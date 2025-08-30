import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper to generate random strings
function randomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to get random integer between min and max (inclusive)
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // -------------------
  // Roles
  // -------------------
  const roles = ['owner', 'editor', 'viewer'];
  const roleRecords = await Promise.all(
    roles.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // -------------------
  // Users
  // -------------------
  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      userName: 'alice',
      passwordHash,
      isEmailVerified: true,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      userName: 'bob',
      passwordHash,
      isEmailVerified: false,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      userName: 'charlie',
      passwordHash,
      isEmailVerified: true,
    },
  });

  // New user with long name
  const longNameUser = await prisma.user.create({
    data: {
      email: 'longuser@example.com',
      userName: randomString(100),
      passwordHash,
      isEmailVerified: true,
    },
  });

  const users = [alice, bob, charlie, longNameUser];

  // -------------------
  // Projects
  // -------------------
  const project1 = await prisma.project.create({
    data: {
      name: 'Project Alpha',
      creatorId: alice.id,
      lastSavedAt: new Date(),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Project Beta',
      creatorId: bob.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Project Gamma',
      creatorId: charlie.id,
      lastSavedAt: new Date(),
    },
  });

  // Long-name project
  const longNameProject = await prisma.project.create({
    data: {
      name: randomString(100),
      creatorId: longNameUser.id,
      lastSavedAt: new Date(),
    },
  });

  const extraProject1 = await prisma.project.create({
    data: {
      name: `Project ${randomString(15)}`,
      creatorId: alice.id,
      lastSavedAt: new Date(),
    },
  });

  const extraProject2 = await prisma.project.create({
    data: {
      name: `Project ${randomString(15)}`,
      creatorId: bob.id,
      lastSavedAt: new Date(),
    },
  });

  const extraProject3 = await prisma.project.create({
    data: {
      name: `Project ${randomString(15)}`,
      creatorId: charlie.id,
      lastSavedAt: new Date(),
    },
  });

  const extraProject4 = await prisma.project.create({
    data: {
      name: `Project ${randomString(15)}`,
      creatorId: longNameUser.id,
      lastSavedAt: new Date(),
    },
  });

  const extraProject5 = await prisma.project.create({
    data: {
      name: `Project ${randomString(15)}`,
      creatorId: alice.id,
      lastSavedAt: new Date(),
    },
  });

  // -------------------
  // Collaborations
  // -------------------
  await prisma.collaboration.create({
    data: {
      userId: alice.id,
      projectId: project1.id,
      roles: {
        connect: [{ id: roleRecords.find((r) => r.name === 'owner')!.id }],
      },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: bob.id,
      projectId: project1.id,
      roles: {
        connect: [{ id: roleRecords.find((r) => r.name === 'editor')!.id }],
      },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: charlie.id,
      projectId: project1.id,
      roles: {
        connect: [{ id: roleRecords.find((r) => r.name === 'viewer')!.id }],
      },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: alice.id,
      projectId: project2.id,
      roles: {
        connect: [{ id: roleRecords.find((r) => r.name === 'viewer')!.id }],
      },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: bob.id,
      projectId: project2.id,
      roles: {
        connect: [{ id: roleRecords.find((r) => r.name === 'owner')!.id }],
      },
    },
  });
  
  await prisma.collaboration.create({
    data: {
      userId: charlie.id,
      projectId: project3.id,
      roles: {
        connect: [{ id: roleRecords.find((r) => r.name === 'owner')!.id }],
      },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: longNameUser.id,
      projectId: longNameProject.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'owner')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: alice.id,
      projectId: extraProject1.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'owner')!.id }] },
    },
  });
  
  await prisma.collaboration.create({
    data: {
      userId: bob.id,
      projectId: extraProject1.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'editor')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: charlie.id,
      projectId: extraProject1.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'viewer')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: bob.id,
      projectId: extraProject2.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'owner')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: alice.id,
      projectId: extraProject2.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'viewer')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: charlie.id,
      projectId: extraProject3.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'owner')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: bob.id,
      projectId: extraProject3.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'editor')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: longNameUser.id,
      projectId: extraProject4.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'owner')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: alice.id,
      projectId: extraProject4.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'viewer')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: bob.id,
      projectId: extraProject4.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'editor')!.id }] },
    },
  });

  await prisma.collaboration.create({
    data: {
      userId: alice.id,
      projectId: extraProject5.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'owner')!.id }] },
    },
  });
  
  await prisma.collaboration.create({
    data: {
      userId: charlie.id,
      projectId: extraProject5.id,
      roles: { connect: [{ id: roleRecords.find(r => r.name === 'viewer')!.id }] },
    },
  });
  
  // -------------------
  // Refresh Tokens
  // -------------------
  await prisma.refreshToken.createMany({
    data: [
      {
        tokenHash: 'refresh_token_1',
        deviceId: 'device1',
        userId: alice.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
      {
        tokenHash: 'refresh_token_2',
        deviceId: 'device2',
        userId: bob.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    ],
  });

  // -------------------
  // Email Verification Tokens
  // -------------------
  await prisma.emailVerificationToken.createMany({
    data: [
      {
        tokenHash: 'email_token_1',
        userId: alice.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
      {
        tokenHash: 'email_token_2',
        userId: bob.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    ],
  });

  // -------------------
  // TwoFA Challenges
  // -------------------
  await prisma.twoFaChallenge.createMany({
    data: [
      {
        tokenHash: '2fa_token_1',
        userId: alice.id,
        action: 'login',
        method: 'email',
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
      {
        tokenHash: '2fa_token_2',
        userId: bob.id,
        action: 'enable2fa',
        method: 'totp',
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    ],
  });

  // -------------------
  // Audit Logs
  // -------------------
  await prisma.auditLog.createMany({
    data: [
      {
        eventType: 'login',
        ipAddress: '127.0.0.1',
        userId: alice.id,
      },
      {
        eventType: 'project_created',
        ipAddress: '127.0.0.1',
        userId: bob.id,
      },
    ],
  });

  console.log('✅ Seed data inserted!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
