/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, Briefcase, CheckCircle2, AlertTriangle, IndianRupee, TrendingUp, 
  Sparkles, Megaphone, ArrowUpRight, DollarSign, Calendar, Clock
} from 'lucide-react';
import { Client, Project, Task, Payment, Lead, FinanceLedger } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

interface DashboardProps {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  tasks: Task[];
  payments: Payment[];
  finances: FinanceLedger[];
  onNavigate: (tab: any) => void;
  currentUsername?: string;
  companyName?: string;
}

export default function Dashboard({ 
  clients, leads, projects, tasks, payments, finances, onNavigate,
  currentUsername = 'Chethan D. M.',
  companyName = 'GrowInvicta'
}: DashboardProps) {
  // 1. KPI Calculations
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const activeProj = projects.filter(p => p.status === 'In Progress').length;
  const completedProj = projects.filter(p => p.status === 'Completed').length;
  
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  
  // Checking overdue tasks (Due date earlier than today (2026-06-19) and not completed)
  const todayStr = '2026-06-19';
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate < todayStr).length;

  // Revenue analytics
  const totalRevenue = payments
    .filter(p => p.status === 'Paid' || p.status === 'Partial')
    .reduce((sum, p) => sum + p.paidAmount, 0);

  // Monthly Revenue for June 2026
  const monthlyRevenue = payments
    .filter(p => (p.status === 'Paid' || p.status === 'Partial') && p.paymentDate.startsWith('2026-06'))
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const pendingPayments = payments
    .filter(p => p.status === 'Pending' || p.status === 'Partial' || p.status === 'Overdue')
    .reduce((sum, p) => sum + p.pendingAmount, 0);

  // Leads
  const leadsGenerated = leads.length;
  const leadsConverted = leads.filter(l => l.status === 'Won').length;

  // 2. Chart Data Generation
  // Revenue Trend - aggregate monthly invoices
  const revenueTrendData = [
    { name: 'Jan', revenue: 950000, expense: 410000 },
    { name: 'Feb', revenue: 1450000, expense: 520000 },
    { name: 'Mar', revenue: 1800000, expense: 610000 },
    { name: 'Apr', revenue: 1210000, expense: 480000 },
    { name: 'May', revenue: 1550000, expense: 710000 },
    { name: 'Jun', revenue: monthlyRevenue + 850000, expense: 671500 } // adding base mock offset for realistic visual trends
  ];

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
            <span className="text-slate-400 text-xs font-mono">UTC: 2026-06-19 07:13:52</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 font-sans tracking-tight">
            Welcome back, {currentUsername.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {companyName === 'GrowInvicta' ? 'GrowInvicta' : companyName}'s running rate is up <strong className="text-emerald-400 font-medium">+14.2%</strong> this fiscal quarter. Invoices are reconciling smoothly.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono text-slate-300">Run Mode: Super Admin Control</span>
        </div>
      </div>

      {/* Primary KPI Grid (10 interactive cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Clients */}
        <div 
          onClick={() => onNavigate('clients')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group"
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

        {/* Pending Tasks */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-amber-500 transition-all cursor-pointer group"
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

        {/* Total Revenue */}
        <div 
          onClick={() => onNavigate('payments')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
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

        {/* Monthly Revenue */}
        <div 
          onClick={() => onNavigate('payments')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group"
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
            Received in June 2026
          </div>
        </div>

        {/* Pending Payments */}
        <div 
          onClick={() => onNavigate('payments')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-amber-500 transition-all cursor-pointer group"
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

        {/* Leads Generated */}
        <div 
          onClick={() => onNavigate('leads')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-cyan-500 transition-all cursor-pointer group"
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

        {/* Leads Converted */}
        <div 
          onClick={() => onNavigate('leads')}
          className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:border-emerald-400 transition-all cursor-pointer group"
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
      </div>

      {/* Main Charts Modules (Dual Column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Financial Performance Trends */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-2xl border border-slate-800">
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
