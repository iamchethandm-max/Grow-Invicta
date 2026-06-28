/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, 
  ChevronRight, ArrowUpRight, Sparkles, AlertCircle, RefreshCw, Info
} from 'lucide-react';
import { Task, Project, Payment } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatIndianDate } from '../utils/dateUtils';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  payments: Payment[];
  onTriggerOAuth: () => void;
}

export default function CalendarView({ tasks, projects, payments, onTriggerOAuth }: CalendarViewProps) {
  const { session, signInWithGoogle } = useAuth();
  const [calendarViewMode, setCalendarViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState('June 2026');

  // Google Calendar integration status and state
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const fetchGoogleCalendarEvents = async (token: string) => {
    setIsLoadingGoogle(true);
    setGoogleError(null);
    setSyncLogs(prev => [...prev, 'Fetching events from primary Google Calendar...']);
    try {
      // Fetch events for June 2026
      const timeMin = new Date('2026-06-01T00:00:00Z').toISOString();
      const timeMax = new Date('2026-07-01T00:00:00Z').toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google API returned status ${res.status}: ${errText}`);
      }
      
      const data = await res.json();
      const items = data.items || [];
      
      const parsed = items.map((item: any) => {
        const startStr = item.start?.dateTime || item.start?.date || '';
        const startDateOnly = startStr.substring(0, 10); // "YYYY-MM-DD"
        const startTimeOnly = item.start?.dateTime ? startStr.substring(11, 16) : 'All Day';
        
        return {
          id: item.id,
          title: item.summary || 'Google Calendar Event',
          description: item.description || '',
          dateStr: startDateOnly,
          timeStr: startTimeOnly,
          type: 'Google Event',
          color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
        };
      });
      
      setGoogleEvents(parsed);
      setIsGoogleSynced(true);
      setSyncLogs(prev => [
        ...prev,
        `Success: Synchronized ${parsed.length} events from Google Calendar.`,
        `Connected context: ${session?.user?.email || 'iamchethandm@gmail.com'}`
      ]);
    } catch (err: any) {
      console.warn(err);
      setGoogleError(err.message || 'OAuth token missing or expired.');
      setSyncLogs(prev => [
        ...prev,
        `Sync error: ${err.message || 'Access token invalid/expired. Please re-authenticate.'}`
      ]);
      setIsGoogleSynced(false);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Auto-fetch if token is available
  useEffect(() => {
    if (session?.provider_token) {
      fetchGoogleCalendarEvents(session.provider_token);
    }
  }, [session?.provider_token]);

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
      color: 'bg-indigo-600 border-indigo-700 text-indigo-200',
      timeStr: 'Due Today'
    }));

    const dayProjects = projects.filter(p => p.endDate === dateStr).map(p => ({
      id: p.id,
      title: `DEADLINE: ${p.name}`,
      type: 'Project Cutoff',
      color: 'bg-red-500/20 border-red-500/40 text-red-300',
      timeStr: 'All Day'
    }));

    const dayPayments = payments.filter(pay => pay.dueDate === dateStr).map(pay => ({
      id: pay.id,
      title: `PAYMENT OUTSTANDING: ${pay.invoiceNumber}`,
      type: 'Bill Due',
      color: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      timeStr: 'Due'
    }));

    const dayGoogleEvents = googleEvents.filter(e => e.dateStr === dateStr);

    return [...dayTasks, ...dayProjects, ...dayPayments, ...dayGoogleEvents];
  };

  const activeDayEvents = getEventsForDate('2026-06-19'); // Selected default day is today (June 19th)

  const handleRunGoogleSync = async () => {
    setSyncLogs(prev => [...prev, 'Initiating Google Calendar synchronization...']);
    onTriggerOAuth(); // Log the action in audit trail
    
    const googleScopes = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
    
    if (session?.provider_token) {
      await fetchGoogleCalendarEvents(session.provider_token);
    } else {
      setSyncLogs(prev => [...prev, 'Authenticating session with Google scopes...']);
      const { error } = await signInWithGoogle(googleScopes);
      if (error) {
        setSyncLogs(prev => [...prev, `OAuth authentication failed: ${error.message}`]);
      }
    }
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

      {/* Sync status logging dashboard if enabled or loading/error */}
      {(isGoogleSynced || isLoadingGoogle || googleError || syncLogs.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              {isLoadingGoogle ? (
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              ) : googleError ? (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
              <p className="font-mono">
                <strong>Google Session Sync:</strong>{' '}
                {isLoadingGoogle 
                  ? 'Re-indexing cloud accounts...' 
                  : googleError 
                    ? 'Sync authorization interrupted.' 
                    : 'Automated calendar imports active under requested scopes.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {googleError && (
                <button
                  onClick={handleRunGoogleSync}
                  className="px-2 py-1 bg-rose-950 text-rose-300 border border-rose-850 hover:bg-rose-900 rounded text-[10px] font-mono transition-colors cursor-pointer"
                >
                  Authorize Google Calendar Scopes
                </button>
              )}
              <span className="text-[10px] bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                CONNECTED: {session?.user?.email || 'iamchethandm@gmail.com'}
              </span>
            </div>
          </div>

          {/* Sync logs container */}
          {syncLogs.length > 0 && (
            <div className="bg-slate-950/85 border border-slate-850 p-3 rounded-lg max-h-[120px] overflow-y-auto space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block border-b border-slate-900 pb-1 mb-1">Live Sync Logs</span>
              {syncLogs.slice(-4).map((log, lIdx) => (
                <div key={lIdx} className="text-[10.5px] font-mono text-slate-400 flex items-start gap-1.5">
                  <span className="text-indigo-500 select-none">&gt;</span>
                  <p>{log}</p>
                </div>
              ))}
            </div>
          )}
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
                <span className="text-[10px] text-slate-500 font-mono">{formatIndianDate('2026-06-19')}</span>
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
