import { prisma } from "./prisma";
import { getFreeBusy } from "./google-calendar";
import type { TimeSlot } from "@/types";

const SLOT_INTERVAL = 30; // minutes

export async function getAvailableSlots(
  dateStr: string,
  durationMinutes: number
): Promise<TimeSlot[]> {
  const settings = await prisma.setting.findMany();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const timezone = settingsMap["timezone"] || "America/Argentina/Buenos_Aires";
  const minNoticeHours = parseInt(settingsMap["min_booking_notice_hours"] || "2");

  // Parse target date in Argentina timezone
  const targetDate = new Date(dateStr + "T00:00:00");
  const dayOfWeek = getArgentinaDayOfWeek(dateStr);

  // 1. Check if date is blocked
  const blocked = await prisma.blockedDate.findFirst({
    where: {
      date: targetDate,
    },
  });
  if (blocked) return [];

  // 2. Get weekly schedule for this day
  const scheduleBlocks = await prisma.weeklySchedule.findMany({
    where: {
      dayOfWeek,
      active: true,
    },
    orderBy: { startTime: "asc" },
  });
  if (scheduleBlocks.length === 0) return [];

  // 3. Generate candidate slots
  const candidates: TimeSlot[] = [];
  for (const block of scheduleBlocks) {
    const [startH, startM] = block.startTime.split(":").map(Number);
    const [endH, endM] = block.endTime.split(":").map(Number);

    const blockStart = new Date(dateStr + "T00:00:00");
    blockStart.setHours(startH, startM, 0, 0);

    const blockEnd = new Date(dateStr + "T00:00:00");
    blockEnd.setHours(endH, endM, 0, 0);

    let slotStart = new Date(blockStart);
    while (slotStart.getTime() + durationMinutes * 60000 <= blockEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      candidates.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        display: formatTime(slotStart),
      });
      slotStart = new Date(slotStart.getTime() + SLOT_INTERVAL * 60000);
    }
  }

  if (candidates.length === 0) return [];

  // 4. Get busy periods from Google Calendar
  const dayStart = new Date(dateStr + "T00:00:00");
  const dayEnd = new Date(dateStr + "T23:59:59");
  const gcalBusy = await getFreeBusy(dayStart, dayEnd);

  // 5. Get existing appointments from DB
  const dbAppointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: dayStart },
      endTime: { lte: new Date(dayEnd.getTime() + 1000) },
      status: { not: "CANCELLED" },
    },
  });

  // 6. Combine busy periods
  const busyPeriods = [
    ...gcalBusy.map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime(),
    })),
    ...dbAppointments.map((a) => ({
      start: a.startTime.getTime(),
      end: a.endTime.getTime(),
    })),
  ];

  // 7. Filter available slots
  const now = new Date();
  const minBookingTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

  return candidates.filter((slot) => {
    const slotStart = new Date(slot.start).getTime();
    const slotEnd = new Date(slot.end).getTime();

    // Filter past slots and respect min notice
    if (slotStart < minBookingTime.getTime()) return false;

    // Filter overlapping with busy periods
    return !busyPeriods.some(
      (busy) => slotStart < busy.end && slotEnd > busy.start
    );
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getArgentinaDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + "T12:00:00");
  return date.getDay();
}
