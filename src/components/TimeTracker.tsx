import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Plus, Trash2, Calendar, Clock, BarChart3, Search, X } from 'lucide-react';
import { Project, TimeLog, Client } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { formatIndianDate } from '../utils/dateUtils';

import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface TimeTrackerProps {
  projects: Project[];
  tasks: any[];
  timeLogs: TimeLog[];
  clients: Client[];
  onAddLog: (newLog: TimeLog) => void;
  onDeleteLog: (id: string) => void;
  theme: 'dark' | 'light';
}

export default function TimeTracker({ projects, timeLogs, clients, onAddLog, onDeleteLog, theme }: TimeTrackerProps) {
  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerClientName, setTimerClientName] = useState('');
  const [timerDescription, setTimerDescription] = useState('');
  
  // Manual offset entry state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualClientName, setManualClientName] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualHours, setManualHours] = useState('1');
  const [manualMinutes, setManualMinutes] = useState('30');

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [logToDelete, setLogToDelete] = useState<TimeLog | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Graph month selection: 'current' or 'previous'
  const [graphMonthMode, setGraphMonthMode] = useState<'current' | 'previous'>('current');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string>('');

  // Ticking calculation
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Helper to determine client name for any log (supports both new logs and old/mock project logs)
  const getClientNameForLog = (log: TimeLog): string => {
    // 1. If the log's projectId directly matches a client ID
    const directClientById = clients.find(c => c.id === log.projectId);
    if (directClientById) {
      return directClientById.company;
    }
    // 2. If the log's projectName matches a client company name
    const directClientByName = clients.find(c => c.company === log.projectName);
    if (directClientByName) {
      return directClientByName.company;
    }
    // 3. Otherwise, look up via project
    const project = projects.find(p => p.id === log.projectId);
    if (project) {
      return project.clientName;
    }
    // 4. Fallback to projectName or "General Operations"
    return log.projectName || 'General Operations';
  };

  // Handle timer toggling
  const handleStartTimer = () => {
    if (!timerClientName) {
      alert("Please select an active client before initiating the timer.");
      return;
    }
    setIsTimerRunning(true);
    setTimerSeconds(0);
    startTimeRef.current = new Date().toISOString();
  };

  const handleStopTimer = () => {
    if (!isTimerRunning) return;
    setIsTimerRunning(false);
    
    const minutesTracked = Math.max(1, Math.round(timerSeconds / 60));
    const matchedClient = clients.find(c => c.company === timerClientName);
    const clientId = matchedClient?.id || 'other';
    
    const logObj: TimeLog = {
      id: `timelog_${Date.now()}`,
      projectId: clientId,
      projectName: timerClientName,
      taskTitle: 'Time Log',
      description: timerDescription || 'Worked on client operations',
      startTime: startTimeRef.current,
      endTime: new Date().toISOString(),
      durationMinutes: minutesTracked,
      date: new Date().toISOString().split('T')[0]
    };

    onAddLog(logObj);
    
    // Reset states
    setTimerSeconds(0);
    setTimerDescription('');
  };

  // Submit manual log
  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClientName) {
      alert("Please select a client.");
      return;
    }
    const matchedClient = clients.find(c => c.company === manualClientName);
    const clientId = matchedClient?.id || 'other';
    const totalMinutes = (Number(manualHours) * 60) + Number(manualMinutes);

    if (totalMinutes <= 0) {
      alert("Please specify a duration greater than zero.");
      return;
    }

    const start = new Date(manualDate);
    start.setHours(9, 0, 0); // simulated default start time
    const end = new Date(start.getTime() + totalMinutes * 60 * 1000);

    const logObj: TimeLog = {
      id: `timelog_${Date.now()}`,
      projectId: clientId,
      projectName: manualClientName,
      taskTitle: 'Time Log',
      description: manualDesc || 'Logged operational hours worked',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: totalMinutes,
      date: manualDate
    };

    onAddLog(logObj);
    
    // Reset manual form
    setManualClientName('');
    setManualDesc('');
    setIsManualOpen(false);
  };

  // Helper formats
  const formatTimeStr = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getFriendlyDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} min`;
  };

  // Filter logs for displaying list
  const filteredLogs = timeLogs.filter(log => {
    const logYearMonth = log.date.substring(0, 7); // "YYYY-MM"
    const matchesMonth = logYearMonth === currentMonth;
    
    const clientName = getClientNameForLog(log);
    const matchesClient = clientFilter === 'all' || clientName === clientFilter;
    
    const matchesKeyword = searchQuery === '' || 
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesMonth && matchesClient && matchesKeyword;
  });

  // Dynamically compute Current Month and Previous Month strings
  const getMonthStrings = () => {
    const now = new Date('2026-06-25'); // Anchored to base time for stability
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    
    const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
    
    let prevMonthNum = currentMonthNum - 1;
    let prevYear = currentYear;
    if (prevMonthNum === 0) {
      prevMonthNum = 12;
      prevYear = currentYear - 1;
    }
    const previousMonthStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;
    
    return { currentMonthStr, previousMonthStr };
  };

  const { currentMonthStr, previousMonthStr } = getMonthStrings();

  // Selected graph month based on toggle option
  const targetGraphMonth = graphMonthMode === 'current' ? currentMonthStr : previousMonthStr;
  const graphMonthLogs = timeLogs.filter(log => log.date.substring(0, 7) === targetGraphMonth);

  // Group hours by client for the graph
  const clientBreakdownMap: Record<string, { duration: number; name: string; color: string }> = {};
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444'];

  graphMonthLogs.forEach((log) => {
    const clientName = getClientNameForLog(log);
    if (!clientBreakdownMap[clientName]) {
      clientBreakdownMap[clientName] = {
        duration: 0,
        name: clientName,
        color: colors[Object.keys(clientBreakdownMap).length % colors.length]
      };
    }
    clientBreakdownMap[clientName].duration += log.durationMinutes;
  });

  const chartData = Object.keys(clientBreakdownMap).map(key => ({
    id: key,
    name: clientBreakdownMap[key].name,
    Hours: parseFloat((clientBreakdownMap[key].duration / 60).toFixed(1)),
    color: clientBreakdownMap[key].color
  }));

  // General statistics (e.g. tracking progress is still based on selected main logs list month)
  const currentMonthLogs = timeLogs.filter(log => log.date.substring(0, 7) === currentMonth);
  const totalMinutesThisMonth = currentMonthLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalHoursThisMonth = parseFloat((totalMinutesThisMonth / 60).toFixed(1));
  const dailyTrackerTarget = 160; // 160 hours target monthly
  const percentOfTarget = Math.min(100, Math.round((totalHoursThisMonth / dailyTrackerTarget) * 100));

  // Graph statistics
  const totalMinutesInGraphMonth = graphMonthLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalHoursInGraphMonth = parseFloat((totalMinutesInGraphMonth / 60).toFixed(1));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Banner & Monthly Targets */}
      <div className={`p-6 rounded-2xl border transition-all ${
        theme === 'light' 
          ? 'bg-white border-gray-200 text-gray-900 shadow-sm' 
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-500 font-mono uppercase tracking-widest font-bold">Timesheet Workspace</span>
            <h2 className="text-xl font-bold tracking-tight font-display">Time Tracker</h2>
            <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-slate-400'}`}>
              Seamlessly record active client hours and generate monthly client billing audits.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className={`text-right ${theme === 'light' ? 'border-gray-200' : 'border-slate-800'} pr-6 md:border-r`}>
              <span className={`text-[9px] uppercase font-mono tracking-wider ${theme === 'light' ? 'text-gray-400' : 'text-slate-500'}`}>Tracked This Month</span>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl font-bold text-indigo-500 font-mono tracking-tight">{totalHoursThisMonth}</span>
                <span className={`text-xs font-mono font-medium ${theme === 'light' ? 'text-gray-400' : 'text-slate-500'}`}>hrs</span>
              </div>
            </div>

            <div className="md:w-44 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className={theme === 'light' ? 'text-gray-500' : 'text-slate-400'}>Target Progress</span>
                <span className="font-semibold text-indigo-500">{percentOfTarget}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-950'}`}>
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${percentOfTarget}%` }} />
              </div>
              <p className={`text-[9px] font-mono text-right ${theme === 'light' ? 'text-gray-400' : 'text-slate-500'}`}>Goal: 160.0 hours / month</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Click-to-Start Live Timer */}
      <div className={`p-6 rounded-2xl border transition-all ${
        theme === 'light' 
          ? 'bg-white border-gray-200 text-gray-900 shadow-sm' 
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Client selector (active only) */}
            <div>
              <label className={`text-[10px] uppercase font-mono mb-1.5 block font-bold ${theme === 'light' ? 'text-gray-500' : 'text-slate-400'}`}>
                Select the Client <span className="text-indigo-500">*</span>
              </label>
              <select 
                value={timerClientName}
                onChange={e => setTimerClientName(e.target.value)}
                disabled={isTimerRunning}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 transition-all focus:outline-none ${
                  theme === 'light' 
                    ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500' 
                    : 'bg-slate-950 border border-slate-800 text-white focus:border-indigo-500'
                }`}
              >
                <option value="">-- Choose Client --</option>
                {clients.filter(c => c.status === 'Active').map(c => (
                  <option key={c.id} value={c.company}>{c.company} ({c.name})</option>
                ))}
              </select>
            </div>

            {/* 2. Description input */}
            <div>
              <label className={`text-[10px] uppercase font-mono mb-1.5 block font-bold ${theme === 'light' ? 'text-gray-500' : 'text-slate-400'}`}>
                Activity Description
              </label>
              <input 
                type="text" 
                placeholder="E.g. Database schema audit, front-end polish..." 
                value={timerDescription}
                onChange={e => setTimerDescription(e.target.value)}
                disabled={isTimerRunning}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 transition-all focus:outline-none ${
                  theme === 'light' 
                    ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500' 
                    : 'bg-slate-950 border border-slate-800 text-white focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          {/* Action Stopwatch */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
            <div className="text-right">
              <span className={`text-[8px] uppercase font-mono block ${theme === 'light' ? 'text-gray-450' : 'text-slate-500'}`}>Ticking Duration</span>
              <span className="text-2xl font-bold font-mono tracking-wider tabular-nums text-indigo-500">{formatTimeStr(timerSeconds)}</span>
            </div>

            <div className="flex gap-2">
              {isTimerRunning ? (
                <button
                  type="button"
                  onClick={handleStopTimer}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30 transition-all font-mono animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 text-white fill-white" />
                  <span>STOP TIMER</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30 transition-all font-mono"
                >
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                  <span>START WORK</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsManualOpen(!isManualOpen)}
                className={`px-3.5 py-2.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-mono cursor-pointer ${
                  theme === 'light'
                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 font-medium'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-300'
                }`}
              >
                <Plus className="w-4 h-4 text-slate-400" />
                <span>Manual log</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual log form expansion */}
      {isManualOpen && (
        <form onSubmit={handleAddManualLog} className={`p-6 rounded-2xl border transition-all animate-fadeIn space-y-4 ${
          theme === 'light' ? 'bg-white border-gray-200 text-gray-950 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-400 font-mono">Manually Record Tracked Business Hours</h3>
            <button type="button" onClick={() => setIsManualOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-slate-450 uppercase font-mono block mb-1 font-bold">Select the Client <span className="text-indigo-500">*</span></label>
              <select 
                value={manualClientName}
                onChange={e => setManualClientName(e.target.value)}
                required
                className={`w-full text-xs rounded-lg p-2.5 outline-none ${theme === 'light' ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
              >
                <option value="">-- Choose Client --</option>
                {clients.filter(c => c.status === 'Active').map(c => (
                  <option key={c.id} value={c.company}>{c.company} ({c.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-455 uppercase font-mono block mb-1 font-bold">Log Date</label>
              <input 
                type="date" 
                required
                value={manualDate}
                onChange={e => setManualDate(e.target.value)}
                className={`w-full text-xs rounded-lg p-2.5 outline-none font-mono ${theme === 'light' ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-455 uppercase font-mono block mb-1 font-bold">Hours</label>
                <input 
                  type="number" 
                  min="0" 
                  max="24"
                  value={manualHours}
                  onChange={e => setManualHours(e.target.value)}
                  className={`w-full text-xs rounded-lg p-2.5 outline-none font-mono ${theme === 'light' ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-455 uppercase font-mono block mb-1 font-bold">Mins</label>
                <input 
                  type="number" 
                  min="0" 
                  max="59"
                  value={manualMinutes}
                  onChange={e => setManualMinutes(e.target.value)}
                  className={`w-full text-xs rounded-lg p-2.5 outline-none font-mono ${theme === 'light' ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-455 uppercase font-mono block mb-1 font-bold">Activity Description</label>
            <input 
              type="text" 
              placeholder="E.g. Database schema audit, front-end polish..."
              value={manualDesc}
              onChange={e => setManualDesc(e.target.value)}
              className={`w-full text-xs rounded-lg p-2.5 outline-none ${theme === 'light' ? 'bg-gray-100 border border-gray-200 text-gray-900' : 'bg-slate-950 border border-slate-800 text-white'}`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
            <button 
              type="button" 
              onClick={() => setIsManualOpen(false)}
              className="px-4 py-2 bg-transparent text-slate-400 border border-slate-800 text-xs rounded-lg font-mono hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg font-mono cursor-pointer"
            >
              Add Ledger Log
            </button>
          </div>
        </form>
      )}

      {/* 3. Analytics charts break down + Ledgers lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Analytics Breakdown */}
        <div className={`col-span-1 lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div>
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 mb-1">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Client Hours Breakdown</span>
                </h3>
                <p className={`text-[11px] ${theme === 'light' ? 'text-gray-500' : 'text-slate-400'}`}>
                  Ratios of tracked hours worked per client in the selected month.
                </p>
              </div>

              {/* Month Selection Toggle */}
              <div className={`flex p-0.5 rounded-lg border ${
                theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setGraphMonthMode('current')}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded-md font-semibold transition-all cursor-pointer ${
                    graphMonthMode === 'current'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Current
                </button>
                <button
                  type="button"
                  onClick={() => setGraphMonthMode('previous')}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded-md font-semibold transition-all cursor-pointer ${
                    graphMonthMode === 'previous'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Previous
                </button>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="Hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                    backgroundColor: theme === 'light' ? '#ffffff' : '#020617', 
                    borderRadius: '8px', 
                    border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #1e293b',
                    fontSize: '11px',
                    color: theme === 'light' ? '#000000' : '#ffffff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-xs font-mono text-center">No hours logged in this month matrix yet</p>
            )}
            {chartData.length > 0 && (
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-indigo-500">{totalHoursInGraphMonth}</span>
                <span className="text-[9px] uppercase font-mono text-slate-500 font-medium">Logged Hours</span>
              </div>
            )}
          </div>

          {/* Color Guides Legend */}
          <div className="space-y-1.5 mt-4 border-t border-slate-850 pt-3">
            {chartData.slice(0, 4).map(item => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className={`truncate ${theme === 'light' ? 'text-gray-600' : 'text-slate-200'}`}>{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-400">{item.Hours} hrs</span>
              </div>
            ))}
            {chartData.length > 4 && (
              <p className="text-[10px] text-slate-500 italic text-center font-mono">+{chartData.length - 4} more clients active</p>
            )}
          </div>
        </div>

        {/* Dynamic Searchable Timesheet Logs */}
        <div className={`col-span-1 lg:col-span-8 p-5 rounded-2xl border flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Work Log Sheets</span>
                </h3>
                <p className={`text-[11px] ${theme === 'light' ? 'text-gray-500' : 'text-slate-400'}`}>
                  Track and audit individual worked logs and billing details.
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`pl-8 pr-3 py-1 text-[11px] rounded-lg focus:outline-none w-32 md:w-40 transition-all ${
                      theme === 'light' ? 'bg-gray-100 text-gray-900 focus:bg-white border border-gray-200' : 'bg-slate-950 border border-slate-800 text-white'
                    }`}
                  />
                </div>

                {/* Client filter */}
                <select 
                  value={clientFilter}
                  onChange={e => setClientFilter(e.target.value)}
                  className={`text-[11px] rounded-lg px-2 py-1 outline-none ${
                    theme === 'light' ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                >
                  <option value="all">All Clients</option>
                  {clients.map(c => <option key={c.id} value={c.company}>{c.company}</option>)}
                </select>

                {/* Month filter select */}
                <input 
                  type="month"
                  value={currentMonth}
                  onChange={e => setCurrentMonth(e.target.value)}
                  className={`text-[11px] rounded-lg px-2 py-1 font-mono outline-none ${
                    theme === 'light' ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-slate-950 text-white border border-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <div 
                    key={log.id} 
                    className={`p-3.5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                      theme === 'light' ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : 'bg-slate-950 border-slate-850 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-display">{getClientNameForLog(log)}</span>
                        {log.taskTitle && log.taskTitle !== 'Time Log' && log.taskTitle !== 'Work Activity' && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono leading-none ${
                            theme === 'light' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-indigo-950/45 text-indigo-300 border border-indigo-500/20'
                          }`}>
                            {log.taskTitle}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-snug font-sans ${theme === 'light' ? 'text-gray-600' : 'text-slate-300'}`}>
                        {log.description}
                      </p>
                      
                      <div className="flex items-center gap-2.5 text-[9.5px] font-mono text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatIndianDate(log.date)}
                        </span>
                        <span>&bull;</span>
                        <span>Start: {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-900">
                      <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-bold font-mono text-indigo-400">{getFriendlyDuration(log.durationMinutes)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setLogToDelete(log);
                        }}
                        className="p-1.5 text-rose-450 hover:bg-rose-950/20 rounded-lg cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-400" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-8 text-center rounded-xl border border-dashed text-slate-500 text-xs font-mono ${
                  theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-950 border-slate-850'
                }`}>
                  No timesheet records logged matching active queries in {currentMonth}.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-850 flex justify-between text-[10px] text-slate-500 font-mono mt-4">
            <span>Filters: {filteredLogs.length} matching logs</span>
            <span>Sum Duration: {getFriendlyDuration(filteredLogs.reduce((acc, log) => acc + log.durationMinutes, 0))}</span>
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={() => {
          if (logToDelete) {
            onDeleteLog(logToDelete.id);
          }
        }}
        title="Delete Timesheet Log"
        message="Are you sure you want to permanently delete this timesheet log? This action cannot be undone."
        itemName={logToDelete ? `${getClientNameForLog(logToDelete)} - ${logToDelete.description || 'No description'}` : ''}
      />

    </div>
  );
}
