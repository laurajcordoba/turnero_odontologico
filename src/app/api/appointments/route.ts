import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { bookingSchema } from "@/lib/validations";
import { createEvent } from "@/lib/google-calendar";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (from || to) {
    where.startTime = {};
    if (from) (where.startTime as Record<string, unknown>).gte = new Date(from);
    if (to) (where.startTime as Record<string, unknown>).lte = new Date(to + "T23:59:59");
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { appointmentType: true },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { clientName, clientPhone, clientEmail, appointmentTypeId, date, time, whatsappOptIn, notes } = parsed.data;

  // Get appointment type
  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: appointmentTypeId },
  });

  if (!appointmentType || !appointmentType.active) {
    return NextResponse.json(
      { error: "Tipo de turno no disponible" },
      { status: 400 }
    );
  }

  // Build start and end times
  const startTime = new Date(`${date}T${time}:00`);
  const endTime = new Date(startTime.getTime() + appointmentType.duration * 60000);

  // Double-check slot availability
  const availableSlots = await getAvailableSlots(date, appointmentType.duration);
  const slotAvailable = availableSlots.some(
    (s) => new Date(s.start).getTime() === startTime.getTime()
  );

  if (!slotAvailable) {
    return NextResponse.json(
      { error: "El horario seleccionado ya no esta disponible" },
      { status: 409 }
    );
  }

  // Create Google Calendar event
  let googleEventId: string | null = null;
  try {
    googleEventId = await createEvent({
      summary: `Turno: ${clientName} - ${appointmentType.name}`,
      description: `Paciente: ${clientName}\nTelefono: ${clientPhone}${clientEmail ? `\nEmail: ${clientEmail}` : ""}${notes ? `\nNotas: ${notes}` : ""}`,
      startTime,
      endTime,
    });
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      clientName,
      clientPhone,
      clientEmail: clientEmail || null,
      appointmentTypeId,
      startTime,
      endTime,
      googleEventId,
      whatsappOptIn,
      notes: notes || null,
    },
    include: { appointmentType: true },
  });

  return NextResponse.json(appointment, { status: 201 });
}
