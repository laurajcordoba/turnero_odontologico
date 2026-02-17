"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { XCircle, CheckCircle, Filter } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  clientName: string;
  clientDni: string;
  clientPhone: string;
  clientEmail: string | null;
  clientLocation: string | null;
  obraSocial: { id: string; name: string } | null;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  appointmentType: {
    name: string;
    duration: number;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Completado", color: "bg-green-100 text-green-800" },
};

export default function TurnosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [filterTo, setFilterTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  async function fetchAppointments() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterFrom) params.set("from", filterFrom);
    if (filterTo) params.set("to", filterTo);
    if (filterStatus) params.set("status", filterStatus);

    const res = await fetch(`/api/appointments?${params}`);
    const data = await res.json();
    setAppointments(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(
        status === "CANCELLED" ? "Turno cancelado" : "Turno completado"
      );
      fetchAppointments();
    } else {
      toast.error("Error al actualizar el turno");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestion de turnos
      </h1>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-end gap-4 py-4">
          <Input
            type="date"
            label="Desde"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            label="Hasta"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="w-40"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="CONFIRMED">Confirmados</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>
          <Button onClick={fetchAppointments}>
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-gray-500 py-4">Cargando...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">
              No hay turnos para mostrar
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Fecha/Hora
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Paciente
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Telefono
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Estado
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="py-3 px-2">
                      <div className="font-medium text-gray-900">
                        {format(new Date(apt.startTime), "dd/MM/yyyy")}
                      </div>
                      <div className="text-gray-500">
                        {format(new Date(apt.startTime), "HH:mm")} -{" "}
                        {format(new Date(apt.endTime), "HH:mm")}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-900">
                      {apt.clientName}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {apt.clientPhone}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {apt.appointmentType.name}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_LABELS[apt.status].color
                        }`}
                      >
                        {STATUS_LABELS[apt.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {apt.status === "CONFIRMED" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(apt.id, "COMPLETED")}
                            title="Marcar como completado"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(apt.id, "CANCELLED")}
                            title="Cancelar turno"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
