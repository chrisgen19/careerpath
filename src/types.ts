export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
export type LocationType = 'remote' | 'hybrid' | 'onsite';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
}

export interface Contact {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export type SubmissionMethod = 'linkedin' | 'indeed' | 'website' | 'referral' | 'other';

export interface StarStory {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  appliedDate: string; // YYYY-MM-DD
  location: string; // e.g., "New York, NY" or "Remote"
  locationType: LocationType;
  salary?: string; // e.g., "$120,000 - $140,000" or "100k"
  url?: string; // job posting link
  contact?: Contact;
  resumeVersion?: string; // resume used for applying
  notes?: string; // notes/descriptions/prep
  tasks: Task[];
  updatedAt: string; // ISO timestamp
  submissionMethod?: SubmissionMethod;
  portalEmail?: string;
  portalUrl?: string;
  jobDescription?: string;
  starStories?: StarStory[];
}

export type ViewMode = 'board' | 'list' | 'analytics';

export interface FilterState {
  search: string;
  status: JobStatus | 'all';
  locationType: LocationType | 'all';
  sortBy: 'appliedDate' | 'company' | 'title' | 'salary';
  sortOrder: 'asc' | 'desc';
}

export interface DashboardStats {
  totalJobs: number;
  savedCount: number;
  appliedCount: number;
  interviewingCount: number;
  offerCount: number;
  rejectedCount: number;
  responseRate: number; // % of applied jobs that got response (interviewing, offer, rejected)
  offerRate: number; // % of applied jobs that got offer
  pendingTasksCount: number;
}
