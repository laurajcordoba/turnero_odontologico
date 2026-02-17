import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteEvent } from "@/lib/google-calendar";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
  }

  // If cancelling, delete Google Calendar event
  if (status === "CANCELLED" && appointment.googleEventId) {
    try {
      await deleteEvent(appointment.googleEventId);
    } catch (error) {
      console.error("Error deleting Google Calendar event:", error);
    }
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: { appointmentType: true },
  });

  return NextResponse.json(updated);
}
