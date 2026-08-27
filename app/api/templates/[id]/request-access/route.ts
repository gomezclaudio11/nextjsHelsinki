import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 400 });
    }

    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    if (template.userId === userId) {
      return NextResponse.json({ error: "Eres el creador de esta planilla" }, { status: 400 });
    }

    const existingRequest = await prisma.templateAccessRequest.findUnique({
      where: {
        templateId_userId: {
          templateId: id,
          userId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "approved") {
        return NextResponse.json({ message: "Ya tienes acceso aprobado" }, { status: 200 });
      }
      // If rejected or pending, upsert / update to pending
      const updated = await prisma.templateAccessRequest.update({
        where: { id: existingRequest.id },
        data: { status: "pending" },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const newRequest = await prisma.templateAccessRequest.create({
      data: {
        templateId: id,
        userId,
        status: "pending",
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error requesting access:", error);
    return NextResponse.json({ error: "Error al solicitar acceso" }, { status: 500 });
  }
}
