"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOCATION_OPTIONS_LIST, OBRA_SOCIAL_PARTICULAR } from "@/lib/validations";
import type { BookingData } from "./booking-wizard";

interface ObraSocial {
  id: string;
  name: string;
  active: boolean;
}

const schema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientDni: z.string().min(7, "El DNI debe tener al menos 7 dígitos"),
  clientPhone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clientLocation: z
    .string()
    .min(1, "Seleccione dónde desea atenderse")
    .refine((val) => LOCATION_OPTIONS_LIST.includes(val as (typeof LOCATION_OPTIONS_LIST)[number]), "Seleccione una sede válida"),
  obraSocialId: z.string().min(1, "Seleccione una obra social"),
});

interface Props {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
}

export function StepClientInfo({ data, updateData, onNext }: Props) {
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [obrasLoading, setObrasLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: data.clientName,
      clientDni: data.clientDni,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      clientLocation: data.clientLocation || undefined,
      obraSocialId: data.obraSocialId || undefined,
    },
  });

  const selectedLocation = watch("clientLocation") ?? "";
  const selectedObraSocial = watch("obraSocialId") ?? "";

  // Al cambiar la sede, cargar obras sociales de esa sede y limpiar obra seleccionada
  useEffect(() => {
    if (!selectedLocation) {
      setObrasSociales([]);
      setValue("obraSocialId", "", { shouldValidate: false });
      return;
    }
    setObrasLoading(true);
    setValue("obraSocialId", "", { shouldValidate: false });
    fetch(`/api/obra-social?sede=${encodeURIComponent(selectedLocation)}`)
      .then((res) => res.json())
      .then((list) => {
        setObrasSociales(Array.isArray(list) ? list : []);
        setObrasLoading(false);
      })
      .catch(() => {
        setObrasSociales([]);
        setObrasLoading(false);
      });
  }, [selectedLocation, setValue]);

  function onSubmit(values: z.infer<typeof schema>) {
    const obraSocialName =
      values.obraSocialId === OBRA_SOCIAL_PARTICULAR
        ? "Particular"
        : obrasSociales.find((o) => o.id === values.obraSocialId)?.name ?? "Particular";
    updateData({
      ...values,
      clientLocation: values.clientLocation,
      obraSocialId: values.obraSocialId,
      obraSocialName,
    });
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Datos personales
      </h2>
      <Input
        label="Nombre completo *"
        placeholder="Juan Pérez"
        error={errors.clientName?.message}
        {...register("clientName")}
      />
      <Input
        label="DNI *"
        placeholder="12345678"
        error={errors.clientDni?.message}
        {...register("clientDni")}
      />
      <Input
        label="Teléfono *"
        placeholder="1155551234"
        error={errors.clientPhone?.message}
        {...register("clientPhone")}
      />
      <Input
        label="Email (opcional)"
        type="email"
        placeholder="juan@email.com"
        error={errors.clientEmail?.message}
        {...register("clientEmail")}
      />
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ¿Dónde quiere atenderse? *
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => setValue("clientLocation", e.target.value, { shouldValidate: true })}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.clientLocation ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Seleccione una sede</option>
          {LOCATION_OPTIONS_LIST.map((address) => (
            <option key={address} value={address}>
              {address}
            </option>
          ))}
        </select>
        {errors.clientLocation && (
          <p className="mt-1 text-sm text-red-600">{errors.clientLocation.message}</p>
        )}
      </div>
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Obra social *
        </label>
        <select
          value={selectedObraSocial}
          onChange={(e) => setValue("obraSocialId", e.target.value, { shouldValidate: true })}
          disabled={!selectedLocation || obrasLoading}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.obraSocialId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">
            {!selectedLocation
              ? "Seleccione primero una sede"
              : obrasLoading
                ? "Cargando..."
                : "Seleccione una obra social"}
          </option>
          <option value={OBRA_SOCIAL_PARTICULAR}>Particular</option>
          {obrasSociales.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.name}
            </option>
          ))}
        </select>
        {errors.obraSocialId && (
          <p className="mt-1 text-sm text-red-600">{errors.obraSocialId.message}</p>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit">Siguiente</Button>
      </div>
    </form>
  );
}
