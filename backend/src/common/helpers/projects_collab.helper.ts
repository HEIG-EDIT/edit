import { ForbiddenException, NotFoundException } from '@nestjs/common';

export async function assertProjectExists(projectId: number) {
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new NotFoundException(`Project ${projectId} not found`);
  return project;
}

export async function assertCollaborator(
  userId: number,
  projectId: number,
): Promise<void> {
  await assertProjectExists(projectId);
  const collab = await this.prisma.collaboration.findFirst({
    where: { userId, projectId },
    select: { id: true },
  });
  if (!collab)
    throw new ForbiddenException('Not allowed to access this project');
}

export async function assertOwner(
  userId: number,
  projectId: number,
): Promise<void> {
  await assertProjectExists(projectId);
  const owner = await this.prisma.collaboration.findFirst({
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
