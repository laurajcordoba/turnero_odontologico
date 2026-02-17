"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BookingData } from "./booking-wizard";

const schema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientPhone: z.string().min(8, "El telefono debe tener al menos 8 digitos"),
  clientEmail: z.string().email("Email invalido").optional().or(z.literal("")),
});

interface Props {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
}

export function StepClientInfo({ data, updateData, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
    },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    updateData(values);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Datos personales
      </h2>
      <Input
        label="Nombre completo *"
        placeholder="Juan Perez"
        error={errors.clientName?.message}
        {...register("clientName")}
      />
      <Input
        label="Telefono *"
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
      <div className="flex justify-end pt-4">
        <Button type="submit">Siguiente</Button>
      </div>
    </form>
  );
}
