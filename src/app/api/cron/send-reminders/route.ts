import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Find appointments for tomorrow that haven't received reminders
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfTomorrow = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate()
  );
  const endOfTomorrow = new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: startOfTomorrow, lt: endOfTomorrow },
      status: "CONFIRMED",
      whatsappOptIn: true,
      reminderSent: false,
    },
    include: { appointmentType: true },
  });

  let sent = 0;
  let failed = 0;

  for (const apt of appointments) {
    const dateStr = format(new Date(apt.startTime), "EEEE d 'de' MMMM", {
      locale: es,
    });
    const timeStr = format(new Date(apt.startTime), "HH:mm");

    const message = `Hola ${apt.clientName}! Le recordamos que tiene un turno de ${apt.appointmentType.name} manana ${dateStr} a las ${timeStr}. Si necesita cancelar o reprogramar, por favor contactenos. Gracias!`;

    const success = await sendWhatsAppMessage(apt.clientPhone, message);

    if (success) {
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { reminderSent: true },
      });
      sent++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    total: appointments.length,
    sent,
    failed,
  });
}
