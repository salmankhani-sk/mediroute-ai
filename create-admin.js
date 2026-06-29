const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const hash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@mediroute.pk' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@mediroute.pk',
      passwordHash: hash,
      fullName: 'System Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created: admin@mediroute.pk / admin123');
  await prisma.$disconnect();
})();
