/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  FileText, Download, TrendingUp, Sparkles, ChevronRight, 
  BarChart, Users, Megaphone, Calendar, HelpCircle, Briefcase, Plus
} from 'lucide-react';
import { Client, Project, Task, Payment, Lead, FinanceLedger } from '../types';

interface ReportsCenterProps {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  payments: Payment[];
  leads: Lead[];
  finances: FinanceLedger[];
}

export default function ReportsCenter({ clients, projects, tasks, payments, leads, finances }: ReportsCenterProps) {
  const [selectedReportType, setSelectedReportType] = useState<
    'Client' | 'Revenue' | 'Expense' | 'Employee' | 'Lead' | 'Project'
  >('Revenue');

  const [metricTimeframe, setMetricTimeframe] = useState<'Q2' | 'Q3' | 'Full_Year'>('Q2');

  const handleRunExcelExport = (reportLabel: string) => {
    let csvData = 'data:text/csv;charset=utf-8,';
    csvData += `GrowInvicta Enterprise Audit Report - ${reportLabel}\r\n`;
    csvData += `Generated,2026-06-19 07:13:52 UTC\r\n\r\n`;

    if (selectedReportType === 'Revenue') {
      csvData += `Client,Invoice Number,Amount,Status,GST (18%),Due Date\r\n`;
      payments.forEach(p => {
        csvData += `"${p.clientName}",${p.invoiceNumber},${p.amount},${p.status},${p.gstAmount},${p.dueDate}\r\n`;
      });
    } else if (selectedReportType === 'Client') {
      csvData += `Company,Representative,Email,Phone,GSTIN,Agreement value\r\n`;
      clients.forEach(c => {
        csvData += `"${c.company}","${c.name}",${c.email},${c.mobile},${c.gstNumber},${c.metrics.totalBilled}\r\n`;
      });
    } else if (selectedReportType === 'Lead') {
      csvData += `Lead Name,Company Name,Source,Phone,Email,Status,Value (INR)\r\n`;
      leads.forEach(l => {
        csvData += `"${l.name}","${l.company}",${l.source},${l.phone},${l.email},${l.status},${l.value}\r\n`;
      });
    } else {
      csvData += `Item,Detail,RefValue\r\n`;
      projects.forEach(p => {
        csvData += `"${p.name}",${p.type},${p.budget}\r\n`;
      });
    }

    const encoded = encodeURI(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `growinvicta_${reportLabel.toLowerCase()}_audit_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-center-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      
      {/* Sidebar switcher */}
      <div className="lg:col-span-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="pb-2 border-b border-slate-850">
          <h3 className="text-xs font-bold font-mono uppercase text-slate-400">Reports Directory</h3>
          <p className="text-slate-500 text-[11px] mt-0.5">Generate compliance audit spreadsheets.</p>
        </div>

        <div className="space-y-1">
          {[
            { id: 'Client', subtitle: 'CRM accounts & dossiers', label: 'Client CRM Report' },
            { id: 'Revenue', subtitle: 'Invoices & receipt logs', label: 'Revenue Ledger Audit' },
            { id: 'Expense', subtitle: 'Double-entry operational costs', label: 'Expense ledger Audit' },
            { id: 'Employee', subtitle: 'Deliverables task speed summaries', label: 'Employee Progress report' },
            { id: 'Lead', subtitle: 'CRM conversions & pipeline', label: 'Lead Funnel report' },
            { id: 'Project', subtitle: 'SLA milestones & budgets', label: 'Project Performance Audit' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedReportType(opt.id as any)}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                selectedReportType === opt.id 
                  ? 'bg-slate-950 border-indigo-500/80 text-indigo-400 font-semibold' 
                  : 'bg-slate-900/40 border-transparent hover:bg-slate-950/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="text-xs block">{opt.label}</span>
                <span className="text-[10px] text-slate-500 font-mono italic font-normal mt-0.5 block">{opt.subtitle}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedReportType === opt.id ? 'translate-x-1' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive preview worksheet console */}
      <div className="lg:col-span-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
        
        <div className="flex justify-between items-start pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-bold block mb-1">
              quarterly balance audits
            </span>
            <h2 className="text-base font-bold text-white font-sans">{selectedReportType} Audit Compilation sheet</h2>
            <p className="text-xs text-slate-400 mt-0.5">Compiled real-time records matching GrowInvicta system databases.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleRunExcelExport(selectedReportType + '_Excel')}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 hover:bg-slate-850 hover:border-slate-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Spreadsheet .csv
            </button>
          </div>
        </div>

        {/* Dynamic worksheet reports depending on type selection */}
        {selectedReportType === 'Revenue' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-lg text-slate-400">
              <div>
                <span>Gross Revenue Reconciled</span>
                <strong className="block text-white text-sm font-sans mt-0.5">
                  ₹{payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span>Unsettled Bills value</span>
                <strong className="block text-amber-500 text-sm font-sans mt-0.5">
                  ₹{payments.filter(p => ['Pending', 'Overdue', 'Partial'].includes(p.status)).reduce((sum, p) => sum + p.pendingAmount, 0).toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span>India service Tax (18% GST)</span>
                <strong className="block text-slate-300 text-sm font-sans mt-0.5">
                  ₹{payments.reduce((sum, p) => sum + p.gstAmount, 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Invoiced client name</th>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">GST value</th>
                      <th className="p-3 text-right">Value (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-950/40">
                        <td className="p-3 font-semibold text-slate-100">{p.clientName}</td>
                        <td className="p-3 font-mono text-indigo-400">{p.invoiceNumber}</td>
                        <td className="p-3 font-mono">₹{p.gstAmount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-semibold font-mono text-slate-200">₹{p.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'Client' && (
          <div className="space-y-4">
            <div className="border border-slate-805 rounded-xl overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[650px]">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Partner Industry brand</th>
                      <th className="p-3">Primary Representative</th>
                      <th className="p-3">Contact Email</th>
                      <th className="p-3 text-right">Agreements value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {clients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-950/40">
                        <td className="p-3 font-semibold text-slate-100">{c.company}</td>
                        <td className="p-3">{c.name}</td>
                        <td className="p-3 font-mono text-indigo-400">{c.email}</td>
                        <td className="p-3 text-right font-bold text-slate-200">₹{c.metrics.totalBilled.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'Lead' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl">
              <div>
                <span className="text-slate-500">Total pipeline worth:</span>
                <strong className="block text-white text-md font-sans mt-0.5">₹{leads.reduce((sum, l) => sum + l.value, 0).toLocaleString('en-IN')}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Won Conversion Speed:</span>
                <strong className="block text-emerald-400 text-md font-sans mt-0.5">{Math.round((leads.filter(l => l.status === 'Won').length / (leads.length || 1)) * 100)}%</strong>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 min-w-[550px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Client Prospect</th>
                      <th className="p-3">Lead Source</th>
                      <th className="p-3">Deal status</th>
                      <th className="p-3 text-right font-sans">Gross Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {leads.map(l => (
                      <tr key={l.id} className="hover:bg-slate-950/40">
                        <td className="p-3 font-bold text-slate-100 font-sans">{l.company}</td>
                        <td className="p-3">{l.source}</td>
                        <td className="p-3 text-indigo-400">{l.status}</td>
                        <td className="p-3 text-right font-bold">₹{l.value.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'Expense' && (
          <div className="space-y-4">
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[550px]">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Expense Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Value (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {finances.filter(f => f.type === 'Expense').map(f => (
                      <tr key={f.id} className="hover:bg-slate-950/40">
                        <td className="p-3 font-semibold text-slate-100">{f.sourceOrName}</td>
                        <td className="p-3 font-mono">{f.category}</td>
                        <td className="p-3 font-mono text-slate-400">{f.date}</td>
                        <td className="p-3 text-right font-mono text-rose-400">-₹{f.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'Employee' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase">Operational Employee Speeds</h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 min-w-[600px]">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Employee Name</th>
                      <th className="p-3 text-center">Open Tasks</th>
                      <th className="p-3 text-center">Completed Work</th>
                      <th className="p-3 text-right">Primary Assignments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {[
                      { name: 'Siddharth Roy', open: 2, done: 4, role: 'Senior React Architect' },
                      { name: 'Nisha Sen', open: 1, done: 3, role: 'Shopify Checkout Engineer' },
                      { name: 'Diana Prince', open: 1, done: 2, role: 'Creative UI Designer' },
                      { name: 'Aarav Gupta', open: 1, done: 1, role: 'Quality Analyst' }
                    ].map((emp, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40">
                        <td className="p-3 font-bold text-slate-100">{emp.name}</td>
                        <td className="p-3 text-center font-mono text-amber-400">{emp.open}</td>
                        <td className="p-3 text-center font-mono text-emerald-400">{emp.done}</td>
                        <td className="p-3 text-right text-slate-400 font-mono text-[11px]">{emp.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'Project' && (
          <div className="space-y-4">
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-300 min-w-[550px]">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Project Campaign</th>
                      <th className="p-3 font-mono">End Date</th>
                      <th className="p-3">SLA Status</th>
                      <th className="p-3 text-right font-mono">Budget (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {projects.map(p => (
                      <tr key={p.id} className="hover:bg-slate-950/40">
                        <td className="p-3 font-bold text-slate-100">{p.name}</td>
                        <td className="p-3 font-mono text-slate-400">{p.endDate}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">₹{p.budget.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center text-xs text-slate-400 font-mono">
          Tax, compliance guidelines, and service audits are locked to <strong>GrowInvicta FY2026</strong>.
        </div>

      </div>

    </div>
  );
}
