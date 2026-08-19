import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "doctor@hospital.com" },
    update: {},
    create: {
      email: "doctor@hospital.com",
      name: "Dr. House",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log({ admin });

  // Seed some sample hospital records
  const sampleRecords = [
    { serviceArea: "Urgencias", bedOccupancy: 85, admissions: 42, discharges: 35, avgWaitTimeMinutes: 45.5, infectionRate: 1.2 },
    { serviceArea: "UTI", bedOccupancy: 92, admissions: 8, discharges: 6, avgWaitTimeMinutes: 10.0, infectionRate: 3.5 },
    { serviceArea: "Pediatría", bedOccupancy: 60, admissions: 15, discharges: 18, avgWaitTimeMinutes: 20.0, infectionRate: 0.5 },
    { serviceArea: "Cirugía", bedOccupancy: 78, admissions: 12, discharges: 14, avgWaitTimeMinutes: 30.0, infectionRate: 1.8 },
  ];

  for (const record of sampleRecords) {
    await prisma.hospitalRecord.create({
      data: {
        ...record,
        userId: admin.id,
      },
    });
  }

  console.log("Sample hospital records seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
