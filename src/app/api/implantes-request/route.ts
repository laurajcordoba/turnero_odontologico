import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const list = await prisma.implantesRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

const bodySchema = z.object({
  clientName: z.string().min(2),
  clientDni: z.string().min(7),
  clientPhone: z.string().min(8),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientLocation: z.string().optional(),
  obraSocialName: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const request = await prisma.implantesRequest.create({
    data: {
      clientName: data.clientName,
      clientDni: data.clientDni,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail || null,
      clientLocation: data.clientLocation || null,
      obraSocialName: data.obraSocialName || null,
      notes: data.notes || null,
    },
  });

  const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
  if (adminPhone) {
    const sede = data.clientLocation || "No indicada";
    const obra = data.obraSocialName || "Particular";
    const message = `*Nueva solicitud de turno - Implantes*

Paciente: ${data.clientName}
DNI: ${data.clientDni}
Teléfono: ${data.clientPhone}
${data.clientEmail ? `Email: ${data.clientEmail}\n` : ""}Sede: ${sede}
Obra social: ${obra}
${data.notes ? `Notas: ${data.notes}\n` : ""}
Por favor contactar al paciente para coordinar fecha y hora.`;

    await sendWhatsAppMessage(adminPhone, message);
  }

  return NextResponse.json(
    { id: request.id, message: "Solicitud enviada correctamente" },
    { status: 201 }
  );
}
