'use client';

import React, { useState } from 'react';
import { Job, JobStatus, LocationType, Task, SubmissionMethod, StarStory } from '../types';
import { X, Plus, Trash2, Calendar, DollarSign, Link2, User, Mail, Phone, FileText, CheckCircle2, AlignLeft, Brain, LogIn, Sparkles } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job; // If provided, we are editing
  onSave: (
    jobData: Omit<Job, 'id' | 'updatedAt'> & { id?: string },
  ) => Promise<boolean> | boolean;
  onDelete?: (id: string) => void;
}

export default function JobModal({ isOpen, onClose, job, onSave, onDelete }: JobModalProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'details' | 'jd' | 'portal' | 'star'>('details');

  // Main form states
  const [title, setTitle] = useState(job?.title || '');
  const [company, setCompany] = useState(job?.company || '');
  const [status, setStatus] = useState<JobStatus>(job?.status || 'saved');
  const [appliedDate, setAppliedDate] = useState(job?.appliedDate || new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(job?.location || '');
  const [locationType, setLocationType] = useState<LocationType>(job?.locationType || 'remote');
  const [salary, setSalary] = useState(job?.salary || '');
  const [url, setUrl] = useState(job?.url || '');
  const [resumeVersion, setResumeVersion] = useState(job?.resumeVersion || '');
  const [notes, setNotes] = useState(job?.notes || '');

  // Premium states
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>(job?.submissionMethod || 'website');
  const [portalEmail, setPortalEmail] = useState(job?.portalEmail || '');
  const [portalUrl, setPortalUrl] = useState(job?.portalUrl || '');
  const [jobDescription, setJobDescription] = useState(job?.jobDescription || '');
  const [starStories, setStarStories] = useState<StarStory[]>(job?.starStories || []);

  // Contact state
  const [contactName, setContactName] = useState(job?.contact?.name || '');
  const [contactRole, setContactRole] = useState(job?.contact?.role || '');
  const [contactEmail, setContactEmail] = useState(job?.contact?.email || '');
  const [contactPhone, setContactPhone] = useState(job?.contact?.phone || '');

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(job?.tasks || [
    { id: 't-default-1', title: 'Submit application', completed: false },
    { id: 't-default-2', title: 'Follow up (5 days after)', completed: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // STAR Story builder states
  const [newStarTitle, setNewStarTitle] = useState('');
  const [newStarSituation, setNewStarSituation] = useState('');
  const [newStarTask, setNewStarTask] = useState('');
  const [newStarAction, setNewStarAction] = useState('');
  const [newStarResult, setNewStarResult] = useState('');
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  // Save flow state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Early return if modal is closed
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      alert('Job Title and Company Name are required.');
      return;
    }

    const jobData: Omit<Job, 'id' | 'updatedAt'> & { id?: string } = {
      title: title.trim(),
      company: company.trim(),
      status,
      appliedDate,
      location: location.trim(),
      locationType,
      salary: salary.trim(),
      url: url.trim(),
      resumeVersion: resumeVersion.trim(),
      notes: notes.trim(),
      submissionMethod,
      portalEmail: portalEmail.trim(),
      portalUrl: portalUrl.trim(),
      jobDescription: jobDescription.trim(),
      starStories,
      contact: {
        name: contactName.trim(),
        role: contactRole.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
      },
      tasks,
    };

    if (job) {
      jobData.id = job.id;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      const ok = await onSave(jobData);
      if (ok) {
        onClose();
      } else {
        setSaveError('Could not save your changes. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Task operations
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: newTaskTitle.trim(),
      completed: false,
      dueDate: newTaskDueDate ? newTaskDueDate : undefined,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // STAR Story operations
  const handleAddStarStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStarTitle.trim()) return;

    const newStory: StarStory = {
      id: `star-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: newStarTitle.trim(),
      situation: newStarSituation.trim(),
      task: newStarTask.trim(),
      action: newStarAction.trim(),
      result: newStarResult.trim(),
    };

    setStarStories([...starStories, newStory]);
    setNewStarTitle('');
    setNewStarSituation('');
    setNewStarTask('');
    setNewStarAction('');
    setNewStarResult('');
  };

  const handleDeleteStarStory = (storyId: string) => {
    setStarStories(starStories.filter((s) => s.id !== storyId));
  };

  // Native .ics calendar generator
  const handleAddToCalendar = (taskTitle: string, dueDate: string) => {
    try {
      const cleanDate = dueDate.replace(/-/g, '');
      const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const companyLabel = company || 'Unknown Company';

      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CareerPath//JobTracker//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:event-${Date.now()}@careerpath.app`,
        `DTSTAMP:${nowStr}`,
        `DTSTART;VALUE=DATE:${cleanDate}`,
        `SUMMARY:CareerPath: ${taskTitle} (${companyLabel})`,
        `DESCRIPTION:Task: ${taskTitle} for your application at ${companyLabel}.`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT12H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ];

      const icsContent = icsLines.join('\r\n');
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const dlUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = dlUrl;
      link.setAttribute('download', `${companyLabel.replace(/\s+/g, '_')}_${taskTitle.replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(dlUrl);
    } catch (err) {
      console.error('Failed to export calendar event', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] max-w-3xl bg-white sm:border sm:border-slate-100 sm:rounded-2xl shadow-2xl transition-all scale-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 leading-tight">
              {job ? `Edit Position at ${job.company}` : 'Track New Position'}
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {title && company ? `${title} • ${company}` : 'Fill in details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 px-6 bg-slate-50/50 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all -mb-px shrink-0 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="h-4 w-4" /> Application Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jd')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all -mb-px shrink-0 ${
              activeTab === 'jd'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <AlignLeft className="h-4 w-4" /> JD Backup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all -mb-px shrink-0 ${
              activeTab === 'portal'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <LogIn className="h-4 w-4" /> Portal & Logins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('star')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all -mb-px shrink-0 ${
              activeTab === 'star'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Brain className="h-4 w-4" /> STAR Prep Stories
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Primary details */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3.5 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-slate-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Stripe"
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3.5 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              {/* Status and Logistics */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-slate-700">
                    Pipeline Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="appliedDate" className="block text-sm font-semibold text-slate-700">
                    Date Applied / Saved
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="date"
                      id="appliedDate"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-semibold text-slate-700">
                    Salary
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      id="salary"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. $120k - $140k"
                      className="block w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    />
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Location and Type */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label htmlFor="location" className="block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / New York, NY"
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3.5 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="locationType" className="block text-sm font-semibold text-slate-700">
                    Workplace Type
                  </label>
                  <select
                    id="locationType"
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as LocationType)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-slate-700">
                    Job Posting URL
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="block w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    />
                    <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="resumeVersion" className="block text-sm font-semibold text-slate-700">
                    Resume Version Used
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      id="resumeVersion"
                      value={resumeVersion}
                      onChange={(e) => setResumeVersion(e.target.value)}
                      placeholder="e.g. Resume_V2_Stripe.pdf"
                      className="block w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    />
                    <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Contacts section */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <User className="h-4.5 w-4.5 text-slate-500" /> Key Contact / Recruiter
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 px-3.5 py-1.5 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Role (e.g. Talent Lead)"
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 px-3.5 py-1.5 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 pl-9 pr-3.5 py-1.5 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                      />
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 pl-9 pr-3.5 py-1.5 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
                      />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Checklist / Tasks with Calendar sync */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-500" /> Application Checklist
                </h3>

                {tasks.length > 0 ? (
                  <div className="space-y-2 mb-4 max-h-[180px] overflow-y-auto pr-1">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 transition-colors"
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 pr-4">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span
                            className={`text-sm font-medium truncate ${
                              task.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-700'
                            }`}
                          >
                            {task.title}
                          </span>
                        </label>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.dueDate && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                                Due: {task.dueDate}
                              </span>
                              <button
                                type="button"
                                title="Add deadline to Calendar"
                                onClick={() => handleAddToCalendar(task.title, task.dueDate!)}
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 bg-white transition-all shadow-xs"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-xs"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic mb-4">No checklist items. Add one below!</p>
                )}

                {/* Add Task Box */}
                <div className="flex flex-col gap-2 p-3 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 sm:flex-row">
                  <input
                    type="text"
                    placeholder="New task title... (e.g. Schedule call)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 text-xs placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-800 text-xs focus:border-indigo-500 outline-hidden bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-slate-700">
                  Notes & Interview Prep
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record feedback, questions, prep, or company highlights..."
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: JOB DESCRIPTION SNAPSHOT */}
          {activeTab === 'jd' && (
            <div className="space-y-4">
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-start gap-2.5">
                <AlignLeft className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-normal">
                  <span className="font-bold">Job Description Backup:</span> Paste the complete job posting description text here. This protects your reference copy if the hiring team deletes or hides the original post online.
                </div>
              </div>
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-semibold text-slate-700">
                  Full Job Description Text
                </label>
                <textarea
                  id="jobDescription"
                  rows={16}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job posting description here..."
                  className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white resize-none font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSION PORTALS */}
          {activeTab === 'portal' && (
            <div className="space-y-6">
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-2.5">
                <LogIn className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 leading-normal">
                  <span className="font-bold">Application Portals:</span> Track what channels you submitted through, and save login details for Workday, Greenhouse, or company-specific application portal status pages.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="submissionMethod" className="block text-sm font-semibold text-slate-700">
                    Submission Channel
                  </label>
                  <select
                    id="submissionMethod"
                    value={submissionMethod}
                    onChange={(e) => setSubmissionMethod(e.target.value as SubmissionMethod)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 text-sm focus:border-indigo-500 outline-hidden bg-white"
                  >
                    <option value="website">Company Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="referral">Employee Referral</option>
                    <option value="other">Other Portal / Sourcer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="portalEmail" className="block text-sm font-semibold text-slate-700">
                    Portal Login Email Address
                  </label>
                  <input
                    type="email"
                    id="portalEmail"
                    value={portalEmail}
                    onChange={(e) => setPortalEmail(e.target.value)}
                    placeholder="e.g. yourname+workday@gmail.com"
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3.5 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="portalUrl" className="block text-sm font-semibold text-slate-700">
                  Portal Status Check Link
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="url"
                    id="portalUrl"
                    value={portalUrl}
                    onChange={(e) => setPortalUrl(e.target.value)}
                    placeholder="e.g. https://stripe.workdayjobs.com/stripe"
                    className="block w-full rounded-lg border border-slate-200 pl-10 pr-3.5 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white"
                  />
                  <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                {portalUrl && (
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    Launch portal checks <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STAR PREP STORY builder */}
          {activeTab === 'star' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-start gap-2.5">
                <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-800 leading-normal">
                  <span className="font-bold">STAR Behavioral Interview Method:</span> Outline structured answers to behavioural questions for this company. Detail the <span className="font-bold">S</span>ituation, <span className="font-bold">T</span>ask, <span className="font-bold">A</span>ction, and <span className="font-bold">R</span>esult.
                </div>
              </div>

              {/* Add STAR Story Form */}
              <form onSubmit={handleAddStarStory} className="p-4 border border-dashed border-indigo-150 bg-indigo-50/20 rounded-xl space-y-3.5">
                <h4 className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider">
                  Create Behavioral Prep Story
                </h4>
                
                <div>
                  <input
                    type="text"
                    placeholder="Story Title (e.g. API Gateway Redesign)"
                    value={newStarTitle}
                    onChange={(e) => setNewStarTitle(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 px-3.5 py-1.5 text-slate-800 text-xs placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Situation</label>
                    <textarea
                      placeholder="Context. What was the conflict/problem?"
                      value={newStarSituation}
                      onChange={(e) => setNewStarSituation(e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 text-xs placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Task</label>
                    <textarea
                      placeholder="Goal. What needed to be resolved?"
                      value={newStarTask}
                      onChange={(e) => setNewStarTask(e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 text-xs placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Action</label>
                    <textarea
                      placeholder="What specific steps did YOU take?"
                      value={newStarAction}
                      onChange={(e) => setNewStarAction(e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 text-xs placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Result</label>
                    <textarea
                      placeholder="Outcome. Metrics, improvements, lessons learned."
                      value={newStarResult}
                      onChange={(e) => setNewStarResult(e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 text-xs placeholder:text-slate-400 focus:border-indigo-500 outline-hidden bg-white resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4.5 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Save Story
                </button>
              </form>

              {/* List of Star Stories */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Saved Stories ({starStories.length})</h4>
                {starStories.length > 0 ? (
                  starStories.map((story) => {
                    const isExpanded = expandedStoryId === story.id;
                    return (
                      <div
                        key={story.id}
                        className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50"
                      >
                        <div
                          onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                          className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-50 cursor-pointer hover:bg-slate-50/30 transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-800 truncate pr-4">
                            ⭐ {story.title}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-semibold text-slate-400">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStarStory(story.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs leading-relaxed text-slate-600 bg-white">
                            <div>
                              <span className="block font-extrabold text-[9px] text-slate-400 uppercase tracking-wide">
                                Situation
                              </span>
                              <p className="mt-1 font-medium">{story.situation || '—'}</p>
                            </div>
                            <div>
                              <span className="block font-extrabold text-[9px] text-slate-400 uppercase tracking-wide">
                                Task
                              </span>
                              <p className="mt-1 font-medium">{story.task || '—'}</p>
                            </div>
                            <div>
                              <span className="block font-extrabold text-[9px] text-slate-400 uppercase tracking-wide">
                                Action
                              </span>
                              <p className="mt-1 font-medium">{story.action || '—'}</p>
                            </div>
                            <div>
                              <span className="block font-extrabold text-[9px] text-slate-400 uppercase tracking-wide">
                                Result
                              </span>
                              <p className="mt-1 font-medium">{story.result || '—'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No behavioral stories created yet.</p>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 sm:rounded-b-2xl">
          <div>
            {job && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to remove your application for ${job.company}?`)) {
                    onDelete(job.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" /> Delete Tracker
              </button>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {saveError && (
              <p className="text-xs font-semibold text-red-600">{saveError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : job ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline mini helper icon to prevent extra packages
function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
