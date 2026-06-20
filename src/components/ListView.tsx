'use client';

import React from 'react';
import { Job, JobStatus } from '../types';
import { MapPin, DollarSign, Calendar, Edit2, ExternalLink, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface ListViewProps {
  jobs: Job[];
  onEditJob: (job: Job) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'appliedDate' | 'company' | 'title' | 'salary') => void;
}

export default function ListView({ jobs, onEditJob, sortBy, sortOrder, onSort }: ListViewProps) {
  // Helper to format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const badges = {
      saved: { bg: 'bg-slate-50 border-slate-100 text-slate-700', label: 'Saved' },
      applied: { bg: 'bg-blue-50 border-blue-100 text-blue-700', label: 'Applied' },
      interviewing: { bg: 'bg-amber-50 border-amber-100 text-amber-700', label: 'Interview' },
      offer: { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', label: 'Offer' },
      rejected: { bg: 'bg-rose-50 border-rose-100 text-rose-700', label: 'Rejected' },
    };

    const config = badges[status] || badges.saved;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${config.bg}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {config.label}
      </span>
    );
  };

  const renderSortHeader = (
    field: 'appliedDate' | 'company' | 'title' | 'salary',
    label: string
  ) => {
    const isActive = sortBy === field;
    return (
      <button
        onClick={() => onSort(field)}
        className="group inline-flex items-center gap-1 font-bold text-xs text-slate-500 hover:text-slate-800 transition-colors"
      >
        {label}
        {isActive ? (
          sortOrder === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5 text-indigo-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-indigo-600" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
      {/* Mobile Sort Options (shown on small screens) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 sm:hidden">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort by</span>
        <div className="flex items-center gap-1.5">
          <select
            value={sortBy}
            onChange={(e) => onSort(e.target.value as 'appliedDate' | 'company' | 'title' | 'salary')}
            className="bg-transparent border-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer outline-hidden py-0"
          >
            <option value="appliedDate">Date Applied</option>
            <option value="company">Company</option>
            <option value="title">Role Title</option>
            <option value="salary">Salary</option>
          </select>
          <button
            onClick={() => onSort(sortBy as 'appliedDate' | 'company' | 'title' | 'salary')}
            className="text-indigo-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            type="button"
          >
            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Card List (shown on small screens) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onEditJob(job)}
              className="p-4 active:bg-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{job.title}</h4>
                  <p className="text-xs font-medium text-slate-500">{job.company}</p>
                </div>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {job.location} ({job.locationType})
                </span>
                {job.salary && (
                  <span className="flex items-center gap-0.5 text-slate-500">
                    <DollarSign className="h-3 w-3" /> {job.salary}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatDate(job.appliedDate)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 italic text-sm">
            No applications match the search or filter criteria.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4">
                {renderSortHeader('title', 'Role')}
              </th>
              <th className="px-6 py-4">
                {renderSortHeader('company', 'Company')}
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">Status</th>
              <th className="px-6 py-4">
                {renderSortHeader('appliedDate', 'Date Applied')}
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">Location</th>
              <th className="px-6 py-4">
                {renderSortHeader('salary', 'Salary')}
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-50/40 group transition-colors cursor-pointer"
                  onClick={() => onEditJob(job)}
                >
                  <td className="px-6 py-4 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">{job.company}</td>
                  <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{formatDate(job.appliedDate)}</td>
                  <td className="px-6 py-4">
                    <div className="max-w-[150px] truncate text-slate-500 font-medium">
                      {job.location}
                      <span className="ml-1.5 text-[10px] uppercase font-bold text-slate-400 border border-slate-100 px-1 rounded-sm">
                        {job.locationType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{job.salary || '—'}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-100 bg-white text-slate-400 hover:text-slate-600 hover:shadow-xs transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-1.5 rounded-lg border border-slate-100 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xs transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                  No applications match the search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
