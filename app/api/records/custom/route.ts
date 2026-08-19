import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, userId, values } = body;

    if (!templateId || !userId || !values) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Fetch template variables to know their types
    const template = await prisma.spreadsheetTemplate.findUnique({
      where: { id: templateId },
      include: { variables: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
    }

    const valueEntries = Array.isArray(values)
      ? values
      : Object.entries(values).map(([variableId, value]) => ({
          variableId,
          value,
        }));

    const createValuesData = valueEntries.map((entry: { variableId: string; value: any }) => {
      const variable = template.variables.find((v) => v.id === entry.variableId);
      const isNumber = variable?.type === "number";

      if (isNumber) {
        return {
          variableId: entry.variableId,
          numberValue: Number(entry.value) || 0,
          textValue: null,
        };
      } else {
        return {
          variableId: entry.variableId,
          numberValue: null,
          textValue: String(entry.value ?? ""),
        };
      }
    });

    const newRecord = await prisma.customRecord.create({
      data: {
        templateId,
        userId,
        values: {
          create: createValuesData,
        },
      },
      include: {
        values: {
          include: { variable: true },
        },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating custom record:", error);
    return NextResponse.json({ error: "Error al guardar el registro" }, { status: 500 });
  }
}
