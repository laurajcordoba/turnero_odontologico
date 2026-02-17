"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

interface DateBlock {
  id: string;
  startTime: string;
  endTime: string;
}

export default function HorariosPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [dateSchedulesByDate, setDateSchedulesByDate] = useState<
    Record<string, DateBlock[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateBlocks, setSelectedDateBlocks] = useState<DateBlock[]>([]);
  const [savingDate, setSavingDate] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startPad = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const blockedSet = new Set(
    blockedDates.map((bd) => bd.date.slice(0, 10))
  );

  useEffect(() => {
    fetch("/api/blocked-dates")
      .then((r) => r.json())
      .then((data) => {
        setBlockedDates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const from = format(monthStart, "yyyy-MM-dd");
    const to = format(monthEnd, "yyyy-MM-dd");
    fetch(`/api/date-schedules?from=${from}&to=${to}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) return {};
        return r.json();
      })
      .then((data) => (typeof data === "object" && data !== null && !("error" in data) ? data : {}))
      .then(setDateSchedulesByDate)
      .catch(() => setDateSchedulesByDate({}));
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      setSelectedDateBlocks(dateSchedulesByDate[selectedDate] ?? []);
    }
  }, [selectedDate, dateSchedulesByDate]);

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
      setBlockedDates((prev) => [...prev, data]);
      setNewBlockedDate("");
      setNewBlockedReason("");
      toast.success("Fecha bloqueada agregada");
    } else {
      const err = await res.json();
      toast.error(err.error || "Error al agregar fecha bloqueada");
    }
  }

  async function removeBlockedDate(id: string) {
    const res = await fetch(`/api/blocked-dates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBlockedDates((prev) => prev.filter((d) => d.id !== id));
      toast.success("Fecha bloqueada eliminada");
    }
  }

  function addSelectedDateBlock() {
    setSelectedDateBlocks((prev) => [
      ...prev,
      { id: "", startTime: "09:00", endTime: "13:00" },
    ]);
  }

  function updateSelectedDateBlock(
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) {
    setSelectedDateBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeSelectedDateBlock(index: number) {
    setSelectedDateBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveSelectedDateBlocks() {
    if (!selectedDate) return;
    setSavingDate(true);
    try {
      const blocksToSave = selectedDateBlocks.map((b) => ({
        startTime: b.startTime.length === 4 ? "0" + b.startTime : b.startTime,
        endTime: b.endTime.length === 4 ? "0" + b.endTime : b.endTime,
      }));

      const res = await fetch("/api/date-schedules", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          blocks: blocksToSave,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const saved = await res.json();
      const list = Array.isArray(saved) ? saved : [];
      setSelectedDateBlocks(list);
      setDateSchedulesByDate((prev) => ({
        ...prev,
        [selectedDate]: list,
      }));
      toast.success("Horarios guardados");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar horarios");
    }
    setSavingDate(false);
  }

  if (loading) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Fechas y horarios disponibles
      </h1>

      {/* Calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendario
            </h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-base font-medium text-gray-900 min-w-[160px] text-center capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Haga clic en una fecha para definir los rangos horarios disponibles
            ese día.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }, (_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isBlocked = blockedSet.has(dateStr);
              const hasCustom = (dateSchedulesByDate[dateStr]?.length ?? 0) > 0;
              const isSelected = selectedDate === dateStr;
              const isPast = day < new Date() && !isSameDay(day, new Date());

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    if (isBlocked || isPast) return;
                    setSelectedDate(dateStr);
                    setSelectedDateBlocks(dateSchedulesByDate[dateStr] ?? []);
                  }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                    isBlocked
                      ? "bg-red-50 text-red-600 cursor-not-allowed"
                      : isPast
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : isSelected
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : hasCustom
                            ? "bg-green-50 text-green-800 hover:bg-green-100"
                            : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  {hasCustom && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Panel rangos horarios por fecha */}
      {selectedDate && !blockedSet.has(selectedDate) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Rangos horarios —{" "}
                {format(parseISO(selectedDate), "EEEE d 'de' MMMM", {
                  locale: es,
                })}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDate(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Agregue uno o más rangos (desde–hasta). Los turnos solo podrán
              reservarse dentro de estos horarios.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              {selectedDateBlocks.map((block, i) => (
                <div
                  key={block.id || `new-${i}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <Input
                    type="time"
                    value={block.startTime}
                    onChange={(e) =>
                      updateSelectedDateBlock(i, "startTime", e.target.value)
                    }
                    className="w-28"
                  />
                  <span className="text-gray-400">a</span>
                  <Input
                    type="time"
                    value={block.endTime}
                    onChange={(e) =>
                      updateSelectedDateBlock(i, "endTime", e.target.value)
                    }
                    className="w-28"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSelectedDateBlock(i)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addSelectedDateBlock}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar rango
              </Button>
            </div>
            <Button onClick={saveSelectedDateBlocks} disabled={savingDate}>
              {savingDate ? "Guardando..." : "Guardar horarios de esta fecha"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Días bloqueados */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Días bloqueados
          </h2>
          <p className="text-sm text-gray-500">
            Fechas en las que no se aceptan turnos (feriados, vacaciones, etc.)
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Fecha
              </label>
              <Input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Motivo (opcional)
              </label>
              <Input
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
                placeholder="Ej. Feriado"
                className="w-48"
              />
            </div>
            <Button onClick={addBlockedDate} disabled={!newBlockedDate}>
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>

          {blockedDates.length === 0 ? (
            <p className="text-sm text-gray-400">No hay días bloqueados</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div
                  key={bd.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {format(
                        new Date(bd.date + "T12:00:00"),
                        "EEEE d 'de' MMMM yyyy",
                        { locale: es }
                      )}
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
