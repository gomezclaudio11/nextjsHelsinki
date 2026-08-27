import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { conclusions, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 400 });
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
        return NextResponse.json({ error: "Necesitas autorización del creador para escribir conclusiones" }, { status: 403 });
      }
    }

    const updatedTemplate = await prisma.spreadsheetTemplate.update({
      where: { id },
      data: {
        conclusions: conclusions !== undefined ? conclusions : null,
      },
      include: {
        variables: true,
        user: { select: { name: true, email: true } },
        accessRequests: { include: { user: { select: { name: true, email: true } } } },
        observations: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } },
        records: {
          include: {
            values: { include: { variable: true } },
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating conclusions:", error);
    return NextResponse.json({ error: "Error al actualizar las conclusiones" }, { status: 500 });
  }
}
