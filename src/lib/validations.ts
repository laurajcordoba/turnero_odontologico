import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const appointmentTypeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  duration: z.number().min(15, "Mínimo 15 minutos").max(240, "Máximo 240 minutos"),
  active: z.boolean().optional().default(true),
});

export const obraSocialSchema = z.object({
  name: z.string().min(1, "El nombre de la obra social es requerido"),
  active: z.boolean().optional().default(true),
  sedes: z.array(z.string()).optional().default([]),
});

export const OBRA_SOCIAL_PARTICULAR = "particular";

const LOCATION_OPTIONS = [
  "25 de Mayo 824, Alta Italia, La Pampa.",
  "Illia 305, Colonia Tirolesa, Cordoba.",
] as const;

export const bookingSchema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientDni: z.string().min(7, "El DNI debe tener al menos 7 dígitos"),
  clientPhone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clientLocation: z.enum(LOCATION_OPTIONS),
  obraSocialId: z.string().nullable(), // null = Particular, string = id de obra social
  appointmentTypeId: z.string().min(1, "Seleccione un tipo de turno"),
  date: z.string().min(1, "Seleccione una fecha"),
  time: z.string().min(1, "Seleccione un horario"),
  whatsappOptIn: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

export const LOCATION_OPTIONS_LIST = LOCATION_OPTIONS;

export const weeklyScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
  active: z.boolean().optional().default(true),
});

export const blockedDateSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  reason: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AppointmentTypeInput = z.infer<typeof appointmentTypeSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type WeeklyScheduleInput = z.infer<typeof weeklyScheduleSchema>;
export type BlockedDateInput = z.infer<typeof blockedDateSchema>;
