'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Job, JobStatus, DashboardStats } from '../types';

type JobInput = Omit<Job, 'id' | 'updatedAt'>;

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

/**
 * API-backed job store. Loads the signed-in user's jobs from PostgreSQL and
 * persists every change through the `/api/jobs` endpoints. Mutations update
 * local state optimistically and self-heal via refetch on failure.
 */
export function useJobTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const router = useRouter();

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (res.ok) {
        setJobs(await res.json());
        setLoadError(false);
      } else {
        // Non-401 server error (e.g. DB unreachable) — surface it instead of
        // silently rendering an empty dashboard.
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setIsLoaded(true);
    }
  }, [router]);

  // Initial load — state is set after `await`, never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/jobs');
        if (cancelled) return;
        if (res.status === 401) {
          // Stale/invalid session cookie — bounce to login instead of rendering
          // an empty dashboard. Keep the loading screen up during the redirect.
          router.replace('/login');
          return;
        }
        if (res.ok) {
          setJobs(await res.json());
          setLoadError(false);
        } else {
          // Non-401 server error — surface it rather than an empty dashboard.
          setLoadError(true);
        }
        setIsLoaded(true);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setIsLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const addJob = useCallback(
    async (jobInput: JobInput): Promise<Job | null> => {
      try {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify(jobInput),
        });
        if (!res.ok) {
          await refetch();
          return null;
        }
        const created: Job = await res.json();
        setJobs((prev) => [created, ...prev]);
        return created;
      } catch {
        await refetch();
        return null;
      }
    },
    [refetch],
  );

  const updateJob = useCallback(
    async (updatedJob: Job): Promise<boolean> => {
      try {
        const res = await fetch(`/api/jobs/${updatedJob.id}`, {
          method: 'PATCH',
          headers: JSON_HEADERS,
          body: JSON.stringify(updatedJob),
        });
        if (!res.ok) {
          await refetch();
          return false;
        }
        const saved: Job = await res.json();
        setJobs((prev) => prev.map((job) => (job.id === saved.id ? saved : job)));
        return true;
      } catch {
        await refetch();
        return false;
      }
    },
    [refetch],
  );

  const deleteJob = useCallback(
    async (id: string): Promise<boolean> => {
      // Snapshot the job so we can restore it if the delete fails — more reliable
      // than refetch(), which itself can fail (e.g. an expired session).
      const previous = jobs.find((job) => job.id === id);
      setJobs((prev) => prev.filter((job) => job.id !== id)); // optimistic removal

      const restore = () => {
        if (previous) {
          setJobs((prev) => [previous, ...prev.filter((job) => job.id !== id)]);
        }
      };

      try {
        const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          restore();
          return false;
        }
        return true;
      } catch {
        restore();
        return false;
      }
    },
    [jobs],
  );

  const moveJob = useCallback(
    async (jobId: string, newStatus: JobStatus) => {
      // Compute the patched job up-front from current state — never read a value
      // assigned inside a setState updater (its execution timing isn't guaranteed).
      const current = jobs.find((job) => job.id === jobId);
      if (!current) return;

      // When entering "applied" from "saved" (or with no date), stamp today.
      let appliedDate = current.appliedDate;
      if (newStatus === 'applied' && (current.status === 'saved' || !current.appliedDate)) {
        appliedDate = new Date().toISOString().split('T')[0];
      }
      const patched: Job = { ...current, status: newStatus, appliedDate };

      // Optimistic move so drag-and-drop feels instant.
      setJobs((prev) => prev.map((job) => (job.id === jobId ? patched : job)));

      // Roll the single card back to its previous value on failure — but only if
      // it's still on the status we set, so a newer move (which already
      // superseded this one) isn't clobbered by a late failure.
      const rollback = () =>
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId && job.status === patched.status ? current : job,
          ),
        );

      try {
        const res = await fetch(`/api/jobs/${jobId}`, {
          method: 'PATCH',
          headers: JSON_HEADERS,
          body: JSON.stringify(patched),
        });
        if (!res.ok) {
          rollback();
          return;
        }
        const saved: Job = await res.json();
        // Out-of-order guard: only apply the server row if the card is still on
        // the status we just set, so a late response can't clobber a newer move.
        setJobs((prev) =>
          prev.map((job) =>
            job.id === saved.id && job.status === patched.status ? saved : job,
          ),
        );
      } catch {
        rollback();
      }
    },
    [jobs],
  );

  /** Loads the bundled sample jobs into the current account. */
  const loadSamples = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/seed', { method: 'POST' });
      if (res.ok) {
        setJobs(await res.json());
      } else {
        await refetch();
      }
    } catch {
      await refetch();
    }
  }, [refetch]);

  /** Replaces all of the user's jobs with an imported backup. */
  const importData = useCallback(async (importedJobs: Job[]) => {
    // Reject empty/non-array payloads — importing `[]` would otherwise wipe
    // every job for the user (deleteMany with no replacements).
    if (!Array.isArray(importedJobs) || importedJobs.length === 0) return false;

    const isValid = importedJobs.every(
      (job) =>
        job.id &&
        typeof job.title === 'string' &&
        typeof job.company === 'string' &&
        job.status,
    );
    if (!isValid) return false;

    try {
      const res = await fetch('/api/jobs/import', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(importedJobs),
      });
      if (!res.ok) return false;

      setJobs(await res.json());
      return true;
    } catch {
      return false;
    }
  }, []);

  // Derive stats
  const stats = useMemo<DashboardStats>(() => {
    const totalJobs = jobs.length;
    const savedCount = jobs.filter((j) => j.status === 'saved').length;
    const appliedCount = jobs.filter((j) => j.status === 'applied').length;
    const interviewingCount = jobs.filter((j) => j.status === 'interviewing').length;
    const offerCount = jobs.filter((j) => j.status === 'offer').length;
    const rejectedCount = jobs.filter((j) => j.status === 'rejected').length;

    // Response rate calculations:
    // Defined as (interviewing + offer + rejected) / (applied + interviewing + offer + rejected)
    const activeAppliedCount = appliedCount + interviewingCount + offerCount + rejectedCount;
    const respondedCount = interviewingCount + offerCount + rejectedCount;

    const responseRate = activeAppliedCount > 0
      ? Math.round((respondedCount / activeAppliedCount) * 100)
      : 0;

    const offerRate = activeAppliedCount > 0
      ? Math.round((offerCount / activeAppliedCount) * 100)
      : 0;

    // Count pending tasks across all jobs
    const pendingTasksCount = jobs.reduce((acc, job) => {
      const pendingInJob = job.tasks?.filter((t) => !t.completed).length || 0;
      return acc + pendingInJob;
    }, 0);

    return {
      totalJobs,
      savedCount,
      appliedCount,
      interviewingCount,
      offerCount,
      rejectedCount,
      responseRate,
      offerRate,
      pendingTasksCount,
    };
  }, [jobs]);

  return {
    jobs,
    isLoaded,
    loadError,
    refetch,
    addJob,
    updateJob,
    deleteJob,
    moveJob,
    importData,
    loadSamples,
    stats,
  };
}
