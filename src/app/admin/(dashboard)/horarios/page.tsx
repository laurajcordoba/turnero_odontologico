"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Trash2, Save, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

interface ScheduleBlock {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

export default function HorariosPage() {
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/availability").then((r) => r.json()),
      fetch("/api/blocked-dates").then((r) => r.json()),
    ]).then(([sched, blocked]) => {
      setSchedules(sched);
      setBlockedDates(blocked);
      setLoading(false);
    });
  }, []);

  function addBlock(dayOfWeek: number) {
    setSchedules([
      ...schedules,
      { dayOfWeek, startTime: "09:00", endTime: "13:00", active: true },
    ]);
  }

  function removeBlock(index: number) {
    setSchedules(schedules.filter((_, i) => i !== index));
  }

  function updateBlock(index: number, field: string, value: string | boolean) {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  }

  async function saveSchedule() {
    setSaving(true);
    const res = await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedules }),
    });
    if (res.ok) {
      const data = await res.json();
      setSchedules(data);
      toast.success("Horarios guardados");
    } else {
      toast.error("Error al guardar horarios");
    }
    setSaving(false);
  }

  async function addBlockedDate() {
    if (!newBlockedDate) return;
    const res = await fetch("/api/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: newBlockedDate,
        reason: newBlockedReason || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setBlockedDates([...blockedDates, data]);
      setNewBlockedDate("");
      setNewBlockedReason("");
      toast.success("Fecha bloqueada agregada");
    } else {
      toast.error("Error al agregar fecha bloqueada");
    }
  }

  async function removeBlockedDate(id: string) {
    const res = await fetch(`/api/blocked-dates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBlockedDates(blockedDates.filter((d) => d.id !== id));
      toast.success("Fecha bloqueada eliminada");
    }
  }

  if (loading) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Configuracion de horarios
        </h1>
        <Button onClick={saveSchedule} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar horarios"}
        </Button>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Horario semanal
          </h2>
          <p className="text-sm text-gray-500">
            Configure los bloques horarios para cada dia de la semana
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const dayBlocks = schedules
              .map((s, i) => ({ ...s, _index: i }))
              .filter((s) => s.dayOfWeek === day);

            return (
              <div key={day} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    {DAY_NAMES[day]}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addBlock(day)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar bloque
                  </Button>
                </div>
                {dayBlocks.length === 0 ? (
                  <p className="text-sm text-gray-400 ml-1">Sin horario</p>
                ) : (
                  <div className="space-y-2">
                    {dayBlocks.map((block) => (
                      <div
                        key={block._index}
                        className="flex items-center gap-3"
                      >
                        <Input
                          type="time"
                          value={block.startTime}
                          onChange={(e) =>
                            updateBlock(block._index, "startTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-gray-400">a</span>
                        <Input
                          type="time"
                          value={block.endTime}
                          onChange={(e) =>
                            updateBlock(block._index, "endTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={block.active}
                            onChange={(e) =>
                              updateBlock(block._index, "active", e.target.checked)
                            }
                            className="rounded"
                          />
                          Activo
                        </label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeBlock(block._index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            <Calendar className="w-5 h-5 inline mr-2" />
            Fechas bloqueadas
          </h2>
          <p className="text-sm text-gray-500">
            Dias en los que no se aceptan turnos (feriados, vacaciones, etc.)
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 mb-4">
            <Input
              type="date"
              label="Fecha"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
            />
            <Input
              label="Motivo (opcional)"
              value={newBlockedReason}
              onChange={(e) => setNewBlockedReason(e.target.value)}
              placeholder="Ej: Feriado"
            />
            <Button onClick={addBlockedDate} disabled={!newBlockedDate}>
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          {blockedDates.length === 0 ? (
            <p className="text-sm text-gray-400">No hay fechas bloqueadas</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div
                  key={bd.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(bd.date + "T12:00:00"), "EEEE d 'de' MMMM yyyy", {
                        locale: es,
                      })}
                    </span>
                    {bd.reason && (
                      <span className="text-sm text-gray-500 ml-2">
                        — {bd.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeBlockedDate(bd.id)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
