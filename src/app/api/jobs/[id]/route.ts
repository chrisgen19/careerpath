import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/server-auth';
import {
  jobInclude,
  serializeJob,
  toScalarData,
  toTaskCreate,
  toStarStoryCreate,
  type JobInput,
} from '@/lib/jobs';

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/jobs/[id] — update a job (replaces tasks & STAR stories). */
export async function PATCH(req: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.job.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const input = (await req.json()) as JobInput;

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...toScalarData(input),
      tasks: { deleteMany: {}, create: toTaskCreate(input) },
      starStories: { deleteMany: {}, create: toStarStoryCreate(input) },
    },
    include: jobInclude,
  });

  return NextResponse.json(serializeJob(job));
}

/** DELETE /api/jobs/[id] — delete a job owned by the current user. */
export async function DELETE(_req: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.job.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
