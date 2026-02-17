export type { AppointmentType, Appointment, WeeklySchedule, BlockedDate, Setting } from "@prisma/client";
export { AppointmentStatus } from "@prisma/client";

export interface TimeSlot {
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
  display: string; // HH:mm format for display
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

export interface DashboardStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  cancelledCount: number;
}
