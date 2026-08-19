import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.customRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Registro eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting record:", error);
    return NextResponse.json({ error: "Error al eliminar el registro" }, { status: 500 });
  }
}
