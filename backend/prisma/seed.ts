/**
 * Seeds the FAQ / domain knowledge for the fictional store.
 * Standalone (own PrismaClient, no app env validation) so it runs without an
 * OpenAI key. Idempotent: clears KnowledgeItem then inserts the seed set.
 *
 *   npm run seed   (or: npm run db:seed from the repo root)
 */
import { config as loadDotenv } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { KNOWLEDGE_SEED, STORE_NAME } from '../src/knowledge/seed-data.js';

loadDotenv();

const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 Seeding knowledge base for "${STORE_NAME}"…`);

  await prisma.knowledgeItem.deleteMany();
  await prisma.knowledgeItem.createMany({ data: KNOWLEDGE_SEED });

  const count = await prisma.knowledgeItem.count();
  console.log(`✅ Seeded ${count} knowledge items.`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
