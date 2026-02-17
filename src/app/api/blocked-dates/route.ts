import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { blockedDateSchema } from "@/lib/validations";

export async function GET() {
  const blockedDates = await prisma.blockedDate.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(blockedDates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = blockedDateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const blockedDate = await prisma.blockedDate.create({
    data: {
      date: new Date(parsed.data.date),
      reason: parsed.data.reason || null,
    },
  });

  return NextResponse.json(blockedDate, { status: 201 });
}
