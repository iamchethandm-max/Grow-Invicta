import React, { useState } from 'react';
import { 
  Layers, Users, Sparkles, Briefcase, Clock, IndianRupee, Globe, Calendar, 
  Settings, HelpCircle, CheckCircle2, ChevronRight, BookOpen, MessageSquare, 
  Terminal, ShieldCheck, Archive, Download, User, X
} from 'lucide-react';

interface HowToUseProps {
  theme: 'dark' | 'light';
  onClose?: () => void;
}

export default function HowToUse({ theme, onClose }: HowToUseProps) {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const sections = [
    {
      id: 'dashboard',
      title: 'Overview Dashboard',
      icon: Layers,
      desc: 'Unified business command center.',
      what: 'Displays agency live statuses, core telemetry, and real-time IST clock with interactive date/calendar widgets.',
      how: [
        'Monitor active high-level counters representing total clients, leads, projects, and pending task allocations.',
        'View the live sales pipelines and financial revenue charts.',
        'Use the top interactive IST Clock to keep track of precision Indian Standard Time.',
        'Click on the date in the IST Clock bar to launch an on-demand, interactive calendar dropdown.'
      ]
    },
    {
      id: 'clients',
      title: 'Client CRM Hub',
      icon: Users,
      desc: 'Central repository of all business accounts.',
      what: 'Keeps track of company names, key contacts, billing rates, communications, and live invoice pipelines.',
      how: [
        'Click "Add New Client" to create custom business entries with tailored hourly rates.',
        'Filter clients by their active relationship statuses or search instantly across fields.',
        'View comprehensive invoice histories, total billed items, and soft-delete/archive records.'
      ]
    },
    {
      id: 'leads',
      title: 'Prospective Leads',
      icon: Sparkles,
      desc: 'Visual sales pipeline for new business.',
      what: 'Tracks deal sizes, contact progress, current conversations, and statuses.',
      how: [
        'Create a lead card with expected contract values (INR/USD).',
        'Move leads through pipeline stages to update their progress.',
        'Add details regarding current conversation status and estimated close dates.'
      ]
    },
    {
      id: 'projects',
      title: 'Projects Kanban',
      icon: Briefcase,
      desc: 'Sprint and task board representation.',
      what: 'Visual board columns including Todo, In Progress, In Review, and Completed for active initiatives.',
      how: [
        'Create tasks inside projects, specifying titles, priorities, and description parameters.',
        'Drag and drop task cards between states or click to edit task specifications.',
        'Assign tasks to corresponding developers/employees and track task counts.'
      ]
    },
    {
      id: 'timetracker',
      title: 'Time Tracker',
      icon: Clock,
      desc: 'Employee hours and billable metrics.',
      what: 'Enables precise tracking of employee billable hours against specific projects.',
      how: [
        'Fill out employee names, active projects, durations in hours, and billing descriptions.',
        'Submit logs to instantly append to the agency-wide audited timesheets.',
        'Analyze total weekly or monthly billable hours logged per user role.'
      ]
    },
    {
      id: 'payments',
      title: 'Expenses',
      icon: IndianRupee,
      desc: 'Integrated general accounting ledger.',
      what: 'Tracks internal finances, general ledgers, corporate revenues, and categorized expenses.',
      how: [
        'Input new debit or credit transactions with precise category fields.',
        'Analyze categorized cash outflows using beautiful, high-contrast reactive charts.',
        'Monitor outstanding balances and maintain complete financial compliance.'
      ]
    },
    {
      id: 'websites',
      title: 'Websites Manager',
      icon: Globe,
      desc: 'Hosting and domain monitoring dashboard.',
      what: 'Monitors client websites, live hosting servers, SSL security statuses, and system response times.',
      how: [
        'Register client URLs to run real-time automated status response monitors.',
        'Inspect server specs, backend technologies, hosting providers, and current memory workloads.',
        'Check automated SSL certifications and domain expiration reports.'
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar Planner',
      icon: Calendar,
      desc: 'Visual scheduling tool.',
      what: 'Coordinates active client briefs, sprint cycles, and milestone deliverables.',
      how: [
        'View the current month or week in a grid-based planning layout.',
        'Add scheduled tasks, client meetings, or launch briefs.',
        'Ensure clean cross-team alignment by checking overlapping deadlines.'
      ]
    },
    {
      id: 'settings',
      title: 'Console Settings',
      icon: Settings,
      desc: 'System customization and advanced control hub.',
      what: 'Holds advanced sections: Profile Settings, Corporate Reports, Archived Folder, Developer Center, Audit Access Log, Download Backup, and this Operating Manual.',
      how: [
        'Profile Settings: Personalize company name, role, address, timezone, and brand logos.',
        'Corporate Reports: View deep analytical charts of sales, revenues, and pipeline metrics.',
        'Archived Folder: Soft-deleted CRM accounts or projects can be recovered or scrubbed permanently.',
        'Developer Center: Technical playground inspecting API structures, mock DBs, and schemas.',
        'Audit Access Log: View system logs showing authorized activities, timestamps, and user IP logs.',
        'Download Backup: Instantly package and download a master, multi-sheet Microsoft Excel workbook containing all databases.'
      ]
    }
  ];

  const onboardingSteps = [
    { id: 'step_1', label: 'Explore the Dashboard metrics and the IST clock' },
    { id: 'step_2', label: 'Add your first client profile in the Client CRM' },
    { id: 'step_3', label: 'Create a prospective deal card in Lead Tracker' },
    { id: 'step_4', label: 'Assign a developmental task in Projects Kanban' },
    { id: 'step_5', label: 'Log billable hours in Time Tracker' },
    { id: 'step_6', label: 'Export your data via Settings > Download backup' }
  ];

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSections = activeSection === 'all' 
    ? sections 
    : sections.filter(s => s.id === activeSection);

  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-2xl border ${
      isDark ? 'bg-[#18191d] border-slate-900/60 shadow-md' : 'bg-white border-gray-150 shadow-xs'
    }`}>
      {/* Header */}
      <div className={`sticky -top-6 -mx-6 px-6 pt-6 pb-4 mb-6 z-30 flex justify-between items-center border-b ${
        isDark ? 'bg-[#18191d] border-slate-900/60' : 'bg-white border-gray-150'
      }`}>
        <div className="text-left pr-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
            <h2 className={`text-sm sm:text-lg font-bold font-sans ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              GrowInvicta Operating Manual
            </h2>
          </div>
          <p className={`text-[10px] sm:text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Welcome to the ultimate system guide. Learn how to operate every feature of the Enterprise Suite.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Guide"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 shrink-0 ${
              isDark 
                ? 'bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 shadow-sm' 
                : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 shadow-xs'
            }`}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close Guide</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Onboarding & Section Selector */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Filter */}
          <div className="text-left">
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Navigate Topics
            </h4>
            <div className="flex flex-wrap xl:flex-col gap-1.5 font-sans">
              <button
                onClick={() => setActiveSection('all')}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left cursor-pointer transition-colors ${
                  activeSection === 'all'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : isDark ? 'bg-slate-900/60 hover:bg-slate-900 text-slate-400' : 'bg-gray-100 hover:bg-gray-150 text-gray-700'
                }`}
              >
                All Workspace Modules
              </button>
              {sections.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center gap-2 cursor-pointer transition-colors ${
                      activeSection === s.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : isDark ? 'bg-slate-900/60 hover:bg-slate-900 text-slate-400' : 'bg-gray-100 hover:bg-gray-150 text-gray-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Checklist */}
          <div className={`p-4 rounded-xl border text-left ${
            isDark ? 'bg-[#0c0d10] border-slate-900' : 'bg-gray-50 border-gray-150'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
              isDark ? 'text-indigo-400' : 'text-indigo-650'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>Interactive Onboarding</span>
            </h3>
            <p className={`text-[11px] mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Complete these steps to get familiar with your workspace:
            </p>
            <div className="space-y-2.5">
              {onboardingSteps.map(step => {
                const isDone = !!completedSteps[step.id];
                return (
                  <button
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className="w-full flex items-start gap-2.5 text-left group cursor-pointer"
                  >
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isDone 
                        ? 'bg-emerald-500 border-emerald-600 text-white' 
                        : isDark ? 'border-slate-800 hover:border-indigo-500' : 'border-gray-300 hover:border-indigo-500'
                    }`}>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-xs leading-normal transition-colors ${
                      isDone 
                        ? 'line-through text-slate-500' 
                        : isDark ? 'text-slate-300 group-hover:text-indigo-400' : 'text-slate-700 group-hover:text-indigo-600'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Guide content */}
        <div className="xl:col-span-2 space-y-4">
          <div className="space-y-4">
            {filteredSections.map(s => {
              const Icon = s.icon;
              return (
                <div 
                  key={s.id}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    isDark ? 'bg-[#0c0d10] border-slate-900/80 hover:border-indigo-500/20' : 'bg-gray-50/50 border-gray-150 hover:border-indigo-500/25'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 bg-indigo-600/10 text-indigo-500 rounded-xl">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {s.title}
                      </h3>
                      <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-indigo-600'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5 mt-4">
                    <div>
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        Core Purpose & Functionality
                      </h4>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {s.what}
                      </p>
                    </div>

                    <div>
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        Operational Instructions
                      </h4>
                      <ul className="space-y-1.5">
                        {s.how.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
