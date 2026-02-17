import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { obraSocialSchema, LOCATION_OPTIONS_LIST } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";
  const sede = searchParams.get("sede") ?? "";

  const isPublic = !session?.user || !all;
  const filterBySede = Boolean(sede && (LOCATION_OPTIONS_LIST as readonly string[]).includes(sede));

  const list = await prisma.obraSocial.findMany({
    where: {
      ...(isPublic && { active: true }),
      ...(filterBySede && {
        OR: [
          { sedes: { hasSome: [sede] } },
          { sedes: { equals: [] } },
        ],
      }),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = obraSocialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const obra = await prisma.obraSocial.create({
    data: parsed.data,
  });

  return NextResponse.json(obra, { status: 201 });
}
