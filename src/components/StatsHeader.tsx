import React from 'react';
import { DashboardStats } from '../types';
import { Briefcase, Activity, Calendar, Trophy, ListTodo } from 'lucide-react';

interface StatsHeaderProps {
  stats: DashboardStats;
}

export default function StatsHeader({ stats }: StatsHeaderProps) {
  const cards = [
    {
      title: 'Total Roles',
      value: stats.totalJobs,
      subtitle: `${stats.savedCount} saved, ${stats.appliedCount} applied`,
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      subtitle: 'Of applications submitted',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Interviews',
      value: stats.interviewingCount,
      subtitle: 'Currently interviewing',
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Offers Received',
      value: stats.offerCount,
      subtitle: 'Congratulations!',
      icon: Trophy,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasksCount,
      subtitle: 'Follow-ups & prep',
      icon: ListTodo,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50/50',
      borderColor: 'border-slate-100',
    },
  ];

  return (
    <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-5 scroll-smooth snap-x snap-mandatory">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`flex flex-col justify-between p-5 bg-white border ${card.borderColor} rounded-xl shadow-xs transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] min-w-[240px] shrink-0 sm:min-w-0 snap-start`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {card.value}
              </span>
              <p className="mt-1 text-xs text-slate-400 font-medium truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
