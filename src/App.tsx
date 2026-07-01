/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Briefcase, CheckSquare, IndianRupee, Bell, Search, 
  Terminal, ShieldCheck, HelpCircle, LogOut, ChevronRight, Menu, 
  X, Layers, Calendar, FileSpreadsheet, Lock, Sparkles, Send, 
  UserPlus, UserCheck, AlertCircle, FileText, Globe, Clock, User, 
  PanelLeftClose, PanelLeft, Sun, Moon, Download, Archive, Settings, ArrowLeft, PlusCircle, Upload, BookOpen,
  Zap, Check
} from 'lucide-react';

import { 
  Client, Lead, Project, Task, Payment, FinanceLedger, Reminder, AuditLog, UserRole, Website, 
  TimeLog, ProfileSettings, ArchivedItem
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

import FinanceManager from './components/FinanceManager';
import CalendarView from './components/CalendarView';
import ReportsCenter from './components/ReportsCenter';
import DeveloperConsole from './components/DeveloperConsole';
import WebsitesManager from './components/WebsitesManager';
import TimeTracker from './components/TimeTracker';
import ProfilePersonalization from './components/ProfilePersonalization';
import ArchiveCenter from './components/ArchiveCenter';
import HowToUse from './components/HowToUse';
import AddNewFeature from './components/AddNewFeature';
import DataImport from './components/DataImport';
import { triggerExcelBackupDownload } from './utils/excelBackup';
import AIAssistant from './components/AIAssistant';


import LoginScreen from './components/LoginScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import { useAuth } from './context/AuthContext';
import { DbService } from './supabaseService';
import { supabase } from './supabase';

export default function App() {
  const { user, session, profile, loading: authLoading, signOut } = useAuth();

  // Trace app rendering, user, and session
  console.log('[Trace App] Rendering App Component', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    hasSession: !!session,
    sessionExpiresAt: session?.expires_at,
    hasProfile: !!profile,
    profileName: profile?.full_name,
    profileCompany: profile?.company_name,
    authLoading,
  });

  const [dbLoaded, setDbLoaded] = useState(false);

  // Track if a state change came from an external storage sync or database initial load,
  // to avoid redundant/circular writes to Supabase.
  const isExternalChangeRef = useRef<Record<string, boolean>>({
    clients: true,
    leads: true,
    projects: true,
    tasks: true,
    payments: true,
    finances: true,
    reminders: true,
    auditLogs: true,
    websites: true,
    timeLogs: true,
    archivedItems: true,
    profileSettings: true,
    enabledFeatures: true
  });

  // Synchronized state refs to prevent redundant/circular database updates
  const lastSyncedClientsRef = useRef<string>('');
  const lastSyncedLeadsRef = useRef<string>('');
  const lastSyncedProjectsRef = useRef<string>('');
  const lastSyncedTasksRef = useRef<string>('');
  const lastSyncedPaymentsRef = useRef<string>('');
  const lastSyncedFinancesRef = useRef<string>('');
  const lastSyncedRemindersRef = useRef<string>('');
  const lastSyncedAuditLogsRef = useRef<string>('');
  const lastSyncedWebsitesRef = useRef<string>('');
  const lastSyncedTimeLogsRef = useRef<string>('');
  const lastSyncedArchivedItemsRef = useRef<string>('');
  const lastSyncedProfileSettingsRef = useRef<string>('');
  const lastSyncedCalendarEventsRef = useRef<string>('');
  const lastSyncedReportsRef = useRef<string>('');

  // States initialized empty, populated by useEffect
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [finances, setFinances] = useState<FinanceLedger[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    companyName: 'GrowInvicta',
    companyLogoUrl: '',
    personalName: 'Chethan D. M.',
    email: 'iamchethandm@gmail.com',
    phone: '+91 98450 12345',
    role: 'Managing Director & CEO',
    address: 'Outer Ring Road, Bangalore, KA, IN',
    timezone: 'Asia/Kolkata (IST)',
    accentColor: 'indigo'
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStateFromStorage('theme', 'dark'));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => getStateFromStorage('isSidebarCollapsed', false));

  // Current authenticated active role representation
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Super Admin');
  const [currentUsername, setCurrentUsername] = useState('User');

  // Sync state parameters from Supabase
  useEffect(() => {
    if (!user) {
      setDbLoaded(false);
      setClients([]);
      setLeads([]);
      setProjects([]);
      setTasks([]);
      setPayments([]);
      setFinances([]);
      setReminders([]);
      setAuditLogs([]);
      setWebsites([]);
      setTimeLogs([]);
      setArchivedItems([]);
      setCalendarEvents([]);
      setReports([]);
      setProfileSettings({
        companyName: 'GrowInvicta',
        companyLogoUrl: '',
        personalName: 'Chethan D. M.',
        email: 'iamchethandm@gmail.com',
        phone: '+91 98450 12345',
        role: 'Managing Director & CEO',
        address: 'Outer Ring Road, Bangalore, KA, IN',
        timezone: 'Asia/Kolkata (IST)',
        accentColor: 'indigo'
      });
      return;
    }

    const loadUserData = async () => {
      setDbLoaded(false);
      console.log('[Trace App] Database loading initiated for user:', user.id);
      try {
        const [
          userClients,
          userLeads,
          userProjects,
          userTasks,
          userPayments,
          dbExtraData,
          userFinances,
          userWebsites,
          userTimeLogs,
          userArchivedItems,
          userReminders,
          userProfileSettings,
          userAuditLogs,
          userCalendarEvents,
          userReports
        ] = await Promise.all([
          DbService.getClients(user.id),
          DbService.getLeads(user.id),
          DbService.getProjects(user.id),
          DbService.getTasks(user.id),
          DbService.getPayments(user.id),
          DbService.getExtraData(user.id),
          DbService.getFinances(user.id),
          DbService.getWebsites(user.id),
          DbService.getTimeLogs(user.id),
          DbService.getArchivedItems(user.id),
          DbService.getReminders(user.id),
          DbService.getProfileSettings(user.id),
          DbService.getAuditLogs(user.id),
          DbService.getCalendarEvents(user.id),
          DbService.getReports(user.id)
        ]);

        console.log('[Trace App] Database loading complete:', {
          clientsCount: userClients.length,
          leadsCount: userLeads.length,
          projectsCount: userProjects.length,
          tasksCount: userTasks.length,
          paymentsCount: userPayments.length,
          financesCount: userFinances?.length || 0,
          websitesCount: userWebsites?.length || 0,
          timeLogsCount: userTimeLogs?.length || 0,
          archivedItemsCount: userArchivedItems?.length || 0,
          remindersCount: userReminders?.length || 0,
          calendarEventsCount: userCalendarEvents?.length || 0,
          reportsCount: userReports?.length || 0,
          hasProfileSettings: !!userProfileSettings,
          auditLogsCount: userAuditLogs?.length || 0,
          hasExtraData: !!dbExtraData
        });

        let finalClients = userClients;
        let finalLeads = userLeads;
        let finalProjects = userProjects;
        let finalTasks = userTasks;
        let finalPayments = userPayments;

        const userEmail = user.email ? user.email.toLowerCase() : '';
        const isNewSignup = localStorage.getItem(`is_new_signup_${userEmail}`) === 'true';

        // Auto-seed for fresh user context if completely empty
        const seededMark = localStorage.getItem(`supabase_user_${user.id}_seeded`);
        if (!isNewSignup && !seededMark && userClients.length === 0 && userLeads.length === 0 && userProjects.length === 0 && userTasks.length === 0 && userPayments.length === 0) {
          finalClients = INITIAL_CLIENTS.map(c => ({ ...c, user_id: user.id }));
          finalLeads = INITIAL_LEADS.map(l => ({ ...l, user_id: user.id }));
          finalProjects = INITIAL_PROJECTS.map(p => ({ ...p, user_id: user.id }));
          finalTasks = INITIAL_TASKS.map(t => ({ ...t, user_id: user.id }));
          finalPayments = INITIAL_PAYMENTS.map(p => ({ ...p, user_id: user.id }));

          await Promise.all([
            DbService.saveClients(user.id, finalClients),
            DbService.saveLeads(user.id, finalLeads),
            DbService.saveProjects(user.id, finalProjects),
            DbService.saveTasks(user.id, finalTasks),
            DbService.savePayments(user.id, finalPayments)
          ]);
          localStorage.setItem(`supabase_user_${user.id}_seeded`, 'true');
        } else if (isNewSignup) {
          localStorage.removeItem(`is_new_signup_${userEmail}`);
          localStorage.setItem(`supabase_user_${user.id}_seeded`, 'true');
          
          const signupFeatures = {
            leads: false,
            timetracker: true,
            payments: false,
            websites: false,
            calendar: false
          };
          localStorage.setItem('enabledFeatures', JSON.stringify(signupFeatures));
          setEnabledFeatures(signupFeatures);
          
          if (userClients.length === 0 && userLeads.length === 0 && userProjects.length === 0 && userTasks.length === 0 && userPayments.length === 0) {
            finalClients = INITIAL_CLIENTS.slice(0, 4).map(c => ({ ...c, user_id: user.id }));
            finalLeads = [];
            finalProjects = [];
            finalTasks = INITIAL_TASKS.slice(0, 4).map(t => ({ ...t, user_id: user.id }));
            finalPayments = [];

            await Promise.all([
              DbService.saveClients(user.id, finalClients),
              DbService.saveTasks(user.id, finalTasks),
              DbService.saveLeads(user.id, []),
              DbService.saveProjects(user.id, []),
              DbService.savePayments(user.id, [])
            ]);

            localStorage.setItem(`user_${user.id}_finances`, JSON.stringify([]));
            localStorage.setItem(`user_${user.id}_reminders`, JSON.stringify([]));
            localStorage.setItem(`user_${user.id}_auditLogs`, JSON.stringify([]));
            localStorage.setItem(`user_${user.id}_websites`, JSON.stringify([]));
            localStorage.setItem(`user_${user.id}_timeLogs`, JSON.stringify([]));

            setShowHowToUsePopup(true);
          } else {
            finalClients = userClients;
            finalLeads = userLeads;
            finalProjects = userProjects;
            finalTasks = userTasks;
            finalPayments = userPayments;
          }
        }

        setClients(finalClients);
        lastSyncedClientsRef.current = JSON.stringify(finalClients);

        setLeads(finalLeads);
        lastSyncedLeadsRef.current = JSON.stringify(finalLeads);

        setProjects(finalProjects);
        lastSyncedProjectsRef.current = JSON.stringify(finalProjects);

        setTasks(finalTasks);
        lastSyncedTasksRef.current = JSON.stringify(finalTasks);

        setPayments(finalPayments);
        lastSyncedPaymentsRef.current = JSON.stringify(finalPayments);

        const resolveCollection = <T,>(key: string, dbData: T[] | null, def: T[]): T[] => {
          if (dbData && dbData.length > 0) {
            localStorage.setItem(`user_${user.id}_${key}`, JSON.stringify(dbData));
            return dbData;
          }
          if (dbExtraData && dbExtraData[key] !== undefined && dbExtraData[key].length > 0) {
            localStorage.setItem(`user_${user.id}_${key}`, JSON.stringify(dbExtraData[key]));
            return dbExtraData[key];
          }
          const item = localStorage.getItem(`user_${user.id}_${key}`) || localStorage.getItem(key);
          return item ? JSON.parse(item) : def;
        };

        const finalFinances = resolveCollection('finances', userFinances, isNewSignup ? [] : INITIAL_FINANCE_LETTERS);
        setFinances(finalFinances);
        lastSyncedFinancesRef.current = JSON.stringify(finalFinances);

        const finalReminders = resolveCollection('reminders', userReminders, isNewSignup ? [] : INITIAL_REMINDERS);
        setReminders(finalReminders);
        lastSyncedRemindersRef.current = JSON.stringify(finalReminders);

        const finalAuditLogs = resolveCollection('auditLogs', userAuditLogs, isNewSignup ? [] : INITIAL_AUDIT_LOGS);
        setAuditLogs(finalAuditLogs);
        lastSyncedAuditLogsRef.current = JSON.stringify(finalAuditLogs);

        const finalWebsites = resolveCollection('websites', userWebsites, isNewSignup ? [] : INITIAL_WEBSITES);
        setWebsites(finalWebsites);
        lastSyncedWebsitesRef.current = JSON.stringify(finalWebsites);

        const finalTimeLogs = resolveCollection('timeLogs', userTimeLogs, isNewSignup ? [] : INITIAL_TIME_LOGS);
        setTimeLogs(finalTimeLogs);
        lastSyncedTimeLogsRef.current = JSON.stringify(finalTimeLogs);

        const finalArchivedItems = resolveCollection('archivedItems', userArchivedItems, []);
        setArchivedItems(finalArchivedItems);
        lastSyncedArchivedItemsRef.current = JSON.stringify(finalArchivedItems);

        const finalCalendarEvents = resolveCollection('calendar', userCalendarEvents, []);
        setCalendarEvents(finalCalendarEvents);
        lastSyncedCalendarEventsRef.current = JSON.stringify(finalCalendarEvents);

        const finalReports = resolveCollection('reports', userReports, []);
        setReports(finalReports);
        lastSyncedReportsRef.current = JSON.stringify(finalReports);

        const defaultFeatures = {
          leads: false,
          timetracker: true,
          payments: false,
          websites: false,
          calendar: false
        };
        let finalFeatures = defaultFeatures;
        if (dbExtraData && dbExtraData.websites !== undefined) {
          finalFeatures = dbExtraData;
          localStorage.setItem(`user_${user.id}_enabledFeatures`, JSON.stringify(finalFeatures));
        } else {
          const item = localStorage.getItem(`user_${user.id}_enabledFeatures`) || localStorage.getItem('enabledFeatures');
          if (item) {
            try {
              finalFeatures = JSON.parse(item);
            } catch (e) {}
          }
        }
        setEnabledFeatures(finalFeatures);

        let finalSettings: ProfileSettings;
        if (userProfileSettings) {
          finalSettings = userProfileSettings;
        } else if (dbExtraData && dbExtraData['profileSettings']) {
          finalSettings = dbExtraData['profileSettings'];
        } else {
          const compName = profile?.company_name || 'My SaaS Business';
          const fName = profile?.full_name || 'User';
          const localItem = localStorage.getItem(`user_${user.id}_profileSettings`) || localStorage.getItem('profileSettings');
          let parsedLocal = null;
          if (localItem) {
            try {
              parsedLocal = JSON.parse(localItem);
            } catch (e) {}
          }
          finalSettings = parsedLocal || {
            companyName: compName,
            companyLogoUrl: '',
            personalName: fName,
            email: user.email || '',
            phone: '',
            role: 'Managing Director & CEO',
            address: '',
            timezone: 'Asia/Kolkata (IST)',
            accentColor: 'indigo'
          };
        }

        const metaFullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
        const metaCompanyName = user?.user_metadata?.company_name || '';

        if (profile) {
          if (profile.full_name && profile.full_name !== 'New User' && profile.full_name !== 'User') {
            finalSettings.personalName = profile.full_name;
          } else if (metaFullName && metaFullName !== 'New User' && metaFullName !== 'User') {
            finalSettings.personalName = metaFullName;
          }

          if (profile.company_name && profile.company_name !== 'GrowInvicta Agency Client') {
            finalSettings.companyName = profile.company_name;
          } else if (metaCompanyName && metaCompanyName !== 'GrowInvicta Agency Client') {
            finalSettings.companyName = metaCompanyName;
          }
        } else {
          if (metaFullName && metaFullName !== 'New User' && metaFullName !== 'User') {
            finalSettings.personalName = metaFullName;
          }
          if (metaCompanyName && metaCompanyName !== 'GrowInvicta Agency Client') {
            finalSettings.companyName = metaCompanyName;
          }
        }

        setProfileSettings(finalSettings);
        lastSyncedProfileSettingsRef.current = JSON.stringify(finalSettings);
        setCurrentUsername(finalSettings.personalName || 'User');

        // Check for App Updated notification on login
        const updateNotifiedKey = `app_updated_notified_v2_${user.id}`;
        const hasSeenUpdate = localStorage.getItem(updateNotifiedKey) === 'true';
        if (!hasSeenUpdate && !isNewSignup) {
          setShowAppUpdatedPopup(true);
        }
      } catch (err) {
        console.warn('Status of loading user data (using local database fallbacks):', err);
      } finally {
        setDbLoaded(true);
      }
    };

    loadUserData();
  }, [user, profile]);

  // Keep username synced when profile changes
  useEffect(() => {
    setCurrentUsername(profileSettings.personalName);
  }, [profileSettings.personalName]);

  const [isResetPasswordRoute, setIsResetPasswordRoute] = useState<boolean>(() => {
    return window.location.pathname.includes('/reset-password') || window.location.hash.includes('type=recovery');
  });

  const [showVerifiedSuccess, setShowVerifiedSuccess] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Parse any Supabase verification redirect details
    const params = new URLSearchParams(search || hash.replace('#', '?'));
    const errorDescription = params.get('error_description') || params.get('error');
    const type = params.get('type');
    
    if (errorDescription && (type === 'signup' || hash.includes('type=signup') || hash.includes('type=invite'))) {
      setVerificationError(decodeURIComponent(errorDescription).replace(/\+/g, ' '));
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (hash.includes('type=signup') || hash.includes('type=invite') || (search.includes('code=') && localStorage.getItem('awaiting_verification') === 'true')) {
      setShowVerifiedSuccess(true);
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      localStorage.removeItem('awaiting_verification');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setIsResetPasswordRoute(window.location.pathname.includes('/reset-password') || window.location.hash.includes('type=recovery'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. UI Navigation parameters
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'clients' | 'leads' | 'projects' | 'payments' | 'calendar' | 'reports' | 'developer' | 'websites' | 'logs' | 'timetracker' | 'profile' | 'archive' | 'settings' | 'addfeature'
  >('dashboard');

  const [previousTab, setPreviousTab] = useState<string>('dashboard');

  useEffect(() => {
    if (activeTab !== 'settings') {
      setPreviousTab(activeTab);
    }
  }, [activeTab]);

  const [settingsSubTab, setSettingsSubTab] = useState<
    'profile' | 'reports' | 'archive' | 'developer' | 'logs' | 'backup' | 'howtouse' | 'addfeature' | 'import'
  >('profile');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState('');
  const [showHowToUsePopup, setShowHowToUsePopup] = useState(false);
  const [showAppUpdatedPopup, setShowAppUpdatedPopup] = useState(false);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('enabledFeatures');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      leads: false,
      timetracker: true,
      payments: false,
      websites: false,
      calendar: false
    };
  });

  const toggleFeature = (featureId: string) => {
    setEnabledFeatures(prev => {
      const next = { ...prev, [featureId]: !prev[featureId] };
      localStorage.setItem('enabledFeatures', JSON.stringify(next));
      if (user) {
        localStorage.setItem(`user_${user.id}_enabledFeatures`, JSON.stringify(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (user && user.email) {
      const emailKey = `is_new_signup_${user.email.toLowerCase()}`;
      if (localStorage.getItem(emailKey) === 'true') {
        setShowHowToUsePopup(true);
        localStorage.removeItem(emailKey);
      }
    }
  }, [user]);

  // Save sync hooks for Supabase CRM tables
  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(clients);
      if (str !== lastSyncedClientsRef.current) {
        lastSyncedClientsRef.current = str;
        DbService.saveClients(user.id, clients);
      }
    }
  }, [clients, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(leads);
      if (str !== lastSyncedLeadsRef.current) {
        lastSyncedLeadsRef.current = str;
        DbService.saveLeads(user.id, leads);
      }
    }
  }, [leads, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(projects);
      if (str !== lastSyncedProjectsRef.current) {
        lastSyncedProjectsRef.current = str;
        DbService.saveProjects(user.id, projects);
      }
    }
  }, [projects, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(tasks);
      if (str !== lastSyncedTasksRef.current) {
        lastSyncedTasksRef.current = str;
        DbService.saveTasks(user.id, tasks);
      }
    }
  }, [tasks, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(payments);
      if (str !== lastSyncedPaymentsRef.current) {
        lastSyncedPaymentsRef.current = str;
        DbService.savePayments(user.id, payments);
      }
    }
  }, [payments, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(finances);
      if (str !== lastSyncedFinancesRef.current) {
        lastSyncedFinancesRef.current = str;
        localStorage.setItem(`user_${user.id}_finances`, str);
        DbService.saveFinances(user.id, finances);
      }
    }
  }, [finances, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(reminders);
      if (str !== lastSyncedRemindersRef.current) {
        lastSyncedRemindersRef.current = str;
        localStorage.setItem(`user_${user.id}_reminders`, str);
        DbService.saveReminders(user.id, reminders);
      }
    }
  }, [reminders, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(auditLogs);
      if (str !== lastSyncedAuditLogsRef.current) {
        lastSyncedAuditLogsRef.current = str;
        localStorage.setItem(`user_${user.id}_auditLogs`, str);
        DbService.saveAuditLogs(user.id, auditLogs);
      }
    }
  }, [auditLogs, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(websites);
      if (str !== lastSyncedWebsitesRef.current) {
        lastSyncedWebsitesRef.current = str;
        localStorage.setItem(`user_${user.id}_websites`, str);
        DbService.saveWebsites(user.id, websites);
      }
    }
  }, [websites, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(timeLogs);
      if (str !== lastSyncedTimeLogsRef.current) {
        lastSyncedTimeLogsRef.current = str;
        localStorage.setItem(`user_${user.id}_timeLogs`, str);
        DbService.saveTimeLogs(user.id, timeLogs);
      }
    }
  }, [timeLogs, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(archivedItems);
      if (str !== lastSyncedArchivedItemsRef.current) {
        lastSyncedArchivedItemsRef.current = str;
        localStorage.setItem(`user_${user.id}_archivedItems`, str);
        DbService.saveArchivedItems(user.id, archivedItems);
      }
    }
  }, [archivedItems, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(profileSettings);
      if (str !== lastSyncedProfileSettingsRef.current) {
        lastSyncedProfileSettingsRef.current = str;
        localStorage.setItem(`user_${user.id}_profileSettings`, str);
        DbService.saveProfileSettings(user.id, profileSettings);
      }
    }
  }, [profileSettings, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(calendarEvents);
      if (str !== lastSyncedCalendarEventsRef.current) {
        lastSyncedCalendarEventsRef.current = str;
        localStorage.setItem(`user_${user.id}_calendar`, str);
        DbService.saveCalendarEvents(user.id, calendarEvents);
      }
    }
  }, [calendarEvents, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(reports);
      if (str !== lastSyncedReportsRef.current) {
        lastSyncedReportsRef.current = str;
        localStorage.setItem(`user_${user.id}_reports`, str);
        DbService.saveReports(user.id, reports);
      }
    }
  }, [reports, user, dbLoaded]);

  useEffect(() => {
    if (user && dbLoaded) {
      const str = JSON.stringify(enabledFeatures);
      localStorage.setItem(`user_${user.id}_enabledFeatures`, str);
      DbService.saveExtraData(user.id, enabledFeatures);
    }
  }, [enabledFeatures, user, dbLoaded]);

  // Supabase Real-time Synchronization across different sessions/devices
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('supabase-crm-realtime-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        async (payload) => {
          console.log('[Realtime Sync] Database change payload:', payload);
          const tableName = payload.table;
          try {
            if (tableName === 'clients') {
              const fresh = await DbService.getClients(user.id);
              lastSyncedClientsRef.current = JSON.stringify(fresh);
              setClients(fresh);
            } else if (tableName === 'leads') {
              const fresh = await DbService.getLeads(user.id);
              lastSyncedLeadsRef.current = JSON.stringify(fresh);
              setLeads(fresh);
            } else if (tableName === 'projects') {
              const fresh = await DbService.getProjects(user.id);
              lastSyncedProjectsRef.current = JSON.stringify(fresh);
              setProjects(fresh);
            } else if (tableName === 'tasks') {
              const fresh = await DbService.getTasks(user.id);
              lastSyncedTasksRef.current = JSON.stringify(fresh);
              setTasks(fresh);
            } else if (tableName === 'payments') {
              const fresh = await DbService.getPayments(user.id);
              lastSyncedPaymentsRef.current = JSON.stringify(fresh);
              setPayments(fresh);
            } else if (tableName === 'finances') {
              const fresh = await DbService.getFinances(user.id);
              lastSyncedFinancesRef.current = JSON.stringify(fresh);
              setFinances(fresh);
            } else if (tableName === 'websites') {
              const fresh = await DbService.getWebsites(user.id);
              lastSyncedWebsitesRef.current = JSON.stringify(fresh);
              setWebsites(fresh);
            } else if (tableName === 'time_logs') {
              const fresh = await DbService.getTimeLogs(user.id);
              lastSyncedTimeLogsRef.current = JSON.stringify(fresh);
              setTimeLogs(fresh);
            } else if (tableName === 'archived_items') {
              const fresh = await DbService.getArchivedItems(user.id);
              lastSyncedArchivedItemsRef.current = JSON.stringify(fresh);
              setArchivedItems(fresh);
            } else if (tableName === 'reminders') {
              const fresh = await DbService.getReminders(user.id);
              lastSyncedRemindersRef.current = JSON.stringify(fresh);
              setReminders(fresh);
            } else if (tableName === 'profile_settings') {
              const fresh = await DbService.getProfileSettings(user.id);
              if (fresh) {
                lastSyncedProfileSettingsRef.current = JSON.stringify(fresh);
                setProfileSettings(fresh);
              }
            } else if (tableName === 'audit_logs') {
              const fresh = await DbService.getAuditLogs(user.id);
              lastSyncedAuditLogsRef.current = JSON.stringify(fresh);
              setAuditLogs(fresh);
            } else if (tableName === 'calendar') {
              const fresh = await DbService.getCalendarEvents(user.id);
              lastSyncedCalendarEventsRef.current = JSON.stringify(fresh);
              setCalendarEvents(fresh);
            } else if (tableName === 'reports') {
              const fresh = await DbService.getReports(user.id);
              lastSyncedReportsRef.current = JSON.stringify(fresh);
              setReports(fresh);
            }
          } catch (err) {
            console.warn('[Realtime Sync] Failed to retrieve fresh data for:', tableName, err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, dbLoaded]);


  useEffect(() => { saveStateToStorage('theme', theme); }, [theme]);
  useEffect(() => { saveStateToStorage('isSidebarCollapsed', isSidebarCollapsed); }, [isSidebarCollapsed]);

  // Sync state across multiple iframe preview viewports (Desktop, Tablet, Mobile) or tabs in real-time
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.newValue === null) return;
      
      const getParsedValue = (val: string) => {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      };

      const parsed = getParsedValue(e.newValue);
      if (parsed === null) return;

      const userId = user.id;
      
      // CRM Main Tables Sync
      if (e.key === `supabase_user_${userId}_clients`) {
        isExternalChangeRef.current['clients'] = true;
        setClients(parsed);
      } else if (e.key === `supabase_user_${userId}_leads`) {
        isExternalChangeRef.current['leads'] = true;
        setLeads(parsed);
      } else if (e.key === `supabase_user_${userId}_projects`) {
        isExternalChangeRef.current['projects'] = true;
        setProjects(parsed);
      } else if (e.key === `supabase_user_${userId}_tasks`) {
        isExternalChangeRef.current['tasks'] = true;
        setTasks(parsed);
      } else if (e.key === `supabase_user_${userId}_payments`) {
        isExternalChangeRef.current['payments'] = true;
        setPayments(parsed);
      }
      // CRM Auxiliary Local Tables Sync
      else if (e.key === `user_${userId}_finances`) {
        isExternalChangeRef.current['finances'] = true;
        setFinances(parsed);
      } else if (e.key === `user_${userId}_reminders`) {
        isExternalChangeRef.current['reminders'] = true;
        setReminders(parsed);
      } else if (e.key === `user_${userId}_auditLogs`) {
        isExternalChangeRef.current['auditLogs'] = true;
        setAuditLogs(parsed);
      } else if (e.key === `user_${userId}_websites`) {
        isExternalChangeRef.current['websites'] = true;
        setWebsites(parsed);
      } else if (e.key === `user_${userId}_timeLogs`) {
        isExternalChangeRef.current['timeLogs'] = true;
        setTimeLogs(parsed);
      } else if (e.key === `user_${userId}_archivedItems`) {
        isExternalChangeRef.current['archivedItems'] = true;
        setArchivedItems(parsed);
      } else if (e.key === `user_${userId}_profileSettings`) {
        isExternalChangeRef.current['profileSettings'] = true;
        setProfileSettings(parsed);
      } else if (e.key === 'enabledFeatures' || e.key === `user_${userId}_enabledFeatures`) {
        isExternalChangeRef.current['enabledFeatures'] = true;
        setEnabledFeatures(parsed);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Automatic monthly invoice generation on 1st of month or previous day
  useEffect(() => {
    const checkAndRunAutoInvoiceGeneration = () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-indexed
        const date = today.getDate();

        let targetMonthStr = '';
        let targetInvoiceDate = '';
        let shouldGenerate = false;

        if (date === 1) {
          const monthStr = String(month + 1).padStart(2, '0');
          targetMonthStr = `${year}-${monthStr}`;
          targetInvoiceDate = `${year}-${monthStr}-01`;
          shouldGenerate = true;
        } else {
          const tomorrow = new Date(year, month, date + 1);
          if (tomorrow.getDate() === 1) {
            const nextMonthYear = tomorrow.getFullYear();
            const nextMonthStr = String(tomorrow.getMonth() + 1).padStart(2, '0');
            targetMonthStr = `${nextMonthYear}-${nextMonthStr}`;
            targetInvoiceDate = `${nextMonthYear}-${nextMonthStr}-01`;
            shouldGenerate = true;
          }
        }

        if (!shouldGenerate) return;

        const autoGenKey = `growinvicta_autogen_months_${user ? user.id : 'guest'}`;
        const generatedMonths: string[] = JSON.parse(localStorage.getItem(autoGenKey) || '[]');

        if (generatedMonths.includes(targetMonthStr)) return;

        const activeRetainerClients = clients.filter(c => 
          c.status === 'Active' && 
          c.metrics && 
          (c.metrics.workType === 'retainer' || (c.metrics.monthlyRetainerAmount && c.metrics.monthlyRetainerAmount > 0))
        );

        if (activeRetainerClients.length === 0) return;

        const newAutoPayments: Payment[] = [];

        activeRetainerClients.forEach(client => {
          const existingAuto = payments.find(p => 
            p.clientName === client.name && 
            p.autoGenerated && 
            p.dueDate === targetInvoiceDate
          );

          if (existingAuto) return;

          const baseAmount = client.metrics?.monthlyRetainerAmount || 50000;
          const hasGst = client.gstNumber && client.gstNumber.trim().length > 0;
          const gstAmount = hasGst ? Math.round(baseAmount * 0.18) : 0;
          const invoiceNumber = `INV-AUTO-${targetMonthStr.replace('-', '')}-${client.id.substring(client.id.length - 4).toUpperCase()}`;

          const dueDateObj = new Date(targetInvoiceDate);
          dueDateObj.setDate(10);
          const dueDateStr = dueDateObj.toISOString().split('T')[0];

          const newPay: Payment = {
            id: `pay_auto_${client.id}_${targetMonthStr}_${Date.now()}`,
            clientName: client.name,
            invoiceNumber: invoiceNumber,
            amount: baseAmount,
            paidAmount: 0,
            pendingAmount: baseAmount,
            paymentDate: '--',
            dueDate: dueDateStr,
            mode: 'Bank Transfer',
            status: 'Pending',
            gstAmount: gstAmount,
            autoGenerated: true,
            serviceDetails: `Monthly Retainer Service Fee`,
            serviceDescription: `Automatic monthly retainer service invoicing for ${client.company || client.name}. Includes continuous maintenance, updates and deployment check-ins.`,
            ourName: profileSettings?.personalName || 'GrowInvicta Agency',
            ourPhone: profileSettings?.phone || '',
            ourEmail: profileSettings?.email || '',
            bankName: 'HDFC Bank Ltd',
            bankAccNo: '50200012345678',
            bankIfsc: 'HDFC0000123'
          };

          newAutoPayments.push(newPay);
        });

        if (newAutoPayments.length > 0) {
          setPayments(prev => [...prev, ...newAutoPayments]);

          const newAuditLogs: AuditLog[] = newAutoPayments.map(p => ({
            id: `a_auto_${p.id}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: 'System Bot',
            role: 'Super Admin',
            action: 'Auto Invoice Issued',
            details: `System automatically generated invoice ${p.invoiceNumber} for client ${p.clientName} worth INR ${p.amount.toLocaleString('en-IN')}.`
          }));
          setAuditLogs(prev => [...newAuditLogs, ...prev]);

          const newReminders: Reminder[] = newAutoPayments.map(p => ({
            id: `rem_auto_${p.id}`,
            type: 'Payment Due',
            title: `Auto Invoice Outstanding: ${p.invoiceNumber} (${p.clientName})`,
            dateTime: `${p.dueDate}T09:00`,
            snoozedCount: 0,
            status: 'Active'
          }));
          setReminders(prev => [...newReminders, ...prev]);
        }

        generatedMonths.push(targetMonthStr);
        localStorage.setItem(autoGenKey, JSON.stringify(generatedMonths));
      } catch (err) {
        console.error('[Auto Invoice] Error in generator:', err);
      }
    };

    if (dbLoaded && clients.length > 0) {
      checkAndRunAutoInvoiceGeneration();
    }
  }, [dbLoaded, clients, payments, user, profileSettings]);

  // Handle responsive collapse for mobile/tablet screen sizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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
    searchResults.leads.length + 
    searchResults.payments.length;

  // 6. Dynamic Website billing notifications builder
  const getBillingNotifications = () => {
    const anchor = new Date('2026-06-19');
    const alerts: Array<{ id: string; type: string; title: string; subtitle: string; isOverdue: boolean }> = [];

    websites.forEach(w => {
      if (w.status !== 'Active') return;
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
      } else if (hDays <= 10 && hDays % 2 === 0) {
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
      } else if (dDays <= 10 && dDays % 2 === 0) {
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

  if (authLoading || (user && !dbLoaded)) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-mono ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col items-center gap-3">
          <Layers className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading Enterprise Console...</p>
        </div>
      </div>
    );
  }

  if (isResetPasswordRoute) {
    return (
      <ResetPasswordScreen 
        theme={theme} 
        onBackToLogin={() => {
          setIsResetPasswordRoute(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (!user) {
    return (
      <LoginScreen theme={theme} />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors ${
      theme === 'light' ? 'light bg-gray-50 text-gray-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* LEFT SIDEBAR OR TOP NAV MOBILE BAR */}
      <aside className={`w-full md:w-auto flex flex-col justify-between sticky top-0 md:sticky md:top-0 md:h-screen z-40 transition-all ${
        isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
      } ${
        theme === 'light' ? 'bg-white border-b md:border-b-0 md:border-r border-gray-200' : 'bg-slate-900 border-b md:border-b-0 md:border-r border-slate-850'
      }`}>
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className={`p-4 border-b flex justify-between items-center h-[64px] ${
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
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
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

          {/* Combined Navigation and User Panel Container (Floating overlay on mobile, flex-1 container on desktop) */}
          <div className={`${
            isMobileMenuOpen 
              ? `fixed inset-x-0 top-[64px] bottom-0 z-45 overflow-y-auto p-4 flex flex-col justify-between ${
                  theme === 'light' ? 'bg-white/95 backdrop-blur-md' : 'bg-slate-950/95 backdrop-blur-md'
                }`
              : 'hidden md:flex md:flex-col md:justify-between md:flex-1'
          }`}>
            {/* Navigation Links list */}
            <nav className="space-y-1">
              {activeTab !== 'settings' ? (
                [
                  { id: 'dashboard', label: 'Overview Dashboard', icon: Layers },
                  { id: 'clients', label: 'Client CRM Hub', icon: Users },
                  { id: 'leads', label: 'Prospective Leads', icon: Sparkles, featureKey: 'leads' },
                  { id: 'projects', label: 'Projects Kanban', icon: Briefcase },
                  { id: 'timetracker', label: 'Time Tracker', icon: Clock, featureKey: 'timetracker' },
                  { id: 'payments', label: 'Billing & Expenses', icon: IndianRupee, featureKey: 'payments' },
                  { id: 'websites', label: 'Websites Manager', icon: Globe, featureKey: 'websites' },
                  { id: 'calendar', label: 'Calendar Planner', icon: Calendar, featureKey: 'calendar' },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].filter(tab => !tab.featureKey || enabledFeatures[tab.featureKey]).map(tab => {
                  const TabIcon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'settings' && isSelected) {
                          setActiveTab(previousTab as any);
                        } else {
                          setActiveTab(tab.id as any);
                        }
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
                      {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="truncate">{tab.label}</span>}
                    </button>
                  );
                })
              ) : (
                <>
                  <button
                    onClick={() => {
                      setActiveTab(previousTab as any);
                      setIsMobileMenuOpen(false);
                      writeAuditEntry('Navigation Clicked', 'Returned to main menu');
                    }}
                    title="Back to Menu"
                    className={`w-full text-left px-3 py-2.5 mb-2.5 rounded-xl flex items-center gap-3 transition-all text-xs font-bold border cursor-pointer ${
                      theme === 'light'
                        ? 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700 shadow-xs'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300 shadow-md'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 flex-shrink-0 text-indigo-500 animate-pulse" />
                    {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="truncate">Back to Menu</span>}
                  </button>
                  {[
                    { id: 'profile', label: 'Profile Settings', icon: User },
                    { id: 'howtouse', label: 'How to use', icon: HelpCircle },
                    { id: 'addfeature', label: 'Add New Feature', icon: PlusCircle },
                    { id: 'backup', label: 'Download backup', icon: Download },
                    { id: 'import', label: 'Import spreadsheet', icon: Upload },
                    { id: 'archive', label: 'Archived folder', icon: Archive },
                    { id: 'reports', label: 'Corporate reports', icon: FileSpreadsheet },
                    { id: 'developer', label: 'Developer center', icon: Terminal },
                    { id: 'logs', label: 'Audit access log', icon: ShieldCheck }
                  ].map(sub => {
                    const SubIcon = sub.icon;
                    const isSelected = settingsSubTab === sub.id;
                    
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSettingsSubTab(sub.id as any);
                          setIsMobileMenuOpen(false);
                          writeAuditEntry('Settings Navigation', `Viewed Settings section: ${sub.label}`);
                        }}
                        title={sub.label}
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
                        <SubIcon className="w-4 h-4 flex-shrink-0" />
                        {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="truncate">{sub.label}</span>}
                      </button>
                    );
                  })}
                </>
              )}
            </nav>

            {/* BOTTOM USER/ROLE PANEL CONFIG */}
            <div className={`p-4 border-t space-y-3.5 mt-4 ${
              theme === 'light' ? 'border-gray-200 bg-gray-50/50' : 'border-slate-850 bg-slate-950/60'
            }`}>
              {/* Emerald AI Assistant trigger button */}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-ai-assistant'));
                  writeAuditEntry('AI Assistant Trigger', 'AI Assistant drawer opened from sidebar.');
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl shadow-lg cursor-pointer transition-all duration-300 font-mono text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20 active:scale-95 ${
                  isSidebarCollapsed && !isMobileMenuOpen ? 'p-2.5 justify-center' : ''
                }`}
                title="Prompt AI Assistant"
              >
                <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse flex-shrink-0" />
                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="truncate">Prompt AI Assistant</span>}
              </button>

              {/* User profile details */}
              <div className="flex items-center gap-2.5 min-w-0 pt-2 border-t border-dashed border-gray-200 dark:border-slate-800">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 text-white font-mono text-xs font-bold flex-shrink-0 shadow-sm">
                  {currentUsername.slice(0, 2).toUpperCase()}
                </div>
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${theme === 'light' ? 'text-gray-900' : 'text-slate-200'}`}>
                      {currentUsername}
                    </p>
                    <span className="text-[9.5px] text-indigo-500 font-mono font-medium block truncate">
                      {profileSettings.role || currentUserRole}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* TOP HEADER STATUS & MASTER CONTENT PANEL */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic Navigation Headbar & Global Searches */}
        <header className={`p-3 md:p-4 border-b flex flex-row justify-between items-center sticky top-[64px] md:top-0 z-30 transition-all ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-850'
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Real Search Box triggering palette overlay */}
            <div className="relative w-full max-w-[180px] sm:max-w-xs cursor-pointer group" onClick={() => setIsSearchPaletteOpen(true)}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                readOnly
                placeholder="Search..." 
                className={`border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none w-full cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-450' 
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-3">
            
            {/* Prominent Standalone Sign Out Button */}
            <button
              onClick={async () => {
                writeAuditEntry('Sign out trigger', 'Manual console token expiration scheduled.');
                await signOut();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${
                theme === 'light'
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 active:scale-95 shadow-xs'
                  : 'bg-rose-950/30 border-rose-900/40 text-rose-400 hover:bg-rose-900/20 hover:border-rose-800 active:scale-95 shadow-md'
              }`}
              title="Sign Out of GrowInvicta"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Sign Out</span>
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
              websites={websites}
              onNavigate={(tab) => setActiveTab(tab)}
              currentUsername={currentUsername}
              companyName={profileSettings.companyName}
              enabledFeatures={enabledFeatures}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsCRM 
              clients={clients}
              projects={projects}
              onAddClient={(c) => setClients(prev => [...prev, c])}
              onEditClient={(c) => setClients(prev => prev.map(item => item.id === c.id ? c : item))}
              onDeleteClient={(id) => {
                const target = clients.find(c => c.id === id);
                if (target) {
                  const archived: ArchivedItem = {
                    id: `arch_${Date.now()}_${id}`,
                    type: 'client',
                    name: target.company || target.name,
                    originalData: target,
                    archivedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                  };
                  setArchivedItems(prev => [archived, ...prev]);
                }
                setClients(prev => prev.filter(item => item.id !== id));
              }}
              onAddProject={(p) => setProjects(prev => [...prev, p])}
              onEditProject={(p) => setProjects(prev => prev.map(item => item.id === p.id ? p : item))}
              onDeleteProject={(id) => setProjects(prev => prev.filter(item => item.id !== id))}
            />
          )}

          {activeTab === 'leads' && (
            <LeadTracker 
              leads={leads}
              onAddLead={(l) => setLeads(prev => [...prev, l])}
              onEditLead={(l) => setLeads(prev => prev.map(item => item.id === l.id ? l : item))}
              onDeleteLead={(id) => {
                const target = leads.find(l => l.id === id);
                if (target) {
                  const archived: ArchivedItem = {
                    id: `arch_${Date.now()}_${id}`,
                    type: 'lead',
                    name: target.company || target.name,
                    originalData: target,
                    archivedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                  };
                  setArchivedItems(prev => [archived, ...prev]);
                }
                setLeads(prev => prev.filter(item => item.id !== id));
              }}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsKanban 
              projects={projects}
              currentUserRole={currentUserRole}
              currentUsername={currentUsername}
              onAddProject={(p) => setProjects(prev => [...prev, p])}
              onEditProject={(p) => setProjects(prev => prev.map(item => item.id === p.id ? p : item))}
              onDeleteProject={(id) => {
                const target = projects.find(p => p.id === id);
                if (target) {
                  const archived: ArchivedItem = {
                    id: `arch_${Date.now()}_${id}`,
                    type: 'project',
                    name: target.name,
                    originalData: target,
                    archivedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                  };
                  setArchivedItems(prev => [archived, ...prev]);
                }
                setProjects(prev => prev.filter(item => item.id !== id));
              }}
              theme={theme}
            />
          )}



          {activeTab === 'payments' && (
            <FinanceManager 
              payments={payments}
              finances={finances}
              clients={clients}
              websites={websites}
              onAddPayment={(p) => setPayments(prev => [...prev, p])}
              onEditPayment={(p) => setPayments(prev => prev.map(item => item.id === p.id ? p : item))}
              onDeletePayment={(id) => {
                const target = payments.find(p => p.id === id);
                if (target) {
                  const archived: ArchivedItem = {
                    id: `arch_${Date.now()}_${id}`,
                    type: 'payment',
                    name: `${target.invoiceNumber} (${target.clientName})`,
                    originalData: target,
                    archivedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                  };
                  setArchivedItems(prev => [archived, ...prev]);
                }
                setPayments(prev => prev.filter(item => item.id !== id));
              }}
              onAddFinance={(f) => setFinances(prev => [f, ...prev])}
              onEditFinance={(f) => setFinances(prev => prev.map(item => item.id === f.id ? f : item))}
              onDeleteFinance={(id) => {
                const target = finances.find(f => f.id === id);
                if (target) {
                  const archived: ArchivedItem = {
                    id: `arch_${Date.now()}_${id}`,
                    type: 'finance',
                    name: `${target.category} (₹${target.amount})`,
                    originalData: target,
                    archivedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                  };
                  setArchivedItems(prev => [archived, ...prev]);
                }
                setFinances(prev => prev.filter(item => item.id !== id));
              }}
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



          {activeTab === 'websites' && (
            <WebsitesManager 
              websites={websites}
              clients={clients}
              onAddWebsite={(w) => setWebsites(prev => [...prev, w])}
              onEditWebsite={(w) => setWebsites(prev => prev.map(item => item.id === w.id ? w : item))}
              onDeleteWebsite={(id) => {
                const target = websites.find(w => w.id === id);
                if (target) {
                  const archived: ArchivedItem = {
                    id: `arch_${Date.now()}_${id}`,
                    type: 'website',
                    name: `${target.name} (${target.url})`,
                    originalData: target,
                    archivedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                  };
                  setArchivedItems(prev => [archived, ...prev]);
                }
                setWebsites(prev => prev.filter(item => item.id !== id));
              }}
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

          {/* VIEW TAB settings container housing profile, reports, archive, developer, logs, and backup */}
          {activeTab === 'settings' && (
            <div className="max-w-6xl mx-auto">
              {/* Content view */}
              <div className="w-full min-w-0">
                {settingsSubTab === 'profile' && (
                  <ProfilePersonalization 
                    settings={profileSettings}
                    onUpdateSettings={(settings) => {
                      setProfileSettings(settings);
                    }}
                    theme={theme}
                  />
                )}

                {settingsSubTab === 'addfeature' && (
                  <AddNewFeature 
                    theme={theme}
                    enabledFeatures={enabledFeatures}
                    onToggleFeature={toggleFeature}
                  />
                )}

                {settingsSubTab === 'reports' && (
                  <ReportsCenter 
                    clients={clients}
                    projects={projects}
                    tasks={tasks}
                    payments={payments}
                    leads={leads}
                    finances={finances}
                  />
                )}

                {settingsSubTab === 'archive' && (
                  <ArchiveCenter 
                    archivedItems={archivedItems}
                    onRestore={(item) => {
                      setArchivedItems(prev => prev.filter(arch => arch.id !== item.id));
                      switch (item.type) {
                        case 'client':
                          setClients(prev => [...prev, item.originalData]);
                          break;
                        case 'lead':
                          setLeads(prev => [...prev, item.originalData]);
                          break;
                        case 'project':
                          setProjects(prev => [...prev, item.originalData]);
                          break;
                        case 'task':
                          setTasks(prev => [...prev, item.originalData]);
                          break;
                        case 'payment':
                          setPayments(prev => [...prev, item.originalData]);
                          break;
                        case 'finance':
                          setFinances(prev => [item.originalData, ...prev]);
                          break;
                        case 'website':
                          setWebsites(prev => [...prev, item.originalData]);
                          break;
                      }
                      writeAuditEntry('Archive Restored', `Recovered deleted ${item.type}: ${item.name}`);
                    }}
                    onDeletePermanent={(id) => {
                      const target = archivedItems.find(arch => arch.id === id);
                      setArchivedItems(prev => prev.filter(arch => arch.id !== id));
                      if (target) {
                        writeAuditEntry('Permanent Delete', `Scrubbed archive item: ${target.name}`);
                      }
                    }}
                    theme={theme}
                  />
                )}

                {settingsSubTab === 'developer' && (
                  <DeveloperConsole />
                )}

                {settingsSubTab === 'logs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h2 className={`text-base font-bold font-sans ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>GrowInvicta Secure Access Logs</h2>
                        <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Automated JWT & User authorization ledger tracking.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setAuditLogs([]);
                          writeAuditEntry('Log purge complete', 'Security console access lists scrubbed.');
                        }}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-mono text-rose-450 hover:bg-rose-950/20 cursor-pointer ${
                          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        Scrub Logs
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {auditLogs.map(log => (
                        <div key={log.id} className={`p-4 border rounded-xl flex items-start gap-3.5 text-xs font-mono ${
                          theme === 'light' ? 'bg-white border-gray-150 shadow-xs' : 'bg-[#18191d] border-slate-900/60'
                        }`}>
                          <div className={`p-1.5 rounded border flex-shrink-0 ${
                            theme === 'light' ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-[#0c0d10] border-slate-900 text-slate-400'
                          }`}>
                            <Lock className="w-4 h-4" />
                          </div>
                          <div className="space-y-1.5 flex-1 text-left">
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>{log.timestamp}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{log.user}</span>
                                &bull;
                                <span className="text-slate-450">{log.role}</span>
                              </div>
                            </div>
                            <p className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>
                              <strong>Action logged: </strong><span className="text-indigo-650 dark:text-indigo-300">{log.action}</span>
                            </p>
                            <p className={`leading-normal font-sans text-[11.5px] italic ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Ref: {log.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {settingsSubTab === 'backup' && (
                  <div className={`p-6 rounded-2xl border ${
                    theme === 'light' ? 'bg-white border-gray-150 shadow-xs' : 'bg-[#18191d] border-slate-900/60 shadow-md'
                  }`}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-indigo-600/10 text-indigo-450 rounded-xl">
                        <Download className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>Download backup</h3>
                        <p className={`text-xs mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Generate and download a real-time, consolidated Multi-Sheet Microsoft Excel workbook containing all business data.
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl text-left border ${
                      theme === 'light' ? 'bg-gray-50 border-gray-150' : 'bg-[#0c0d10] border-slate-900/60'
                    }`}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-slate-750' : 'text-slate-300'}`}>
                        Entities Included in the Export
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-450 font-medium">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>Client CRM Hub accounts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>Prospective leads & sales pipeline</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>Projects Kanban tasks & milestones</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>Time tracker logged entries</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>Financial expense records</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>Active website manager integrations</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 flex justify-start">
                      <button
                        onClick={() => {
                          triggerExcelBackupDownload({ clients, leads, projects, tasks, payments, websites, timeLogs });
                          writeAuditEntry('Corporate Backup', 'Downloaded complete business data worksheet with multiple worksheet tabs.');
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-xs flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download master Excel workbook</span>
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'import' && (
                  <DataImport 
                    theme={theme}
                    clients={clients}
                    onImportClients={(newClients) => {
                      setClients(prev => [...prev, ...newClients]);
                      writeAuditEntry('Import Spreadsheet', `Imported ${newClients.length} clients via bulk upload.`);
                    }}
                    onImportWebsites={(newWebsites) => {
                      setWebsites(prev => [...prev, ...newWebsites]);
                      writeAuditEntry('Import Spreadsheet', `Imported ${newWebsites.length} websites via bulk upload.`);
                    }}
                  />
                )}

                {settingsSubTab === 'howtouse' && (
                  <HowToUse theme={theme} />
                )}
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

      {/* GROWINVICTA AI ASSISTANT CONSOLE */}
      <AIAssistant 
        clients={clients}
        setClients={setClients}
        leads={leads}
        setLeads={setLeads}
        projects={projects}
        setProjects={setProjects}
        tasks={tasks}
        setTasks={setTasks}
        payments={payments}
        setPayments={setPayments}
        finances={finances}
        setFinances={setFinances}
        reminders={reminders}
        setReminders={setReminders}
        auditLogs={auditLogs}
        setAuditLogs={setAuditLogs}
        profileSettings={profileSettings}
      />

      {/* HOW TO USE POPUP ON NEW SIGNUP */}
      {showHowToUsePopup && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl my-2 sm:my-8">
            <HowToUse 
              theme={theme} 
              onClose={() => {
                setShowHowToUsePopup(false);
                writeAuditEntry('Guide Dismissed', 'Completed reading new user manual.');
              }} 
            />
          </div>
        </div>
      )}

      {/* APP UPDATED POPUP */}
      {showAppUpdatedPopup && user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 ${
            theme === 'light' 
              ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50' 
              : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-black/80 backdrop-blur-xl'
          }`}>
            {/* Absolute Close Button */}
            <button
              onClick={() => {
                const updateNotifiedKey = `app_updated_notified_v2_${user.id}`;
                localStorage.setItem(updateNotifiedKey, 'true');
                setShowAppUpdatedPopup(false);
                writeAuditEntry('Update Dismissed', 'Acknowledged workspace update notification via close button');
              }}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing visual top indicator */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-md animate-pulse ${
                theme === 'light' 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-200' 
                  : 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-900/40'
              }`}>
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <div className="text-center mt-6 space-y-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase ${
                theme === 'light' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                <Zap className="w-3 h-3 animate-bounce" /> App Update Live &bull; v2.4.0
              </span>
              <h3 className="text-xl font-extrabold tracking-tight font-sans">
                GrowInvicta Workspace Upgraded!
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} max-w-sm mx-auto leading-relaxed`}>
                We've enhanced your SaaS console with automatic workspace seeding, training guides, and optimized database caching.
              </p>
            </div>

            {/* List of features */}
            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Starter Workspace Seeding",
                  desc: "New accounts now initialize instantly with 4 starter client records and 4 scheduled tasks set."
                },
                {
                  title: "Interactive User Manual",
                  desc: "Master the agency console with step-by-step instructions. Walkthrough guides are always one click away."
                },
                {
                  title: "Continuous Caching & Speed Boost",
                  desc: "Enhanced data fetching speeds and reliable session restoration across logins."
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    theme === 'light' 
                      ? 'bg-slate-50/50 hover:bg-slate-50 border-slate-100' 
                      : 'bg-slate-950/40 hover:bg-slate-950/60 border-slate-800/60'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-lg ${
                    theme === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/30 text-indigo-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold leading-none">{item.title}</h4>
                    <p className={`text-[11px] leading-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const updateNotifiedKey = `app_updated_notified_v2_${user.id}`;
                  localStorage.setItem(updateNotifiedKey, 'true');
                  setShowAppUpdatedPopup(false);
                  writeAuditEntry('Update Dismissed', 'Acknowledged workspace update notification');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                  theme === 'light'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-300'
                    : 'bg-slate-100 hover:bg-white text-slate-900'
                }`}
              >
                Explore Workspace
              </button>
              <button
                onClick={() => {
                  const updateNotifiedKey = `app_updated_notified_v2_${user.id}`;
                  localStorage.setItem(updateNotifiedKey, 'true');
                  setShowAppUpdatedPopup(false);
                  setShowHowToUsePopup(true);
                  writeAuditEntry('Update Guided Action', 'Initiated manual from update popup notification');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer border ${
                  theme === 'light'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Launch Guide Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL VERIFICATION SUCCESS POPUP */}
      {showVerifiedSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`relative w-full max-w-md rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 text-center ${
            theme === 'light' 
              ? 'bg-white border-emerald-100 text-slate-900 shadow-emerald-100/40' 
              : 'bg-slate-900/95 border-emerald-950/60 text-slate-100 shadow-black/80 backdrop-blur-xl'
          }`}>
            {/* Visual Top Success Ring */}
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500 border-4 border-emerald-400 text-white shadow-lg animate-bounce">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verification Successful
              </span>
              <h3 className="text-xl font-black tracking-tight font-sans">
                You are successfully verified!
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                Enjoy the app! Your GrowInvicta corporate workspace account has been verified successfully. Welcome to your ultimate business management console.
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  setShowVerifiedSuccess(false);
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
              >
                Let's Explore the App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL VERIFICATION ERROR POPUP */}
      {verificationError && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`relative w-full max-w-md rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 text-center ${
            theme === 'light' 
              ? 'bg-white border-rose-100 text-slate-900 shadow-rose-100/40' 
              : 'bg-slate-900/95 border-rose-950/60 text-slate-100 shadow-black/80 backdrop-blur-xl'
          }`}>
            {/* Visual Top Error Ring */}
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-rose-500 border-4 border-rose-400 text-white shadow-lg">
                <AlertCircle className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Verification Failed
              </span>
              <h3 className="text-xl font-black tracking-tight font-sans">
                Could not verify email
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                {verificationError || "The verification link is invalid, expired, or has already been used. Please request a new registration or try logging in."}
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  setVerificationError(null);
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20"
              >
                Back to Console Login
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
