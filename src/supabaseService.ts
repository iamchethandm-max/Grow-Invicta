import { supabase } from './supabase';
import { Client, Lead, Project, Task, Payment, FinanceLedger, Reminder, Website, TimeLog, ProfileSettings, ArchivedItem, AuditLog } from './types';

// Helper to check if a DB operation failed due to missing table
const isTableMissingError = (error: any) => {
  return error && (error.code === '42P01' || error.message?.includes('does not exist') || error.status === 404);
};

// SQL Schema for the user to copy-paste into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- GROWINVICTA SAAS PLATFORM SQL SCHEMA
-- 1. Create Users profile table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own profile" 
  ON public.users FOR ALL USING (auth.uid() = id);

-- 2. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  mobile TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  website TEXT,
  notes TEXT,
  created_at TEXT,
  status TEXT,
  metrics JSONB,
  contracts JSONB,
  timeline JSONB
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own clients" 
  ON public.clients FOR ALL USING (auth.uid() = user_id);

-- 3. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  source TEXT,
  status TEXT,
  value NUMERIC,
  follow_up_date TEXT,
  notes TEXT,
  created_at TEXT
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own leads" 
  ON public.leads FOR ALL USING (auth.uid() = user_id);

-- 4. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT,
  type TEXT,
  start_date TEXT,
  end_date TEXT,
  budget NUMERIC,
  team_members TEXT[],
  priority TEXT,
  status TEXT,
  progress NUMERIC,
  milestones JSONB,
  comments JSONB,
  created_at TEXT
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own projects" 
  ON public.projects FOR ALL USING (auth.uid() = user_id);

-- 5. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  project TEXT,
  due_date TEXT,
  priority TEXT,
  status TEXT,
  created_at TEXT
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own tasks" 
  ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- 6. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_name TEXT,
  invoice_number TEXT,
  amount NUMERIC,
  paid_amount NUMERIC,
  pending_amount NUMERIC,
  payment_date TEXT,
  due_date TEXT,
  mode TEXT,
  status TEXT,
  gst_amount NUMERIC,
  logo_url TEXT,
  custom_logo_text TEXT,
  bank_name TEXT,
  bank_acc_no TEXT,
  bank_ifsc TEXT,
  bank_upi TEXT,
  service_details TEXT,
  service_description TEXT,
  client_email TEXT,
  client_phone TEXT,
  our_name TEXT,
  our_phone TEXT,
  our_email TEXT,
  auto_generated BOOLEAN,
  created_at TEXT
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own payments" 
  ON public.payments FOR ALL USING (auth.uid() = user_id);

-- 7. Create Finances Table
CREATE TABLE IF NOT EXISTS public.finances (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  source_or_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own finances" 
  ON public.finances FOR ALL USING (auth.uid() = user_id);

-- 8. Create Websites Table
CREATE TABLE IF NOT EXISTS public.websites (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  hosting_provider TEXT,
  hosting_price NUMERIC,
  hosting_bill_date TEXT,
  domain_registrar TEXT,
  domain_price NUMERIC,
  domain_bill_date TEXT,
  status TEXT,
  notes TEXT,
  client_id TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own websites" 
  ON public.websites FOR ALL USING (auth.uid() = user_id);

-- 9. Create Time Logs Table
CREATE TABLE IF NOT EXISTS public.time_logs (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id TEXT,
  project_name TEXT,
  task_title TEXT,
  description TEXT,
  start_time TEXT,
  end_time TEXT,
  duration_minutes NUMERIC,
  date TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own time_logs" 
  ON public.time_logs FOR ALL USING (auth.uid() = user_id);

-- 10. Create Archived Items Table
CREATE TABLE IF NOT EXISTS public.archived_items (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  original_data JSONB,
  archived_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

ALTER TABLE public.archived_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own archived_items" 
  ON public.archived_items FOR ALL USING (auth.uid() = user_id);

-- 11. Create Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  date_time TEXT NOT NULL,
  snoozed_count NUMERIC DEFAULT 0,
  status TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own reminders" 
  ON public.reminders FOR ALL USING (auth.uid() = user_id);

-- 12. Create Profile Settings Table
CREATE TABLE IF NOT EXISTS public.profile_settings (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  company_name TEXT,
  company_logo_url TEXT,
  personal_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  address TEXT,
  timezone TEXT,
  accent_color TEXT,
  updated_at TEXT NOT NULL
);

ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own profile_settings" 
  ON public.profile_settings FOR ALL USING (auth.uid() = user_id);

-- 13. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  timestamp TEXT NOT NULL,
  user_name TEXT,
  role TEXT,
  action TEXT,
  details TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own audit_logs" 
  ON public.audit_logs FOR ALL USING (auth.uid() = user_id);

-- 14. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  timeframe TEXT,
  metrics JSONB,
  created_at TEXT NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own reports" 
  ON public.reports FOR ALL USING (auth.uid() = user_id);

-- 15. Create Calendar Table
CREATE TABLE IF NOT EXISTS public.calendar (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own calendar" 
  ON public.calendar FOR ALL USING (auth.uid() = user_id);

-- 16. Create AI Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own ai_conversations" 
  ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
`;

// LocalStorage helpers for fallbacks
const getLocalBackup = <T>(key: string, userId: string, defaultValue: T): T => {
  const item = localStorage.getItem(`supabase_user_${userId}_${key}`);
  return item ? JSON.parse(item) : defaultValue;
};

const setLocalBackup = <T>(key: string, userId: string, value: T) => {
  localStorage.setItem(`supabase_user_${userId}_${key}`, JSON.stringify(value));
};

// API Services
export const DbService = {
  // CLIENTS
  async getClients(userId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getClients failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Client[]>('clients', userId, []).filter(c => c.id !== '__system_extra_data__');
        }
        throw error;
      }
      
      const mapped = (data || [])
        .filter(item => item.id !== '__system_extra_data__')
        .map(item => ({
          id: item.id,
          user_id: item.user_id,
          name: item.name,
          company: item.company || '',
          mobile: item.mobile || '',
          whatsapp: item.whatsapp || '',
          email: item.email || '',
          address: item.address || '',
          gstNumber: item.gst_number || '',
          website: item.website || '',
          notes: item.notes || '',
          createdAt: item.created_at || '',
          status: (item.status as any) || 'Active',
          metrics: item.metrics || { projectsCount: 0, totalBilled: 0, pendingInvoice: 0 },
          contracts: item.contracts || [],
          timeline: item.timeline || []
        }));

      return mapped;
    } catch (err) {
      console.warn('DB client error, using local fallback:', err);
      return getLocalBackup<Client[]>('clients', userId, []).filter(c => c.id !== '__system_extra_data__');
    }
  },

  async saveClients(userId: string, clients: Client[]): Promise<void> {
    const filteredClients = clients.filter(c => c.id !== '__system_extra_data__');
    setLocalBackup('clients', userId, filteredClients);
    try {
      // Sync deletions
      const clientIds = filteredClients.map(c => c.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
        console.warn('[Supabase Sync] Fetching clients for delete sync failed:', fetchError);
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => item.id !== '__system_extra_data__' && !clientIds.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          const { error: delError } = await supabase.from('clients').delete().in('id', idsToDelete);
          if (delError) console.warn(`[Supabase Sync] failed to delete clients:`, delError);
        }
      }

      // Map to snake_case for DB
      const dbRecords = filteredClients.map(c => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        company: c.company,
        mobile: c.mobile,
        whatsapp: c.whatsapp,
        email: c.email,
        address: c.address,
        gst_number: c.gstNumber,
        website: c.website,
        notes: c.notes,
        created_at: c.createdAt,
        status: c.status,
        metrics: c.metrics,
        contracts: c.contracts,
        timeline: c.timeline
      }));

      if (dbRecords.length > 0) {
        const { error } = await supabase.from('clients').upsert(dbRecords);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert clients:`, error);
        }
      }
    } catch (err) {
      console.warn('DB upsert error, saved to local fallback:', err);
    }
  },

  // LEADS
  async getLeads(userId: string): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getLeads failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Lead[]>('leads', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        company: item.company || '',
        phone: item.phone || '',
        email: item.email || '',
        source: item.source || 'Website',
        status: item.status || 'New',
        value: Number(item.value) || 0,
        followUpDate: item.follow_up_date || '',
        notes: item.notes || '',
        createdAt: item.created_at || ''
      }));

      return mapped;
    } catch (err) {
      console.warn('DB leads error, using local fallback:', err);
      return getLocalBackup<Lead[]>('leads', userId, []);
    }
  },

  async saveLeads(userId: string, leads: Lead[]): Promise<void> {
    setLocalBackup('leads', userId, leads);
    try {
      // Sync deletions
      const leadIds = leads.map(l => l.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
        console.warn('[Supabase Sync] Fetching leads for delete sync failed:', fetchError);
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !leadIds.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          const { error: delError } = await supabase.from('leads').delete().in('id', idsToDelete);
          if (delError) console.warn(`[Supabase Sync] failed to delete leads:`, delError);
        }
      }

      const dbRecords = leads.map(l => ({
        id: l.id,
        user_id: userId,
        name: l.name,
        company: l.company,
        phone: l.phone,
        email: l.email,
        source: l.source,
        status: l.status,
        value: l.value,
        follow_up_date: l.followUpDate,
        notes: l.notes,
        created_at: l.createdAt
      }));

      if (dbRecords.length > 0) {
        const { error } = await supabase.from('leads').upsert(dbRecords);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert leads:`, error);
        }
      }
    } catch (err) {
      console.warn('DB upsert error, saved to local fallback:', err);
    }
  },

  // PROJECTS
  async getProjects(userId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getProjects failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Project[]>('projects', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        clientName: item.client_name || '',
        type: item.type || 'Website Development',
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        budget: Number(item.budget) || 0,
        teamMembers: item.team_members || [],
        priority: item.priority || 'Medium',
        status: item.status || 'Not Started',
        progress: Number(item.progress) || 0,
        milestones: item.milestones || [],
        comments: item.comments || [],
        createdAt: item.created_at || ''
      }));

      return mapped;
    } catch (err) {
      console.warn('DB projects error, using local fallback:', err);
      return getLocalBackup<Project[]>('projects', userId, []);
    }
  },

  async saveProjects(userId: string, projects: Project[]): Promise<void> {
    setLocalBackup('projects', userId, projects);
    try {
      // Sync deletions
      const projectIds = projects.map(p => p.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
        console.warn('[Supabase Sync] Fetching projects for delete sync failed:', fetchError);
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !projectIds.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          const { error: delError } = await supabase.from('projects').delete().in('id', idsToDelete);
          if (delError) console.warn(`[Supabase Sync] failed to delete projects:`, delError);
        }
      }

      const dbRecords = projects.map(p => ({
        id: p.id,
        user_id: userId,
        name: p.name,
        client_name: p.clientName,
        type: p.type,
        start_date: p.startDate,
        end_date: p.endDate,
        budget: p.budget,
        team_members: p.teamMembers,
        priority: p.priority,
        status: p.status,
        progress: p.progress,
        milestones: p.milestones,
        comments: p.comments,
        created_at: p.startDate || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        const { error } = await supabase.from('projects').upsert(dbRecords);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert projects:`, error);
        }
      }
    } catch (err) {
      console.warn('DB upsert error, saved to local fallback:', err);
    }
  },

  // TASKS
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getTasks failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Task[]>('tasks', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description || '',
        assignedTo: item.assigned_to || '',
        project: item.project || '',
        dueDate: item.due_date || '',
        priority: item.priority || 'Medium',
        status: item.status || 'Pending',
        createdAt: item.created_at || ''
      }));

      return mapped;
    } catch (err) {
      console.warn('DB tasks error, using local fallback:', err);
      return getLocalBackup<Task[]>('tasks', userId, []);
    }
  },

  async saveTasks(userId: string, tasks: Task[]): Promise<void> {
    setLocalBackup('tasks', userId, tasks);
    try {
      // Sync deletions
      const taskIds = tasks.map(t => t.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
        console.warn('[Supabase Sync] Fetching tasks for delete sync failed:', fetchError);
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !taskIds.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          const { error: delError } = await supabase.from('tasks').delete().in('id', idsToDelete);
          if (delError) console.warn(`[Supabase Sync] failed to delete tasks:`, delError);
        }
      }

      const dbRecords = tasks.map(t => ({
        id: t.id,
        user_id: userId,
        title: t.title,
        description: t.description,
        assigned_to: t.assignedTo,
        project: t.project,
        due_date: t.dueDate,
        priority: t.priority,
        status: t.status,
        created_at: t.createdAt
      }));

      if (dbRecords.length > 0) {
        const { error } = await supabase.from('tasks').upsert(dbRecords);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert tasks:`, error);
        }
      }
    } catch (err) {
      console.warn('DB upsert error, saved to local fallback:', err);
    }
  },

  // PAYMENTS
  async getPayments(userId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getPayments failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Payment[]>('payments', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        clientName: item.client_name || '',
        invoiceNumber: item.invoice_number || '',
        amount: Number(item.amount) || 0,
        paidAmount: Number(item.paid_amount) || 0,
        pendingAmount: Number(item.pending_amount) || 0,
        paymentDate: item.payment_date || '',
        dueDate: item.due_date || '',
        mode: item.mode || 'UPI',
        status: item.status || 'Pending',
        gstAmount: Number(item.gst_amount) || 0,
        logoUrl: item.logo_url || '',
        customLogoText: item.custom_logo_text || '',
        bankName: item.bank_name || '',
        bankAccNo: item.bank_acc_no || '',
        bankIfsc: item.bank_ifsc || '',
        bankUpi: item.bank_upi || '',
        serviceDetails: item.service_details || '',
        serviceDescription: item.service_description || '',
        clientEmail: item.client_email || '',
        clientPhone: item.client_phone || '',
        ourName: item.our_name || '',
        ourPhone: item.our_phone || '',
        ourEmail: item.our_email || '',
        autoGenerated: !!item.auto_generated
      }));

      return mapped;
    } catch (err) {
      console.warn('DB payments error, using local fallback:', err);
      return getLocalBackup<Payment[]>('payments', userId, []);
    }
  },

  async savePayments(userId: string, payments: Payment[]): Promise<void> {
    setLocalBackup('payments', userId, payments);
    try {
      // Sync deletions
      const paymentIds = payments.map(p => p.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
        console.warn('[Supabase Sync] Fetching payments for delete sync failed:', fetchError);
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !paymentIds.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          const { error: delError = null } = await supabase.from('payments').delete().in('id', idsToDelete);
          if (delError) console.warn(`[Supabase Sync] failed to delete payments:`, delError);
        }
      }

      const dbRecords = payments.map(p => ({
        id: p.id,
        user_id: userId,
        client_name: p.clientName,
        invoice_number: p.invoiceNumber,
        amount: p.amount,
        paid_amount: p.paidAmount,
        pending_amount: p.pendingAmount,
        payment_date: p.paymentDate,
        due_date: p.dueDate,
        mode: p.mode,
        status: p.status,
        gst_amount: p.gstAmount,
        logo_url: p.logoUrl || '',
        custom_logo_text: p.customLogoText || '',
        bank_name: p.bankName || '',
        bank_acc_no: p.bankAccNo || '',
        bank_ifsc: p.bankIfsc || '',
        bank_upi: p.bankUpi || '',
        service_details: p.serviceDetails || '',
        service_description: p.serviceDescription || '',
        client_email: p.clientEmail || '',
        client_phone: p.clientPhone || '',
        our_name: p.ourName || '',
        our_phone: p.ourPhone || '',
        our_email: p.ourEmail || '',
        auto_generated: !!p.autoGenerated,
        created_at: p.paymentDate || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        const { error } = await supabase.from('payments').upsert(dbRecords);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert payments:`, error);
        }
      }
    } catch (err) {
      console.warn('DB upsert error, saved to local fallback:', err);
    }
  },

  // FINANCES
  async getFinances(userId: string): Promise<FinanceLedger[]> {
    try {
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getFinances failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<FinanceLedger[]>('finances', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        type: item.type as any,
        sourceOrName: item.source_or_name,
        category: item.category,
        amount: Number(item.amount) || 0,
        date: item.date,
        notes: item.notes || ''
      }));

      return mapped;
    } catch (err) {
      console.warn('DB finances error, using local fallback:', err);
      return getLocalBackup<FinanceLedger[]>('finances', userId, []);
    }
  },

  async saveFinances(userId: string, finances: FinanceLedger[]): Promise<void> {
    setLocalBackup('finances', userId, finances);
    try {
      const ids = finances.map(f => f.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('finances')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('finances').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = finances.map(f => ({
        id: f.id,
        user_id: userId,
        type: f.type,
        source_or_name: f.sourceOrName,
        category: f.category,
        amount: f.amount,
        date: f.date,
        notes: f.notes,
        created_at: f.date || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        await supabase.from('finances').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB finances save error:', err);
    }
  },

  // WEBSITES
  async getWebsites(userId: string): Promise<Website[]> {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getWebsites failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Website[]>('websites', userId, []);
        }
        throw error;
      }

      const localItems = getLocalBackup<Website[]>('websites', userId, []);
      const mapped = (data || []).map(item => {
        const localItem = localItems.find(w => w.id === item.id);
        
        let parsedNotes = item.notes || '';
        let hostingRem = localItem?.hostingReminderDays || 30;
        let domainRem = localItem?.domainReminderDays || 30;

        if (item.notes && item.notes.startsWith('{') && item.notes.endsWith('}')) {
          try {
            const parsed = JSON.parse(item.notes);
            if (parsed && typeof parsed === 'object') {
              parsedNotes = parsed.userNotes !== undefined ? parsed.userNotes : (parsed.notes || '');
              if (parsed.hostingReminderDays !== undefined) {
                hostingRem = Number(parsed.hostingReminderDays) || 30;
              }
              if (parsed.domainReminderDays !== undefined) {
                domainRem = Number(parsed.domainReminderDays) || 30;
              }
            }
          } catch (e) {
            // Fallback to plain text
          }
        }

        return {
          id: item.id,
          name: item.name,
          url: item.url,
          hostingProvider: item.hosting_provider || '',
          hostingPrice: Number(item.hosting_price) || 0,
          hostingBillDate: item.hosting_bill_date || '',
          domainRegistrar: item.domain_registrar || '',
          domainPrice: Number(item.domain_price) || 0,
          domainBillDate: item.domain_bill_date || '',
          status: item.status as any || 'Active',
          notes: parsedNotes,
          clientId: item.client_id || undefined,
          hostingReminderDays: hostingRem,
          domainReminderDays: domainRem
        };
      });

      return mapped;
    } catch (err) {
      console.warn('DB websites error, using local fallback:', err);
      return getLocalBackup<Website[]>('websites', userId, []);
    }
  },

  async saveWebsites(userId: string, websites: Website[]): Promise<void> {
    setLocalBackup('websites', userId, websites);
    try {
      const ids = websites.map(w => w.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('websites').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = websites.map(w => {
        const serializedNotes = JSON.stringify({
          userNotes: w.notes,
          hostingReminderDays: w.hostingReminderDays || 30,
          domainReminderDays: w.domainReminderDays || 30
        });

        return {
          id: w.id,
          user_id: userId,
          name: w.name,
          url: w.url,
          hosting_provider: w.hostingProvider,
          hosting_price: w.hostingPrice,
          hosting_bill_date: w.hostingBillDate,
          domain_registrar: w.domainRegistrar,
          domain_price: w.domainPrice,
          domain_bill_date: w.domainBillDate,
          status: w.status,
          notes: serializedNotes,
          client_id: w.clientId || null,
          created_at: new Date().toISOString()
        };
      });

      if (dbRecords.length > 0) {
        await supabase.from('websites').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB websites save error:', err);
    }
  },

  // TIME LOGS
  async getTimeLogs(userId: string): Promise<TimeLog[]> {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getTimeLogs failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<TimeLog[]>('timeLogs', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        projectId: item.project_id || '',
        projectName: item.project_name || '',
        taskTitle: item.task_title || '',
        description: item.description || '',
        startTime: item.start_time || '',
        endTime: item.end_time || '',
        durationMinutes: Number(item.duration_minutes) || 0,
        date: item.date || ''
      }));

      return mapped;
    } catch (err) {
      console.warn('DB time logs error, fallback:', err);
      return getLocalBackup<TimeLog[]>('timeLogs', userId, []);
    }
  },

  async saveTimeLogs(userId: string, timeLogs: TimeLog[]): Promise<void> {
    setLocalBackup('timeLogs', userId, timeLogs);
    try {
      const ids = timeLogs.map(t => t.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('time_logs')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('time_logs').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = timeLogs.map(t => ({
        id: t.id,
        user_id: userId,
        project_id: t.projectId,
        project_name: t.projectName,
        task_title: t.taskTitle,
        description: t.description,
        start_time: t.startTime,
        end_time: t.endTime,
        duration_minutes: t.durationMinutes,
        date: t.date,
        created_at: t.startTime || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        await supabase.from('time_logs').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB time logs save error:', err);
    }
  },

  // ARCHIVES
  async getArchivedItems(userId: string): Promise<ArchivedItem[]> {
    try {
      const { data, error } = await supabase
        .from('archived_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getArchivedItems failed:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<ArchivedItem[]>('archivedItems', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        type: item.type as any,
        name: item.name,
        originalData: item.original_data,
        archivedAt: item.archived_at
      }));

      return mapped;
    } catch (err) {
      console.warn('DB archived items error:', err);
      return getLocalBackup<ArchivedItem[]>('archivedItems', userId, []);
    }
  },

  async saveArchivedItems(userId: string, items: ArchivedItem[]): Promise<void> {
    setLocalBackup('archivedItems', userId, items);
    try {
      const ids = items.map(i => i.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('archived_items')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('archived_items').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = items.map(i => ({
        id: i.id,
        user_id: userId,
        type: i.type,
        name: i.name,
        original_data: i.originalData,
        archived_at: i.archivedAt,
        created_at: i.archivedAt || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        await supabase.from('archived_items').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB archived items save error:', err);
    }
  },

  // REMINDERS
  async getReminders(userId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getReminders failed:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Reminder[]>('reminders', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        type: item.type as any,
        title: item.title,
        dateTime: item.date_time,
        snoozedCount: Number(item.snoozed_count) || 0,
        status: item.status as any || 'Active'
      }));

      return mapped;
    } catch (err) {
      console.warn('DB reminders error:', err);
      return getLocalBackup<Reminder[]>('reminders', userId, []);
    }
  },

  async saveReminders(userId: string, reminders: Reminder[]): Promise<void> {
    setLocalBackup('reminders', userId, reminders);
    try {
      const ids = reminders.map(r => r.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('reminders')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('reminders').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = reminders.map(r => ({
        id: r.id,
        user_id: userId,
        type: r.type,
        title: r.title,
        date_time: r.dateTime,
        snoozed_count: r.snoozedCount,
        status: r.status,
        created_at: r.dateTime || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        await supabase.from('reminders').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB reminders save error:', err);
    }
  },

  // AUDIT LOGS
  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getAuditLogs failed:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<AuditLog[]>('auditLogs', userId, []);
        }
        throw error;
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        user: item.user_name || '',
        role: item.role as any || 'Employee',
        action: item.action || '',
        details: item.details || ''
      }));

      return mapped;
    } catch (err) {
      console.warn('DB audit logs error:', err);
      return getLocalBackup<AuditLog[]>('auditLogs', userId, []);
    }
  },

  async saveAuditLogs(userId: string, logs: AuditLog[]): Promise<void> {
    setLocalBackup('auditLogs', userId, logs);
    try {
      const ids = logs.map(l => l.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('audit_logs').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = logs.map(l => ({
        id: l.id,
        user_id: userId,
        timestamp: l.timestamp,
        user_name: l.user,
        role: l.role,
        action: l.action,
        details: l.details,
        created_at: l.timestamp || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        await supabase.from('audit_logs').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB audit logs save error:', err);
    }
  },

  // PROFILE SETTINGS
  async getProfileSettings(userId: string): Promise<ProfileSettings | null> {
    try {
      const { data, error } = await supabase
        .from('profile_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Supabase Sync] getProfileSettings failed:', error);
        return null;
      }
      if (data) {
        return {
          companyName: data.company_name || 'GrowInvicta',
          companyLogoUrl: data.company_logo_url || '',
          personalName: data.personal_name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || '',
          address: data.address || '',
          timezone: data.timezone || '',
          accentColor: data.accent_color || 'indigo'
        };
      }
      return null;
    } catch (err) {
      console.warn('DB getProfileSettings error:', err);
      return null;
    }
  },

  async saveProfileSettings(userId: string, settings: ProfileSettings): Promise<void> {
    try {
      const record = {
        user_id: userId,
        company_name: settings.companyName,
        company_logo_url: settings.companyLogoUrl,
        personal_name: settings.personalName,
        email: settings.email,
        phone: settings.phone,
        role: settings.role,
        address: settings.address,
        timezone: settings.timezone,
        accent_color: settings.accentColor,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('profile_settings').upsert(record);
      if (error) {
        console.warn('[Supabase Sync] saveProfileSettings failed:', error);
      }
    } catch (err) {
      console.warn('DB saveProfileSettings error:', err);
    }
  },

  // Delete DB helper
  async deleteRecord(table: string, id: string): Promise<void> {
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (err) {
      console.warn(`Error deleting record from ${table}:`, err);
    }
  },

  // EXTRA DATA FOR FULL SYNC
  async getExtraData(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .eq('id', '__system_extra_data__')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.warn('[Supabase Sync] getExtraData failed:', error);
        return null;
      }
      if (data && data.metrics) {
        return data.metrics;
      }
      return null;
    } catch (err) {
      console.warn('DB getExtraData error:', err);
      return null;
    }
  },

  async saveExtraData(userId: string, extraData: any): Promise<void> {
    try {
      const record = {
        id: '__system_extra_data__',
        user_id: userId,
        name: 'System Extra Data',
        metrics: extraData,
        created_at: new Date().toISOString()
      };
      const { error } = await supabase.from('clients').upsert(record);
      if (error) {
        console.warn('[Supabase Sync] saveExtraData failed:', error);
      }
    } catch (err) {
      console.warn('DB saveExtraData error:', err);
    }
  },

  // CALENDAR
  async getCalendarEvents(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('calendar')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getCalendarEvents failed:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<any[]>('calendar', userId, []);
        }
        throw error;
      }
      return data || [];
    } catch (err) {
      console.warn('DB calendar events error, using fallback:', err);
      return getLocalBackup<any[]>('calendar', userId, []);
    }
  },

  async saveCalendarEvents(userId: string, events: any[]): Promise<void> {
    setLocalBackup('calendar', userId, events);
    try {
      const ids = events.map(e => e.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('calendar')
        .select('id')
        .eq('user_id', userId);

      if (!fetchError && dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('calendar').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = events.map(e => ({
        id: e.id,
        user_id: userId,
        title: e.title,
        description: e.description || '',
        start_time: e.startTime || e.start_time || '',
        end_time: e.endTime || e.end_time || '',
        color: e.color || '',
        created_at: e.createdAt || e.created_at || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        await supabase.from('calendar').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB calendar save error:', err);
    }
  },

  // REPORTS
  async getReports(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Sync] getReports failed:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<any[]>('reports', userId, []);
        }
        throw error;
      }
      return data || [];
    } catch (err) {
      console.warn('DB reports error, using fallback:', err);
      return getLocalBackup<any[]>('reports', userId, []);
    }
  },

  async saveReports(userId: string, reports: any[]): Promise<void> {
    setLocalBackup('reports', userId, reports);
    try {
      const ids = reports.map(r => r.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('reports')
        .select('id')
        .eq('user_id', userId);

      if (!fetchError && dbItems) {
        const toDelete = dbItems.filter(item => !ids.includes(item.id));
        const idsToDelete = toDelete.map(item => item.id);
        if (idsToDelete.length > 0) {
          await supabase.from('reports').delete().in('id', idsToDelete);
        }
      }

      const dbRecords = reports.map(r => ({
        id: r.id,
        user_id: userId,
        title: r.title,
        type: r.type,
        timeframe: r.timeframe || '',
        metrics: r.metrics || {},
        created_at: r.createdAt || r.created_at || new Date().toISOString()
      }));

      if (dbRecords.length > 0) {
        await supabase.from('reports').upsert(dbRecords);
      }
    } catch (err) {
      console.warn('DB reports save error:', err);
    }
  },

  // SINGLE RECORD CRUD IMPLEMENTATIONS
  async upsertClient(userId: string, client: Client): Promise<void> {
    // 1. Cache locally first
    const local = getLocalBackup<Client[]>('clients', userId, []).filter(c => c.id !== '__system_extra_data__');
    const idx = local.findIndex(c => c.id === client.id);
    if (idx >= 0) local[idx] = client;
    else local.push(client);
    setLocalBackup('clients', userId, local);

    // 2. Try writing to Supabase
    try {
      const record = {
        id: client.id,
        user_id: userId,
        name: client.name,
        company: client.company,
        mobile: client.mobile,
        whatsapp: client.whatsapp,
        email: client.email,
        address: client.address,
        gst_number: client.gstNumber,
        website: client.website,
        notes: client.notes,
        created_at: client.createdAt,
        status: client.status,
        metrics: client.metrics,
        contracts: client.contracts,
        timeline: client.timeline
      };
      const { error } = await supabase.from('clients').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertClient failed, saved to local cache:', err);
      throw err;
    }
  },

  async deleteClient(userId: string, clientId: string): Promise<void> {
    // 1. Cache locally first
    const local = getLocalBackup<Client[]>('clients', userId, []).filter(c => c.id !== clientId);
    setLocalBackup('clients', userId, local);

    // 2. Delete from Supabase
    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteClient failed:', err);
      throw err;
    }
  },

  async upsertLead(userId: string, lead: Lead): Promise<void> {
    const local = getLocalBackup<Lead[]>('leads', userId, []);
    const idx = local.findIndex(l => l.id === lead.id);
    if (idx >= 0) local[idx] = lead;
    else local.push(lead);
    setLocalBackup('leads', userId, local);

    try {
      const record = {
        id: lead.id,
        user_id: userId,
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        status: lead.status,
        value: lead.value,
        follow_up_date: lead.followUpDate,
        notes: lead.notes,
        created_at: lead.createdAt
      };
      const { error } = await supabase.from('leads').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertLead failed:', err);
      throw err;
    }
  },

  async deleteLead(userId: string, leadId: string): Promise<void> {
    const local = getLocalBackup<Lead[]>('leads', userId, []).filter(l => l.id !== leadId);
    setLocalBackup('leads', userId, local);

    try {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteLead failed:', err);
      throw err;
    }
  },

  async upsertProject(userId: string, project: Project): Promise<void> {
    const local = getLocalBackup<Project[]>('projects', userId, []);
    const idx = local.findIndex(p => p.id === project.id);
    if (idx >= 0) local[idx] = project;
    else local.push(project);
    setLocalBackup('projects', userId, local);

    try {
      const record = {
        id: project.id,
        user_id: userId,
        name: project.name,
        client_name: project.clientName,
        type: project.type,
        start_date: project.startDate,
        end_date: project.endDate,
        budget: project.budget,
        team_members: project.teamMembers,
        priority: project.priority,
        status: project.status,
        progress: project.progress,
        milestones: project.milestones,
        comments: project.comments,
        created_at: project.startDate || new Date().toISOString()
      };
      const { error } = await supabase.from('projects').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertProject failed:', err);
      throw err;
    }
  },

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const local = getLocalBackup<Project[]>('projects', userId, []).filter(p => p.id !== projectId);
    setLocalBackup('projects', userId, local);

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteProject failed:', err);
      throw err;
    }
  },

  async upsertTask(userId: string, task: Task): Promise<void> {
    const local = getLocalBackup<Task[]>('tasks', userId, []);
    const idx = local.findIndex(t => t.id === task.id);
    if (idx >= 0) local[idx] = task;
    else local.push(task);
    setLocalBackup('tasks', userId, local);

    try {
      const record = {
        id: task.id,
        user_id: userId,
        title: task.title,
        description: task.description,
        assigned_to: task.assignedTo,
        project: task.project,
        due_date: task.dueDate,
        priority: task.priority,
        status: task.status,
        created_at: task.createdAt
      };
      const { error } = await supabase.from('tasks').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertTask failed:', err);
      throw err;
    }
  },

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const local = getLocalBackup<Task[]>('tasks', userId, []).filter(t => t.id !== taskId);
    setLocalBackup('tasks', userId, local);

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteTask failed:', err);
      throw err;
    }
  },

  async upsertPayment(userId: string, payment: Payment): Promise<void> {
    const local = getLocalBackup<Payment[]>('payments', userId, []);
    const idx = local.findIndex(p => p.id === payment.id);
    if (idx >= 0) local[idx] = payment;
    else local.push(payment);
    setLocalBackup('payments', userId, local);

    try {
      const record = {
        id: payment.id,
        user_id: userId,
        client_name: payment.clientName,
        invoice_number: payment.invoiceNumber,
        amount: payment.amount,
        paid_amount: payment.paidAmount,
        pending_amount: payment.pendingAmount,
        payment_date: payment.paymentDate,
        due_date: payment.dueDate,
        mode: payment.mode,
        status: payment.status,
        gst_amount: payment.gstAmount,
        logo_url: payment.logoUrl || '',
        custom_logo_text: payment.customLogoText || '',
        bank_name: payment.bankName || '',
        bank_acc_no: payment.bankAccNo || '',
        bank_ifsc: payment.bankIfsc || '',
        bank_upi: payment.bankUpi || '',
        service_details: payment.serviceDetails || '',
        service_description: payment.serviceDescription || '',
        client_email: payment.clientEmail || '',
        client_phone: payment.clientPhone || '',
        our_name: payment.ourName || '',
        our_phone: payment.ourPhone || '',
        our_email: payment.ourEmail || '',
        auto_generated: !!payment.autoGenerated,
        created_at: payment.paymentDate || new Date().toISOString()
      };
      const { error } = await supabase.from('payments').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertPayment failed:', err);
      throw err;
    }
  },

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    const local = getLocalBackup<Payment[]>('payments', userId, []).filter(p => p.id !== paymentId);
    setLocalBackup('payments', userId, local);

    try {
      const { error } = await supabase.from('payments').delete().eq('id', paymentId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deletePayment failed:', err);
      throw err;
    }
  },

  async upsertFinance(userId: string, finance: FinanceLedger): Promise<void> {
    const local = getLocalBackup<FinanceLedger[]>('finances', userId, []);
    const idx = local.findIndex(f => f.id === finance.id);
    if (idx >= 0) local[idx] = finance;
    else local.push(finance);
    setLocalBackup('finances', userId, local);

    try {
      const record = {
        id: finance.id,
        user_id: userId,
        type: finance.type,
        source_or_name: finance.sourceOrName,
        category: finance.category,
        amount: finance.amount,
        date: finance.date,
        notes: finance.notes,
        created_at: finance.date || new Date().toISOString()
      };
      const { error } = await supabase.from('finances').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertFinance failed:', err);
      throw err;
    }
  },

  async deleteFinance(userId: string, financeId: string): Promise<void> {
    const local = getLocalBackup<FinanceLedger[]>('finances', userId, []).filter(f => f.id !== financeId);
    setLocalBackup('finances', userId, local);

    try {
      const { error } = await supabase.from('finances').delete().eq('id', financeId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteFinance failed:', err);
      throw err;
    }
  },

  async upsertWebsite(userId: string, website: Website): Promise<void> {
    const local = getLocalBackup<Website[]>('websites', userId, []);
    const idx = local.findIndex(w => w.id === website.id);
    if (idx >= 0) local[idx] = website;
    else local.push(website);
    setLocalBackup('websites', userId, local);

    try {
      const serializedNotes = JSON.stringify({
        userNotes: website.notes,
        hostingReminderDays: website.hostingReminderDays || 30,
        domainReminderDays: website.domainReminderDays || 30
      });

      const record = {
        id: website.id,
        user_id: userId,
        name: website.name,
        url: website.url,
        hosting_provider: website.hostingProvider,
        hosting_price: website.hostingPrice,
        hosting_bill_date: website.hostingBillDate,
        domain_registrar: website.domainRegistrar,
        domain_price: website.domainPrice,
        domain_bill_date: website.domainBillDate,
        status: website.status,
        notes: serializedNotes,
        client_id: website.clientId || null,
        created_at: new Date().toISOString()
      };
      const { error } = await supabase.from('websites').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertWebsite failed:', err);
      throw err;
    }
  },

  async deleteWebsite(userId: string, websiteId: string): Promise<void> {
    const local = getLocalBackup<Website[]>('websites', userId, []).filter(w => w.id !== websiteId);
    setLocalBackup('websites', userId, local);

    try {
      const { error } = await supabase.from('websites').delete().eq('id', websiteId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteWebsite failed:', err);
      throw err;
    }
  },

  async upsertTimeLog(userId: string, timeLog: TimeLog): Promise<void> {
    const local = getLocalBackup<TimeLog[]>('timeLogs', userId, []);
    const idx = local.findIndex(t => t.id === timeLog.id);
    if (idx >= 0) local[idx] = timeLog;
    else local.push(timeLog);
    setLocalBackup('timeLogs', userId, local);

    try {
      const record = {
        id: timeLog.id,
        user_id: userId,
        project_id: timeLog.projectId,
        project_name: timeLog.projectName,
        task_title: timeLog.taskTitle,
        description: timeLog.description,
        start_time: timeLog.startTime,
        end_time: timeLog.endTime,
        duration_minutes: timeLog.durationMinutes,
        date: timeLog.date,
        created_at: timeLog.startTime || new Date().toISOString()
      };
      const { error } = await supabase.from('time_logs').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertTimeLog failed:', err);
      throw err;
    }
  },

  async deleteTimeLog(userId: string, logId: string): Promise<void> {
    const local = getLocalBackup<TimeLog[]>('timeLogs', userId, []).filter(t => t.id !== logId);
    setLocalBackup('timeLogs', userId, local);

    try {
      const { error } = await supabase.from('time_logs').delete().eq('id', logId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteTimeLog failed:', err);
      throw err;
    }
  },

  async upsertArchivedItem(userId: string, item: ArchivedItem): Promise<void> {
    const local = getLocalBackup<ArchivedItem[]>('archivedItems', userId, []);
    const idx = local.findIndex(i => i.id === item.id);
    if (idx >= 0) local[idx] = item;
    else local.push(item);
    setLocalBackup('archivedItems', userId, local);

    try {
      const record = {
        id: item.id,
        user_id: userId,
        type: item.type,
        name: item.name,
        original_data: item.originalData,
        archived_at: item.archivedAt,
        created_at: item.archivedAt || new Date().toISOString()
      };
      const { error } = await supabase.from('archived_items').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertArchivedItem failed:', err);
      throw err;
    }
  },

  async deleteArchivedItem(userId: string, itemId: string): Promise<void> {
    const local = getLocalBackup<ArchivedItem[]>('archivedItems', userId, []).filter(i => i.id !== itemId);
    setLocalBackup('archivedItems', userId, local);

    try {
      const { error } = await supabase.from('archived_items').delete().eq('id', itemId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteArchivedItem failed:', err);
      throw err;
    }
  },

  async upsertReminder(userId: string, reminder: Reminder): Promise<void> {
    const local = getLocalBackup<Reminder[]>('reminders', userId, []);
    const idx = local.findIndex(r => r.id === reminder.id);
    if (idx >= 0) local[idx] = reminder;
    else local.push(reminder);
    setLocalBackup('reminders', userId, local);

    try {
      const record = {
        id: reminder.id,
        user_id: userId,
        type: reminder.type,
        title: reminder.title,
        date_time: reminder.dateTime,
        snoozed_count: reminder.snoozedCount,
        status: reminder.status,
        created_at: reminder.dateTime || new Date().toISOString()
      };
      const { error } = await supabase.from('reminders').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertReminder failed:', err);
      throw err;
    }
  },

  async deleteReminder(userId: string, reminderId: string): Promise<void> {
    const local = getLocalBackup<Reminder[]>('reminders', userId, []).filter(r => r.id !== reminderId);
    setLocalBackup('reminders', userId, local);

    try {
      const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteReminder failed:', err);
      throw err;
    }
  },

  async upsertCalendarEvent(userId: string, event: any): Promise<void> {
    const local = getLocalBackup<any[]>('calendar', userId, []);
    const idx = local.findIndex(e => e.id === event.id);
    if (idx >= 0) local[idx] = event;
    else local.push(event);
    setLocalBackup('calendar', userId, local);

    try {
      const record = {
        id: event.id,
        user_id: userId,
        title: event.title,
        description: event.description || '',
        start_time: event.startTime || event.start_time || '',
        end_time: event.endTime || event.end_time || '',
        color: event.color || '',
        created_at: event.createdAt || event.created_at || new Date().toISOString()
      };
      const { error } = await supabase.from('calendar').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertCalendarEvent failed:', err);
      throw err;
    }
  },

  async deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
    const local = getLocalBackup<any[]>('calendar', userId, []).filter(e => e.id !== eventId);
    setLocalBackup('calendar', userId, local);

    try {
      const { error } = await supabase.from('calendar').delete().eq('id', eventId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteCalendarEvent failed:', err);
      throw err;
    }
  },

  async upsertReport(userId: string, report: any): Promise<void> {
    const local = getLocalBackup<any[]>('reports', userId, []);
    const idx = local.findIndex(r => r.id === report.id);
    if (idx >= 0) local[idx] = report;
    else local.push(report);
    setLocalBackup('reports', userId, local);

    try {
      const record = {
        id: report.id,
        user_id: userId,
        title: report.title,
        type: report.type,
        timeframe: report.timeframe || '',
        metrics: report.metrics || {},
        created_at: report.createdAt || report.created_at || new Date().toISOString()
      };
      const { error } = await supabase.from('reports').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] upsertReport failed:', err);
      throw err;
    }
  },

  async deleteReport(userId: string, reportId: string): Promise<void> {
    const local = getLocalBackup<any[]>('reports', userId, []).filter(r => r.id !== reportId);
    setLocalBackup('reports', userId, local);

    try {
      const { error } = await supabase.from('reports').delete().eq('id', reportId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] deleteReport failed:', err);
      throw err;
    }
  },

  // AI CONVERSATION METHODS
  async getAIMessages(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        if (isTableMissingError(error)) {
          return getLocalBackup<any[]>('ai_messages', userId, []);
        }
        throw error;
      }
      return (data || []).map(m => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: new Date(m.timestamp)
      }));
    } catch (err) {
      console.warn('[DbService] getAIMessages error, using local fallback:', err);
      return getLocalBackup<any[]>('ai_messages', userId, []).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  },

  async addAIMessage(userId: string, message: any): Promise<void> {
    // 1. Cache locally first
    const local = getLocalBackup<any[]>('ai_messages', userId, []);
    local.push(message);
    setLocalBackup('ai_messages', userId, local);

    // 2. Write to Supabase
    try {
      const record = {
        id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        role: message.role,
        text: message.text,
        timestamp: (message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)).toISOString(),
        created_at: new Date().toISOString()
      };
      const { error } = await supabase.from('ai_conversations').upsert(record);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] addAIMessage error:', err);
      throw err;
    }
  },

  async clearAIMessages(userId: string): Promise<void> {
    setLocalBackup('ai_messages', userId, []);
    try {
      const { error } = await supabase.from('ai_conversations').delete().eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      console.warn('[DbService] clearAIMessages error:', err);
      throw err;
    }
  }
};

