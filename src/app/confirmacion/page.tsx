"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const type = searchParams.get("type") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  const dateDisplay = date
    ? format(new Date(date + "T12:00:00"), "EEEE d 'de' MMMM yyyy", {
        locale: es,
      })
    : "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Turno confirmado
        </h1>
        <p className="text-gray-600 mb-6">
          Su turno ha sido reservado exitosamente
        </p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6 text-left">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">{name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">{type}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">
              {dateDisplay} a las {time}
            </span>
          </div>
        </div>

        <Link href="/">
          <Button className="w-full">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  );
}
