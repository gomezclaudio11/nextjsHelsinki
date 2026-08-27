import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id },
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
    });

    if (!template) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ error: "Error al obtener la planilla" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, variables, userId } = body;

    if (!title || !variables || !Array.isArray(variables)) {
      return NextResponse.json({ error: "Título y variables son obligatorios" }, { status: 400 });
    }

    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || (template.userId !== userId && user.role !== "admin")) {
        return NextResponse.json({ error: "No tienes permisos para modificar esta planilla" }, { status: 403 });
      }
    }

    await prisma.spreadsheetTemplate.update({
      where: { id },
      data: {
        title,
        description: description || "",
      },
    });

    const existingVariables = await prisma.templateVariable.findMany({
      where: { templateId: id },
    });

    const existingIds = existingVariables.map((v: any) => v.id);
    const incomingIds = variables.filter((v: any) => v.id).map((v: any) => v.id);

    const varsToDelete = existingIds.filter((dbId: any) => !incomingIds.includes(dbId));
    if (varsToDelete.length > 0) {
      await prisma.templateVariable.deleteMany({
        where: { id: { in: varsToDelete } },
      });
    }

    for (const v of variables) {
      if (v.id && existingIds.includes(v.id)) {
        await prisma.templateVariable.update({
          where: { id: v.id },
          data: { name: v.name, type: v.type || "number" },
        });
      } else {
        await prisma.templateVariable.create({
          data: {
            name: v.name,
            type: v.type || "number",
            templateId: id,
          },
        });
      }
    }

    const updatedTemplate = await prisma.spreadsheetTemplate.findUnique({
      where: { id },
      include: {
        variables: true,
        user: { select: { name: true, email: true } },
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
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Error al actualizar la planilla" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let userId = "";
    try {
      const body = await request.json();
      userId = body.userId;
    } catch {}

    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || (template.userId !== userId && user.role !== "admin")) {
        return NextResponse.json({ error: "No tienes permisos para eliminar esta planilla" }, { status: 403 });
      }
    }

    await prisma.spreadsheetTemplate.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Planilla eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Error al eliminar la planilla" }, { status: 500 });
  }
}
