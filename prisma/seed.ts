import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@turnero.com" },
    update: {},
    create: {
      email: "admin@turnero.com",
      password: hashedPassword,
      name: "Dr. Admin",
    },
  });
  console.log("Admin user created: admin@turnero.com / admin123");

  // Create default appointment types
  const types = [
    { name: "Arreglo", duration: 30 },
    { name: "Extracción", duration: 60 },
    { name: "Limpieza bucal", duration: 30 },
    { name: "Otro", duration: 30 },
  ];

  for (const type of types) {
    await prisma.appointmentType.upsert({
      where: { id: type.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: type.name.toLowerCase().replace(/\s+/g, "-"),
        name: type.name,
        duration: type.duration,
      },
    });
  }
  console.log("Appointment types created");

  // Create default weekly schedule (Mon-Fri, 9-13 and 15-19)
  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
  for (const day of weekdays) {
    // Morning block
    await prisma.weeklySchedule.create({
      data: {
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "13:00",
        active: true,
      },
    });
    // Afternoon block
    await prisma.weeklySchedule.create({
      data: {
        dayOfWeek: day,
        startTime: "15:00",
        endTime: "19:00",
        active: true,
      },
    });
  }
  console.log("Weekly schedule created (Mon-Fri, 9-13 & 15-19)");

  // Create default settings
  const settings = [
    { key: "advance_booking_days", value: "30" },
    { key: "min_booking_notice_hours", value: "2" },
    { key: "timezone", value: "America/Argentina/Buenos_Aires" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("Settings created");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
