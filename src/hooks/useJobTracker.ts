'use client';

import { useState, useEffect, useMemo } from 'react';
import { Job, JobStatus, DashboardStats } from '../types';
import { INITIAL_MOCK_JOBS } from '../mockData';

const LOCAL_STORAGE_KEY = 'careerpath_jobs_data';

export function useJobTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setJobs(JSON.parse(stored));
        } else {
          // Seed with initial mock data
          setJobs(INITIAL_MOCK_JOBS);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_JOBS));
        }
      } catch (e) {
        console.error('Error loading data from localStorage', e);
        setJobs(INITIAL_MOCK_JOBS);
      } finally {
        setIsLoaded(true);
      }
    };

    // Load data asynchronously to avoid synchronous setState inside render/effects warnings
    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage whenever jobs state changes
  const saveJobs = (newJobs: Job[]) => {
    setJobs(newJobs);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newJobs));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  };

  const addJob = (jobInput: Omit<Job, 'id' | 'updatedAt'>) => {
    const newJob: Job = {
      ...jobInput,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      updatedAt: new Date().toISOString(),
    };
    const updated = [newJob, ...jobs];
    saveJobs(updated);
    return newJob;
  };

  const updateJob = (updatedJob: Job) => {
    const updated = jobs.map((job) => {
      if (job.id === updatedJob.id) {
        return {
          ...updatedJob,
          updatedAt: new Date().toISOString(),
        };
      }
      return job;
    });
    saveJobs(updated);
  };

  const deleteJob = (id: string) => {
    const updated = jobs.filter((job) => job.id !== id);
    saveJobs(updated);
  };

  const moveJob = (jobId: string, newStatus: JobStatus) => {
    const updated = jobs.map((job) => {
      if (job.id === jobId) {
        // If status changes to 'applied' and appliedDate is empty or default, update it to today's date
        let appliedDate = job.appliedDate;
        if (newStatus === 'applied' && (job.status === 'saved' || !job.appliedDate)) {
          appliedDate = new Date().toISOString().split('T')[0];
        }
        return {
          ...job,
          status: newStatus,
          appliedDate,
          updatedAt: new Date().toISOString(),
        };
      }
      return job;
    });
    saveJobs(updated);
  };

  const importData = (importedJobs: Job[]) => {
    if (!Array.isArray(importedJobs)) return false;
    
    // Basic validation
    const isValid = importedJobs.every(
      (job) =>
        job.id &&
        typeof job.title === 'string' &&
        typeof job.company === 'string' &&
        job.status
    );

    if (isValid) {
      saveJobs(importedJobs);
      return true;
    }
    return false;
  };

  const resetData = () => {
    saveJobs(INITIAL_MOCK_JOBS);
  };

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
    addJob,
    updateJob,
    deleteJob,
    moveJob,
    importData,
    resetData,
    stats,
  };
}
