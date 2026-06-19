/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, CheckSquare, IndianRupee, Bell, Search, 
  Terminal, ShieldCheck, HelpCircle, LogOut, ChevronRight, Menu, 
  X, Layers, Calendar, FileSpreadsheet, Lock, Sparkles, Send, 
  UserPlus, UserCheck, AlertCircle, FileText, Globe, Clock, User, 
  PanelLeftClose, PanelLeft, Sun, Moon, Download
} from 'lucide-react';

import { 
  Client, Lead, Project, Task, Payment, FinanceLedger, Reminder, AuditLog, UserRole, Website, 
  TimeLog, ProfileSettings 
} from './types';

import { 
  INITIAL_CLIENTS, INITIAL_LEADS, INITIAL_PROJECTS, INITIAL_TASKS, 
  INITIAL_PAYMENTS, INITIAL_FINANCE_LETTERS, INITIAL_REMINDERS, INITIAL_AUDIT_LOGS,
  INITIAL_WEBSITES, INITIAL_TIME_LOGS, getStateFromStorage, saveStateToStorage 
} from './data/mockData';

// Modular component imports
import Dashboard from './components/Dashboard';
import ClientsCRM from './components/ClientsCRM';
import LeadTracker from './components/LeadTracker';
import ProjectsKanban from './components/ProjectsKanban';
import TaskPlanner from './components/TaskPlanner';
import FinanceManager from './components/FinanceManager';
import CalendarView from './components/CalendarView';
import ReportsCenter from './components/ReportsCenter';
import DeveloperConsole from './components/DeveloperConsole';
import WebsitesManager from './components/WebsitesManager';
import TimeTracker from './components/TimeTracker';
import ProfilePersonalization from './components/ProfilePersonalization';
import { triggerExcelBackupDownload } from './utils/excelBackup';


import LoginScreen from './components/LoginScreen';

export default function App() {
  // 1. Multi-company tenant directory
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; adminEmail: string }>>(() => {
    const saved = localStorage.getItem('growinvicta_registered_companies');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return [
      { id: 'grow_invicta', name: 'GrowInvicta Agency', adminEmail: 'admin@growinvicta.com' },
      { id: 'apex_retail', name: 'Apex Retail Solutions', adminEmail: 'ananya@apexretail.in' },
      { id: 'vance_logistics', name: 'Vance Logistics Corp', adminEmail: 'm.vance@vancestrong.com' }
    ];
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    return localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
  });

  const loadedCompanyIdRef = React.useRef(activeCompanyId);

  // 1b. App State persisted securely in LocalStorage segregated by activeCompanyId
  const [clients, setClients] = useState<Client[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_clients`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_CLIENTS : []);
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_leads`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_LEADS : []);
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_projects`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_PROJECTS : []);
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_tasks`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_TASKS : []);
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_payments`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_PAYMENTS : []);
  });

  const [finances, setFinances] = useState<FinanceLedger[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_finances`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_FINANCE_LETTERS : []);
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_reminders`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_REMINDERS : []);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_auditLogs`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_AUDIT_LOGS : []);
  });

  const [websites, setWebsites] = useState<Website[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_websites`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_WEBSITES : []);
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_timeLogs`);
    return item ? JSON.parse(item) : (cid === 'grow_invicta' ? INITIAL_TIME_LOGS : []);
  });
  
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(() => {
    const cid = localStorage.getItem('growinvicta_active_company_id') || 'grow_invicta';
    const item = localStorage.getItem(`company_${cid}_profileSettings`);
    if (item) return JSON.parse(item);
    
    return {
      companyName: cid === 'grow_invicta' ? 'GrowInvicta' : cid.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      companyLogoUrl: '',
      personalName: 'Chethan D. M.',
      email: 'iamchethandm@gmail.com',
      phone: '+91 98450 12345',
      role: 'Managing Director & CEO',
      address: 'Outer Ring Road, Bangalore, KA, IN',
      timezone: 'Asia/Kolkata (IST)',
      accentColor: 'indigo'
    };
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStateFromStorage('theme', 'dark'));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => getStateFromStorage('isSidebarCollapsed', false));

  // Update current user presentation based on profileSettings
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('growinvicta_isAuthenticated') === 'true';
  });
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Super Admin');
  const [currentUsername, setCurrentUsername] = useState('Chethan D. M.');

  // Keep username synced when profile changes
  useEffect(() => {
    setCurrentUsername(profileSettings.personalName);
  }, [profileSettings.personalName]);

  // 3. UI Navigation parameters
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'clients' | 'leads' | 'projects' | 'tasks' | 'payments' | 'calendar' | 'reports' | 'developer' | 'websites' | 'logs' | 'timetracker' | 'profile'
  >('dashboard');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState('');

  // Switching helper
  const switchToCompany = (newCompanyId: string) => {
    // 1. Save current states to localStorage for the old active company
    const oldId = loadedCompanyIdRef.current;
    if (oldId) {
      localStorage.setItem(`company_${oldId}_clients`, JSON.stringify(clients));
      localStorage.setItem(`company_${oldId}_leads`, JSON.stringify(leads));
      localStorage.setItem(`company_${oldId}_projects`, JSON.stringify(projects));
      localStorage.setItem(`company_${oldId}_tasks`, JSON.stringify(tasks));
      localStorage.setItem(`company_${oldId}_payments`, JSON.stringify(payments));
      localStorage.setItem(`company_${oldId}_finances`, JSON.stringify(finances));
      localStorage.setItem(`company_${oldId}_reminders`, JSON.stringify(reminders));
      localStorage.setItem(`company_${oldId}_auditLogs`, JSON.stringify(auditLogs));
      localStorage.setItem(`company_${oldId}_websites`, JSON.stringify(websites));
      localStorage.setItem(`company_${oldId}_timeLogs`, JSON.stringify(timeLogs));
      localStorage.setItem(`company_${oldId}_profileSettings`, JSON.stringify(profileSettings));
    }

    // 2. Set reference first
    loadedCompanyIdRef.current = newCompanyId;
    setActiveCompanyId(newCompanyId);
    localStorage.setItem('growinvicta_active_company_id', newCompanyId);

    // 3. Retrieve and set values for the new active company
    const prefix = `company_${newCompanyId}_`;
    const isDemo = newCompanyId === 'grow_invicta';
    
    function getLocal<T>(key: string, def: T): T {
      const item = localStorage.getItem(prefix + key);
      return item ? JSON.parse(item) : def;
    }

    setClients(getLocal('clients', isDemo ? INITIAL_CLIENTS : []));
    setLeads(getLocal('leads', isDemo ? INITIAL_LEADS : []));
    setProjects(getLocal('projects', isDemo ? INITIAL_PROJECTS : []));
    setTasks(getLocal('tasks', isDemo ? INITIAL_TASKS : []));
    setPayments(getLocal('payments', isDemo ? INITIAL_PAYMENTS : []));
    setFinances(getLocal('finances', isDemo ? INITIAL_FINANCE_LETTERS : []));
    setReminders(getLocal('reminders', isDemo ? INITIAL_REMINDERS : []));
    setAuditLogs(getLocal('auditLogs', isDemo ? INITIAL_AUDIT_LOGS : []));
    setWebsites(getLocal('websites', isDemo ? INITIAL_WEBSITES : []));
    setTimeLogs(getLocal('timeLogs', isDemo ? INITIAL_TIME_LOGS : []));

    const defaultProfile: ProfileSettings = {
      companyName: isDemo ? 'GrowInvicta' : newCompanyId.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      companyLogoUrl: '',
      personalName: 'Chethan D. M.',
      email: 'iamchethandm@gmail.com',
      phone: '+91 98450 12345',
      role: 'Managing Director & CEO',
      address: 'Outer Ring Road, Bangalore, KA, IN',
      timezone: 'Asia/Kolkata (IST)',
      accentColor: 'indigo'
    };
    setProfileSettings(getLocal('profileSettings', defaultProfile));
  };

  const handleRegisterCompany = (companyName: string, adminName: string, email: string) => {
    const id = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    const newCompany = { id, name: companyName, adminEmail: email };
    const updated = [...companies, newCompany];
    setCompanies(updated);
    localStorage.setItem('growinvicta_registered_companies', JSON.stringify(updated));

    const audit: AuditLog = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: adminName,
      role: 'Super Admin',
      action: 'Register Enterprise Node',
      details: `Provisioned isolated business container schema for ${companyName} [Tenant ID: ${id}]`
    };

    localStorage.setItem(`company_${id}_clients`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_leads`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_projects`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_tasks`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_payments`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_finances`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_reminders`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_auditLogs`, JSON.stringify([audit]));
    localStorage.setItem(`company_${id}_websites`, JSON.stringify([]));
    localStorage.setItem(`company_${id}_timeLogs`, JSON.stringify([]));

    const profile: ProfileSettings = {
      companyName: companyName,
      companyLogoUrl: '',
      personalName: adminName,
      email: email,
      phone: '',
      role: 'Managing Director & CEO',
      address: '',
      timezone: 'Asia/Kolkata (IST)',
      accentColor: 'indigo'
    };
    localStorage.setItem(`company_${id}_profileSettings`, JSON.stringify(profile));
  };

  const handleLogin = (companyId: string, role: UserRole, username: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('growinvicta_isAuthenticated', 'true');
    setCurrentUserRole(role);
    switchToCompany(companyId);
    
    // Set customized logged username
    setProfileSettings(prev => {
      const updated = {
        ...prev,
        personalName: username || prev.personalName,
        role: prev.role || role
      };
      localStorage.setItem(`company_${companyId}_profileSettings`, JSON.stringify(updated));
      return updated;
    });

    const log: AuditLog = {
      id: `a_usr_log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: username,
      role: role,
      action: 'Secure Authentication',
      details: `Sign-in token authenticated for workspace node ${companyId}`
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // 4. Persistence synchronization hooks matching selected tenant
  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_clients`, JSON.stringify(clients));
    }
  }, [clients, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_leads`, JSON.stringify(leads));
    }
  }, [leads, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_projects`, JSON.stringify(projects));
    }
  }, [projects, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_tasks`, JSON.stringify(tasks));
    }
  }, [tasks, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_payments`, JSON.stringify(payments));
    }
  }, [payments, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_finances`, JSON.stringify(finances));
    }
  }, [finances, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_reminders`, JSON.stringify(reminders));
    }
  }, [reminders, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_auditLogs`, JSON.stringify(auditLogs));
    }
  }, [auditLogs, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_websites`, JSON.stringify(websites));
    }
  }, [websites, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_timeLogs`, JSON.stringify(timeLogs));
    }
  }, [timeLogs, activeCompanyId]);

  useEffect(() => {
    if (loadedCompanyIdRef.current === activeCompanyId) {
      localStorage.setItem(`company_${activeCompanyId}_profileSettings`, JSON.stringify(profileSettings));
    }
  }, [profileSettings, activeCompanyId]);

  useEffect(() => { saveStateToStorage('theme', theme); }, [theme]);
  useEffect(() => { saveStateToStorage('isSidebarCollapsed', isSidebarCollapsed); }, [isSidebarCollapsed]);


  // Push audit logging record on security events
  const writeAuditEntry = (action: string, details: string) => {
    const log: AuditLog = {
      id: `a_usr_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUsername,
      role: currentUserRole,
      action,
      details
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleRoleToggle = (role: UserRole) => {
    setCurrentUserRole(role);
    const userMap: Record<UserRole, string> = {
      'Super Admin': 'Chethan D. M.',
      'Manager': 'Nisha Sen',
      'Employee': 'Siddharth Roy'
    };
    setCurrentUsername(userMap[role]);
    writeAuditEntry('RBAC Role Change', `Authorized access token views transitioned to ${role}`);
  };

  // 5. Global Search queries handler across multiple entities
  const getSearchResults = () => {
    if (!globalSearchInput.trim()) return { clients: [], projects: [], tasks: [], leads: [], payments: [] };
    const query = globalSearchInput.toLowerCase();

    return {
      clients: clients.filter(c => c.company.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)),
      projects: projects.filter(p => p.name.toLowerCase().includes(query) || p.clientName.toLowerCase().includes(query)),
      tasks: tasks.filter(t => t.title.toLowerCase().includes(query) || t.project.toLowerCase().includes(query)),
      leads: leads.filter(l => l.company.toLowerCase().includes(query) || l.name.toLowerCase().includes(query)),
      payments: payments.filter(p => p.invoiceNumber.toLowerCase().includes(query) || p.clientName.toLowerCase().includes(query))
    };
  };

  const searchResults = getSearchResults();
  const searchResultsCount = 
    searchResults.clients.length + 
    searchResults.projects.length + 
    searchResults.tasks.length + 
    searchResults.leads.length + 
    searchResults.payments.length;

  // 6. Dynamic Website billing notifications builder
  const getBillingNotifications = () => {
    const anchor = new Date('2026-06-19');
    const alerts: Array<{ id: string; type: string; title: string; subtitle: string; isOverdue: boolean }> = [];

    websites.forEach(w => {
      // Hosting
      const hDate = new Date(w.hostingBillDate);
      const hDays = Math.ceil((hDate.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
      if (hDays < 0) {
        alerts.push({
          id: `notif_h_${w.id}`,
          type: 'Hosting Overdue',
          title: `Hosting bill for ${w.name} is Overdue by ${Math.abs(hDays)} days`,
          subtitle: `AWS/Hostinger Node • INR ${w.hostingPrice.toLocaleString('en-IN')}`,
          isOverdue: true
        });
      } else if (hDays <= 7) {
        alerts.push({
          id: `notif_h_${w.id}`,
          type: 'Hosting Renewal',
          title: `Hosting bill for ${w.name} is due in ${hDays} days`,
          subtitle: `Cloud Staging • INR ${w.hostingPrice.toLocaleString('en-IN')}`,
          isOverdue: false
        });
      }

      // Domain
      const dDate = new Date(w.domainBillDate);
      const dDays = Math.ceil((dDate.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
      if (dDays < 0) {
        alerts.push({
          id: `notif_d_${w.id}`,
          type: 'Domain Overdue',
          title: `Domain fee for ${w.name} is Overdue by ${Math.abs(dDays)} days`,
          subtitle: `DNS Record • INR ${w.domainPrice.toLocaleString('en-IN')}`,
          isOverdue: true
        });
      } else if (dDays <= 7) {
        alerts.push({
          id: `notif_d_${w.id}`,
          type: 'Domain Renewal',
          title: `Domain fee for ${w.name} is due in ${dDays} days`,
          subtitle: `DNS Registrar • INR ${w.domainPrice.toLocaleString('en-IN')}`,
          isOverdue: false
        });
      }
    });

    return alerts;
  };

  const billingNotifications = getBillingNotifications();
  const totalAlertsCount = reminders.length + billingNotifications.length;

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        companies={companies}
        onLogin={handleLogin}
        onRegisterCompany={handleRegisterCompany}
        theme={theme}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors ${
      theme === 'light' ? 'light bg-gray-50 text-gray-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* LEFT SIDEBAR OR TOP NAV MOBILE BAR */}
      <aside className={`w-full flex flex-col justify-between md:sticky md:top-0 md:h-screen z-40 transition-all ${
        isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
      } ${
        theme === 'light' ? 'bg-white border-b md:border-b-0 md:border-r border-gray-200' : 'bg-slate-900 border-b md:border-b-0 md:border-r border-slate-850'
      }`}>
        <div>
          {/* Brand header */}
          <div className={`p-4 border-b flex justify-between items-center ${
            theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-slate-850 bg-slate-950'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {profileSettings.companyLogoUrl ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-250 flex items-center justify-center p-0.5 flex-shrink-0">
                  <img src={profileSettings.companyLogoUrl} referrerPolicy="no-referrer" alt="Company Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="p-1.5 bg-indigo-600 rounded-lg text-white flex-shrink-0">
                  <Layers className="w-5 h-5 animate-pulse" />
                </div>
              )}
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <h1 className={`text-xs font-bold tracking-wider font-mono truncate uppercase ${theme === 'light' ? 'text-indigo-600' : 'text-white'}`}>
                    {profileSettings.companyName || 'GROWINVICTA'}
                  </h1>
                  <span className={`text-[8.5px] font-mono italic block tracking-tight ${theme === 'light' ? 'text-gray-400' : 'text-slate-450'}`}>Corporate Console</span>
                </div>
              )}
            </div>

            {/* Mobile menu triggers */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-1.5 text-slate-400 hover:text-indigo-500 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Hide/Unhide Collapse Button for Desktop */}
          <div className="hidden md:block p-3">
            <button 
              onClick={() => {
                setIsSidebarCollapsed(!isSidebarCollapsed);
                writeAuditEntry('Sidebar toggled', `Menu width mutated to: ${!isSidebarCollapsed ? 'expanded' : 'collapsed'}`);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-medium border cursor-pointer transition-colors ${
                theme === 'light'
                  ? 'border-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  : 'border-transparent hover:bg-slate-850 text-slate-400 hover:text-slate-200'
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-indigo-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
              {!isSidebarCollapsed && <span>Collapse menu</span>}
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className={`p-4 space-y-1 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: Layers },
              { id: 'clients', label: 'Client CRM Hub', icon: Users },
              { id: 'leads', label: 'Prospective Leads', icon: Sparkles },
              { id: 'projects', label: 'Projects Kanban', icon: Briefcase },
              { id: 'tasks', label: 'Sprint Planner', icon: CheckSquare },
              { id: 'timetracker', label: 'Clockify Tracker', icon: Clock },
              { id: 'payments', label: 'Payments & Ledger', icon: IndianRupee },
              { id: 'websites', label: 'Websites Manager', icon: Globe },
              { id: 'calendar', label: 'Calendar Planner', icon: Calendar },
              { id: 'reports', label: 'Corporate Reports', icon: FileSpreadsheet },
              { id: 'profile', label: 'Personalize Profile', icon: User },
              { id: 'developer', label: 'Developer Center', icon: Terminal },
              { id: 'logs', label: 'Audit Access Logs', icon: ShieldCheck }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                    writeAuditEntry('Navigation Clicked', `Opened console tab: ${tab.label}`);
                  }}
                  title={tab.label}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-colors text-xs font-medium border cursor-pointer ${
                    isSelected 
                      ? theme === 'light'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-650 font-bold shadow-xs'
                        : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 font-semibold shadow-xs' 
                      : theme === 'light'
                        ? 'border-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                        : 'border-transparent hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER/ROLE PANEL CONFIG */}
        <div className={`p-4 border-t space-y-3.5 ${
          theme === 'light' ? 'border-gray-200 bg-gray-50/50' : 'border-slate-850 bg-slate-950/60'
        } ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
              theme === 'light' ? 'bg-gray-200 border-indigo-400/20' : 'bg-slate-850 border-indigo-500/20'
            }`}>
              <span className="text-[10px] font-bold text-indigo-400 font-mono">CH</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${theme === 'light' ? 'text-gray-900' : 'text-slate-200'}`}>{currentUsername}</p>
                <span className="text-[9.5px] text-indigo-500 font-mono font-medium block truncate">{profileSettings.role || currentUserRole}</span>
              </div>
            )}
          </div>

          {/* Quick Role switcher RBAC selector */}
          {!isSidebarCollapsed && (
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block mb-1">RBAC Authority Level</span>
              <div className={`grid grid-cols-3 gap-1 p-0.5 rounded-lg border ${
                theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-slate-900 border-slate-850'
              }`}>
                {(['Super Admin', 'Manager', 'Employee'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleToggle(role)}
                    className={`py-1 rounded text-[8.5px] font-bold uppercase tracking-tighter cursor-pointer ${
                      currentUserRole === role 
                        ? theme === 'light'
                          ? 'bg-white text-indigo-600 font-extrabold shadow-xs'
                          : 'bg-slate-950 text-indigo-400 font-extrabold shadow-sm' 
                        : 'text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    {role.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-850 text-[10px] font-mono text-slate-500">
            {!isSidebarCollapsed && <span>Ver: Enterprise v2.5</span>}
            <button 
              onClick={() => {
                if(confirm("Verify security logout sequence?")) {
                  writeAuditEntry('Sign out trigger', 'Manual console token expiration scheduled.');
                  setIsAuthenticated(false);
                }
              }}
              className="text-rose-450 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              {!isSidebarCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* TOP HEADER STATUS & MASTER CONTENT PANEL */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic Navigation Headbar & Global Searches */}
        <header className={`p-4 border-b flex flex-col md:flex-row justify-between items-center sticky top-0 z-30 transition-all ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-850'
        }`}>
          <div className="flex items-center gap-3">
            {/* Real Search Box triggering palette overlay */}
            <div className="relative max-w-xs cursor-pointer group" onClick={() => setIsSearchPaletteOpen(true)}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                readOnly
                placeholder="Global Search (Press / to explore)..." 
                className={`border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none w-56 md:w-64 cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-450' 
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 md:mt-0">
            
            {/* Real-time multi-sheet workbook Excel backup trigger */}
            <button
              onClick={() => {
                triggerExcelBackupDownload({ clients, leads, projects, tasks, payments, websites, timeLogs });
                writeAuditEntry('Corporate Backup', 'Downloaded complete business data worksheet with multiple worksheet tabs.');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-xs'
                  : 'bg-indigo-600 hover:bg-indigo-750 text-white'
              }`}
              title="Download composite Multi-Tab Excel Backup of all business entities"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Excel Backup</span>
            </button>

            {/* Theme switcher toggle */}
            <button
              onClick={() => {
                const nTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nTheme);
                writeAuditEntry('Theme Transition', `System layout flipped to ${nTheme} mode`);
              }}
              className={`p-1.5 rounded-lg border cursor-pointer flex items-center justify-center transition-colors ${
                theme === 'light'
                  ? 'bg-gray-150 border-gray-300 hover:bg-gray-200 text-gray-700'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-500 text-slate-300'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Sync connection status indicators */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 border rounded-lg ${
              theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono text-slate-400">Postgres Node Connected</span>
            </div>

            {/* Quick alert notifications bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-1.5 border rounded-lg cursor-pointer relative ${
                  theme === 'light' 
                    ? 'bg-gray-150 border-gray-300 text-gray-700 hover:text-black' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-500 text-slate-300'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
                {totalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>


              {/* Notification drop menus */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-40 space-y-3.5 font-sans">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200 font-mono">Operations Alerts</span>
                      <span className="px-1.5 py-0.2 bg-rose-955 text-rose-400 font-mono text-[9px] rounded-full font-bold">
                        {totalAlertsCount}
                      </span>
                    </div>
                    <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-500 hover:text-slate-300 text-[10px] uppercase font-mono cursor-pointer">Close</button>
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto space-y-3.5 pr-1">
                    
                    {/* Website Billing Renewals (Priority 1) */}
                    {billingNotifications.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-rose-400 font-bold block">
                          ⚡ hosting & domain bills ({billingNotifications.length})
                        </span>
                        
                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                          {billingNotifications.map(alert => (
                            <div 
                              key={alert.id} 
                              onClick={() => { setActiveTab('websites'); setIsNotificationsOpen(false); }}
                              className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-750 rounded-lg cursor-pointer text-[10.5px] text-slate-350 transition-colors"
                            >
                              <div className="flex justify-between items-center font-bold">
                                <span className={alert.isOverdue ? 'text-rose-400' : 'text-amber-400'}>
                                  {alert.type}
                                </span>
                                <span className="text-slate-500 text-[9px] font-mono">due soon</span>
                              </div>
                              <p className="mt-1 leading-normal font-sans font-medium text-slate-200">{alert.title}</p>
                              <span className="text-[9.5px] text-slate-450 block font-mono mt-0.5">{alert.subtitle}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General Business reminders (Priority 2) */}
                    <div className="space-y-2 pt-1.5 border-t border-slate-850">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-indigo-400 font-bold block">
                        📅 Schedule & Tasks ({reminders.length})
                      </span>
                      
                      <div className="space-y-2">
                        {reminders.map(rem => (
                          <div key={rem.id} className="text-[11px] text-slate-350 bg-slate-950/40 p-2 rounded-lg border border-slate-900 leading-snug">
                            <span className="text-[8.5px] font-mono text-indigo-400 block font-semibold">{rem.type}</span>
                            <p className="mt-0.5 leading-snug text-slate-250">{rem.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Interactive OAuth trigger to Google Workspace client */}
            <button
              onClick={() => {
                setActiveTab('calendar');
                setIsNotificationsOpen(false);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Launch Board
            </button>
          </div>
        </header>

        {/* CONTAINER WORKSPACE FOR SELECTIVE TAB MODULE */}
        <section className="p-6 overflow-y-auto block flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard 
              clients={clients} 
              leads={leads} 
              projects={projects} 
              tasks={tasks} 
              payments={payments}
              finances={finances}
              onNavigate={(tab) => setActiveTab(tab)}
              currentUsername={currentUsername}
              companyName={profileSettings.companyName}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsCRM 
              clients={clients}
              onAddClient={(c) => setClients(prev => [...prev, c])}
              onEditClient={(c) => setClients(prev => prev.map(item => item.id === c.id ? c : item))}
              onDeleteClient={(id) => setClients(prev => prev.filter(item => item.id !== id))}
            />
          )}

          {activeTab === 'leads' && (
            <LeadTracker 
              leads={leads}
              onAddLead={(l) => setLeads(prev => [...prev, l])}
              onEditLead={(l) => setLeads(prev => prev.map(item => item.id === l.id ? l : item))}
              onDeleteLead={(id) => setLeads(prev => prev.filter(item => item.id !== id))}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsKanban 
              projects={projects}
              currentUserRole={currentUserRole}
              currentUsername={currentUsername}
              onAddProject={(p) => setProjects(prev => [...prev, p])}
              onEditProject={(p) => setProjects(prev => prev.map(item => item.id === p.id ? p : item))}
              onDeleteProject={(id) => setProjects(prev => prev.filter(item => item.id !== id))}
              theme={theme}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskPlanner 
              tasks={tasks}
              projects={projects}
              currentUsername={currentUsername}
              onAddTask={(t) => setTasks(prev => [...prev, t])}
              onEditTask={(t) => setTasks(prev => prev.map(item => item.id === t.id ? t : item))}
              onDeleteTask={(id) => setTasks(prev => prev.filter(item => item.id !== id))}
            />
          )}

          {activeTab === 'payments' && (
            <FinanceManager 
              payments={payments}
              finances={finances}
              onAddPayment={(p) => setPayments(prev => [...prev, p])}
              onEditPayment={(p) => setPayments(prev => prev.map(item => item.id === p.id ? p : item))}
              onDeletePayment={(id) => setPayments(prev => prev.filter(item => item.id !== id))}
              onAddFinance={(f) => setFinances(prev => [f, ...prev])}
              onEditFinance={(f) => setFinances(prev => prev.map(item => item.id === f.id ? f : item))}
              onDeleteFinance={(id) => setFinances(prev => prev.filter(item => item.id !== id))}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              tasks={tasks}
              projects={projects}
              payments={payments}
              onTriggerOAuth={() => {
                // Instantly notify custom OAuth configurations
                writeAuditEntry('Google API Connection Requested', 'Triggered secure calendar permission scopes authorization.');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsCenter 
              clients={clients}
              projects={projects}
              tasks={tasks}
              payments={payments}
              leads={leads}
              finances={finances}
            />
          )}

          {activeTab === 'developer' && (
            <DeveloperConsole />
          )}

          {activeTab === 'websites' && (
            <WebsitesManager 
              websites={websites}
              clients={clients}
              onAddWebsite={(w) => setWebsites(prev => [...prev, w])}
              onEditWebsite={(w) => setWebsites(prev => prev.map(item => item.id === w.id ? w : item))}
              onDeleteWebsite={(id) => setWebsites(prev => prev.filter(item => item.id !== id))}
              onAuditLog={(action, details) => writeAuditEntry(action, details)}
            />
          )}

          {/* VIEW TAB clockify style Time Log */}
          {activeTab === 'timetracker' && (
            <TimeTracker 
              projects={projects}
              tasks={tasks}
              timeLogs={timeLogs}
              clients={clients}
              onAddLog={(log) => setTimeLogs(prev => [log, ...prev])}
              onDeleteLog={(id) => setTimeLogs(prev => prev.filter(item => item.id !== id))}
              theme={theme}
            />
          )}

          {/* VIEW TAB personalizer company custom profile */}
          {activeTab === 'profile' && (
            <ProfilePersonalization 
              settings={profileSettings}
              onUpdateSettings={(settings) => {
                setProfileSettings(settings);
              }}
              theme={theme}
            />
          )}

          {/* VIEW TAB 10: REAL-TIME AUDIT LOGS DISPLAY PANE */}
          {activeTab === 'logs' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white font-sans">GrowInvicta Secure Access Logs</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Automated JWT & User authorization ledger tracking.</p>
                </div>
                <button 
                  onClick={() => {
                    setAuditLogs([]);
                    writeAuditEntry('Log purge complete', 'Security console access lists scrubbed.');
                  }}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-rose-400 hover:bg-slate-850 cursor-pointer"
                >
                  Scrub Logs
                </button>
              </div>

              <div className="space-y-2.5">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-920 border border-slate-850 rounded-xl flex items-start gap-3.5 text-xs font-mono">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex-shrink-0 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{log.timestamp}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-indigo-400 font-semibold">{log.user}</span>
                          &bull;
                          <span className="text-slate-400">{log.role}</span>
                        </div>
                      </div>
                      <p className="text-slate-200">
                        <strong>Action logged: </strong><span className="text-indigo-300">{log.action}</span>
                      </p>
                      <p className="text-slate-400 leading-normal font-sans text-[11.5px] italic">Ref: {log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FLOAT GLOBAL COMMAND PALETTE SEARCH ENGINE */}
      {isSearchPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-4 pt-16">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col max-h-[75vh] overflow-hidden">
            
            <div className="p-4 border-b border-slate-800 flex gap-2.5 items-center bg-slate-950">
              <Search className="w-5 h-5 text-indigo-400" />
              <input 
                type="text" 
                autoFocus
                placeholder="Global Search directories, project titles, client accounts..." 
                value={globalSearchInput}
                onChange={e => setGlobalSearchInput(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
              />
              <button onClick={() => { setIsSearchPaletteOpen(false); setGlobalSearchInput(''); }} className="text-slate-500 hover:text-white cursor-pointer select-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matching items results container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {globalSearchInput.trim() ? (
                searchResultsCount > 0 ? (
                  <div className="space-y-4">
                    {/* Clients results matching */}
                    {searchResults.clients.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-indigo-400">Match Clients CRM ({searchResults.clients.length})</span>
                        {searchResults.clients.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => { setActiveTab('clients'); setIsSearchPaletteOpen(false); }}
                            className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg hover:border-slate-500 cursor-pointer block text-xs"
                          >
                            <span className="font-bold text-slate-100">{c.company}</span>
                            <span className="text-slate-400 text-[10px] block font-mono">Rep: {c.name} &bull; Contact: {c.email}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Project results matching */}
                    {searchResults.projects.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-emerald-400">Match Projects Kanban ({searchResults.projects.length})</span>
                        {searchResults.projects.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => { setActiveTab('projects'); setIsSearchPaletteOpen(false); }}
                            className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg hover:border-slate-500 cursor-pointer block text-xs"
                          >
                            <span className="font-bold text-slate-100">{p.name}</span>
                            <span className="text-slate-405 text-[10px] block font-mono">{p.type} &bull; Status: {p.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Task results matching */}
                    {searchResults.tasks.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-amber-500">Match Sprint Tasks ({searchResults.tasks.length})</span>
                        {searchResults.tasks.map(t => (
                          <div 
                            key={t.id} 
                            onClick={() => { setActiveTab('tasks'); setIsSearchPaletteOpen(false); }}
                            className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg hover:border-slate-500 cursor-pointer block text-xs"
                          >
                            <span className="font-bold text-slate-100">{t.title}</span>
                            <span className="text-slate-450 text-[10px] block font-mono">Assign: {t.assignedTo} &bull; Project: {t.project}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lead results matching */}
                    {searchResults.leads.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-cyan-400">Match Leads Funnel ({searchResults.leads.length})</span>
                        {searchResults.leads.map(l => (
                          <div 
                            key={l.id} 
                            onClick={() => { setActiveTab('leads'); setIsSearchPaletteOpen(false); }}
                            className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg hover:border-slate-500 cursor-pointer block text-xs"
                          >
                            <span className="font-bold text-slate-100">{l.company}</span>
                            <span className="text-slate-400 block font-mono text-[10px]">Rep: {l.name} &bull; Source: {l.source} ({l.status})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs font-mono text-center py-6">No matching parameters found matching "{globalSearchInput}"</p>
                )
              ) : (
                <div className="space-y-2 text-center py-6">
                  <p className="text-slate-400 text-xs font-mono">Execute real-time query indexes.</p>
                  <span className="text-[10px] text-slate-500 block leading-normal">Typing automatically triggers database filter scans over clients, leads, invoices, task queues and campaign milestones.</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-805 text-center text-[10px] text-slate-550 font-mono">
              Press Escape or click closing icon to dim the console.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
