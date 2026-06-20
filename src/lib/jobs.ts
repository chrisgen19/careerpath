import type { Prisma } from '@/generated/prisma/client';
import type { Job } from '@/types';

/** Relations always loaded when returning a job to the client. */
export const jobInclude = {
  tasks: true,
  starStories: true,
} satisfies Prisma.JobInclude;

export type JobRow = Prisma.JobGetPayload<{ include: typeof jobInclude }>;

/** Payload accepted from the client when creating/updating a job. */
export type JobInput = Omit<Job, 'id' | 'updatedAt'> & { id?: string };

/**
 * Maps a Prisma job row (with relations) back into the exact `Job` shape the
 * frontend already expects — re-nesting the flattened contact columns and
 * serializing the timestamp.
 */
export function serializeJob(job: JobRow): Job {
  const hasContact =
    job.contactName || job.contactRole || job.contactEmail || job.contactPhone;

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    status: job.status,
    appliedDate: job.appliedDate,
    location: job.location,
    locationType: job.locationType,
    salary: job.salary ?? undefined,
    url: job.url ?? undefined,
    contact: hasContact
      ? {
          name: job.contactName ?? undefined,
          role: job.contactRole ?? undefined,
          email: job.contactEmail ?? undefined,
          phone: job.contactPhone ?? undefined,
        }
      : undefined,
    resumeVersion: job.resumeVersion ?? undefined,
    notes: job.notes ?? undefined,
    tasks: job.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      dueDate: t.dueDate ?? undefined,
    })),
    updatedAt: job.updatedAt.toISOString(),
    submissionMethod: job.submissionMethod ?? undefined,
    portalEmail: job.portalEmail ?? undefined,
    portalUrl: job.portalUrl ?? undefined,
    jobDescription: job.jobDescription ?? undefined,
    starStories: job.starStories.map((s) => ({
      id: s.id,
      title: s.title,
      situation: s.situation,
      task: s.task,
      action: s.action,
      result: s.result,
    })),
  };
}

/** Flattens a job input into the scalar columns Prisma stores. */
export function toScalarData(input: JobInput) {
  return {
    title: input.title,
    company: input.company,
    status: input.status,
    appliedDate: input.appliedDate ?? '',
    location: input.location ?? '',
    locationType: input.locationType,
    salary: input.salary ?? null,
    url: input.url ?? null,
    resumeVersion: input.resumeVersion ?? null,
    notes: input.notes ?? null,
    submissionMethod: input.submissionMethod ?? null,
    portalEmail: input.portalEmail ?? null,
    portalUrl: input.portalUrl ?? null,
    jobDescription: input.jobDescription ?? null,
    contactName: input.contact?.name ?? null,
    contactRole: input.contact?.role ?? null,
    contactEmail: input.contact?.email ?? null,
    contactPhone: input.contact?.phone ?? null,
  };
}

/** Nested `create` payload for a job's tasks. */
export function toTaskCreate(input: JobInput) {
  return (input.tasks ?? []).map((t) => ({
    title: t.title,
    completed: t.completed ?? false,
    dueDate: t.dueDate ?? null,
  }));
}

/** Nested `create` payload for a job's STAR stories. */
export function toStarStoryCreate(input: JobInput) {
  return (input.starStories ?? []).map((s) => ({
    title: s.title,
    situation: s.situation,
    task: s.task,
    action: s.action,
    result: s.result,
  }));
}
