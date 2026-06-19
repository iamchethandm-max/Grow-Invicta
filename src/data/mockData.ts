/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Lead, Project, Task, Payment, FinanceLedger, Reminder, AuditLog, Website, TimeLog } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Ananya Sharma',
    company: 'Apex Retail Solutions',
    mobile: '9876543210',
    whatsapp: '9876543210',
    email: 'ananya@apexretail.in',
    address: 'Sector 62, Noida, UP, India',
    gstNumber: '09AAACA1234F1ZP',
    website: 'https://apexretail.in',
    notes: 'Key client for nationwide retail franchise development.',
    createdAt: '2026-01-15',
    status: 'Active',
    metrics: { projectsCount: 2, totalBilled: 1250000, pendingInvoice: 150000 },
    contracts: [
      { id: 'con_1', title: 'Omnichannel Web Development Agreement', value: 850000, date: '2026-01-20', status: 'Signed' },
      { id: 'con_2', title: 'SEO & Content Retainer (12 Months)', value: 400000, date: '2026-02-10', status: 'Signed' }
    ],
    timeline: [
      { id: 't_1', date: '2026-06-18', type: 'meeting', description: 'Monthly review of SEO rankings. Target keywords up by 40%.' },
      { id: 't_2', date: '2026-06-15', type: 'payment', description: 'Received payment of INR 350,000 for Milestone 2.' },
      { id: 't_3', date: '2026-06-01', type: 'project', description: 'Launched website beta on staging server for testing.' }
    ]
  },
  {
    id: 'c2',
    name: 'Marcus Vance',
    company: 'Vance Logistics Corp',
    mobile: '15550198273',
    whatsapp: '15550198273',
    email: 'm.vance@vancestrong.com',
    address: '452 Broadway, Tech District, New York, NY',
    gstNumber: 'Not Applicable',
    website: 'https://vancelogistics.com',
    notes: 'Requires highly-optimized corporate website + real-time delivery tracking integration.',
    createdAt: '2026-03-05',
    status: 'Active',
    metrics: { projectsCount: 1, totalBilled: 1800000, pendingInvoice: 450000 },
    contracts: [
      { id: 'con_3', title: 'Enterprise Portal Development Spec', value: 1800000, date: '2026-03-10', status: 'Signed' }
    ],
    timeline: [
      { id: 't_4', date: '2026-06-19', type: 'call', description: 'Call with Marcus to finalize shipment status API configurations.' },
      { id: 't_5', date: '2026-06-10', type: 'project', description: 'Integration of Google Maps Routes API completed.' }
    ]
  },
  {
    id: 'c3',
    name: 'Rajesh Mehta',
    company: 'Spice Route Hospitality',
    mobile: '9123456789',
    whatsapp: '9123456789',
    email: 'rajesh@spiceroute.co.in',
    address: 'Indiranagar, Bangalore, KA, India',
    gstNumber: '29BBBPH9876R1Z3',
    website: 'https://spiceroutegroup.com',
    notes: 'Premium chain of dining outlets request Shopify merch setups and custom reservation flow.',
    createdAt: '2026-04-12',
    status: 'Active',
    metrics: { projectsCount: 2, totalBilled: 950000, pendingInvoice: 0 },
    contracts: [
      { id: 'con_4', title: 'Shopify Store Customization', value: 350000, date: '2026-04-15', status: 'Signed' },
      { id: 'con_5', title: 'Social Media Launch & Ads Retainer', value: 600000, date: '2026-05-01', status: 'Signed' }
    ],
    timeline: [
      { id: 't_6', date: '2026-06-16', type: 'email', description: 'Sent high-fidelity UI design mocks for Shopify storefront.' }
    ]
  },
  {
    id: 'c4',
    name: 'Sarah Jenkins',
    company: 'Elysian Cosmetics Ltd',
    mobile: '442079460192',
    whatsapp: '442079460192',
    email: 'sarah@elysianbeauty.uk',
    address: 'Kensington High St, London, UK',
    gstNumber: 'GB123456789',
    website: 'https://elysianbeauty.uk',
    notes: 'Global brand launch campaign targeting modern sustainable products.',
    createdAt: '2026-05-20',
    status: 'Active',
    metrics: { projectsCount: 1, totalBilled: 1400000, pendingInvoice: 700000 },
    contracts: [
      { id: 'con_6', title: 'Branding & Comprehensive Digital Launch', value: 1400000, date: '2026-05-25', status: 'Signed' }
    ],
    timeline: [
      { id: 't_7', date: '2026-06-17', type: 'meeting', description: 'Logo assets and color system approved. Draft branding manual sent.' }
    ]
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead_1',
    name: 'Devendra Patel',
    company: 'Patel Agro Industries',
    phone: '7890123456',
    email: 'devendra@patelagro.com',
    source: 'Website',
    status: 'Proposal Sent',
    value: 650000,
    followUpDate: '2026-06-22',
    notes: 'Wants full custom agricultural commerce platform. Highly interested in inventory hooks.',
    createdAt: '2026-06-10'
  },
  {
    id: 'lead_2',
    name: 'Emily Watson',
    company: 'Stellar Tech Academy',
    phone: '16175550293',
    email: 'emily@stellartech.edu',
    source: 'LinkedIn',
    status: 'Negotiation',
    value: 1200000,
    followUpDate: '2026-06-21',
    notes: 'Discussed high-volume lead gen SEO campaign + website development. Budget approved.',
    createdAt: '2026-06-08'
  },
  {
    id: 'lead_3',
    name: 'Karan Malhotra',
    company: 'Malhotra Luxury Homes',
    phone: '9988776655',
    email: 'karan@malhotrahomes.com',
    source: 'Google Ads',
    status: 'Contacted',
    value: 450000,
    followUpDate: '2026-06-20',
    notes: 'Seeking premium interactive real estate portfolio. Demo sent on landing pages.',
    createdAt: '2026-06-14'
  },
  {
    id: 'lead_4',
    name: 'Robert Stark',
    company: 'Winterfell Brews',
    phone: '441314960012',
    email: 'rob@winterbrews.co.uk',
    source: 'Instagram',
    status: 'Follow Up',
    value: 280000,
    followUpDate: '2026-06-24',
    notes: 'Coffee brand requested Shopify optimization and influencer tracking dashboard template.',
    createdAt: '2026-06-15'
  },
  {
    id: 'lead_5',
    name: 'Aisha Rahman',
    company: 'Lumiere Studios',
    phone: '9880011223',
    email: 'aisha@lumierestudios.co',
    source: 'Referral',
    status: 'Won',
    value: 350000,
    followUpDate: '2026-06-18',
    notes: 'Reference by Apex Retail. Rebranded portfolio. Converted successfully!',
    createdAt: '2026-06-05'
  },
  {
    id: 'lead_6',
    name: 'Vikram Singh',
    company: 'Singh Auto Spares',
    phone: '9555122112',
    email: 'vikram@auto-spares.in',
    source: 'Direct Call',
    status: 'New',
    value: 500000,
    followUpDate: '2026-06-25',
    notes: 'Cold call following automated response. Catalog website request.',
    createdAt: '2026-06-19'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Apex Omnichannel Portal',
    clientName: 'Apex Retail Solutions',
    type: 'Website Development',
    startDate: '2026-02-01',
    endDate: '2026-07-15',
    budget: 850000,
    teamMembers: ['Siddharth Roy', 'Nisha Sen', 'Aarav Gupta'],
    priority: 'Critical',
    status: 'In Progress',
    progress: 75,
    milestones: [
      { id: 'm_1_1', title: 'Figma UI/UX Signoff', dueDate: '2026-02-25', completed: true },
      { id: 'm_1_2', title: 'React Frontend Development', dueDate: '2026-05-10', completed: true },
      { id: 'm_1_3', title: 'CMS & Inventory Integrations', dueDate: '2026-06-20', completed: false },
      { id: 'm_1_4', title: 'UAT & Final Production Deploy', dueDate: '2026-07-15', completed: false }
    ],
    comments: [
      { id: 'c_1_1', author: 'Siddharth Roy', role: 'Employee', text: 'Backend endpoints for stock reconciliation are responding under 40ms.', timestamp: '22 Hours Ago' },
      { id: 'c_1_2', author: 'Ananya Sharma', role: 'Client', text: 'Vibrant color schemes look fantastic. Please verify the invoice confirmation details.', timestamp: '1 Day Ago' }
    ]
  },
  {
    id: 'p2',
    name: 'Vance Portal & Fleet Maps',
    clientName: 'Vance Logistics Corp',
    type: 'Website Development',
    startDate: '2026-03-15',
    endDate: '2026-08-30',
    budget: 1800000,
    teamMembers: ['Siddharth Roy', 'Priya Das', 'Amit Kumar'],
    priority: 'High',
    status: 'In Progress',
    progress: 55,
    milestones: [
      { id: 'm_2_1', title: 'API Schema Definitions', dueDate: '2026-04-10', completed: true },
      { id: 'm_2_2', title: 'Google Maps platform sync', dueDate: '2026-06-05', completed: true },
      { id: 'm_2_3', title: 'Vehicle Telemetry simulator', dueDate: '2026-07-10', completed: false },
      { id: 'm_2_4', title: 'QA Dry Run', dueDate: '2026-08-15', completed: false }
    ],
    comments: [
      { id: 'c_2_1', author: 'Priya Das', role: 'Employee', text: 'Integrated Address Search with Autocomplete support.', timestamp: '3 Days Ago' }
    ]
  },
  {
    id: 'p3',
    name: 'Elysian Cosmetics Branding Suite',
    clientName: 'Elysian Cosmetics Ltd',
    type: 'Branding',
    startDate: '2026-06-01',
    endDate: '2026-07-30',
    budget: 1400000,
    teamMembers: ['Diana Prince', 'Lokesh Sharma'],
    priority: 'High',
    status: 'In Progress',
    progress: 30,
    milestones: [
      { id: 'm_3_1', title: 'Market Competitor Analysis', dueDate: '2026-06-12', completed: true },
      { id: 'm_3_2', title: 'Logo System Specs Draft', dueDate: '2026-06-30', completed: false },
      { id: 'm_3_3', title: 'Packaging Mockups Signoff', dueDate: '2026-07-15', completed: false }
    ],
    comments: []
  },
  {
    id: 'p4',
    name: 'Spice Route Shopify Launch',
    clientName: 'Spice Route Hospitality',
    type: 'Shopify Store',
    startDate: '2026-04-20',
    endDate: '2026-06-15',
    budget: 350000,
    teamMembers: ['Nisha Sen', 'Lokesh Sharma'],
    priority: 'Medium',
    status: 'Completed',
    progress: 100,
    milestones: [
      { id: 'm_4_1', title: 'Store Wireframes', dueDate: '2026-05-02', completed: true },
      { id: 'm_4_2', title: 'Shopify SDK Checkout Sync', dueDate: '2026-05-25', completed: true },
      { id: 'm_4_3', title: 'Store Handover', dueDate: '2026-06-15', completed: true }
    ],
    comments: [
      { id: 'c_4_1', author: 'Nisha Sen', role: 'Employee', text: 'Delivered client training on updating store inventories yesterday.', timestamp: '2 Days Ago' }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't_1',
    title: 'Finalize inventory APIs integration',
    description: 'Bind Salesforce Commerce Cloud stock points to central React app database client.',
    assignedTo: 'Siddharth Roy',
    project: 'Apex Omnichannel Portal',
    dueDate: '2026-06-20',
    priority: 'Critical',
    status: 'In Progress',
    createdAt: '2026-06-12'
  },
  {
    id: 't_2',
    title: 'Audit Google Maps billing quota caps',
    description: 'Ensure route APIs do not spike above standard thresholds in beta mock releases.',
    assignedTo: 'Priya Das',
    project: 'Vance Portal & Fleet Maps',
    dueDate: '2026-06-23',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-06-15'
  },
  {
    id: 't_3',
    title: 'Export Vector Logos for Packaging',
    description: 'Generate production ready svg/ai specs for Elysian Cosmetics primary items.',
    assignedTo: 'Diana Prince',
    project: 'Elysian Cosmetics Branding Suite',
    dueDate: '2026-06-21',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-06-16'
  },
  {
    id: 't_4',
    title: 'Set up Google Search Console verification',
    description: 'Verify metadata sitemaps for newly finished Spice Route storefront pages.',
    assignedTo: 'Nisha Sen',
    project: 'Spice Route Shopify Launch',
    dueDate: '2026-06-18',
    priority: 'Low',
    status: 'Completed',
    createdAt: '2026-06-12'
  },
  {
    id: 't_5',
    title: 'Resolve navigation overlap bug in mobile Safari',
    description: 'Bottom navigation tab container overlap on iPhone 15 screens.',
    assignedTo: 'Aarav Gupta',
    project: 'Apex Omnichannel Portal',
    dueDate: '2026-06-24',
    priority: 'High',
    status: 'Review',
    createdAt: '2026-06-17'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_1',
    clientName: 'Apex Retail Solutions',
    invoiceNumber: 'INV-2026-001',
    amount: 500000,
    paidAmount: 500000,
    pendingAmount: 0,
    paymentDate: '2026-02-15',
    dueDate: '2026-02-25',
    mode: 'Bank Transfer',
    status: 'Paid',
    gstAmount: 90000 // 18% standard India GST
  },
  {
    id: 'pay_2',
    clientName: 'Apex Retail Solutions',
    invoiceNumber: 'INV-2026-004',
    amount: 350000,
    paidAmount: 350000,
    pendingAmount: 0,
    paymentDate: '2026-06-15',
    dueDate: '2026-06-20',
    mode: 'UPI',
    status: 'Paid',
    gstAmount: 63000
  },
  {
    id: 'pay_3',
    clientName: 'Vance Logistics Corp',
    invoiceNumber: 'INV-2026-002',
    amount: 450000,
    paidAmount: 450000,
    pendingAmount: 0,
    paymentDate: '2026-03-12',
    dueDate: '2026-03-20',
    mode: 'Bank Transfer',
    status: 'Paid',
    gstAmount: 81000
  },
  {
    id: 'pay_4',
    clientName: 'Elysian Cosmetics Ltd',
    invoiceNumber: 'INV-2026-005',
    amount: 700000,
    paidAmount: 0,
    pendingAmount: 700000,
    paymentDate: '--',
    dueDate: '2026-06-28',
    mode: 'Bank Transfer',
    status: 'Pending',
    gstAmount: 126000
  },
  {
    id: 'pay_5',
    clientName: 'Spice Route Hospitality',
    invoiceNumber: 'INV-2026-003',
    amount: 350000,
    paidAmount: 350000,
    pendingAmount: 0,
    paymentDate: '2026-05-18',
    dueDate: '2026-05-20',
    mode: 'Credit Card',
    status: 'Paid',
    gstAmount: 63000
  },
  {
    id: 'pay_6',
    clientName: 'Apex Retail Solutions',
    invoiceNumber: 'INV-2026-006',
    amount: 150000,
    paidAmount: 50000,
    pendingAmount: 100000,
    paymentDate: '2026-06-10',
    dueDate: '2026-06-25',
    mode: 'Bank Transfer',
    status: 'Partial',
    gstAmount: 27000
  },
  {
    id: 'pay_7',
    clientName: 'Vance Logistics Corp',
    invoiceNumber: 'INV-2026-007',
    amount: 450000,
    paidAmount: 0,
    pendingAmount: 450000,
    paymentDate: '--',
    dueDate: '2026-06-15',
    mode: 'Bank Transfer',
    status: 'Overdue',
    gstAmount: 81000
  }
];

export const INITIAL_FINANCE_LETTERS: FinanceLedger[] = [
  { id: 'f_1', type: 'Income', sourceOrName: 'Apex Retail Inc', category: 'Website Projects', amount: 350000, date: '2026-06-15', notes: 'Invoice INV-2026-004 paid' },
  { id: 'f_2', type: 'Income', sourceOrName: 'Spice Route Retainer', category: 'Social Media', amount: 150000, date: '2026-06-10', notes: 'SEO optimization retainer billing' },
  { id: 'f_3', type: 'Expense', sourceOrName: 'TechHub Noida Office', category: 'Office Rent', amount: 120000, date: '2026-06-01', notes: 'Monthly rent plus electricity maintenance fee' },
  { id: 'f_4', type: 'Expense', sourceOrName: 'Vercel, AWS & OpenAI', category: 'Software Subscriptions', amount: 45000, date: '2026-06-03', notes: 'SaaS licenses for servers & deep analytics engines' },
  { id: 'f_5', type: 'Expense', sourceOrName: 'Hostinger Enterprise Node', category: 'Hosting', amount: 8500, date: '2026-06-05', notes: 'Annual client testing staging servers' },
  { id: 'f_6', type: 'Expense', sourceOrName: 'Employee Salaries June 1st Half', category: 'Salary', amount: 480000, date: '2026-06-10', notes: 'Salaries for core agency developers and designers' },
  { id: 'f_7', type: 'Income', sourceOrName: 'Affiliate Links Hubspot', category: 'Affiliate Income', amount: 12500, date: '2026-06-12', notes: 'Referral commission payouts' },
  { id: 'f_8', type: 'Expense', sourceOrName: 'Google Workspace Enterprise', category: 'Software Subscriptions', amount: 14000, date: '2026-06-07', notes: 'Corporate emails and Drive quotas expansion' },
  { id: 'f_9', type: 'Expense', sourceOrName: 'Delhi Auto Exhibition Trip', category: 'Travel', amount: 18000, date: '2026-06-14', notes: 'Business development networking travel costs' }
];

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 'rem_1', type: 'Payment Due', title: 'Verify Vance Logistics Invoice INV-2026-007 Overdue', dateTime: '2026-06-19T09:00', snoozedCount: 1, status: 'Active' },
  { id: 'rem_2', type: 'Client Follow-up', title: 'Call Devendra Patel regarding commerce proposal terms', dateTime: '2026-06-22T11:30', snoozedCount: 0, status: 'Active' },
  { id: 'rem_3', type: 'Project Deadline', title: 'Apex Omnichannel Portal Sandbox Deliverable due', dateTime: '2026-06-20T17:00', snoozedCount: 0, status: 'Active' },
  { id: 'rem_4', type: 'Task Due', title: 'Diana Prince - Export Vector packaging schemas', dateTime: '2026-06-21T18:00', snoozedCount: 0, status: 'Active' }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'a_1', timestamp: '2026-06-19 13:42:00', user: 'Chethan D. M.', role: 'Super Admin', action: 'Login Success', details: 'Authorized securely from IP 106.51.22.81 via JWT Session verification.' },
  { id: 'a_2', timestamp: '2026-06-19 11:20:15', user: 'Chethan D. M.', role: 'Super Admin', action: 'Invoice Issued', details: 'Created INV-2026-007 for Vance Logistics Corp worth INR 450,000.' },
  { id: 'a_3', timestamp: '2026-06-19 09:15:40', user: 'Aarav Gupta', role: 'Employee', action: 'Task Update', details: 'Status for "Resolve navigation overlap bug" changed to Review.' }
];

export const INITIAL_WEBSITES: Website[] = [
  {
    id: 'web_1',
    name: 'Apex Retail Hub',
    url: 'https://apexretail.in',
    hostingProvider: 'AWS Premium Containers',
    hostingPrice: 18500,
    hostingBillDate: '2026-06-25', // due in 6 days
    domainRegistrar: 'GoDaddy',
    domainPrice: 1250,
    domainBillDate: '2026-07-20',
    status: 'Active',
    notes: 'Primary retail catalog portal. Integrates internal client databases.',
    clientId: 'c1'
  },
  {
    id: 'web_2',
    name: 'Apex Retail Staging',
    url: 'https://staging.apexretail.in',
    hostingProvider: 'Hostinger Business VPS',
    hostingPrice: 4200,
    hostingBillDate: '2026-07-15',
    domainRegistrar: 'GoDaddy',
    domainPrice: 1250,
    domainBillDate: '2026-06-21', // Due in 2 days
    status: 'Active',
    notes: 'Developer staging subdomain for client testing.',
    clientId: 'c1'
  },
  {
    id: 'web_3',
    name: 'Vance Logistics Portal',
    url: 'https://vancelogistics.com',
    hostingProvider: 'Google Cloud Platform (GCE VM)',
    hostingPrice: 42000,
    hostingBillDate: '2026-10-14',
    domainRegistrar: 'Google Domains',
    domainPrice: 1500,
    domainBillDate: '2026-10-14',
    status: 'Active',
    notes: 'Heavy map traffic and delivery route calculations.',
    clientId: 'c2'
  },
  {
    id: 'web_4',
    name: 'Spice Route Corporate',
    url: 'https://spiceroutegroup.com',
    hostingProvider: 'Shopify Plus Engine',
    hostingPrice: 24000,
    hostingBillDate: '2026-06-23', // Due in 4 days
    domainRegistrar: 'Namecheap',
    domainPrice: 950,
    domainBillDate: '2027-05-18',
    status: 'Active',
    notes: 'Multi-outlet booking portal with automated food menu sync.',
    clientId: 'c3'
  },
  {
    id: 'web_5',
    name: 'Spice Route Bangalore Outlet',
    url: 'https://spicerouteblr.co.in',
    hostingProvider: 'Hostinger Shared Cloud',
    hostingPrice: 2900,
    hostingBillDate: '2026-06-18', // OVERDUE (yesterday)
    domainRegistrar: 'Namecheap',
    domainPrice: 950,
    domainBillDate: '2027-04-12',
    status: 'Active',
    notes: 'Local outlet website with contact forms & reviews ledger.',
    clientId: 'c3'
  },
  {
    id: 'web_6',
    name: 'Elysian Cosmetics Int.',
    url: 'https://elysianbeauty.uk',
    hostingProvider: 'Vercel Enterprise Edge',
    hostingPrice: 15000,
    hostingBillDate: '2026-11-20',
    domainRegistrar: 'Namecheap',
    domainPrice: 1100,
    domainBillDate: '2026-06-21', // Due in 2 days
    status: 'Active',
    notes: 'Vibrant visuals and global traffic. Requires robust edge caching.',
    clientId: 'c4'
  },
  {
    id: 'web_7',
    name: 'Elysian Labs UK Sandbox',
    url: 'https://labs.elysianbeauty.uk',
    hostingProvider: 'Vercel Starter Node',
    hostingPrice: 0,
    hostingBillDate: '2027-05-20',
    domainRegistrar: 'Namecheap',
    domainPrice: 1100,
    domainBillDate: '2026-12-10',
    status: 'Active',
    notes: 'Client QA testing playground.',
    clientId: 'c4'
  },
  {
    id: 'web_8',
    name: 'GrowInvicta Main Site',
    url: 'https://growinvicta.com',
    hostingProvider: 'Vercel Pro Node',
    hostingPrice: 2400,
    hostingBillDate: '2026-06-26', // Due in 7 days
    domainRegistrar: 'Google Cloud Domains',
    domainPrice: 1450,
    domainBillDate: '2027-01-15',
    status: 'Active',
    notes: 'Our primary agency website and business presentation hub.',
  },
  {
    id: 'web_9',
    name: 'Patel Agro E-Commerce',
    url: 'https://patelagro.com',
    hostingProvider: 'DigitalOcean Droplet Starter',
    hostingPrice: 6500,
    hostingBillDate: '2026-06-20', // Due in 1 day!
    domainRegistrar: 'Hostinger',
    domainPrice: 850,
    domainBillDate: '2026-06-20', // Due in 1 day!
    status: 'Under Maintenance',
    notes: 'Pending final launch signatures. Currently in staging build.',
  },
  {
    id: 'web_10',
    name: 'Stellar Tech LMS',
    url: 'https://stellartech.edu',
    hostingProvider: 'Heroku Professional Dyno',
    hostingPrice: 14000,
    hostingBillDate: '2026-07-28',
    domainRegistrar: 'GoDaddy Premium',
    domainPrice: 1800,
    domainBillDate: '2026-07-28',
    status: 'Active',
    notes: 'E-learning system platform database node.',
  },
  {
    id: 'web_11',
    name: 'Malhotra Luxury Portfolios',
    url: 'https://malhotrahomes.com',
    hostingProvider: 'Wix Premium Professional',
    hostingPrice: 5800,
    hostingBillDate: '2026-12-05',
    domainRegistrar: 'Namecheap Premium',
    domainPrice: 1200,
    domainBillDate: '2026-12-05',
    status: 'Active',
    notes: 'High resolution images of villas. Heavy CDN loads cached.',
  },
  {
    id: 'web_12',
    name: 'Winterfell Brews Store',
    url: 'https://winterbrews.co.uk',
    hostingProvider: 'Shopify Starter Cloud',
    hostingPrice: 3200,
    hostingBillDate: '2026-06-17', // OVERDUE by 2 days!
    domainRegistrar: 'Domain.com',
    domainPrice: 1550,
    domainBillDate: '2026-06-17', // OVERDUE by 2 days!
    status: 'Suspended',
    notes: 'Storefront frozen temporary until contract extension signed.',
  }
];

// Helper functions for state management with window.localStorage
export const getStateFromStorage = <T>(key: string, initialValue: T): T => {
  if (typeof window === 'undefined') return initialValue;
  try {
    const item = window.localStorage.getItem(`growinvicta_${key}`);
    return item ? JSON.parse(item) : initialValue;
  } catch (err) {
    console.error('Error reading localStorage', err);
    return initialValue;
  }
};

export const saveStateToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`growinvicta_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error('Error writing localStorage', err);
  }
};

export const INITIAL_TIME_LOGS: TimeLog[] = [
  {
    id: 'timelog_1',
    projectId: 'p1',
    projectName: 'Apex Retail Solutions Website',
    taskTitle: 'Database Audit',
    description: 'Construct core product catalogs structures and index relationships.',
    startTime: '2026-06-18T09:30:00.000Z',
    endTime: '2026-06-18T13:45:00.000Z',
    durationMinutes: 255, // 4h 15m
    date: '2026-06-18'
  },
  {
    id: 'timelog_2',
    projectId: 'p1',
    projectName: 'Apex Retail Solutions Website',
    taskTitle: 'CSS styling review',
    description: 'Polished responsive layout elements and added CSS animations using framer motion.',
    startTime: '2026-06-19T14:00:00.000Z',
    endTime: '2026-06-19T16:30:00.000Z',
    durationMinutes: 150, // 2h 30m
    date: '2026-06-19'
  },
  {
    id: 'timelog_3',
    projectId: 'p2',
    projectName: 'Vance Logistics Portal',
    taskTitle: 'API Gateway Hooks',
    description: 'Successfully resolved route mappings and custom latency logs in AWS controller api endpoints.',
    startTime: '2026-06-17T10:15:00.000Z',
    endTime: '2026-06-17T15:45:00.000Z',
    durationMinutes: 330, // 5h 30m
    date: '2026-06-17'
  }
];

