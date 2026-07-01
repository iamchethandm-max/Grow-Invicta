import React from 'react';
import { 
  Sparkles, Globe, Clock, IndianRupee, Calendar, 
  CheckCircle, Plus, ToggleLeft, ToggleRight, Info, ShieldAlert
} from 'lucide-react';

interface FeatureOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface AddNewFeatureProps {
  theme: 'dark' | 'light';
  enabledFeatures: Record<string, boolean>;
  onToggleFeature: (id: string) => void;
}

export default function AddNewFeature({ theme, enabledFeatures, onToggleFeature }: AddNewFeatureProps) {
  const isDark = theme === 'dark';

  const featureOptions: FeatureOption[] = [
    {
      id: 'leads',
      label: 'Prospective Leads Tracker',
      desc: 'Visual sales pipeline to track custom deal sizes, client communications, and real-time conversion metrics.',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'websites',
      label: 'Websites & SSL Manager',
      desc: 'Monitor client domains, check automated SSL certifications, hosting response times, and system workloads.',
      icon: Globe,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'timetracker',
      label: 'Time Tracker',
      desc: 'Track our billable hours against active projects, generate custom timesheets, and calculate billable sums.',
      icon: Clock,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'payments',
      label: 'Billing & Expenses',
      desc: 'Durable accounting log tracking internal expenditures, general ledgers, categorized outflows, and cash trends.',
      icon: IndianRupee,
      color: 'from-rose-500 to-red-500'
    },
    {
      id: 'calendar',
      label: 'Calendar Planner',
      desc: 'Interactive schedule grid to coordinate milestone sprint deliverables, client kickoffs, and project deadlines.',
      icon: Calendar,
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className={`p-6 rounded-2xl border transition-all text-left ${
      isDark ? 'bg-[#18191d] border-slate-900/60 shadow-md' : 'bg-white border-gray-150 shadow-xs'
    }`}>
      {/* Header Banner */}
      <div className={`mb-6 p-6 rounded-xl border relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-[#101114] to-[#121317] border-slate-800' 
          : 'bg-gradient-to-r from-slate-50 via-gray-50 to-indigo-50/20 border-gray-150'
      }`}>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-650/10 text-indigo-500 dark:text-indigo-400 rounded-full">
              Workspace Configurator
            </span>
          </div>
          <h2 className={`text-xl font-bold font-sans tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Add or Customize Workspace Features
          </h2>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Tailor the GrowInvicta suite to your exact business needs. Toggle optional modules on or off below. 
            Disabled modules are instantly and completely hidden from the main navigation menu, the Overview dashboard stats, and all system charts.
          </p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureOptions.map(feature => {
          const isEnabled = !!enabledFeatures[feature.id];
          const Icon = feature.icon;

          return (
            <div 
              key={feature.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isEnabled 
                  ? isDark 
                    ? 'bg-indigo-950/10 border-indigo-500/20 shadow-xs' 
                    : 'bg-indigo-50/20 border-indigo-200/50 shadow-xs'
                  : isDark 
                    ? 'bg-[#0d0e11] border-slate-900 opacity-60 hover:opacity-80' 
                    : 'bg-gray-50/50 border-gray-150 opacity-65 hover:opacity-85'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => onToggleFeature(feature.id)}
                    className="cursor-pointer focus:outline-none transition-transform active:scale-95"
                    title={isEnabled ? 'Disable module' : 'Enable module'}
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-10 h-10 text-indigo-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-500" />
                    )}
                  </button>
                </div>

                <h3 className={`text-sm font-bold font-sans mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {feature.label}
                </h3>
                <p className={`text-xs leading-relaxed min-h-[48px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.desc}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-800/10 dark:border-slate-800/50 flex justify-between items-center">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isEnabled 
                    ? 'text-emerald-500' 
                    : 'text-slate-500'
                }`}>
                  {isEnabled ? '● Active in Workspace' : '○ Hidden / Disabled'}
                </span>

                <button
                  onClick={() => onToggleFeature(feature.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isEnabled
                      ? isDark 
                        ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isEnabled ? 'Disable Feature' : 'Add to Workspace'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Warning Card */}
      <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 text-left ${
        isDark ? 'bg-slate-950/40 border-slate-900 text-slate-400' : 'bg-amber-50/20 border-amber-200/50 text-slate-600'
      }`}>
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            Data Integrity Guard
          </h4>
          <p className="text-[11px] leading-relaxed">
            Disabling or hiding features does not erase your recorded data (leads, timesheets, invoices, calendar schedules, SSL urls remain fully saved). When you re-enable any module in the future, all your historical logs will instantly reappear in perfect condition.
          </p>
        </div>
      </div>
    </div>
  );
}
