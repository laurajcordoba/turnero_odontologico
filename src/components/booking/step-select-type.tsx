"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MessageCircle } from "lucide-react";
import { IMPLANTES_TYPE_ID } from "./step-implantes-request";
import type { BookingData } from "./booking-wizard";

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  active: boolean;
}

interface Props {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSelectType({ data, updateData, onNext, onBack }: Props) {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointment-types")
      .then((r) => r.json())
      .then((data) => {
        setTypes(data.filter((t: AppointmentType) => t.active));
        setLoading(false);
      });
  }, []);

  function selectType(type: AppointmentType) {
    updateData({
      appointmentTypeId: type.id,
      appointmentTypeName: type.name,
      date: "",
      time: "",
    });
    onNext();
  }

  function selectImplantes() {
    updateData({
      appointmentTypeId: IMPLANTES_TYPE_ID,
      appointmentTypeName: "Implantes",
      date: "",
      time: "",
    });
    onNext();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Tipo de turno
      </h2>
      {loading ? (
        <p className="text-gray-500">Cargando tipos de turno...</p>
      ) : (
        <div className="grid gap-3">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => selectType(type)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors text-left ${
                data.appointmentTypeId === type.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <span className="font-medium text-gray-900">{type.name}</span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {type.duration} min
              </span>
            </button>
          ))}
          <button
            onClick={selectImplantes}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors text-left ${
              data.appointmentTypeId === IMPLANTES_TYPE_ID
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <span className="font-medium text-gray-900">Implantes</span>
            <span className="flex items-center gap-1 text-sm text-amber-600">
              <MessageCircle className="w-4 h-4" />
              Coordinación por WhatsApp
            </span>
          </button>
        </div>
      )}
      <div className="flex justify-between pt-6">
        <Button variant="secondary" onClick={onBack}>
          Atras
        </Button>
      </div>
    </div>
  );
}
