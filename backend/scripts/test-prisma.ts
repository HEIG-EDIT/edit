/* before running the scripts: 
1) run docker desktop

2) run in bash:
    docker run --name my-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

3) set this in your .env:
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

4) run in bash (only once at the creation of the container):
    npx prisma generate
    npx prisma migrate dev --name init
    
5) then run the script:
    npx ts-node scripts/test-prisma.ts
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
