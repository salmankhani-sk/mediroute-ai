import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { join } from 'path';
import { PESHAWAR_HOSPITALS } from '../src/lib/hospitals';

// Load .env from project root
config({ path: join(process.cwd(), '.env') });

// Debug: verify env loaded
console.log('DB URL loaded:', process.env.DATABASE_URL ? 'yes' : 'NO - falling back');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Peshawar hospitals...');

  // Delete old and re-insert to ensure complete list
  await prisma.hospital.deleteMany();

  await prisma.hospital.createMany({
    data: PESHAWAR_HOSPITALS.map((h) => ({
      ...h,
      city: 'Peshawar',
      isApproved: true,
    })),
  });

  console.log(`   ✅ ${PESHAWAR_HOSPITALS.length} hospitals seeded successfully!`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
