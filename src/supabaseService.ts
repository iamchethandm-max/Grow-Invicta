import { supabase } from './supabase';
import { Client, Lead, Project, Task, Payment, FinanceLedger, Reminder, Website, TimeLog, ProfileSettings } from './types';

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
  comments JSONB
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
  gst_amount NUMERIC
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can modify their own payments" 
  ON public.payments FOR ALL USING (auth.uid() = user_id);
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
        .eq('user_id', userId);

      if (error) {
        console.warn('[Supabase Sync] getClients failed, using local fallback:', error);
        if (isTableMissingError(error)) {
          return getLocalBackup<Client[]>('clients', userId, []);
        }
        throw error;
      }
      
      const mapped = (data || []).map(item => ({
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

      // Fallback/sync check: if DB is empty, but local backup has items, use local backup and let hooks sync them to DB
      if (mapped.length === 0) {
        const local = getLocalBackup<Client[]>('clients', userId, []);
        if (local.length > 0) {
          console.log(`[Sync] DB clients empty, syncing ${local.length} local items to DB`);
          return local;
        }
      }

      return mapped;
    } catch (err) {
      console.warn('DB client error, using local fallback:', err);
      return getLocalBackup<Client[]>('clients', userId, []);
    }
  },

  async saveClients(userId: string, clients: Client[]): Promise<void> {
    setLocalBackup('clients', userId, clients);
    try {
      // Sync deletions (delete from DB anything not in local array)
      const clientIds = clients.map(c => c.id);
      const { data: dbItems, error: fetchError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId);

      if (fetchError) {
        if (isTableMissingError(fetchError)) return;
        console.warn('[Supabase Sync] Fetching clients for delete sync failed:', fetchError);
      } else if (dbItems) {
        const toDelete = dbItems.filter(item => !clientIds.includes(item.id));
        for (const item of toDelete) {
          const { error: delError } = await supabase.from('clients').delete().eq('id', item.id);
          if (delError) console.warn(`[Supabase Sync] failed to delete client ${item.id}:`, delError);
        }
      }

      // Map to snake_case for DB
      const dbRecords = clients.map(c => ({
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

      for (const record of dbRecords) {
        const { error } = await supabase.from('clients').upsert(record);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert client ${record.id}:`, error);
          if (isTableMissingError(error)) break;
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
        .eq('user_id', userId);

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

      // Fallback/sync check: if DB is empty, but local backup has items, use local backup and let hooks sync them to DB
      if (mapped.length === 0) {
        const local = getLocalBackup<Lead[]>('leads', userId, []);
        if (local.length > 0) {
          console.log(`[Sync] DB leads empty, syncing ${local.length} local items to DB`);
          return local;
        }
      }

      return mapped;
    } catch (err) {
      console.warn('DB leads error, using local fallback:', err);
      return getLocalBackup<Lead[]>('leads', userId, []);
    }
  },

  async saveLeads(userId: string, leads: Lead[]): Promise<void> {
    setLocalBackup('leads', userId, leads);
    try {
      // Sync deletions (delete from DB anything not in local array)
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
        for (const item of toDelete) {
          const { error: delError } = await supabase.from('leads').delete().eq('id', item.id);
          if (delError) console.warn(`[Supabase Sync] failed to delete lead ${item.id}:`, delError);
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

      for (const record of dbRecords) {
        const { error } = await supabase.from('leads').upsert(record);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert lead ${record.id}:`, error);
          if (isTableMissingError(error)) break;
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
        .eq('user_id', userId);

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
        comments: item.comments || []
      }));

      // Fallback/sync check: if DB is empty, but local backup has items, use local backup and let hooks sync them to DB
      if (mapped.length === 0) {
        const local = getLocalBackup<Project[]>('projects', userId, []);
        if (local.length > 0) {
          console.log(`[Sync] DB projects empty, syncing ${local.length} local items to DB`);
          return local;
        }
      }

      return mapped;
    } catch (err) {
      console.warn('DB projects error, using local fallback:', err);
      return getLocalBackup<Project[]>('projects', userId, []);
    }
  },

  async saveProjects(userId: string, projects: Project[]): Promise<void> {
    setLocalBackup('projects', userId, projects);
    try {
      // Sync deletions (delete from DB anything not in local array)
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
        for (const item of toDelete) {
          const { error: delError } = await supabase.from('projects').delete().eq('id', item.id);
          if (delError) console.warn(`[Supabase Sync] failed to delete project ${item.id}:`, delError);
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
        comments: p.comments
      }));

      for (const record of dbRecords) {
        const { error } = await supabase.from('projects').upsert(record);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert project ${record.id}:`, error);
          if (isTableMissingError(error)) break;
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
        .eq('user_id', userId);

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

      // Fallback/sync check: if DB is empty, but local backup has items, use local backup and let hooks sync them to DB
      if (mapped.length === 0) {
        const local = getLocalBackup<Task[]>('tasks', userId, []);
        if (local.length > 0) {
          console.log(`[Sync] DB tasks empty, syncing ${local.length} local items to DB`);
          return local;
        }
      }

      return mapped;
    } catch (err) {
      console.warn('DB tasks error, using local fallback:', err);
      return getLocalBackup<Task[]>('tasks', userId, []);
    }
  },

  async saveTasks(userId: string, tasks: Task[]): Promise<void> {
    setLocalBackup('tasks', userId, tasks);
    try {
      // Sync deletions (delete from DB anything not in local array)
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
        for (const item of toDelete) {
          const { error: delError } = await supabase.from('tasks').delete().eq('id', item.id);
          if (delError) console.warn(`[Supabase Sync] failed to delete task ${item.id}:`, delError);
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

      for (const record of dbRecords) {
        const { error } = await supabase.from('tasks').upsert(record);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert task ${record.id}:`, error);
          if (isTableMissingError(error)) break;
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
        .eq('user_id', userId);

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
        gstAmount: Number(item.gst_amount) || 0
      }));

      // Fallback/sync check: if DB is empty, but local backup has items, use local backup and let hooks sync them to DB
      if (mapped.length === 0) {
        const local = getLocalBackup<Payment[]>('payments', userId, []);
        if (local.length > 0) {
          console.log(`[Sync] DB payments empty, syncing ${local.length} local items to DB`);
          return local;
        }
      }

      return mapped;
    } catch (err) {
      console.warn('DB payments error, using local fallback:', err);
      return getLocalBackup<Payment[]>('payments', userId, []);
    }
  },

  async savePayments(userId: string, payments: Payment[]): Promise<void> {
    setLocalBackup('payments', userId, payments);
    try {
      // Sync deletions (delete from DB anything not in local array)
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
        for (const item of toDelete) {
          const { error: delError } = await supabase.from('payments').delete().eq('id', item.id);
          if (delError) console.warn(`[Supabase Sync] failed to delete payment ${item.id}:`, delError);
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
        gst_amount: p.gstAmount
      }));

      for (const record of dbRecords) {
        const { error } = await supabase.from('payments').upsert(record);
        if (error) {
          console.warn(`[Supabase Sync] failed to upsert payment ${record.id}:`, error);
          if (isTableMissingError(error)) break;
        }
      }
    } catch (err) {
      console.warn('DB upsert error, saved to local fallback:', err);
    }
  },

  // Delete DB helper
  async deleteRecord(table: string, id: string): Promise<void> {
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (err) {
      console.warn(`Error deleting record from ${table}:`, err);
    }
  }
};
