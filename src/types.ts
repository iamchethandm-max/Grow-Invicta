/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Super Admin' | 'Manager' | 'Employee';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  gstNumber: string;
  website: string;
  notes: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
  metrics: {
    projectsCount: number;
    totalBilled: number;
    pendingInvoice: number;
  };
  contracts: Array<{
    id: string;
    title: string;
    value: number;
    date: string;
    status: 'Signed' | 'Draft' | 'Expired';
  }>;
  timeline: Array<{
    id: string;
    date: string;
    type: 'call' | 'email' | 'meeting' | 'payment' | 'project';
    description: string;
  }>;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: 'Website' | 'Facebook' | 'Instagram' | 'LinkedIn' | 'Google Ads' | 'Referral' | 'Direct Call';
  status: 'New' | 'Contacted' | 'Follow Up' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  value: number;
  followUpDate: string;
  notes: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  type: 'Website Development' | 'Shopify Store' | 'SEO' | 'Social Media Management' | 'Google Ads' | 'Branding' | 'Graphic Design';
  startDate: string;
  endDate: string;
  budget: number;
  teamMembers: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
  progress: number; // percentage
  milestones: Array<{
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }>;
  comments: Array<{
    id: string;
    author: string;
    role: string;
    text: string;
    timestamp: string;
  }>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  project: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Review' | 'Completed';
  createdAt: string;
}

export interface Payment {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentDate: string;
  dueDate: string;
  mode: 'UPI' | 'Bank Transfer' | 'Cash' | 'Credit Card';
  status: 'Paid' | 'Partial' | 'Overdue' | 'Pending';
  gstAmount: number;
}

export interface FinanceLedger {
  id: string;
  type: 'Income' | 'Expense';
  sourceOrName: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
}

export interface Reminder {
  id: string;
  type: 'Client Follow-up' | 'Payment Due' | 'Project Deadline' | 'Task Due' | 'Personal Reminder';
  title: string;
  dateTime: string;
  snoozedCount: number;
  status: 'Active' | 'Dismissed';
}

export interface Website {
  id: string;
  name: string;
  url: string;
  hostingProvider: string;
  hostingPrice: number;
  hostingBillDate: string; // "YYYY-MM-DD"
  domainRegistrar: string;
  domainPrice: number;
  domainBillDate: string; // "YYYY-MM-DD"
  status: 'Active' | 'Under Maintenance' | 'Suspended';
  notes: string;
  clientId?: string; // Links to Client CRM
}

export interface TimeLog {
  id: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
  description: string;
  startTime: string; // ISO string or time string
  endTime: string;   // ISO string or time string
  durationMinutes: number;
  date: string; // YYYY-MM-DD
}

export interface ProfileSettings {
  companyName: string;
  companyLogoUrl: string; // Preset or Uploaded Base64
  personalName: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  timezone: string;
  accentColor: string;
}

