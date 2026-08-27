import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, content } = body;

    if (!userId || !content || !content.trim()) {
      return NextResponse.json({ error: "Usuario y contenido son obligatorios" }, { status: 400 });
    }

    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (template.userId !== userId && user.role !== "admin") {
      const accessReq = await prisma.templateAccessRequest.findUnique({
        where: {
          templateId_userId: {
            templateId: id,
            userId,
          },
        },
      });

      if (!accessReq || accessReq.status !== "approved") {
        return NextResponse.json({ error: "Necesitas autorización del creador para escribir observaciones" }, { status: 403 });
      }
    }

    const observation = await prisma.templateObservation.create({
      data: {
        templateId: id,
        userId,
        content: content.trim(),
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(observation, { status: 201 });
  } catch (error) {
    console.error("Error creating observation:", error);
    return NextResponse.json({ error: "Error al guardar la observación" }, { status: 500 });
  }
}
