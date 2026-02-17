"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, Mail, MapPin, CreditCard, Heart } from "lucide-react";
import type { BookingData } from "./booking-wizard";

interface Props {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function StepConfirm({
  data,
  updateData,
  onBack,
  onSubmit,
  submitting,
}: Props) {
  const dateDisplay = data.date
    ? format(new Date(data.date + "T12:00:00"), "EEEE d 'de' MMMM yyyy", {
        locale: es,
      })
    : "";

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Confirmar turno
      </h2>
      <div className="bg-gray-50 rounded-lg p-6 space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Paciente</p>
            <p className="font-medium text-gray-900">{data.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">DNI</p>
            <p className="font-medium text-gray-900">{data.clientDni}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium text-gray-900">{data.clientPhone}</p>
          </div>
        </div>
        {data.clientEmail && (
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{data.clientEmail}</p>
            </div>
          </div>
        )}
        {data.clientLocation && (
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Sede</p>
              <p className="font-medium text-gray-900">{data.clientLocation}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Obra social</p>
            <p className="font-medium text-gray-900">{data.obraSocialName || "Particular"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Tipo de turno</p>
            <p className="font-medium text-gray-900">
              {data.appointmentTypeName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Fecha y hora</p>
            <p className="font-medium text-gray-900">
              {dateDisplay} a las {data.time}
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp opt-in */}
      <label className="flex items-start gap-3 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={data.whatsappOptIn}
          onChange={(e) => updateData({ whatsappOptIn: e.target.checked })}
          className="mt-1 rounded"
        />
        <span className="text-sm text-gray-700">
          Deseo recibir un recordatorio por WhatsApp antes de mi turno
        </span>
      </label>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas adicionales (opcional)
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => updateData({ notes: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Alguna informacion adicional para el dentista..."
        />
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Atras
        </Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? "Reservando..." : "Confirmar turno"}
        </Button>
      </div>
    </div>
  );
}
