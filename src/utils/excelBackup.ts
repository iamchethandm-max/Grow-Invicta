import * as XLSX from 'xlsx';
import { Client, Lead, Project, Task, Payment, Website, TimeLog } from '../types';

interface BackupData {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  tasks: Task[];
  payments: Payment[];
  websites: Website[];
  timeLogs: TimeLog[];
}

export function triggerExcelBackupDownload(data: BackupData) {
  // 1. Pack Clients Sheet Rows
  const clientRows = data.clients.map(c => ({
    'ID': c.id,
    'Company': c.company,
    'Client Representative': c.name,
    'Email Address': c.email,
    'Mobile Contact Number': c.mobile,
    'GST Invoice registration': c.gstNumber,
    'Web URL Domain': c.website,
    'SLA Status State': c.status,
    'Total Projects Active': c.metrics?.projectsCount || 0,
    'Total Billing Incurred': c.metrics?.totalBilled || 0,
    'Pending Invoices': c.metrics?.pendingInvoice || 0,
    'Client Specific Notes': c.notes,
    'Created On': c.createdAt
  }));

  // 2. Pack Leads Sheet Rows
  const leadRows = data.leads.map(l => ({
    'ID': l.id,
    'Company Target': l.company,
    'Lead Rep Name': l.name,
    'Phone Contact': l.phone,
    'Email address': l.email,
    'Inflow Source': l.source,
    'Leads Status': l.status,
    'Assessed Pipeline Value': l.value,
    'Follow up Date': l.followUpDate,
    'Operational Notes': l.notes,
    'Acquired On': l.createdAt
  }));

  // 3. Pack Projects (Trello Kanban) Rows
  const projectRows = data.projects.map(p => ({
    'ID': p.id,
    'Card / Project Name': p.name,
    'Client Owner': p.clientName,
    'Campaign Category': p.type,
    'Planned Start Date': p.startDate,
    'Launch Deadline': p.endDate,
    'Assigned Team Members': p.teamMembers.join(', '),
    'Campaign Status List': p.status,
    'Progress Percentage': `${p.progress}%`,
    'Allocated Budget': p.budget,
    'Total Milestones Deliverable': p.milestones?.length || 0,
    'Completed Checkpoints': p.milestones?.filter(m => m.completed).length || 0
  }));

  // 4. Pack Tasks Sheet Rows
  const taskRows = data.tasks.map(t => ({
    'ID': t.id,
    'Task Name info': t.title,
    'Detailed Description': t.description,
    'Project Association': t.project,
    'Assigned To Agent': t.assignedTo,
    'SLA Due Date': t.dueDate,
    'Urgency Level': t.priority,
    'Sprint State': t.status,
    'Created On': t.createdAt
  }));

  // 5. Pack Payments & Invoices Rows
  const paymentRows = data.payments.map(p => ({
    'ID': p.id,
    'Client Entity': p.clientName,
    'Billing Invoice No': p.invoiceNumber,
    'Target Budget Amount': p.amount,
    'Paid Amount Cashflows': p.paidAmount,
    'Outstanding Pending Amount': p.pendingAmount,
    'Applicable GST Slabs': p.gstAmount,
    'Launch Date Paid': p.paymentDate,
    'Payment Due Date': p.dueDate,
    'Payment Mode Used': p.mode,
    'Fulfillment State': p.status
  }));

  // 6. Pack Websites Rows
  const websiteRows = data.websites.map(w => ({
    'ID': w.id,
    'Website URL Label': w.name,
    'Staging URL': w.url,
    'Hosting Node Provider': w.hostingProvider,
    'Hosting Subscription Price': w.hostingPrice,
    'Hosting Bill Date Due': w.hostingBillDate,
    'DNS Domain Registrar': w.domainRegistrar,
    'Domain Subscription Price': w.domainPrice,
    'Domain Bill Date Due': w.domainBillDate,
    'Service Status': w.status,
    'Web System Notes': w.notes
  }));

  // 7. Pack Clockify Time Logs Rows
  const timeLogRows = data.timeLogs.map(log => ({
    'ID': log.id,
    'Project Name': log.projectName,
    'Assigned Task Ticket': log.taskTitle,
    'Worked Details': log.description,
    'Tracked Minutes Count': log.durationMinutes,
    'Calculated Hours Decimal': parseFloat((log.durationMinutes / 60).toFixed(2)),
    'Activity Date': log.date,
    'Recorded Start Date': log.startTime,
    'Recorded End Date': log.endTime
  }));

  // --- BUILD MULTI-SHEET WORKBOOK ---
  const workbook = XLSX.utils.book_new();

  const sheet1 = XLSX.utils.json_to_sheet(clientRows);
  const sheet2 = XLSX.utils.json_to_sheet(leadRows);
  const sheet3 = XLSX.utils.json_to_sheet(projectRows);
  const sheet4 = XLSX.utils.json_to_sheet(taskRows);
  const sheet5 = XLSX.utils.json_to_sheet(paymentRows);
  const sheet6 = XLSX.utils.json_to_sheet(websiteRows);
  const sheet7 = XLSX.utils.json_to_sheet(timeLogRows);

  XLSX.utils.book_append_sheet(workbook, sheet1, "Clients CRM Matrix");
  XLSX.utils.book_append_sheet(workbook, sheet2, "Prospective CRM Leads");
  XLSX.utils.book_append_sheet(workbook, sheet3, "Projects Trello Kanban");
  XLSX.utils.book_append_sheet(workbook, sheet4, "Sprint Tasks list");
  XLSX.utils.book_append_sheet(workbook, sheet5, "Payments & Invoices");
  XLSX.utils.book_append_sheet(workbook, sheet6, "Configured Web Portals");
  XLSX.utils.book_append_sheet(workbook, sheet7, "Clockify Time Logs");

  // Generate File Output
  const timestampStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `GrowInvicta_Daily_Backup_${timestampStr}.xlsx`);
}
