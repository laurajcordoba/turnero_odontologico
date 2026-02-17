"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { BookingData } from "./booking-wizard";
import "react-day-picker/style.css";

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

interface Props {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSelectDateTime({ data, updateData, onNext, onBack }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    data.date ? new Date(data.date + "T12:00:00") : undefined
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState(data.time || "");

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    fetch(
      `/api/availability/slots?date=${dateStr}&typeId=${data.appointmentTypeId}`
    )
      .then((r) => r.json())
      .then((res) => {
        setSlots(res.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => {
        setSlots([]);
        setLoadingSlots(false);
      });
  }, [selectedDate, data.appointmentTypeId]);

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    if (date) {
      updateData({ date: format(date, "yyyy-MM-dd"), time: "" });
    }
  }

  function handleTimeSelect(slot: TimeSlot) {
    setSelectedTime(slot.display);
    updateData({ time: slot.display });
  }

  function handleNext() {
    if (data.date && data.time) {
      onNext();
    }
  }

  const today = new Date();
  const maxDate = addDays(today, 30);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Fecha y horario
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={es}
            disabled={[
              { before: today },
              { after: maxDate },
              { dayOfWeek: [0] },
            ]}
            className="border rounded-lg p-3"
          />
        </div>

        {/* Time slots */}
        <div>
          {!selectedDate && (
            <p className="text-gray-500 text-sm">
              Seleccione una fecha para ver los horarios disponibles
            </p>
          )}
          {selectedDate && loadingSlots && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando horarios...
            </div>
          )}
          {selectedDate && !loadingSlots && slots.length === 0 && (
            <p className="text-gray-500 text-sm">
              No hay horarios disponibles para esta fecha
            </p>
          )}
          {selectedDate && !loadingSlots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => handleTimeSelect(slot)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                    selectedTime === slot.display
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300 text-gray-700"
                  }`}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="secondary" onClick={onBack}>
          Atras
        </Button>
        <Button onClick={handleNext} disabled={!data.date || !data.time}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
