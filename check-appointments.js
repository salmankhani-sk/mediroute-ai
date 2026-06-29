const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const apps = await prisma.appointment.findMany({
    include: {
      doctor: { include: { user: { select: { fullName: true } } } },
      patient: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  console.log(JSON.stringify(apps.map(a => ({
    doctor: a.doctor.user.fullName,
    patient: a.patient.fullName,
    date: a.date.toISOString().split('T')[0],
    time: a.timeSlot,
    status: a.status,
  })), null, 2));
  await prisma.$disconnect();
})();
