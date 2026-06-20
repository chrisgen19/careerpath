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

/** GET /api/jobs — list the current user's jobs. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    include: jobInclude,
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(jobs.map(serializeJob));
}

/** POST /api/jobs — create a job for the current user. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const input = (await req.json()) as JobInput;
  if (!input?.title || !input?.company || !input?.status || !input?.locationType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      ...toScalarData(input),
      tasks: { create: toTaskCreate(input) },
      starStories: { create: toStarStoryCreate(input) },
    },
    include: jobInclude,
  });

  return NextResponse.json(serializeJob(job), { status: 201 });
}
