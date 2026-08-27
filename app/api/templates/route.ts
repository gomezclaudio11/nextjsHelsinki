import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.spreadsheetTemplate.findMany({
      include: {
        variables: true,
        user: { select: { name: true, email: true } },
        accessRequests: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        records: {
          include: {
            values: {
              include: { variable: true },
            },
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Error al obtener las planillas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, userId, variables } = body;

    if (!title || !userId || !variables || !Array.isArray(variables) || variables.length === 0) {
      return NextResponse.json({ error: "Título, usuario y al menos una variable son obligatorios" }, { status: 400 });
    }

    const newTemplate = await prisma.spreadsheetTemplate.create({
      data: {
        title,
        description: description || "",
        userId,
        variables: {
          create: variables.map((v: { name: string; type?: string }) => ({
            name: v.name,
            type: v.type || "number",
          })),
        },
      },
      include: {
        variables: true,
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Error al crear la planilla" }, { status: 500 });
  }
}
