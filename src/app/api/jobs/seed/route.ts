import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/server-auth';
import { INITIAL_MOCK_JOBS } from '@/mockData';
import {
  jobInclude,
  serializeJob,
  toScalarData,
  toTaskCreate,
  toStarStoryCreate,
} from '@/lib/jobs';

/**
 * POST /api/jobs/seed — load the bundled sample jobs into the current user's
 * account (powers the "Load Samples" button). Additive: each call inserts the
 * sample set for the signed-in user.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.$transaction(
    INITIAL_MOCK_JOBS.map((sample) =>
      prisma.job.create({
        data: {
          userId: user.id,
          ...toScalarData(sample),
          tasks: { create: toTaskCreate(sample) },
          starStories: { create: toStarStoryCreate(sample) },
        },
      }),
    ),
  );

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    include: jobInclude,
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(jobs.map(serializeJob));
}
