import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const typeId = searchParams.get("typeId");

  if (!date || !typeId) {
    return NextResponse.json(
      { error: "Parametros date y typeId requeridos" },
      { status: 400 }
    );
  }

  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: typeId },
  });

  if (!appointmentType) {
    return NextResponse.json(
      { error: "Tipo de turno no encontrado" },
      { status: 404 }
    );
  }

  const slots = await getAvailableSlots(date, appointmentType.duration);

  return NextResponse.json({ date, slots });
}
