/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Briefcase, CheckCircle2, AlertTriangle, IndianRupee, TrendingUp, 
  Sparkles, Megaphone, ArrowUpRight, DollarSign, Calendar, Clock, Globe, Server
} from 'lucide-react';
import { Client, Project, Task, Payment, Lead, FinanceLedger, Website } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

interface DashboardProps {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  tasks: Task[];
  payments: Payment[];
  finances: FinanceLedger[];
  websites?: Website[];
  onNavigate: (tab: any) => void;
  currentUsername?: string;
  companyName?: string;
  enabledFeatures?: Record<string, boolean>;
}

export default function Dashboard({ 
  clients, leads, projects, tasks, payments, finances, websites = [], onNavigate,
  currentUsername = 'Chethan D. M.',
  companyName = 'GrowInvicta',
  enabledFeatures = { leads: true, timetracker: true, payments: true, websites: true, calendar: true }
}: DashboardProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [istTime, setIstTime] = useState('');
  const [istDate, setIstDate] = useState('');
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setIstTime(timeStr);
      setIstDate(dateStr);
    };

    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Console trace of dashboard rendering and passed data
  console.log('[Trace Dashboard] Rendering Dashboard component', {
    clientsLength: clients?.length,
    leadsLength: leads?.length,
    projectsLength: projects?.length,
    tasksLength: tasks?.length,
    paymentsLength: payments?.length,
    financesLength: finances?.length,
    currentUsername,
    companyName
  });

  // 1. KPI Calculations
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const activeProj = projects.filter(p => p.status === 'In Progress').length;
  const completedProj = projects.filter(p => p.status === 'Completed').length;
  
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  
  // Checking overdue tasks (Due date earlier than today (2026-06-19) and not completed)
  const todayStr = '2026-06-19';
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate < todayStr).length;

  // Revenue analytics - Reflects monthly retainer money (payments) as well as any other works done and added in income (finances ledger)
  const generalFinanceIncome = finances
    .filter(f => {
      if (f.type !== 'Income') return false;
      const notes = (f.notes || '').toLowerCase();
      const source = (f.sourceOrName || '').toLowerCase();
      // Avoid counting invoice logs to prevent double counting
      return !(notes.includes('invoice') || source.includes('invoice'));
    })
    .reduce((sum, f) => sum + f.amount, 0);

  const totalRevenue = payments
    .filter(p => p.status === 'Paid' || p.status === 'Partial')
    .reduce((sum, p) => sum + p.paidAmount, 0) + generalFinanceIncome;

  // Monthly Revenue - Shows ONLY the total amount from the active retainer clients
  const monthlyRevenue = clients
    .filter(c => c.status === 'Active' && (c.metrics?.workType === 'retainer' || (c.metrics?.monthlyRetainerAmount && c.metrics.monthlyRetainerAmount > 0)))
    .reduce((sum, c) => sum + (c.metrics?.monthlyRetainerAmount || 0), 0);

  const pendingPayments = payments
    .filter(p => p.status === 'Pending' || p.status === 'Partial' || p.status === 'Overdue')
    .reduce((sum, p) => sum + p.pendingAmount, 0);

  // Leads
  const leadsGenerated = leads.length;
  const leadsConverted = leads.filter(l => l.status === 'Won').length;

  // Yearly Domain & Hosting contract value (potential annual subscription revenue)
  const yearlyDomainHostingRevenue = (websites || []).reduce(
    (sum, w) => sum + (w.domainPrice || 0) + (w.hostingPrice || 0),
    0
  );

  // Helper to extract month (e.g. "01", "02") from a date string
  const getMonthFromDate = (dateStr: string) => {
    if (!dateStr || dateStr === '--') return null;
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return parts[1]; // "01", "02", etc.
    }
    return null;
  };

  const monthsList = [
    { key: '01', name: 'Jan' },
    { key: '02', name: 'Feb' },
    { key: '03', name: 'Mar' },
    { key: '04', name: 'Apr' },
    { key: '05', name: 'May' },
    { key: '06', name: 'Jun' }
  ];

  // 2. Chart Data Generation
  // Revenue Trend - dynamically aggregate monthly invoices and finances
  const revenueTrendData = monthsList.map(m => {
    // 1. Calculate revenue from payments paid in this month
    const monthPayments = payments.filter(p => {
      if (p.status !== 'Paid' && p.status !== 'Partial') return false;
      return getMonthFromDate(p.paymentDate) === m.key;
    });
    const paymentRev = monthPayments.reduce((sum, p) => sum + p.paidAmount, 0);

    // 2. Calculate revenue from general finances Income in this month
    const monthFinancesIncome = finances.filter(f => {
      if (f.type !== 'Income') return false;
      return getMonthFromDate(f.date) === m.key;
    });
    
    // Deduplicate income entries in finances that are just logs of the invoice payments
    const uniqueFinancesIncome = monthFinancesIncome.filter(f => {
      const notes = (f.notes || '').toLowerCase();
      const source = (f.sourceOrName || '').toLowerCase();
      if ((notes.includes('invoice') || source.includes('invoice')) && paymentRev > 0) {
        return false;
      }
      return true;
    });
    const financeRev = uniqueFinancesIncome.reduce((sum, f) => sum + f.amount, 0);

    const totalMonthRevenue = paymentRev + financeRev;

    // 3. Calculate expenses from general finances Expense in this month
    const monthFinancesExpense = finances.filter(f => {
      if (f.type !== 'Expense') return false;
      return getMonthFromDate(f.date) === m.key;
    });
    const totalMonthExpense = monthFinancesExpense.reduce((sum, f) => sum + f.amount, 0);

    return {
      name: m.name,
      revenue: totalMonthRevenue,
      expense: totalMonthExpense
    };
  });

  // Lead Funnel conversion rates
  const funnelData = [
    { stage: 'New Leads', count: leads.length, color: '#6366f1' },
    { stage: 'Contacted', count: leads.filter(l => ['Contacted', 'Follow Up', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.status)).length, color: '#3b82f6' },
    { stage: 'Proposal / Neg', count: leads.filter(l => ['Proposal Sent', 'Negotiation', 'Won'].includes(l.status)).length, color: '#06b6d4' },
    { stage: 'Closed Won', count: leadsConverted, color: '#10b981' }
  ];

  // Project Type pie distribution
  const projectTypesCount = projects.reduce((acc: any, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(projectTypesCount).map(key => ({
    name: key,
    value: projectTypesCount[key]
  }));

  const COLORS = ['#818cf8', '#34d399', '#f59e0b', '#ec4899', '#38bdf8', '#a78bfa', '#fb7185'];

  return (
    <div id="dashboard-module" className="space-y-6 max-w-7xl mx-auto">
      
      {/* GrowInvicta Dynamic Top Greetings Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wide">
              agency live status
            </span>
            <span className="text-slate-400 text-xs font-mono">Run Mode: Super Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 font-sans tracking-tight">
            Welcome back, {currentUsername}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">IST Clock</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold tabular-nums">{istTime}</span>
            <span className="text-slate-600 dark:text-slate-700">&bull;</span>
            <div className="relative" ref={calendarRef}>
              <button
                type="button"
                onClick={() => {
                  setShowCalendar(!showCalendar);
                  setCalendarDate(new Date());
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline decoration-indigo-500/40 decoration-wavy underline-offset-2 cursor-pointer transition-colors"
                title="Click to show calendar"
              >
                {istDate}
              </button>

              {showCalendar && (
                <div className="absolute right-0 top-full mt-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 w-64 z-50 animate-fadeIn text-left">
                  <div className="flex justify-between items-center mb-3">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 text-xs cursor-pointer select-none"
                    >
                      &lt;
                    </button>
                    <span className="text-xs font-semibold text-white font-sans">
                      {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 text-xs cursor-pointer select-none"
                    >
                      &gt;
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 mb-1.5 font-sans">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-sans text-xs">
                    {(() => {
                      const year = calendarDate.getFullYear();
                      const month = calendarDate.getMonth();
                      const firstDayIndex = new Date(year, month, 1).getDay();
                      const totalDays = new Date(year, month + 1, 0).getDate();
                      
                      const cells = [];
                      for (let i = 0; i < firstDayIndex; i++) {
                        cells.push(<div key={`empty-${i}`} className="p-1" />);
                      }
                      
                      const today = new Date();
                      for (let d = 1; d <= totalDays; d++) {
                        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
                        cells.push(
                          <div 
                            key={`day-${d}`} 
                            className={`p-1 rounded font-medium select-none text-[11px] ${
                              isToday 
                                ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30' 
                                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            {d}
                          </div>
                        );
                      }
                      return cells;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (11 interactive cards rearranged) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        {enabledFeatures.payments && (
          <div 
            onClick={() => onNavigate('payments')}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
            id="kpi-total-revenue"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400">Total Revenue</span>
              <span className="p-1.5 bg-slate-950 rounded-lg text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight flex items-center gap-0.5">
              <span className="text-sm font-normal text-slate-400">₹</span>
              {totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Total ledger receipts
            </div>
          </div>
        )}

        {/* Monthly Revenue */}
        {enabledFeatures.payments && (
          <div 
            onClick={() => onNavigate('payments')}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
            id="kpi-monthly-revenue"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400">Monthly Revenue</span>
              <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400">
                <IndianRupee className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight flex items-center gap-0.5">
              <span className="text-sm font-normal text-slate-400">₹</span>
              {monthlyRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Active retainer clients value
            </div>
          </div>
        )}

        {/* Pending Payments / Outstanding Invoices */}
        {enabledFeatures.payments && (
          <div 
            onClick={() => onNavigate('payments')}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-amber-500 transition-all cursor-pointer group"
            id="kpi-outstanding-invoices"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400">Outstanding Invoices</span>
              <span className="p-1.5 bg-slate-950 rounded-lg text-amber-500">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xl font-bold text-amber-400 tracking-tight flex items-center gap-0.5">
              <span className="text-sm font-normal text-amber-500">₹</span>
              {pendingPayments.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Unbilled & Overdue credit
            </div>
          </div>
        )}

        {/* Yearly Domain & Hosting Revenue */}
        {enabledFeatures.websites && (
          <div 
            onClick={() => onNavigate('websites')}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-blue-400 transition-all cursor-pointer group"
            id="kpi-domain-hosting-revenue"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400">Domain & Hosting (Yearly)</span>
              <span className="p-1.5 bg-slate-950 rounded-lg text-blue-400">
                <Globe className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight flex items-center gap-0.5">
              <span className="text-sm font-normal text-slate-400">₹</span>
              {yearlyDomainHostingRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Annual recurring contract value
            </div>
          </div>
        )}

        {/* Total Clients */}
        <div 
          onClick={() => onNavigate('clients')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group"
          id="kpi-total-clients"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Total Clients</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-indigo-400 group-hover:bg-indigo-950 transition-colors">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">{clients.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{activeClients} Active CRM</span>
            <span className="text-indigo-400 group-hover:underline">Manage &rarr;</span>
          </div>
        </div>

        {/* Active Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
          id="kpi-active-projects"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Active Projects</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400 group-hover:bg-emerald-950 transition-colors">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">{activeProj}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>In Pipeline</span>
            <span className="text-emerald-400 group-hover:underline">Kanban &rarr;</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
          id="kpi-completed-projects"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Completed</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-500 group-hover:bg-emerald-950 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">{completedProj}</div>
          <div className="text-[10px] text-emerald-400 mt-1">
            Build deliverables finalized
          </div>
        </div>

        {/* Leads Generated */}
        {enabledFeatures.leads && (
          <div 
            onClick={() => onNavigate('leads')}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-cyan-500 transition-all cursor-pointer group"
            id="kpi-leads-generated"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400">Leads Generated</span>
              <span className="p-1.5 bg-slate-950 rounded-lg text-cyan-400">
                <Megaphone className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-semibold text-white tracking-tight">{leadsGenerated}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Across active channels
            </div>
          </div>
        )}

        {/* Leads Converted */}
        {enabledFeatures.leads && (
          <div 
            onClick={() => onNavigate('leads')}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-emerald-400 transition-all cursor-pointer group"
            id="kpi-leads-won"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400">Leads Won</span>
              <span className="p-1.5 bg-slate-950 rounded-lg text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{leadsConverted}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Conversion Rate: {Math.round((leadsConverted / (leadsGenerated || 1)) * 100)}%
            </div>
          </div>
        )}

        {/* Pending Tasks */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-amber-500 transition-all cursor-pointer group"
          id="kpi-pending-tasks"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Pending Tasks</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-amber-400 group-hover:bg-amber-950 transition-colors">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">{pendingTasks}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Staff Schedules</span>
            <span className="text-amber-400 group-hover:underline">Checklist &rarr;</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-850 shadow-sm hover:border-red-500 transition-all cursor-pointer group"
          id="kpi-overdue-tasks"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Overdue Tasks</span>
            <span className="p-1.5 bg-slate-950 rounded-lg text-red-400 group-hover:bg-red-950 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-red-400 tracking-tight">{overdueTasks}</div>
          <div className="text-[10px] text-red-400/90 mt-1">
            Needs priority follow ups
          </div>
        </div>
      </div>

      {/* Main Charts Modules (Dual Column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Financial Performance Trends */}
        <div className={`${enabledFeatures.leads ? 'lg:col-span-8' : 'lg:col-span-12'} bg-slate-900 p-6 rounded-2xl border border-slate-800`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">
                Financial Growth & Expenditure Trend
              </h3>
              <p className="text-slate-400 text-xs">
                Comparison of received invoice revenue against structural operational budgets in INR.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                <span className="text-slate-300">Revenue Ledger</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="text-slate-300">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: Lead Funnel */}
        {enabledFeatures.leads && (
          <div className="lg:col-span-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1 font-sans">
                Lead Conversion Funnel
              </h3>
              <p className="text-slate-400 text-[11px] mb-6">
                Track CRM response metrics for prospective client projects.
              </p>
            </div>

            {/* Graphical Funnel blocks */}
            <div className="space-y-3.5 my-4 flex-1 flex flex-col justify-center">
              {funnelData.map((item, index) => {
                const maxCount = Math.max(...funnelData.map(d => d.count)) || 1;
                const widthPct = `${(item.count / maxCount) * 100}%`;
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">{item.stage}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{item.count} Leads</span>
                    </div>
                    <div className="w-full bg-slate-950 h-6.5 rounded-lg overflow-hidden border border-slate-850 flex items-center px-1">
                      <div 
                        className="h-4.5 rounded-md flex items-center justify-end pr-2 transition-all duration-300" 
                        style={{ 
                          width: widthPct, 
                          background: `linear-gradient(90deg, ${item.color}33, ${item.color})` 
                        }}
                      >
                        <span className="text-[10px] font-bold text-white font-mono">
                          {Math.round((item.count / maxCount) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Overall Closed Ratio</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {Math.round((leadsConverted / (leads.length || 1)) * 100)}% Conversion
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Types pie and table */}
        <div className="lg:col-span-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-1 font-sans">
            Campaign Distributions
          </h3>
          <p className="text-slate-400 text-[11px] mb-4">
            Allocation of agency expertise by technical contract types.
          </p>

          <div className="h-52 flex justify-center items-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">No project items registered to classify.</div>
            )}
          </div>
        </div>

        {/* Milestone status tracking */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">Upcoming High-Priority Deliverables</h3>
              <p className="text-slate-400 text-xs">Milestone checklist from active corporate development contracts.</p>
            </div>
            <button 
              onClick={() => onNavigate('projects')}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Configure Milestones &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {projects.flatMap(p => p.milestones.map(m => ({ ...m, projName: p.name, priority: p.priority })))
              .filter(m => !m.completed)
              .slice(0, 4)
              .map((m, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs hover:bg-slate-950/40 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${m.priority === 'Critical' ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <div>
                      <span className="font-medium text-slate-200">{m.title}</span>
                      <p className="text-[10px] text-slate-400 font-mono italic mt-0.5">{m.projName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-400">{m.dueDate}</span>
                    <span className="px-2.5 py-0.5 font-mono text-[9px] font-bold bg-slate-950 text-amber-500 rounded border border-amber-500/20">
                      ON TRACK
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
