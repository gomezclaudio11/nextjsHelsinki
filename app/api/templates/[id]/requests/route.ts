import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { requestId, status, ownerUserId } = body;

    if (!requestId || !status || !ownerUserId) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    const owner = await prisma.user.findUnique({ where: { id: ownerUserId } });
    if (!owner || (template.userId !== ownerUserId && owner.role !== "admin")) {
      return NextResponse.json({ error: "No tienes permisos para gestionar solicitudes" }, { status: 403 });
    }

    const updatedRequest = await prisma.templateAccessRequest.update({
      where: { id: requestId },
      data: { status }, // "approved" or "rejected"
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating access request:", error);
    return NextResponse.json({ error: "Error al actualizar la solicitud" }, { status: 500 });
  }
}
