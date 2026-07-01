import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { DbService } from '../supabaseService';
import { 
  Sparkles, X, Send, Bot, User, Loader2, ArrowRightLeft, Check, 
  ChevronRight, AlertCircle, FileText, UserPlus, Briefcase, CheckSquare, Zap
} from 'lucide-react';
import { 
  Client, Lead, Project, Task, Payment, FinanceLedger, Reminder, AuditLog 
} from '../types';

interface AIAssistantProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  finances: FinanceLedger[];
  setFinances: React.Dispatch<React.SetStateAction<FinanceLedger[]>>;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  profileSettings: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  executedActions?: Array<{
    type: string;
    description: string;
    details: any;
  }>;
}

export default function AIAssistant({
  clients, setClients,
  leads, setLeads,
  projects, setProjects,
  tasks, setTasks,
  payments, setPayments,
  finances, setFinances,
  reminders, setReminders,
  auditLogs, setAuditLogs,
  profileSettings
}: AIAssistantProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your **GrowInvicta AI Assistant**. I have complete context of your agency workspace.\n\nYou can ask me complex questions about your business, or **command me to do things**! For example, try telling me:\n- *\"Create an invoice of INR 75,000 for Vance Logistics due on July 15th\"*\n- *\"Add a new client named Anjali Verma from Cosmic Devs with a 45,000 monthly retainer\"*\n- *\"Tell me which invoices are currently overdue and what is the total outstanding amount\"*",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef<boolean>(false);
  const prevUserEmailRef = useRef<string | null>(null);

  // Restore chat history on startup / user change and subscribe to Supabase Real-time Changes
  useEffect(() => {
    if (!user) {
      isLoadedRef.current = false;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: "Hello! I am your **GrowInvicta AI Assistant**. I have complete context of your agency workspace.\n\nYou can ask me complex questions about your business, or **command me to do things**! For example, try telling me:\n- *\"Create an invoice of INR 75,000 for Vance Logistics due on July 15th\"*\n- *\"Add a new client named Anjali Verma from Cosmic Devs with a 45,000 monthly retainer\"*\n- *\"Tell me which invoices are currently overdue and what is the total outstanding amount\"*",
          timestamp: new Date()
        }
      ]);
      return;
    }

    // 1. Immediately load from local cache for instant visual feedback
    const key = `growinvicta_chat_history_${user.email?.toLowerCase() || 'default'}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        }
      } catch (e) {
        console.warn('Local cache chat load warning:', e);
      }
    }

    let active = true;

    // 2. Fetch latest data from Supabase
    async function syncAndLoad() {
      try {
        const dbMsgs = await DbService.getAIMessages(user.id);
        if (active) {
          if (dbMsgs.length > 0) {
            setMessages(dbMsgs);
            localStorage.setItem(key, JSON.stringify(dbMsgs));
          } else {
            // Seed welcome in DB if empty
            const welcome = {
              id: 'welcome',
              role: 'assistant' as const,
              text: "Hello! I am your **GrowInvicta AI Assistant**. I have complete context of your agency workspace.\n\nYou can ask me complex questions about your business, or **command me to do things**! For example, try telling me:\n- *\"Create an invoice of INR 75,000 for Vance Logistics due on July 15th\"*\n- *\"Add a new client named Anjali Verma from Cosmic Devs with a 45,000 monthly retainer\"*\n- *\"Tell me which invoices are currently overdue and what is the total outstanding amount\"*",
              timestamp: new Date()
            };
            setMessages([welcome]);
            localStorage.setItem(key, JSON.stringify([welcome]));
            await DbService.addAIMessage(user.id, welcome);
          }
        }
      } catch (err) {
        console.warn('DB AI conversation fetch failed, using offline cache:', err);
      }
    }

    syncAndLoad();
    isLoadedRef.current = true;

    // 3. Real-time subscription to AI conversation changes on Supabase
    const channel = supabase
      .channel(`realtime-ai-conversation-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_conversations', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          console.log('[Realtime AI] Database change detected:', payload);
          try {
            const fresh = await DbService.getAIMessages(user.id);
            if (active) {
              setMessages(fresh);
              localStorage.setItem(key, JSON.stringify(fresh));
            }
          } catch (err) {
            console.warn('[Realtime AI] Failed to reload messages:', err);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Save chat history to local cache on change
  useEffect(() => {
    if (!user || !user.email) return;
    if (!isLoadedRef.current) return;

    const key = `growinvicta_chat_history_${user.email.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, user]);

  // Clean up storage when user signs out
  useEffect(() => {
    if (user) {
      prevUserEmailRef.current = user.email;
    } else {
      if (prevUserEmailRef.current) {
        const key = `growinvicta_chat_history_${prevUserEmailRef.current.toLowerCase()}`;
        localStorage.removeItem(key);
        prevUserEmailRef.current = null;
      }
    }
  }, [user]);

  const handleClearChat = async () => {
    if (!user || !user.email) return;
    const key = `growinvicta_chat_history_${user.email.toLowerCase()}`;
    localStorage.removeItem(key);
    
    // Database-first deletion
    try {
      await DbService.clearAIMessages(user.id);
    } catch (err) {
      console.warn('Failed to clear messages from DB:', err);
    }

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "Hello! I am your **GrowInvicta AI Assistant**. I have complete context of your agency workspace.\n\nYou can ask me complex questions about your business, or **command me to do things**! For example, try telling me:\n- *\"Create an invoice of INR 75,000 for Vance Logistics due on July 15th\"*\n- *\"Add a new client named Anjali Verma from Cosmic Devs with a 45,000 monthly retainer\"*\n- *\"Tell me which invoices are currently overdue and what is the total outstanding amount\"*",
        timestamp: new Date()
      }
    ]);
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Force scroll to bottom when opening the drawer
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const executeAction = async (action: { type: string; payload: any }) => {
    const { type, payload } = action;
    console.log('[AI Action Triggered]:', type, payload);

    let desc = '';
    
    if (type === 'CREATE_INVOICE') {
      const invoiceNum = `INV-AI-${Date.now().toString().slice(-4)}`;
      const baseAmount = Number(payload.amount) || 0;
      const gstAmount = payload.gstAmount !== undefined ? Number(payload.gstAmount) : Math.round(baseAmount * 0.18);
      const paymentObj: Payment = {
        id: `pay_ai_${Date.now()}`,
        clientName: payload.clientName || 'General Client',
        invoiceNumber: payload.invoiceNumber || invoiceNum,
        amount: baseAmount,
        paidAmount: payload.paidAmount || 0,
        pendingAmount: baseAmount - (payload.paidAmount || 0),
        paymentDate: (payload.paidAmount || 0) > 0 ? new Date().toISOString().split('T')[0] : '--',
        dueDate: payload.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mode: payload.mode || 'Bank Transfer',
        status: payload.status || 'Pending',
        gstAmount: gstAmount,
        serviceDetails: payload.serviceDetails || 'Design & Development Staging Build',
        serviceDescription: `Invoice dynamically generated by AI Assistant command request.`,
        ourName: profileSettings?.personalName || 'GrowInvicta Agency',
        ourPhone: profileSettings?.phone || '',
        ourEmail: profileSettings?.email || '',
        bankName: 'HDFC Bank Ltd',
        bankAccNo: '50200012345678',
        bankIfsc: 'HDFC0000123'
      };

      setPayments(prev => [...prev, paymentObj]);
      if (user) {
        DbService.upsertPayment(user.id, paymentObj).catch(err => console.warn('AI Action DB sync failed:', err));
      }

      desc = `Created invoice **${paymentObj.invoiceNumber}** for **${paymentObj.clientName}** worth **₹${(paymentObj.amount + paymentObj.gstAmount).toLocaleString('en-IN')}**.`;
      
      // Auto ledger syncer
      if (paymentObj.paidAmount > 0) {
        const financeObj = {
          id: `f_pay_ref_ai_${Date.now()}`,
          type: 'Income' as const,
          sourceOrName: `${paymentObj.clientName} - Ref ${paymentObj.invoiceNumber}`,
          category: 'Client Payments',
          amount: paymentObj.paidAmount,
          date: new Date().toISOString().split('T')[0],
          notes: `Ledger reference sync for AI invoice ${paymentObj.invoiceNumber}`
        };
        setFinances(prev => [financeObj, ...prev]);
        if (user) {
          DbService.upsertFinance(user.id, financeObj).catch(err => console.warn('AI Action DB sync failed:', err));
        }
      }

      // Reminder sync
      const reminderObj = {
        id: `rem_ai_${Date.now()}`,
        type: 'Payment Due' as const,
        title: `AI Invoice Outstanding: ${paymentObj.invoiceNumber} (${paymentObj.clientName})`,
        dateTime: `${paymentObj.dueDate}T09:00`,
        snoozedCount: 0,
        status: 'Active' as const
      };
      setReminders(prev => [reminderObj, ...prev]);
      if (user) {
        DbService.upsertReminder(user.id, reminderObj).catch(err => console.warn('AI Action DB sync failed:', err));
      }

      // Audit entry
      const auditLogObj = {
        id: `a_ai_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'AI Assistant',
        role: 'Super Admin' as const,
        action: 'Invoice Issued',
        details: `Issued invoice ${paymentObj.invoiceNumber} for ${paymentObj.clientName} (Amount: INR ${paymentObj.amount}).`
      };
      setAuditLogs(prev => [auditLogObj, ...prev]);
      // Note: audit logs are currently saved inside saveAuditLogs
      if (user) {
        DbService.saveAuditLogs(user.id, [auditLogObj, ...auditLogs]).catch(err => console.warn('AI Action DB sync failed:', err));
      }

    } else if (type === 'CREATE_CLIENT') {
      const clientObj: Client = {
        id: `c_ai_${Date.now()}`,
        name: payload.name || 'New AI Client',
        company: payload.company || 'AI Corporate Partner',
        mobile: payload.mobile || '',
        whatsapp: payload.mobile || '',
        email: payload.email || '',
        address: payload.address || 'Enterprise HQ',
        gstNumber: payload.gstNumber || '',
        website: payload.website || '',
        notes: payload.notes || 'Created via AI Assistant command.',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'Active',
        metrics: {
          projectsCount: 0,
          totalBilled: 0,
          pendingInvoice: 0,
          workStartDate: new Date().toISOString().split('T')[0],
          workType: payload.workType || 'one-time',
          monthlyRetainerAmount: payload.monthlyRetainerAmount || 0
        },
        contracts: [],
        timeline: [
          {
            id: `timeline_ai_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'project',
            description: 'Client profile initialized dynamically by GrowAI Assistant.'
          }
        ]
      };

      setClients(prev => [...prev, clientObj]);
      if (user) {
        DbService.upsertClient(user.id, clientObj).catch(err => console.warn('AI Action DB sync failed:', err));
      }

      desc = `Successfully added new active client **${clientObj.name}** representing **${clientObj.company}**.`;

      const auditLogObj = {
        id: `a_ai_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'AI Assistant',
        role: 'Super Admin' as const,
        action: 'Client Created',
        details: `Created new client profile for ${clientObj.name} representing ${clientObj.company}.`
      };
      setAuditLogs(prev => [auditLogObj, ...prev]);
      if (user) {
        DbService.saveAuditLogs(user.id, [auditLogObj, ...auditLogs]).catch(err => console.warn('AI Action DB sync failed:', err));
      }

    } else if (type === 'CREATE_LEAD') {
      const leadObj: Lead = {
        id: `l_ai_${Date.now()}`,
        name: payload.name || 'AI Sourced Lead',
        company: payload.company || 'SaaS Prospect',
        phone: payload.phone || '',
        email: payload.email || '',
        source: (payload.source && ['Website', 'Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'Referral', 'Direct Call'].includes(payload.source)) ? payload.source : 'Website',
        status: (payload.status && ['New', 'Contacted', 'Follow Up', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'].includes(payload.status)) ? payload.status : 'New',
        value: Number(payload.value) || 0,
        followUpDate: payload.followUpDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: payload.notes || 'Lead ingested by AI assistant instruction.',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setLeads(prev => [...prev, leadObj]);
      if (user) {
        DbService.upsertLead(user.id, leadObj).catch(err => console.warn('AI Action DB sync failed:', err));
      }

      desc = `Successfully registered high-intent lead **${leadObj.name}** (**${leadObj.company}**) valued at **₹${leadObj.value.toLocaleString('en-IN')}**.`;

      const auditLogObj = {
        id: `a_ai_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'AI Assistant',
        role: 'Super Admin' as const,
        action: 'Lead Created',
        details: `Ingested sales opportunity lead for ${leadObj.name} (${leadObj.company}).`
      };
      setAuditLogs(prev => [auditLogObj, ...prev]);
      if (user) {
        DbService.saveAuditLogs(user.id, [auditLogObj, ...auditLogs]).catch(err => console.warn('AI Action DB sync failed:', err));
      }

    } else if (type === 'CREATE_PROJECT') {
      const projectObj: Project = {
        id: `p_ai_${Date.now()}`,
        name: payload.title || payload.name || 'AI Sourced Development Node',
        clientName: payload.clientName || 'General Client',
        budget: Number(payload.value) || Number(payload.budget) || 150000,
        type: (payload.type && ['Website Development', 'Shopify Store', 'SEO', 'Social Media Management', 'Google Ads', 'Branding', 'Graphic Design'].includes(payload.type)) ? payload.type : 'Website Development',
        status: (payload.status && ['Not Started', 'In Progress', 'On Hold', 'Completed'].includes(payload.status)) ? payload.status : 'Not Started',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        progress: 0,
        milestones: [],
        comments: [],
        teamMembers: []
      };

      setProjects(prev => [...prev, projectObj]);
      if (user) {
        DbService.upsertProject(user.id, projectObj).catch(err => console.warn('AI Action DB sync failed:', err));
      }

      desc = `Successfully launched project **${projectObj.name}** for client **${projectObj.clientName}** valued at **₹${projectObj.budget.toLocaleString('en-IN')}**.`;

      const auditLogObj = {
        id: `a_ai_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'AI Assistant',
        role: 'Super Admin' as const,
        action: 'Project Sourced',
        details: `Launched project node "${projectObj.name}" for client ${projectObj.clientName}.`
      };
      setAuditLogs(prev => [auditLogObj, ...prev]);
      if (user) {
        DbService.saveAuditLogs(user.id, [auditLogObj, ...auditLogs]).catch(err => console.warn('AI Action DB sync failed:', err));
      }

    } else if (type === 'CREATE_TASK') {
      const taskObj: Task = {
        id: `t_ai_${Date.now()}`,
        title: payload.title || 'AI Task Assignment',
        description: payload.description || 'Deliverable identified by AI audit.',
        assignedTo: payload.assignedTo || 'Chethan D. M.',
        project: payload.project || 'General',
        dueDate: payload.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: payload.priority || 'Medium',
        status: payload.status || 'Pending',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setTasks(prev => [...prev, taskObj]);
      if (user) {
        DbService.upsertTask(user.id, taskObj).catch(err => console.warn('AI Action DB sync failed:', err));
      }

      desc = `Assigned task **"${taskObj.title}"** to **${taskObj.assignedTo}** for project **${taskObj.project}**.`;

      const auditLogObj = {
        id: `a_ai_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'AI Assistant',
        role: 'Super Admin' as const,
        action: 'Task Assigned',
        details: `Created task "${taskObj.title}" assigned to ${taskObj.assignedTo}.`
      };
      setAuditLogs(prev => [auditLogObj, ...prev]);
      if (user) {
        DbService.saveAuditLogs(user.id, [auditLogObj, ...auditLogs]).catch(err => console.warn('AI Action DB sync failed:', err));
      }
    }

    return { type, description: desc, details: payload };
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (user) {
      DbService.addAIMessage(user.id, userMsg).catch(err => console.warn('Failed to save AI user message:', err));
    }
    setInput('');
    setIsLoading(true);

    try {
      // Form context payload for AI analysis
      const appStateContext = {
        clients: clients.map(c => ({ id: c.id, name: c.name, company: c.company, status: c.status, workType: c.metrics?.workType, monthlyRetainerAmount: c.metrics?.monthlyRetainerAmount })),
        leads: leads.map(l => ({ id: l.id, name: l.name, company: l.company, status: l.status, value: l.value })),
        projects: projects.map(p => ({ id: p.id, name: p.name, clientName: p.clientName, budget: p.budget, status: p.status })),
        tasks: tasks.map(t => ({ id: t.id, title: t.title, assignedTo: t.assignedTo, project: t.project, priority: t.priority, status: t.status, dueDate: t.dueDate })),
        payments: payments.map(p => ({ id: p.id, clientName: p.clientName, invoiceNumber: p.invoiceNumber, amount: p.amount, paidAmount: p.paidAmount, pendingAmount: p.pendingAmount, status: p.status, dueDate: p.dueDate, autoGenerated: p.autoGenerated }))
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          context: appStateContext,
          chatHistory: messages.slice(-10).map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!res.ok) {
        let errMsg = 'Failed to fetch AI response';
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      // Execute any actions returned by AI
      const executedList: any[] = [];
      if (data.actions && Array.isArray(data.actions)) {
        for (const act of data.actions) {
          const outcome = await executeAction(act);
          if (outcome) executedList.push(outcome);
        }
      }

      const botMsg: Message = {
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        text: data.text || "I have received your request.",
        timestamp: new Date(),
        executedActions: executedList.length > 0 ? executedList : undefined
      };

      setMessages(prev => [...prev, botMsg]);
      if (user) {
        DbService.addAIMessage(user.id, botMsg).catch(err => console.warn('Failed to save AI bot message:', err));
      }
    } catch (err: any) {
      console.error('[AI assistant error]:', err);
      const errMsg: Message = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Error communicating with AI Assistant**: ${err.message || 'Please verify your API key and internet connection.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
      if (user) {
        DbService.addAIMessage(user.id, errMsg).catch(e => console.warn('Failed to save AI error message:', e));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "📊 Analyze Outstanding Bills", text: "Give me an audit of outstanding invoices, total pending amount, and list which clients owe us money." },
    { label: "🧾 Create Vance Invoice", text: "Create a pending invoice of INR 65,000 for Vance Logistics due on July 25, 2026." },
    { label: "📋 Project Status Summary", text: "Give me a quick breakdown of all active projects, their completion statuses, and any delayed tasks." },
    { label: "⚠️ What's due this week?", text: "What tasks and invoice deadlines are due this week?" }
  ];

  return (
    <>
      {/* Slide-out Chat Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end font-sans">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                    GrowAI Assistant
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Workspace Intel & Automation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 1 && (
                  <button 
                    onClick={handleClearChat}
                    className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 hover:border-rose-950/50 rounded-md transition-all cursor-pointer"
                    title="Clear Chat History"
                  >
                    Clear Chat
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
              {messages.map((msg) => {
                const isBot = msg.role === 'assistant';
                return (
                  <div key={msg.id} className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
                    {/* Avatar Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                      isBot 
                        ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Message body */}
                    <div className="space-y-2 max-w-[80%]">
                      <div className={`p-3 rounded-xl text-[12.5px] leading-relaxed shadow-sm ${
                        isBot 
                          ? 'bg-slate-950 border border-slate-800 text-slate-300' 
                          : 'bg-indigo-600 text-white font-medium'
                      }`}>
                        {/* Split text by simple bold notations for dynamic formatting */}
                        <div className="whitespace-pre-wrap">
                          {msg.text.split('\n').map((paragraph, pIdx) => (
                            <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
                              {paragraph.split('**').map((chunk, cIdx) => {
                                if (cIdx % 2 === 1) {
                                  return <strong key={cIdx} className="text-white font-bold">{chunk}</strong>;
                                }
                                return chunk;
                              })}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Executed Actions (If any) */}
                      {msg.executedActions && (
                        <div className="border border-emerald-500/20 bg-emerald-950/20 p-2.5 rounded-lg space-y-1.5">
                          <span className="text-[9.5px] uppercase font-mono text-emerald-400 font-black tracking-wider flex items-center gap-1">
                            <Zap className="w-3 h-3 animate-bounce" /> Action Executed Successfully:
                          </span>
                          {msg.executedActions.map((act, idx) => (
                            <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-normal">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <div className="whitespace-pre-wrap">
                                {act.description.split('**').map((chunk: string, cIdx: number) => {
                                  if (cIdx % 2 === 1) {
                                    return <strong key={cIdx} className="text-white font-semibold">{chunk}</strong>;
                                  }
                                  return chunk;
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bot Loading State */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 flex items-center gap-2 shadow-sm font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    AI Assistant processing commands & reports...
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Recommendation Chips */}
            {messages.length === 1 && !isLoading && (
              <div className="p-3 border-t border-slate-800 bg-slate-950/30">
                <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase block mb-1.5">Quick Actions Recommendation</span>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.text)}
                      className="text-left w-full text-[11px] font-mono p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span>{chip.label}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Form Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask GrowAI, or command 'create an invoice...'"
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg p-2.5 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
