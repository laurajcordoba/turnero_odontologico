"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Phone, Mail, MapPin, User } from "lucide-react";

interface ImplantesRequest {
  id: string;
  clientName: string;
  clientDni: string;
  clientPhone: string;
  clientEmail: string | null;
  clientLocation: string | null;
  obraSocialName: string | null;
  notes: string | null;
  createdAt: string;
}

export default function ImplantesPage() {
  const [requests, setRequests] = useState<ImplantesRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/implantes-request")
      .then((r) => r.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Solicitudes de Implantes
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Pacientes que solicitaron turno para Implantes. Contactarlos por
        WhatsApp para coordinar fecha, horario y sede. También recibe un
        mensaje por WhatsApp en el número configurado (ADMIN_WHATSAPP_PHONE).
      </p>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
            <div className="col-span-3">Paciente / Contacto</div>
            <div className="col-span-3">Sede / Obra social</div>
            <div className="col-span-3">Notas</div>
            <div className="col-span-3">Fecha solicitud</div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {requests.map((req) => (
            <div
              key={req.id}
              className="grid grid-cols-12 gap-4 items-start py-4"
            >
              <div className="col-span-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  {req.clientName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`https://wa.me/549${req.clientPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {req.clientPhone}
                  </a>
                </div>
                {req.clientEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {req.clientEmail}
                  </div>
                )}
                <div className="text-xs text-gray-500">DNI: {req.clientDni}</div>
              </div>
              <div className="col-span-3 space-y-1 text-sm text-gray-600">
                {req.clientLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{req.clientLocation}</span>
                  </div>
                )}
                <div>
                  Obra social: {req.obraSocialName || "Particular"}
                </div>
              </div>
              <div className="col-span-3 text-sm text-gray-600">
                {req.notes ? (
                  <span className="line-clamp-2">{req.notes}</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
              <div className="col-span-3 text-sm text-gray-500">
                {format(new Date(req.createdAt), "d MMM yyyy, HH:mm", {
                  locale: es,
                })}
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <p className="text-sm text-gray-500 py-8 text-center">
              No hay solicitudes de Implantes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
