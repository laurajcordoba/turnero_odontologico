"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepClientInfo } from "./step-client-info";
import { StepSelectType } from "./step-select-type";
import { StepSelectDateTime } from "./step-select-datetime";
import { StepConfirm } from "./step-confirm";

export interface BookingData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  appointmentTypeId: string;
  appointmentTypeName: string;
  date: string;
  time: string;
  whatsappOptIn: boolean;
  notes: string;
}

const INITIAL_DATA: BookingData = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  appointmentTypeId: "",
  appointmentTypeName: "",
  date: "",
  time: "",
  whatsappOptIn: false,
  notes: "",
};

const STEP_TITLES = [
  "Datos personales",
  "Tipo de turno",
  "Fecha y horario",
  "Confirmacion",
];

export function BookingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BookingData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);

  function updateData(partial: Partial<BookingData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, 3));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: data.clientName,
          clientPhone: data.clientPhone,
          clientEmail: data.clientEmail,
          appointmentTypeId: data.appointmentTypeId,
          date: data.date,
          time: data.time,
          whatsappOptIn: data.whatsappOptIn,
          notes: data.notes,
        }),
      });

      if (res.ok) {
        const appointment = await res.json();
        router.push(
          `/confirmacion?id=${appointment.id}&name=${encodeURIComponent(data.clientName)}&type=${encodeURIComponent(data.appointmentTypeName)}&date=${data.date}&time=${data.time}`
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al reservar el turno");
      }
    } catch {
      toast.error("Error de conexion");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEP_TITLES.map((title, i) => (
            <div key={title} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:inline ${
                  i <= step ? "text-gray-900 font-medium" : "text-gray-400"
                }`}
              >
                {title}
              </span>
              {i < 3 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    i < step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {step === 0 && (
          <StepClientInfo data={data} updateData={updateData} onNext={next} />
        )}
        {step === 1 && (
          <StepSelectType
            data={data}
            updateData={updateData}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 2 && (
          <StepSelectDateTime
            data={data}
            updateData={updateData}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <StepConfirm
            data={data}
            updateData={updateData}
            onBack={back}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
