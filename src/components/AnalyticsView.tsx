'use client';

import React, { useMemo } from 'react';
import { Job } from '../types';
import { CheckSquare, Award, TrendingUp, AlertCircle, DollarSign, Share2 } from 'lucide-react';

interface AnalyticsViewProps {
  jobs: Job[];
}

export default function AnalyticsView({ jobs }: AnalyticsViewProps) {
  // 1. Calculate Status Breakdown
  const statusStats = useMemo(() => {
    const counts = {
      saved: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
    };
    jobs.forEach((j) => {
      if (counts[j.status] !== undefined) {
        counts[j.status]++;
      }
    });
    return counts;
  }, [jobs]);

  // 2. Calculate Workplace Location Type Breakdown
  const locationStats = useMemo(() => {
    const counts = { remote: 0, hybrid: 0, onsite: 0 };
    jobs.forEach((j) => {
      if (counts[j.locationType] !== undefined) {
        counts[j.locationType]++;
      }
    });
    return counts;
  }, [jobs]);

  // 3. Calculate Submission Method Breakdown
  const submissionStats = useMemo(() => {
    const counts = { website: 0, linkedin: 0, indeed: 0, referral: 0, other: 0 };
    jobs.forEach((j) => {
      const method = j.submissionMethod || 'website';
      if (counts[method] !== undefined) {
        counts[method]++;
      }
    });
    return counts;
  }, [jobs]);

  // 4. Calculate Salary Statistics
  const salaryStats = useMemo(() => {
    const parseSingleVal = (str: string): number | null => {
      let val = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (isNaN(val)) return null;
      // If it's like 120 or 150 (not fully expanded), but contains 'k', expand it
      if (str.includes('k')) val *= 1000;
      // If it is written like 120000, keep it
      return val;
    };

    const parseSalary = (salaryStr?: string): number | null => {
      if (!salaryStr) return null;
      const clean = salaryStr.toLowerCase().replace(/[\s$,]/g, '');
      if (clean.includes('-')) {
        const parts = clean.split('-');
        const val1 = parseSingleVal(parts[0]);
        const val2 = parseSingleVal(parts[1]);
        if (val1 && val2) return (val1 + val2) / 2;
        return val1 || val2 || null;
      }
      return parseSingleVal(clean);
    };

    const parsedSalaries = jobs
      .map((j) => parseSalary(j.salary))
      .filter((s): s is number => s !== null && s > 1000); // Filter out empty or low bogus values

    if (parsedSalaries.length === 0) return null;

    const min = Math.min(...parsedSalaries);
    const max = Math.max(...parsedSalaries);
    const avg = Math.round(parsedSalaries.reduce((sum, s) => sum + s, 0) / parsedSalaries.length);

    return { min, max, avg, count: parsedSalaries.length };
  }, [jobs]);

  // 5. Applications Over Time (grouped by Month)
  const timelineStats = useMemo(() => {
    const monthsData: { [key: string]: number } = {};
    
    const sortedJobs = [...jobs]
      .filter((j) => j.appliedDate)
      .sort((a, b) => a.appliedDate.localeCompare(b.appliedDate));

    sortedJobs.forEach((job) => {
      try {
        const date = new Date(job.appliedDate);
        if (isNaN(date.getTime())) return;
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthsData[monthYear] = (monthsData[monthYear] || 0) + 1;
      } catch {
        // Fallback for malformed dates
      }
    });

    return Object.entries(monthsData).map(([name, count]) => ({ name, count }));
  }, [jobs]);

  // 6. Tasks Completion Stats
  const taskStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    jobs.forEach((j) => {
      if (j.tasks) {
        total += j.tasks.length;
        completed += j.tasks.filter((t) => t.completed).length;
      }
    });
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [jobs]);

  // 7. Funnel Conversion Metrics
  const funnelMetrics = useMemo(() => {
    const totalApplied = jobs.filter((j) => j.status !== 'saved').length;
    const totalInterviewed = jobs.filter(
      (j) => j.status === 'interviewing' || j.status === 'offer' || (j.status === 'rejected' && j.tasks.length > 2)
    ).length;
    const totalOffers = statusStats.offer;

    const interviewConv = totalApplied > 0 ? Math.round((totalInterviewed / totalApplied) * 100) : 0;
    const offerConv = totalInterviewed > 0 ? Math.round((totalOffers / totalInterviewed) * 100) : 0;
    const overallConv = totalApplied > 0 ? Math.round((totalOffers / totalApplied) * 100) : 0;

    return {
      totalApplied,
      totalInterviewed,
      totalOffers,
      interviewConv,
      offerConv,
      overallConv,
    };
  }, [jobs, statusStats]);

  // Donut chart calculations
  const donutData = useMemo(() => {
    const data = [
      { key: 'saved', label: 'Saved', count: statusStats.saved, color: '#64748b' },
      { key: 'applied', label: 'Applied', count: statusStats.applied, color: '#2563eb' },
      { key: 'interviewing', label: 'Interview', count: statusStats.interviewing, color: '#d97706' },
      { key: 'offer', label: 'Offer', count: statusStats.offer, color: '#059669' },
      { key: 'rejected', label: 'Rejected', count: statusStats.rejected, color: '#e11d48' },
    ].filter((item) => item.count > 0);

    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    let accumulatedPercentage = 0;
    return data.map((item) => {
      const percentage = total > 0 ? (item.count / total) * 100 : 0;
      const startPercentage = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return {
        ...item,
        percentage,
        startPercentage,
      };
    });
  }, [statusStats]);

  const totalStatusCount = donutData.reduce((sum, item) => sum + item.count, 0);

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Fallback if no data is present
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-xs text-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">No Data Available</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1">
          Add some job applications first to see visual breakdown and analytics!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Analytics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            APPLICATION VELOCITY
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-800">
            {funnelMetrics.interviewConv}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Conversion of applications into interview requests
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <Award className="h-4 w-4 text-emerald-500" />
            OFFER SUCCESS RATE
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-800">
            {funnelMetrics.overallConv}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Ratio of final offers to total applications submitted
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <CheckSquare className="h-4 w-4 text-indigo-500" />
            TASK ENGAGEMENT
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-800">
            {taskStats.rate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {taskStats.completed} of {taskStats.total} tasks completed across all roles
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution Donut Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-1">
              Pipeline Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-6">Proportion of positions by active stages</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            {totalStatusCount > 0 ? (
              <div className="relative h-40 w-40 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  {donutData.map((seg, idx) => {
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDash = circumference;
                    const strokeDashoffset = circumference - (seg.percentage / 100) * circumference;
                    const rotation = (seg.startPercentage / 100) * 360;

                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(${rotation} 50 50)`}
                        className="transition-all duration-500 ease-out"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-800">{totalStatusCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-40 w-40 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-xs text-slate-400 font-medium italic">
                No active records
              </div>
            )}

            <div className="flex-1 space-y-2.5 w-full">
              {donutData.map((seg) => (
                <div key={seg.key} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-md" style={{ backgroundColor: seg.color }} />
                    <span className="text-slate-500">{seg.label}</span>
                  </div>
                  <div className="text-slate-800 flex items-center gap-1.5">
                    <span>{seg.count}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({Math.round(seg.percentage)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workplace Type Distribution */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-1">
              Workplace Preferences
            </h3>
            <p className="text-xs text-slate-400 mb-6">Distribution of remote, hybrid, and on-site applications</p>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {(['remote', 'hybrid', 'onsite'] as const).map((key) => {
              const count = locationStats[key];
              const total = locationStats.remote + locationStats.hybrid + locationStats.onsite;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const labels = {
                remote: { text: 'Remote', color: 'bg-emerald-500', textColors: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                hybrid: { text: 'Hybrid', color: 'bg-indigo-500', textColors: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
                onsite: { text: 'On-site', color: 'bg-slate-500', textColors: 'text-slate-700 bg-slate-50 border-slate-100' },
              };
              const config = labels[key];

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className={`px-2 py-0.5 border rounded-md text-[10px] uppercase ${config.textColors}`}>
                      {config.text}
                    </span>
                    <span className="text-slate-700">
                      {count} roles <span className="font-medium text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${config.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Premium Analytics Row: Salary and Channels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Compensation Analyzer */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-1 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Tracked Compensation
            </h3>
            <p className="text-xs text-slate-400 mb-6">Distribution and averages computed from salary details</p>
          </div>

          {salaryStats ? (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Min Salary</span>
                  <span className="text-sm font-extrabold text-slate-700 mt-1 block">
                    {formatCurrency(salaryStats.min)}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl ring-2 ring-indigo-50/20">
                  <span className="block text-[10px] font-bold text-indigo-500 uppercase">Average</span>
                  <span className="text-base font-extrabold text-indigo-700 mt-1 block">
                    {formatCurrency(salaryStats.avg)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Max Salary</span>
                  <span className="text-sm font-extrabold text-slate-700 mt-1 block">
                    {formatCurrency(salaryStats.max)}
                  </span>
                </div>
              </div>

              {/* Slider graphic showing average indicator */}
              <div className="space-y-2">
                <div className="w-full bg-slate-100 h-2 rounded-full relative">
                  {/* Position of average between min and max */}
                  {(() => {
                    const range = salaryStats.max - salaryStats.min;
                    const pos = range > 0 ? ((salaryStats.avg - salaryStats.min) / range) * 100 : 50;
                    return (
                      <div
                        className="absolute h-4 w-4 bg-indigo-600 border-2 border-white rounded-full -top-1 shadow-xs transition-all duration-500"
                        style={{ left: `calc(${pos}% - 8px)` }}
                        title={`Average: ${formatCurrency(salaryStats.avg)}`}
                      />
                    );
                  })()}
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>{formatCurrency(salaryStats.min)}</span>
                  <span>Avg Indicator</span>
                  <span>{formatCurrency(salaryStats.max)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 border-2 border-dashed border-slate-200/50 rounded-xl h-36 text-xs text-slate-400 italic text-center">
              Add compensation values (e.g. &quot;$120k&quot;, &quot;$150,000&quot;) inside job logs to view salary analytics.
            </div>
          )}
        </div>

        {/* Submission Channels */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-1 flex items-center gap-1.5">
              <Share2 className="h-4 w-4 text-indigo-500" /> Submission Channels
            </h3>
            <p className="text-xs text-slate-400 mb-6">Volume of applications sent per recruitment channel</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {(['website', 'linkedin', 'referral', 'indeed', 'other'] as const).map((key) => {
              const count = submissionStats[key];
              const total = Object.values(submissionStats).reduce((sum, v) => sum + v, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const labels = {
                website: 'Company Site',
                linkedin: 'LinkedIn',
                referral: 'Employee Referral',
                indeed: 'Indeed',
                other: 'Other Portals',
              };

              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-28 shrink-0 truncate">
                    {labels[key]}
                  </span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500/80 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-12 text-right shrink-0">
                    {count} <span className="font-medium text-slate-400 text-[10px]">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Activity Timeline Chart */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-1">
          Application Activity
        </h3>
        <p className="text-xs text-slate-400 mb-6">Historical view of job submissions over time</p>

        {timelineStats.length > 0 ? (
          <div>
            <div className="relative w-full h-48 border-b border-l border-slate-100 pb-2 pl-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300 font-semibold pl-2">
                <div className="border-t border-slate-50 w-full pt-1">Max</div>
                <div className="border-t border-slate-50 w-full pt-1">Mid</div>
                <div className="border-t border-slate-50 w-full pt-1">0</div>
              </div>

              <div className="relative z-10 w-full h-full flex items-end justify-around px-4">
                {timelineStats.map((item, idx) => {
                  const maxCount = Math.max(...timelineStats.map((d) => d.count), 1);
                  const heightPercentage = Math.max((item.count / maxCount) * 100, 8);

                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 max-w-[50px] group">
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-5 bg-indigo-500/80 rounded-t-sm group-hover:bg-indigo-600 transition-all duration-300 flex items-start justify-center"
                          style={{ height: `${(heightPercentage / 100) * 150}px` }}
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded-sm shadow-xs font-bold transition-opacity whitespace-nowrap z-30">
                            {item.count} applications
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-2 truncate w-full text-center">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium italic">
            No application timeline details yet (ensure applied dates are specified)
          </div>
        )}
      </div>
    </div>
  );
}
