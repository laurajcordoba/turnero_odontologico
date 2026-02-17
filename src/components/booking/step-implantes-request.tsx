"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { BookingData } from "./booking-wizard";

export const IMPLANTES_TYPE_ID = "implantes-coordinar";

export function isImplantesRequest(typeId: string) {
  return typeId === IMPLANTES_TYPE_ID;
}

interface Props {
  data: BookingData;
  onBack: () => void;
}

export function StepImplantesRequest({ data, onBack }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/implantes-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: data.clientName,
          clientDni: data.clientDni,
          clientPhone: data.clientPhone,
          clientEmail: data.clientEmail || undefined,
          clientLocation: data.clientLocation || undefined,
          obraSocialName: data.obraSocialName || undefined,
          notes: data.notes || undefined,
        }),
      });

      if (res.ok) {
        router.push(
          `/confirmacion?implantes=1&name=${encodeURIComponent(data.clientName)}`
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al enviar la solicitud");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setSubmitting(false);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Solicitud de turno - Implantes
      </h2>
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 mb-6">
        <MessageCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-medium mb-1">Coordinación por WhatsApp</p>
          <p>
            Para turnos de Implantes un coordinador lo contactará por WhatsApp
            para acordar fecha, horario y sede. No es necesario elegir fecha ni
            hora en este momento.
          </p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700 space-y-2">
        <p>
          <span className="font-medium">Paciente:</span> {data.clientName}
        </p>
        <p>
          <span className="font-medium">Teléfono:</span> {data.clientPhone}
        </p>
        <p>
          <span className="font-medium">Sede elegida:</span>{" "}
          {data.clientLocation || "—"}
        </p>
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar solicitud de coordinación"}
        </Button>
      </div>
    </div>
  );
}
