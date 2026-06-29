const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const hash = await bcrypt.hash('patient123', 12);
  await prisma.user.upsert({
    where: { id: 'demo-patient' },
    update: {},
    create: {
      id: 'demo-patient',
      email: 'patient@demo.com',
      passwordHash: hash,
      fullName: 'Demo Patient',
      role: 'PATIENT',
    },
  });

  console.log('✅ Demo patient created (id: demo-patient)');
  await prisma.$disconnect();
})();
