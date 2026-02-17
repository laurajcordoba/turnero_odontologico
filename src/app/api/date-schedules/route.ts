import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

const putBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocks: z.array(z.object({
    startTime: z.string().min(1),
    endTime: z.string().min(1),
  })),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "Se requieren from y to (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const fromDate = new Date(from + "T00:00:00.000Z");
  const toDate = new Date(to + "T23:59:59.999Z");
  const blocks = await prisma.dateSchedule.findMany({
    where: {
      date: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const byDate: Record<string, { id: string; startTime: string; endTime: string }[]> = {};
  for (const b of blocks) {
    const d = new Date(b.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push({
      id: b.id,
      startTime: b.startTime,
      endTime: b.endTime,
    });
  }

  return NextResponse.json(byDate);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Se requiere date (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const targetStart = new Date(date + "T00:00:00.000Z");
  const targetEnd = new Date(date + "T23:59:59.999Z");

  await prisma.dateSchedule.deleteMany({
    where: {
      date: {
        gte: targetStart,
        lte: targetEnd,
      },
    },
  });

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const dateOnly = new Date(parsed.data.date + "T12:00:00.000Z");
  const startTime = parsed.data.startTime.padStart(5, "0");
  const endTime = parsed.data.endTime.padStart(5, "0");
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return NextResponse.json(
      { error: "Horarios deben ser HH:mm (ej. 09:00)" },
      { status: 400 }
    );
  }
  const block = await prisma.dateSchedule.create({
    data: {
      date: dateOnly,
      startTime,
      endTime,
    },
  });

  return NextResponse.json(block, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = putBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { date, blocks } = parsed.data;
  const targetStart = new Date(date + "T00:00:00.000Z");
  const targetEnd = new Date(date + "T23:59:59.999Z");

  await prisma.dateSchedule.deleteMany({
    where: {
      date: { gte: targetStart, lte: targetEnd },
    },
  });

  const dateOnly = new Date(date + "T12:00:00.000Z");
  for (const block of blocks) {
    const start = block.startTime.padStart(5, "0");
    const end = block.endTime.padStart(5, "0");
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) continue;
    await prisma.dateSchedule.create({
      data: {
        date: dateOnly,
        startTime: start,
        endTime: end,
      },
    });
  }

  const created = await prisma.dateSchedule.findMany({
    where: { date: { gte: targetStart, lte: targetEnd } },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(
    created.map((b) => ({ id: b.id, startTime: b.startTime, endTime: b.endTime }))
  );
}
