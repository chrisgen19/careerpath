'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Job, JobStatus } from '../types';
import { MapPin, DollarSign, Calendar, CheckSquare, Edit3 } from 'lucide-react';

interface KanbanBoardProps {
  jobs: Job[];
  onMoveJob: (jobId: string, newStatus: JobStatus) => void;
  onEditJob: (job: Job) => void;
}

const COLUMNS: { id: JobStatus; title: string; bg: string; border: string; dot: string; textColor: string }[] = [
  { id: 'saved', title: 'Saved Roles', bg: 'bg-slate-50/60', border: 'border-slate-100', dot: 'bg-slate-400', textColor: 'text-slate-700' },
  { id: 'applied', title: 'Applied', bg: 'bg-blue-50/30', border: 'border-blue-100/50', dot: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'interviewing', title: 'Interviewing', bg: 'bg-amber-50/30', border: 'border-amber-100/50', dot: 'bg-amber-500', textColor: 'text-amber-700' },
  { id: 'offer', title: 'Offers', bg: 'bg-emerald-50/30', border: 'border-emerald-100/50', dot: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { id: 'rejected', title: 'Rejected', bg: 'bg-rose-50/30', border: 'border-rose-100/50', dot: 'bg-rose-500', textColor: 'text-rose-700' },
];

export default function KanbanBoard({ jobs, onMoveJob, onEditJob }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeColId, setActiveColId] = useState<JobStatus>('saved');

  // Prevent hydration error due to SSR with Hello Pangea DnD
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5 animate-pulse mt-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="h-[500px] bg-slate-100 rounded-2xl border border-slate-200/50"></div>
        ))}
      </div>
    );
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid column
    if (!destination) return;

    // Dropped in the same column at the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    onMoveJob(draggableId, destination.droppableId as JobStatus);
  };

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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Mobile Column Tabs */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
        {COLUMNS.map((col) => {
          const count = jobs.filter((job) => job.status === col.id).length;
          const isActive = activeColId === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveColId(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? `${col.textColor} ${col.bg} ${col.border} shadow-xs font-extrabold`
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
              <span className="whitespace-nowrap">{col.title.replace(' Roles', '')}</span>
              <span className="text-[10px] font-normal opacity-85">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-5 pb-6 overflow-x-auto min-h-[60vh] select-none scrollbar-thin scrollbar-thumb-slate-200">
        {COLUMNS.map((col) => {
          // Filter jobs belonging to this column
          const columnJobs = jobs.filter((job) => job.status === col.id);
          const isColActiveOnMobile = activeColId === col.id;

          return (
            <div
              key={col.id}
              className={`flex flex-col flex-1 min-w-[280px] max-w-[340px] md:max-w-[340px] rounded-2xl border border-slate-100 ${
                col.bg
              } p-4 ${isColActiveOnMobile ? 'flex w-full' : 'hidden md:flex'}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                  <h3 className={`font-bold text-sm tracking-tight ${col.textColor}`}>
                    {col.title}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-100 text-slate-500 shadow-xs">
                  {columnJobs.length}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-3.5 min-h-[400px] transition-colors rounded-xl duration-200 ${
                      snapshot.isDraggingOver ? 'bg-slate-100/50 border border-dashed border-slate-200/50' : ''
                    }`}
                  >
                    {columnJobs.map((job, index) => {
                      const completedTasks = job.tasks?.filter((t) => t.completed).length || 0;
                      const totalTasks = job.tasks?.length || 0;

                      return (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => onEditJob(job)}
                              className={`group relative p-4 bg-white border border-slate-100 rounded-xl shadow-xs transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing hover:border-indigo-100 ${
                                dragSnapshot.isDragging ? 'shadow-lg rotate-[1.5deg] border-indigo-200 ring-2 ring-indigo-50/50' : ''
                              }`}
                            >
                              {/* Job Header */}
                              <div className="pr-4">
                                <h4 className="font-bold text-sm text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
                                  {job.title}
                                </h4>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                  {job.company}
                                </p>
                              </div>

                              {/* Details Grid */}
                              <div className="mt-3.5 space-y-1.5 border-t border-slate-50 pt-3 text-xs text-slate-400 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-slate-300" />
                                  <span className="truncate">
                                    {job.location} ({job.locationType})
                                  </span>
                                </div>

                                {job.salary && (
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <DollarSign className="h-3.5 w-3.5 text-slate-300" />
                                    <span>{job.salary}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-slate-300" />
                                  <span>{formatDate(job.appliedDate)}</span>
                                </div>
                              </div>

                              {/* Tasks Checklist Indicator */}
                              {totalTasks > 0 && (
                                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-100/50 rounded-lg px-2.5 py-1">
                                  <span className="flex items-center gap-1">
                                    <CheckSquare className="h-3.5 w-3.5 text-slate-400" /> Checklist
                                  </span>
                                  <span className="font-bold text-indigo-600">
                                    {completedTasks}/{totalTasks}
                                  </span>
                                </div>
                              )}

                              {/* Resume Tag */}
                              {job.resumeVersion && (
                                <div className="mt-2.5 text-[10px] text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                                  📄 {job.resumeVersion}
                                </div>
                              )}

                              {/* Edit shortcut button on hover */}
                              <div className="absolute right-3.5 top-3.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-md border border-slate-100 shadow-xs hover:bg-slate-50 text-slate-400 hover:text-slate-700">
                                <Edit3 className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {columnJobs.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/50 rounded-xl h-28 text-slate-300 font-medium text-xs">
                        No positions
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
