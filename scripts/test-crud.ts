import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function testCRUD() {
  console.log('Testing Neon connection and CRUD operations...\n');

  // CREATE - Insert a test user
  console.log('1. CREATE: Inserting a test user...');
  const user = await db.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      passwordHash: 'hashed_password_123',
      name: 'Test User',
    },
  });
  console.log('   Created:', user);

  // READ - Fetch the user
  console.log('\n2. READ: Fetching the user by ID...');
  const foundUser = await db.user.findUnique({
    where: { id: user.id },
  });
  console.log('   Found:', foundUser);

  // UPDATE - Update the user's name
  console.log('\n3. UPDATE: Updating the user\'s name...');
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: { name: 'Updated Test User' },
  });
  console.log('   Updated:', updatedUser);

  // CREATE related records - Add a document and concept
  console.log('\n4. CREATE (Relations): Adding a document and concept...');
  const document = await db.document.create({
    data: {
      userId: user.id,
      title: 'Test Document',
      fileType: 'txt',
      rawText: 'This is a test document for learning Neon CRUD.',
    },
  });
  console.log('   Document created:', document);

  const concept = await db.concept.create({
    data: {
      documentId: document.id,
      name: 'Neon Database',
      originalText: 'A serverless PostgreSQL database.',
      category: 'Technology',
    },
  });
  console.log('   Concept created:', concept);

  // READ with relations
  console.log('\n5. READ (with relations): Fetching user with documents...');
  const userWithDocs = await db.user.findUnique({
    where: { id: user.id },
    include: { documents: true },
  });
  console.log('   User with documents:', userWithDocs);

  // DELETE - Clean up test data
  console.log('\n6. DELETE: Cleaning up test data...');
  await db.user.delete({ where: { id: user.id } });
  console.log('   Deleted user and cascade-deleted related records');

  console.log('\n✅ All CRUD operations completed successfully!');
}

testCRUD().catch((error) => {
  console.error('❌ Error during CRUD test:', error);
  process.exit(1);
});
