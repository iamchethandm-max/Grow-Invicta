/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, 
  ChevronRight, ArrowUpRight, Sparkles, AlertCircle, RefreshCw, Info
} from 'lucide-react';
import { Task, Project, Payment } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  payments: Payment[];
  onTriggerOAuth: () => void;
}

export default function CalendarView({ tasks, projects, payments, onTriggerOAuth }: CalendarViewProps) {
  const [calendarViewMode, setCalendarViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState('June 2026');

  // Google Calendar integration status simulation
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // We are in June 2026. June 1st, 2026 is a Monday.
  // Generate 35 calendar day boxes covering June 2026.
  const juneDaysCount = 30;
  const calendarDays = Array.from({ length: 35 }, (_, idx) => {
    const dayNum = idx + 1;
    if (dayNum <= juneDaysCount) {
      const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
      return { dayNum, dateStr, isCurrentMonth: true };
    }
    // Padding days for next month
    const gapNum = dayNum - juneDaysCount;
    return { dayNum: gapNum, dateStr: `2026-07-0${gapNum}`, isCurrentMonth: false };
  });

  // Fetch events matching a specific date string
  const getEventsForDate = (dateStr: string) => {
    const dayTasks = tasks.filter(t => t.dueDate === dateStr).map(t => ({
      id: t.id,
      title: t.title,
      type: 'Task Due',
      color: 'bg-indigo-600 border-indigo-700 text-indigo-200'
    }));

    const dayProjects = projects.filter(p => p.endDate === dateStr).map(p => ({
      id: p.id,
      title: `DEADLINE: ${p.name}`,
      type: 'Project Cutoff',
      color: 'bg-red-500/20 border-red-500/40 text-red-300'
    }));

    const dayPayments = payments.filter(pay => pay.dueDate === dateStr).map(pay => ({
      id: pay.id,
      title: `PAYMENT OUTSTANDING: ${pay.invoiceNumber}`,
      type: 'Bill Due',
      color: 'bg-amber-500/20 border-amber-500/40 text-amber-300'
    }));

    return [...dayTasks, ...dayProjects, ...dayPayments];
  };

  const activeDayEvents = getEventsForDate('2026-06-19'); // Selected default day is today (June 19th)

  const handleRunGoogleSync = () => {
    setSyncLogs(['Initiating OAuth workflow with Google Calendar scopes...', 'Connected to iamchethandm@gmail.com security context.', 'Synchronizing active projects and invoices...']);
    onTriggerOAuth();
    setIsGoogleSynced(true);
  };

  return (
    <div id="calendar-module" className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header with control buttons and OAuth triggers */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          {(['Month', 'Week', 'Day'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setCalendarViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                calendarViewMode === mode 
                  ? 'bg-slate-950 border-slate-705 text-indigo-400 shadow-xs' 
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-850'
              }`}
            >
              {mode} Grid
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white font-sans">{currentCalendarMonth}</span>
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button className="p-1 text-slate-400 hover:text-white cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <button className="p-1 text-slate-400 hover:text-white cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Dynamic actual Google Workspace scope trigger */}
        <button
          onClick={handleRunGoogleSync}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-950 hover:bg-slate-850 text-indigo-400 border border-slate-750 hover:border-indigo-500 rounded-lg text-xs font-medium cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Sync Google Calendar</span>
        </button>
      </div>

      {/* Sync status logging dashboard if enabled */}
      {isGoogleSynced && (
        <div className="bg-slate-900 border border-indigo-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <p className="font-mono">
              <strong>Google Session Sync:</strong> Automated calendar imports active under requested scopes.
            </p>
          </div>
          <span className="text-[10px] bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
            CONNECTED: iamchethandm@gmail.com
          </span>
        </div>
      )}

      {/* VIEW SECTION 1: MASTER CALENDAR MONTH MATRIX */}
      {calendarViewMode === 'Month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Grid Calendar */}
          <div className="lg:col-span-8 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            {/* Weekdays names */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold border-b border-slate-800 pb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar Day grids */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const dateEvents = getEventsForDate(day.dateStr);
                const isToday = day.dateStr === '2026-06-19';

                return (
                  <div
                    key={idx}
                    className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                      isToday 
                        ? 'bg-slate-950 border-indigo-500 ring-1 ring-indigo-500/20' 
                        : day.isCurrentMonth 
                          ? 'bg-slate-900 border-slate-850 hover:bg-slate-950/60' 
                          : 'bg-slate-950/40 border-transparent text-slate-600'
                    }`}
                  >
                    <span className={`text-[10px] font-bold font-mono ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {day.dayNum}
                    </span>

                    {/* Events indicators limit to 2 */}
                    <div className="space-y-1">
                      {dateEvents.slice(0, 2).map((ev, eIdx) => (
                        <span
                          key={eIdx}
                          title={ev.title}
                          className={`block p-0.5 pl-1.5 border-l-2 text-[8px] font-semibold truncate rounded-sm leading-none ${ev.color}`}
                        >
                          {ev.title.split(':')[0]}
                        </span>
                      ))}
                      {dateEvents.length > 2 && (
                        <span className="text-[7.5px] font-mono text-slate-500 block text-right">+{dateEvents.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Today agenda Panel */}
          <div className="lg:col-span-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between h-[510px]">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase">Today Agenda checklist</span>
                <span className="text-[10px] text-slate-500 font-mono">June 19th, 2026</span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                {activeDayEvents.length > 0 ? (
                  activeDayEvents.map((ev, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-400 font-bold">{ev.type}</span>
                        <span className="text-[9px] text-slate-500 font-mono">14:00</span>
                      </div>
                      <p className="font-semibold text-slate-200">{ev.title}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs font-mono py-4">No critical appointments recorded for today.</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <p className="text-[10px] text-slate-400 leading-normal">
                Calendar imports from Google Calendar scopes synchronizes team actions immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SECTION 2: WEEK TIMELINE BOARD */}
      {calendarViewMode === 'Week' && (
        <div className="bg-slate-900 border border-slate-805 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-2">Weekly Agenda Schedule Block</h3>
          <p className="text-slate-400 text-xs mb-4">Hourly layout for client briefings and launch deliverables across June 15th-21st.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Array.from({ length: 7 }, (_, i) => {
              const dNum = 15 + i;
              const dStr = `2026-06-${dNum}`;
              const dEvents = getEventsForDate(dStr);
              return (
                <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-xl min-h-[220px] flex flex-col justify-between">
                  <span className="font-mono text-slate-500 text-[10px] uppercase font-bold block border-b border-slate-900 pb-1">June {dNum}</span>
                  <div className="space-y-1.5 my-2">
                    {dEvents.map((ev, eIdx) => (
                      <span key={eIdx} className="text-[8px] p-1 rounded font-semibold block bg-slate-900 border border-slate-850 text-slate-300">
                        {ev.title}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW SECTION 3: DAILY PLANNER SLATE */}
      {calendarViewMode === 'Day' && (
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Daily Operational Grid (Today)</h3>
          <div className="space-y-3">
            {['09:00', '11:00', '13:00', '15:00', '17:00'].map(hour => (
              <div key={hour} className="grid grid-cols-12 gap-3 items-center border-l-2 border-indigo-500 pl-3 py-1 bg-slate-950/40 rounded-r-lg">
                <span className="col-span-2 text-xs font-mono text-indigo-400 font-semibold">{hour}</span>
                <p className="col-span-12 md:col-span-10 text-xs text-slate-300 font-medium">Sprint check-in: Finalize database scopes and invoice reconciliations.</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
