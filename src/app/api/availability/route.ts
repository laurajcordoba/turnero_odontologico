import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const schedules = await prisma.weeklySchedule.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(schedules);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { schedules } = body as {
    schedules: {
      id?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      active: boolean;
    }[];
  };

  // Delete existing and recreate
  await prisma.weeklySchedule.deleteMany();

  const created = await Promise.all(
    schedules.map((s) =>
      prisma.weeklySchedule.create({
        data: {
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          active: s.active,
        },
      })
    )
  );

  return NextResponse.json(created);
}
