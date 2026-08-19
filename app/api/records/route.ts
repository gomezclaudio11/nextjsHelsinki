import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.hospitalRecord.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceArea, bedOccupancy, admissions, discharges, avgWaitTimeMinutes, infectionRate, userId } = body;

    if (!serviceArea || bedOccupancy === undefined || admissions === undefined || discharges === undefined || avgWaitTimeMinutes === undefined || infectionRate === undefined || !userId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const newRecord = await prisma.hospitalRecord.create({
      data: {
        serviceArea,
        bedOccupancy: Number(bedOccupancy),
        admissions: Number(admissions),
        discharges: Number(discharges),
        avgWaitTimeMinutes: Number(avgWaitTimeMinutes),
        infectionRate: Number(infectionRate),
        userId,
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json({ error: "Error al crear registro" }, { status: 500 });
  }
}
