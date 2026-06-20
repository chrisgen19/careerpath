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

/**
 * POST /api/jobs/import — replace the current user's jobs with an imported
 * backup (powers the "Import" button). Runs as a single transaction.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const incoming = (await req.json()) as JobInput[];
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: 'Expected an array of jobs' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.job.deleteMany({ where: { userId: user.id } }),
    ...incoming.map((job) =>
      prisma.job.create({
        data: {
          userId: user.id,
          ...toScalarData(job),
          tasks: { create: toTaskCreate(job) },
          starStories: { create: toStarStoryCreate(job) },
        },
      }),
    ),
  ]);

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    include: jobInclude,
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(jobs.map(serializeJob));
}
