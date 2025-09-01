import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export async function assertProjectExists(
  prisma: PrismaService,
  projectId: number,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) throw new NotFoundException(`Project ${projectId} not found`);
  return project;
}

export async function assertCollaborator(
  prisma: PrismaService,
  userId: number,
  projectId: number,
): Promise<void> {
  await assertProjectExists(prisma, projectId);
  const collab = await prisma.collaboration.findFirst({
    where: { userId, projectId },
    select: { id: true },
  });
  if (!collab)
    throw new ForbiddenException('Not allowed to access this project');
}

export async function assertOwner(
  prisma: PrismaService,
  userId: number,
  projectId: number,
): Promise<void> {
  await assertProjectExists(prisma, projectId);
  const owner = await prisma.collaboration.findFirst({
    where: {
      userId,
      projectId,
      roles: { some: { name: 'owner' } },
    },
    select: { id: true },
  });
  if (!owner)
    throw new ForbiddenException('Only the owner can perform this action');
}
