import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; obsId: string }> }
) {
  try {
    const { id, obsId } = await params;
    const body = await request.json().catch(() => ({}));
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 400 });
    }

    const observation = await prisma.templateObservation.findUnique({
      where: { id: obsId },
      include: { template: true },
    });

    if (!observation || observation.templateId !== id) {
      return NextResponse.json({ error: "Observación no encontrada" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (observation.userId !== userId && observation.template.userId !== userId && user.role !== "admin") {
      return NextResponse.json({ error: "No tienes permisos para eliminar esta observación" }, { status: 403 });
    }

    await prisma.templateObservation.delete({
      where: { id: obsId },
    });

    return NextResponse.json({ message: "Observación eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting observation:", error);
    return NextResponse.json({ error: "Error al eliminar la observación" }, { status: 500 });
  }
}
