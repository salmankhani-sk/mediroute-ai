const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const r = await prisma.doctorProfile.updateMany({ data: { isApproved: true } });
  console.log('Approved:', r.count, 'doctors');
  await prisma.$disconnect();
})();
