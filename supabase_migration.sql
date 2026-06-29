-- GROWINVICTA COMPLETE ENTERPRISE SAAS DATABASE MIGRATION SCRIPT
-- Generated for complete Postgres/Supabase Sync Alignment

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users profile table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view and update their own profile'
  ) THEN
    CREATE POLICY "Users can view and update their own profile" 
      ON public.users FOR ALL USING (auth.uid() = id);
  END IF;
END $$;

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
  created_at TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  metrics JSONB DEFAULT '{"projectsCount": 0, "totalBilled": 0, "pendingInvoice": 0}'::jsonb,
  contracts JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can modify their own clients'
  ) THEN
    CREATE POLICY "Users can modify their own clients" 
      ON public.clients FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create Index for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

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
  value NUMERIC DEFAULT 0,
  follow_up_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can modify their own leads'
  ) THEN
    CREATE POLICY "Users can modify their own leads" 
      ON public.leads FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);

-- 4. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT,
  type TEXT,
  start_date TEXT,
  end_date TEXT,
  budget NUMERIC DEFAULT 0,
  team_members TEXT[] DEFAULT '{}'::text[],
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Not Started',
  progress NUMERIC DEFAULT 0,
  milestones JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TEXT NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can modify their own projects'
  ) THEN
    CREATE POLICY "Users can modify their own projects" 
      ON public.projects FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- 5. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  project TEXT,
  due_date TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Pending',
  created_at TEXT NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can modify their own tasks'
  ) THEN
    CREATE POLICY "Users can modify their own tasks" 
      ON public.tasks FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- 6. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_name TEXT,
  invoice_number TEXT,
  amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  pending_amount NUMERIC DEFAULT 0,
  payment_date TEXT,
  due_date TEXT,
  mode TEXT DEFAULT 'UPI',
  status TEXT DEFAULT 'Pending',
  gst_amount NUMERIC DEFAULT 0,
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
  auto_generated BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can modify their own payments'
  ) THEN
    CREATE POLICY "Users can modify their own payments" 
      ON public.payments FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- 7. Create Finances Table
CREATE TABLE IF NOT EXISTS public.finances (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  source_or_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'finances' AND policyname = 'Users can modify their own finances'
  ) THEN
    CREATE POLICY "Users can modify their own finances" 
      ON public.finances FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_finances_user_id ON public.finances(user_id);

-- Create Finance alias table if needed (or keep finances as core table)
CREATE OR REPLACE VIEW public.finance AS SELECT * FROM public.finances;

-- 8. Create Websites Table
CREATE TABLE IF NOT EXISTS public.websites (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  hosting_provider TEXT,
  hosting_price NUMERIC DEFAULT 0,
  hosting_bill_date TEXT,
  domain_registrar TEXT,
  domain_price NUMERIC DEFAULT 0,
  domain_bill_date TEXT,
  status TEXT DEFAULT 'Active',
  notes TEXT,
  client_id TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'websites' AND policyname = 'Users can modify their own websites'
  ) THEN
    CREATE POLICY "Users can modify their own websites" 
      ON public.websites FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_websites_user_id ON public.websites(user_id);

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
  duration_minutes NUMERIC DEFAULT 0,
  date TEXT,
  created_at TEXT NOT NULL
);

ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'time_logs' AND policyname = 'Users can modify their own time_logs'
  ) THEN
    CREATE POLICY "Users can modify their own time_logs" 
      ON public.time_logs FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON public.time_logs(user_id);

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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'archived_items' AND policyname = 'Users can modify their own archived_items'
  ) THEN
    CREATE POLICY "Users can modify their own archived_items" 
      ON public.archived_items FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_archived_items_user_id ON public.archived_items(user_id);

-- Create Archive alias table/view
CREATE OR REPLACE VIEW public.archive AS SELECT * FROM public.archived_items;

-- 11. Create Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  date_time TEXT NOT NULL,
  snoozed_count NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TEXT NOT NULL
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Users can modify their own reminders'
  ) THEN
    CREATE POLICY "Users can modify their own reminders" 
      ON public.reminders FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);

-- 12. Create Profile Settings Table
CREATE TABLE IF NOT EXISTS public.profile_settings (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  company_name TEXT DEFAULT 'GrowInvicta',
  company_logo_url TEXT,
  personal_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  address TEXT,
  timezone TEXT,
  accent_color TEXT DEFAULT 'indigo',
  updated_at TEXT NOT NULL
);

ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profile_settings' AND policyname = 'Users can modify their own profile_settings'
  ) THEN
    CREATE POLICY "Users can modify their own profile_settings" 
      ON public.profile_settings FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users can modify their own audit_logs'
  ) THEN
    CREATE POLICY "Users can modify their own audit_logs" 
      ON public.audit_logs FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- 14. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  timeframe TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TEXT NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Users can modify their own reports'
  ) THEN
    CREATE POLICY "Users can modify their own reports" 
      ON public.reports FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

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

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'calendar' AND policyname = 'Users can modify their own calendar'
  ) THEN
    CREATE POLICY "Users can modify their own calendar" 
      ON public.calendar FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendar_user_id ON public.calendar(user_id);

-- Enable Realtime for all tables so subscription works instantaneously
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.websites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.archived_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar;
