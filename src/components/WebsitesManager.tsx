/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Globe, ExternalLink, AlertTriangle, Calendar, Plus, Search, 
  Edit, Trash2, Filter, IndianRupee, Info, CalendarClock, Sparkles, 
  User, Server, CheckCircle2, X, Activity, CreditCard, Upload, FileSpreadsheet, AlertCircle, Check, FileText
} from 'lucide-react';
import { Website, Client } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { formatIndianDate } from '../utils/dateUtils';


interface WebsitesManagerProps {
  websites: Website[];
  clients: Client[];
  onAddWebsite: (newTask: Website) => void;
  onEditWebsite: (updatedTask: Website) => void;
  onDeleteWebsite: (id: string) => void;
  onAuditLog: (action: string, details: string) => void;
}

export default function WebsitesManager({ 
  websites, 
  clients, 
  onAddWebsite, 
  onEditWebsite, 
  onDeleteWebsite,
  onAuditLog
}: WebsitesManagerProps) {
  
  // Current anchor date is 2026-06-19
  const CURRENT_DATE_STR = '2026-06-19';
  const CURRENT_DATE = new Date(CURRENT_DATE_STR);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [billingFilter, setBillingFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [websiteToDelete, setWebsiteToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form Field States
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formHostingProvider, setFormHostingProvider] = useState('');
  const [formHostingPrice, setFormHostingPrice] = useState(0);
  const [formHostingBillDate, setFormHostingBillDate] = useState('2026-06-25');
  const [formDomainRegistrar, setFormDomainRegistrar] = useState('');
  const [formDomainPrice, setFormDomainPrice] = useState(0);
  const [formDomainBillDate, setFormDomainBillDate] = useState('2026-06-25');
  const [formStatus, setFormStatus] = useState<Website['status']>('Active');
  const [formNotes, setFormNotes] = useState('');
  const [formClientId, setFormClientId] = useState('');

  // Smart CSV Import States
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [previewWebsites, setPreviewWebsites] = useState<any[]>([]);
  const [mappedColumns, setMappedColumns] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV parsing logic that accommodates custom delimiters & escapes
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const firstLine = cleanText.split('\n')[0] || '';
    const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') ? ';' : ',');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(currentValue.trim());
        currentValue = '';
      } else if (char === '\n' && !inQuotes) {
        row.push(currentValue.trim());
        lines.push(row);
        row = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    if (currentValue || row.length > 0) {
      row.push(currentValue.trim());
      lines.push(row);
    }

    return lines.filter(r => r.length > 0 && r.some(val => val !== ''));
  };

  // Heuristically find best column matching with various terms
  const findBestColumnIndex = (headers: string[], matchers: string[]): number => {
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (matchers.some(m => {
        const cleanedM = m.toLowerCase().replace(/[^a-z0-9]/g, '');
        return h === cleanedM || h.includes(cleanedM);
      })) {
        return i;
      }
    }
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase();
      if (matchers.some(m => h.includes(m.toLowerCase()))) {
        return i;
      }
    }
    return -1;
  };

  // Read the CSV and process the fields using loose mapping heuristics
  const processImportCSV = (rawText: string) => {
    try {
      setImportError(null);
      setImportSuccessCount(null);
      const rows = parseCSV(rawText);
      if (rows.length < 2) {
        setImportError("The CSV file appears empty or lacks a header row.");
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      const matchersMap: Record<string, string[]> = {
        name: ['name', 'title', 'site', 'website', 'app', 'project', 'label', 'websitename', 'identity'],
        url: ['url', 'link', 'domain', 'address', 'href', 'siteurl', 'websiteurl', 'hosturl'],
        hostingProvider: ['host', 'hosting', 'provider', 'server', 'cloud', 'hostingprovider', 'hoster'],
        hostingPrice: ['hostingprice', 'hostprice', 'hostingcost', 'hostingfee', 'hostingamount', 'servercost', 'serverprice'],
        hostingBillDate: ['hostingbill', 'hostingdate', 'hostingdue', 'hostdate', 'hostbill', 'hostbilldate', 'hostdue', 'hostingrenewal'],
        domainRegistrar: ['registrar', 'domainregistrar', 'godaddy', 'namecheap', 'domainprovider', 'registry'],
        domainPrice: ['domainprice', 'domaincost', 'domainfee', 'domainamount', 'regprice', 'registrarprice', 'domainrenewalcost'],
        domainBillDate: ['domainbill', 'domaindate', 'domaindue', 'registrardate', 'domainbilldate', 'domaindue', 'domainrenewal'],
        notes: ['note', 'notes', 'desc', 'description', 'comment', 'info', 'credential', 'credentials', 'detail', 'details', 'about', 'remarks'],
        status: ['status', 'active', 'state', 'condition'],
        clientName: ['client', 'owner', 'customer', 'contact', 'user', 'clientname', 'clientname', 'company', 'firm']
      };

      const fieldToColumnIndex: Record<string, number> = {};
      const actualMappings: Record<string, string> = {};

      Object.entries(matchersMap).forEach(([field, matchers]) => {
        const idx = findBestColumnIndex(headers, matchers);
        fieldToColumnIndex[field] = idx;
        if (idx !== -1) {
          actualMappings[field] = headers[idx];
        }
      });

      // We need at least 'name' or 'url' to be mapped to create a website entry!
      if (fieldToColumnIndex['name'] === -1 && fieldToColumnIndex['url'] === -1) {
        setImportError("Could not automatically identify 'name' or 'url' columns in your file. Please ensure your CSV has column headers.");
        return;
      }

      setMappedColumns(actualMappings);

      const items: any[] = [];
      dataRows.forEach((row, idx) => {
        const getValue = (field: string, defaultValue: any = '') => {
          const colIdx = fieldToColumnIndex[field];
          if (colIdx !== undefined && colIdx !== -1 && row[colIdx] !== undefined) {
            return row[colIdx].trim();
          }
          return defaultValue;
        };

        let rawName = getValue('name');
        let rawUrl = getValue('url');

        // Fallback names/urls
        if (!rawName && rawUrl) {
          try {
            const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
            const urlObj = new URL(cleanUrl);
            rawName = urlObj.hostname.replace('www.', '');
          } catch {
            rawName = rawUrl;
          }
        }
        if (!rawUrl && rawName) {
          rawUrl = `https://${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        }

        if (!rawName) return;

        const rawHostingProvider = getValue('hostingProvider', 'Hostinger Share Node');
        const rawHostingPrice = parseFloat(getValue('hostingPrice', '0').replace(/[^0-9.]/g, '')) || 0;
        const rawHostingBillDate = getValue('hostingBillDate', '2027-06-25');
        const rawDomainRegistrar = getValue('domainRegistrar', 'Namecheap');
        const rawDomainPrice = parseFloat(getValue('domainPrice', '0').replace(/[^0-9.]/g, '')) || 0;
        const rawDomainBillDate = getValue('domainBillDate', '2027-06-25');
        const rawNotes = getValue('notes', '');
        const clientNameField = getValue('clientName', '');

        let matchedClientId = '';
        if (clientNameField) {
          const matchedClient = clients.find(c => 
            c.name.toLowerCase().includes(clientNameField.toLowerCase()) || 
            c.company.toLowerCase().includes(clientNameField.toLowerCase())
          );
          if (matchedClient) {
            matchedClientId = matchedClient.id;
          }
        }

        let parsedStatus: Website['status'] = 'Active';
        const rawStatus = getValue('status', 'Active').toLowerCase();
        if (rawStatus.includes('maintenance')) {
          parsedStatus = 'Under Maintenance';
        } else if (rawStatus.includes('inactive') || rawStatus === 'off') {
          parsedStatus = 'Inactive';
        } else if (rawStatus.includes('suspended')) {
          parsedStatus = 'Suspended';
        }

        items.push({
          id: `web_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
          name: rawName,
          url: rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`,
          hostingProvider: rawHostingProvider,
          hostingPrice: isNaN(rawHostingPrice) ? 0 : rawHostingPrice,
          hostingBillDate: rawHostingBillDate,
          domainRegistrar: rawDomainRegistrar,
          domainPrice: isNaN(rawDomainPrice) ? 0 : rawDomainPrice,
          domainBillDate: rawDomainBillDate,
          status: parsedStatus,
          notes: rawNotes,
          clientId: matchedClientId || undefined,
          clientNameField: clientNameField || undefined
        });
      });

      if (items.length === 0) {
        setImportError("No valid rows containing website data were found in the file.");
      } else {
        setPreviewWebsites(items);
      }
    } catch (e: any) {
      setImportError(`Failed to parse CSV file: ${e.message}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImportFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processImportCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processImportCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteImport = () => {
    if (previewWebsites.length === 0) return;

    previewWebsites.forEach(web => {
      // Create clean website item matching the exact properties
      const cleanedWeb: Website = {
        id: web.id,
        name: web.name,
        url: web.url,
        hostingProvider: web.hostingProvider,
        hostingPrice: web.hostingPrice,
        hostingBillDate: web.hostingBillDate,
        domainRegistrar: web.domainRegistrar,
        domainPrice: web.domainPrice,
        domainBillDate: web.domainBillDate,
        status: web.status,
        notes: web.notes,
        clientId: web.clientId
      };
      onAddWebsite(cleanedWeb);
    });

    onAuditLog('Websites Smart Imported', `Successfully imported ${previewWebsites.length} website monitors from CSV file.`);
    setImportSuccessCount(previewWebsites.length);
    setPreviewWebsites([]);
    setImportFileName('');
    setTimeout(() => {
      setShowImportPanel(false);
      setImportSuccessCount(null);
    }, 4000);
  };

  // Helper calculation for due days remainder relative to anchor date
  const getDaysDiff = (dateStr: string) => {
    if (!dateStr) return 999;
    const target = new Date(dateStr);
    const diffTime = target.getTime() - CURRENT_DATE.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to test if a renewal alert is urgent
  const getBillingStatusType = (hostingDate: string, domainDate: string) => {
    const hostDiff = getDaysDiff(hostingDate);
    const domainDiff = getDaysDiff(domainDate);

    if (hostDiff < 0 || domainDiff < 0) return 'Overdue';
    if (hostDiff <= 10 || domainDiff <= 10) return 'Urgent';
    if (hostDiff <= 30 || domainDiff <= 30) return 'Upcoming';
    return 'Normal';
  };

  // Renew action (extends bill date by exactly 1 year and logs the transaction)
  const handleRenewItem = (website: Website, type: 'hosting' | 'domain' | 'all') => {
    let updated = { ...website };
    
    if (type === 'hosting' || type === 'all') {
      const oldDate = new Date(website.hostingBillDate);
      oldDate.setFullYear(oldDate.getFullYear() + 1);
      updated.hostingBillDate = oldDate.toISOString().substring(0, 10);
    }
    
    if (type === 'domain' || type === 'all') {
      const oldDate = new Date(website.domainBillDate);
      oldDate.setFullYear(oldDate.getFullYear() + 1);
      updated.domainBillDate = oldDate.toISOString().substring(0, 10);
    }

    onEditWebsite(updated);
    
    const actionDesc = type === 'all' 
      ? `Hosting & Domain renewed for ${website.name}` 
      : `${type === 'hosting' ? 'Hosting' : 'Domain'} renewed for ${website.name}`;
      
    const detailDesc = type === 'all' 
      ? `Extended hosting to ${updated.hostingBillDate} and domain to ${updated.domainBillDate}.` 
      : `Extended bill date to ${type === 'hosting' ? updated.hostingBillDate : updated.domainBillDate}.`;

    onAuditLog('Website Renewal Paid', `${actionDesc}. ${detailDesc}`);
  };

  // Add website submit handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) return;

    const newWeb: Website = {
      id: `web_${Date.now()}`,
      name: formName,
      url: formUrl.startsWith('http') ? formUrl : `https://${formUrl}`,
      hostingProvider: formHostingProvider || 'Hostinger Share Node',
      hostingPrice: Number(formHostingPrice) || 0,
      hostingBillDate: formHostingBillDate,
      domainRegistrar: formDomainRegistrar || 'Namecheap',
      domainPrice: Number(formDomainPrice) || 0,
      domainBillDate: formDomainBillDate,
      status: formStatus,
      notes: formNotes,
      clientId: formClientId || undefined
    };

    onAddWebsite(newWeb);
    onAuditLog('Registered Website', `Added new website: ${newWeb.name} (${newWeb.url}) under management.`);
    setShowAddModal(false);
    resetForm();
  };

  // Open Edit Dialog
  const handleOpenEdit = (w: Website) => {
    setSelectedWebsite(w);
    setFormName(w.name);
    setFormUrl(w.url);
    setFormHostingProvider(w.hostingProvider);
    setFormHostingPrice(w.hostingPrice);
    setFormHostingBillDate(w.hostingBillDate);
    setFormDomainRegistrar(w.domainRegistrar);
    setFormDomainPrice(w.domainPrice);
    setFormDomainBillDate(w.domainBillDate);
    setFormStatus(w.status);
    setFormNotes(w.notes);
    setFormClientId(w.clientId || '');
    setShowEditModal(true);
  };

  // Update website submit handler
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebsite || !formName.trim()) return;

    const updatedWeb: Website = {
      ...selectedWebsite,
      name: formName,
      url: formUrl.startsWith('http') ? formUrl : `https://${formUrl}`,
      hostingProvider: formHostingProvider,
      hostingPrice: Number(formHostingPrice) || 0,
      hostingBillDate: formHostingBillDate,
      domainRegistrar: formDomainRegistrar,
      domainPrice: Number(formDomainPrice) || 0,
      domainBillDate: formDomainBillDate,
      status: formStatus,
      notes: formNotes,
      clientId: formClientId || undefined
    };

    onEditWebsite(updatedWeb);
    onAuditLog('Website Modified', `Updated settings & configurations for ${updatedWeb.name}.`);
    setShowEditModal(false);
    setSelectedWebsite(null);
    resetForm();
  };

  // Delete website handler
  const handleDeleteTrigger = (id: string, name: string) => {
    setWebsiteToDelete({ id, name });
  };

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormHostingProvider('');
    setFormHostingPrice(0);
    setFormHostingBillDate('2026-06-25');
    setFormDomainRegistrar('');
    setFormDomainPrice(0);
    setFormDomainBillDate('2026-06-25');
    setFormStatus('Active');
    setFormNotes('');
    setFormClientId('');
  };

  // Metrics calculations
  const totalCount = websites.length;
  const activeCount = websites.filter(w => w.status === 'Active').length;
  const inactiveCount = websites.filter(w => w.status === 'Inactive').length;
  const maintenanceCount = websites.filter(w => w.status === 'Under Maintenance').length;
  const suspendedCount = websites.filter(w => w.status === 'Suspended').length;

  const expiredHostingCount = websites.filter(w => w.status === 'Active' && getDaysDiff(w.hostingBillDate) < 0).length;
  const expiredDomainCount = websites.filter(w => w.status === 'Active' && getDaysDiff(w.domainBillDate) < 0).length;
  const totalOverdueBills = websites.filter(w => w.status === 'Active' && (getDaysDiff(w.hostingBillDate) < 0 || getDaysDiff(w.domainBillDate) < 0)).length;

  const expiringHostingSoon = websites.filter(w => {
    if (w.status !== 'Active') return false;
    const diff = getDaysDiff(w.hostingBillDate);
    return diff >= 0 && diff <= 10 && diff % 2 === 0;
  }).length;
  
  const expiringDomainSoon = websites.filter(w => {
    if (w.status !== 'Active') return false;
    const diff = getDaysDiff(w.domainBillDate);
    return diff >= 0 && diff <= 10 && diff % 2 === 0;
  }).length;

  const totalUrgentCount = websites.filter(w => {
    if (w.status !== 'Active') return false;
    const hDiff = getDaysDiff(w.hostingBillDate);
    const dDiff = getDaysDiff(w.domainBillDate);
    return (hDiff >= 0 && hDiff <= 10 && hDiff % 2 === 0) || (dDiff >= 0 && dDiff <= 10 && dDiff % 2 === 0);
  }).length;

  // Monthly average spending
  const totalAnnualHosting = websites.reduce((sum, w) => sum + w.hostingPrice, 0);
  const totalAnnualDomain = websites.reduce((sum, w) => sum + w.domainPrice, 0);
  const estimatedMonthlyRenewal = Math.round((totalAnnualHosting + totalAnnualDomain) / 12);

  // List of urgent active alerts for overhead banner notification panel
  const billingAlerts = websites
    .filter(w => w.status === 'Active')
    .flatMap(w => {
    const alertsList: Array<{
      id: string;
      web: Website;
      type: 'Hosting' | 'Domain';
      daysLeft: number;
      date: string;
      price: number;
      registrarOrProvider: string;
    }> = [];

    const hostDiff = getDaysDiff(w.hostingBillDate);
    if (hostDiff < 0 || (hostDiff <= 10 && hostDiff % 2 === 0)) {
      alertsList.push({
        id: `${w.id}_host`,
        web: w,
        type: 'Hosting',
        daysLeft: hostDiff,
        date: w.hostingBillDate,
        price: w.hostingPrice,
        registrarOrProvider: w.hostingProvider
      });
    }

    const domDiff = getDaysDiff(w.domainBillDate);
    if (domDiff < 0 || (domDiff <= 10 && domDiff % 2 === 0)) {
      alertsList.push({
        id: `${w.id}_domain`,
        web: w,
        type: 'Domain',
        daysLeft: domDiff,
        date: w.domainBillDate,
        price: w.domainPrice,
        registrarOrProvider: w.domainRegistrar
      });
    }

    return alertsList;
  }).sort((a, b) => a.daysLeft - b.daysLeft); // most urgent first

  // Filtered websites
  const filteredWebsites = websites.filter(w => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      w.name.toLowerCase().includes(query) || 
      w.url.toLowerCase().includes(query) || 
      w.hostingProvider.toLowerCase().includes(query) || 
      w.domainRegistrar.toLowerCase().includes(query) ||
      (w.notes && w.notes.toLowerCase().includes(query));

    // 2. Status Filter
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;

    // 3. Billing Filter
    let matchesBilling = true;
    const hDiff = getDaysDiff(w.hostingBillDate);
    const dDiff = getDaysDiff(w.domainBillDate);
    if (billingFilter === 'Overdue') {
      matchesBilling = hDiff < 0 || dDiff < 0;
    } else if (billingFilter === 'Expiring7') {
      matchesBilling = (hDiff >= 0 && hDiff <= 7) || (dDiff >= 0 && dDiff <= 7);
    } else if (billingFilter === 'Expiring30') {
      matchesBilling = (hDiff >= 0 && hDiff <= 30) || (dDiff >= 0 && dDiff <= 30);
    }

    return matchesSearch && matchesStatus && matchesBilling;
  });

  return (
    <div className="space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      
      {/* HEADER SECTION WITH ADD TRIGGER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-indigo-400 animate-pulse" />
            Websites Infrastructure Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise cloud hosting billing schedules, domain registrars, and automated due-alert notifications.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => {
              setShowImportPanel(!showImportPanel);
              setImportError(null);
              setPreviewWebsites([]);
              setImportFileName('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border ${
              showImportPanel 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400 shadow-md shadow-indigo-950/20' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            Smart CSV Import
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-indigo-900/20 ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            Add Managed Website
          </button>
        </div>
      </div>

      {/* SMART CSV IMPORT CENTER PANEL */}
      {showImportPanel && (
        <div className="bg-slate-900 border border-indigo-500/10 rounded-2xl p-5 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                Smart CSV Document Import Center
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 max-w-2xl">
                Upload any website listing CSV. Our intelligence engine analyzes your columns (such as site name, link, hoster, server fee, domain registrar) and automatically maps them. 
                <span className="text-indigo-400 font-semibold ml-1">No specific column order or naming is required!</span>
              </p>
            </div>
            <button 
              onClick={() => setShowImportPanel(false)}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* DRAG AND DROP ZONE */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-950/10 scale-[0.99]' 
                : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3 bg-slate-900/80 rounded-xl text-indigo-400 border border-slate-800">
              <Upload className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {importFileName ? `Selected: ${importFileName}` : 'Drag & drop your CSV file here, or click to browse'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Supports standard comma-separated, semicolon-separated, or tab-delimited sheets (.csv, .txt)
              </p>
            </div>
          </div>

          {/* STATUS NOTIFICATIONS */}
          {importError && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/20 text-rose-200 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Parsing Error:</span> {importError}
              </div>
            </div>
          )}

          {importSuccessCount !== null && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Success!</span> Registered <span className="font-bold text-white font-mono">{importSuccessCount}</span> website monitors into your infrastructure hub. Sync logs updated.
              </div>
            </div>
          )}

          {/* MATCHING RESULTS PREVIEW */}
          {previewWebsites.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Detected Column Mapping Map */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10.5px] font-bold font-mono text-indigo-400 uppercase tracking-wider">
                    Auto-Detected Column Mappings
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/10">
                    Smart Match Ready
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[10px]">
                  {Object.entries(mappedColumns).map(([field, rawHeader]) => {
                    const labelMap: Record<string, string> = {
                      name: 'Website Name',
                      url: 'Website URL',
                      hostingProvider: 'Hosting Provider',
                      hostingPrice: 'Hosting Price',
                      hostingBillDate: 'Hosting Bill Date',
                      domainRegistrar: 'Domain Registrar',
                      domainPrice: 'Domain Price',
                      domainBillDate: 'Domain Bill Date',
                      notes: 'Notes / Description',
                      status: 'Status State',
                      clientName: 'Client Lookup'
                    };
                    return (
                      <div key={field} className="p-2 bg-slate-900 border border-slate-850 rounded-lg flex flex-col gap-0.5">
                        <span className="text-slate-500 font-medium">{labelMap[field] || field}</span>
                        <span className="text-slate-200 font-bold font-mono truncate">&ldquo;{rawHeader}&rdquo;</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Row Table Preview */}
              <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-850 flex justify-between items-center">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-300">
                    Import Preview &mdash; Matches Detected ({previewWebsites.length} items)
                  </span>
                  <span className="text-[9.5px] text-slate-400 italic">
                    Top rows shown. Clicking import will ingest all rows.
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                  <table className="w-full text-left text-[11px] font-sans border-collapse">
                    <thead>
                      <tr className="bg-slate-920 text-slate-400 border-b border-slate-850">
                        <th className="p-2.5 font-bold">Name</th>
                        <th className="p-2.5 font-bold">URL</th>
                        <th className="p-2.5 font-bold">Hosting Provider</th>
                        <th className="p-2.5 font-bold">Hosting Price</th>
                        <th className="p-2.5 font-bold">Domain Registrar</th>
                        <th className="p-2.5 font-bold">Domain Price</th>
                        <th className="p-2.5 font-bold">Client Linkage</th>
                        <th className="p-2.5 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono">
                      {previewWebsites.slice(0, 10).map((web, idx) => (
                        <tr key={web.id || idx} className="hover:bg-slate-900/40 text-slate-300">
                          <td className="p-2.5 font-semibold text-white">{web.name}</td>
                          <td className="p-2.5 text-indigo-400 font-sans select-all">{web.url}</td>
                          <td className="p-2.5 text-slate-400">{web.hostingProvider}</td>
                          <td className="p-2.5 text-emerald-400">INR {web.hostingPrice}</td>
                          <td className="p-2.5 text-slate-400">{web.domainRegistrar}</td>
                          <td className="p-2.5 text-emerald-400">INR {web.domainPrice}</td>
                          <td className="p-2.5 text-amber-400">
                            {web.clientId ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1 font-sans">
                                <Check className="w-3 h-3" /> Attached
                              </span>
                            ) : web.clientNameField ? (
                              <span className="text-slate-500 italic truncate block max-w-[100px]" title={web.clientNameField}>
                                &ldquo;{web.clientNameField}&rdquo;
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              web.status === 'Active' 
                                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/10' 
                                : web.status === 'Under Maintenance'
                                ? 'bg-amber-950/50 text-amber-400 border border-amber-500/10'
                                : 'bg-rose-950/50 text-rose-400 border border-rose-500/10'
                            }`}>
                              {web.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirm Action Bar */}
              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  onClick={() => {
                    setPreviewWebsites([]);
                    setImportFileName('');
                  }}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Clear File
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-indigo-900/30"
                >
                  <Check className="w-4 h-4" />
                  Import {previewWebsites.length} Website Monitors
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BENTO STATISTICS SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total websites */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-colors">
          <div className="p-3 bg-indigo-950/50 text-indigo-400 rounded-lg border border-indigo-500/10">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Monitored Domains</span>
            <div className="text-2xl font-black mt-0.5 font-mono">{totalCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5 font-mono">
              <span className="text-emerald-400 font-bold">{activeCount} Active</span>
              <span>&bull;</span>
              <span className="text-slate-400 font-bold">{inactiveCount} Inact</span>
              <span>&bull;</span>
              <span className="text-amber-400 font-bold">{minorCheck(maintenanceCount)} Maint</span>
              <span>&bull;</span>
              <span className="text-rose-400 font-bold">{minorCheck(suspendedCount)} Susp</span>
            </div>
          </div>
        </div>

        {/* Card 2: Overdue Billings alerts */}
        <div className={`border p-4 rounded-xl flex items-center gap-4 transition-colors ${
          totalOverdueBills > 0 
            ? 'bg-rose-950/30 border-rose-500/30 text-rose-100 hover:border-rose-500/40' 
            : 'bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}>
          <div className={`p-3 rounded-lg border ${
            totalOverdueBills > 0 
              ? 'bg-rose-950/55 text-rose-400 border-rose-500/20' 
              : 'bg-slate-950 text-slate-400 border-slate-800'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Overdue Payments</span>
            <div className={`text-2xl font-black mt-0.5 font-mono ${totalOverdueBills > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {totalOverdueBills}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5">
              {totalOverdueBills > 0 ? 'Immediate domain freeze threats' : 'All accounts currently clear'}
            </p>
          </div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className={`border p-4 rounded-xl flex items-center gap-4 transition-colors ${
          totalUrgentCount > 0 
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-100 hover:border-amber-500/40' 
            : 'bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}>
          <div className={`p-3 rounded-lg border ${
            totalUrgentCount > 0 
              ? 'bg-amber-950/50 text-amber-400 border-amber-500/20' 
              : 'bg-slate-950 text-slate-400 border-slate-800'
          }`}>
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Expires in 7 Days</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-amber-400">{totalUrgentCount}</div>
            <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">
              H: {expiringHostingSoon} soon &bull; D: {expiringDomainSoon} soon
            </span>
          </div>
        </div>

        {/* Card 4: Estimated Spending */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-colors">
          <div className="p-3 bg-emerald-950/40 text-emerald-400 rounded-lg border border-emerald-500/10">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">Avg Monthly renewal</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-emerald-400 flex items-center gap-0.5">
              <IndianRupee className="w-5 h-5" />
              {estimatedMonthlyRenewal.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Yearly: <span className="font-mono">INR {(totalAnnualHosting + totalAnnualDomain).toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

      </div>

      {/* URGENT BILLING ALERTS & REMINDERS PANEL */}
      {billingAlerts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-850 bg-slate-920 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Urgent Website Billing Reminders
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 rounded-lg text-slate-400 font-bold border border-slate-800">
              {billingAlerts.length} Action Needed
            </span>
          </div>
          
          <div className="p-4 divide-y divide-slate-850">
            {billingAlerts.map(alert => {
              const isOverdue = alert.daysLeft < 0;
              const isToday = alert.daysLeft === 0;
              let colorClass = 'text-amber-400';
              let badgeBg = 'bg-amber-950/50 border border-amber-500/20';

              if (isOverdue) {
                colorClass = 'text-rose-400 font-bold';
                badgeBg = 'bg-rose-950/80 border border-rose-500/30 text-rose-300';
              } else if (isToday) {
                colorClass = 'text-amber-300 font-bold';
                badgeBg = 'bg-amber-900/60 border border-amber-400/40 text-amber-200';
              }

              return (
                <div key={alert.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] uppercase font-mono ${badgeBg}`}>
                        {alert.type}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{alert.web.name}</span>
                        <a 
                          href={alert.web.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          referrerPolicy="no-referrer"
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Provider: <span className="text-slate-300 font-mono">{alert.registrarOrProvider}</span> &bull; 
                        Bill Date: <span className="text-slate-300 font-mono font-semibold">{formatIndianDate(alert.date)}</span> &bull; 
                        Renew Value: <span className="text-emerald-400 font-bold font-mono">INR {alert.price.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`text-[11px] font-mono ${colorClass}`}>
                      {isOverdue 
                        ? `🚨 OVERDUE BY ${Math.abs(alert.daysLeft)} DAYS` 
                        : isToday 
                        ? '🔥 RENEWS TODAY!' 
                        : `⏰ Due in ${alert.daysLeft} days`
                      }
                    </span>
                    
                    <button
                      onClick={() => handleRenewItem(alert.web, alert.type === 'Hosting' ? 'hosting' : 'domain')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[10.5px] cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Renewed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, domain, host..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-1.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          
          {/* Status selector filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Status:</span>
            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg text-[10px]">
              {['All', 'Active', 'Inactive', 'Under Maintenance', 'Suspended'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    statusFilter === opt
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt === 'Under Maintenance' ? 'Maint' : opt}
                </button>
              ))}
            </div>
          </div>

          {/* Billing selector filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Billing Scope:</span>
            <select
              value={billingFilter}
              onChange={e => setBillingFilter(e.target.value)}
              className="bg-slate-950 text-[10px] border border-slate-800 px-2 py-1.5 rounded-lg text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Renewal Schedules</option>
              <option value="Overdue">Overdue Outstanding</option>
              <option value="Expiring7">Expiry within 7 Days</option>
              <option value="Expiring30">Expiry within 30 Days</option>
            </select>
          </div>

        </div>
      </div>

      {/* WEBSITES CARDS BENTO GRID */}
      {filteredWebsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebsites.map(web => {
            const client = clients.find(c => c.id === web.clientId);
            
            const hostDiff = getDaysDiff(web.hostingBillDate);
            const domDiff = getDaysDiff(web.domainBillDate);

            return (
              <div 
                key={web.id} 
                className="bg-slate-900 border border-slate-850 hover:border-slate-750 p-5 rounded-2xl flex flex-col justify-between transition-all duration-350 shadow-sm relative group"
              >
                
                {/* Visual Glow indicators matching status */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    web.status === 'Active' 
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse' 
                      : web.status === 'Under Maintenance' 
                      ? 'bg-amber-400' 
                      : web.status === 'Inactive'
                      ? 'bg-slate-500'
                      : 'bg-rose-400 animate-ping'
                  }`} />
                  <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400">
                    {web.status}
                  </span>
                </div>

                {/* Primary Card Info */}
                <div className="space-y-4">
                  
                  {/* Website title and link */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-950 border border-slate-850 text-indigo-400 rounded-lg">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-indigo-400 transition-colors tracking-tight truncate max-w-[140px]">
                        {web.name}
                      </h4>
                    </div>
                    
                    <a
                      href={web.url}
                      target="_blank"
                      rel="noreferrer"
                      referrerPolicy="no-referrer"
                      className="text-[11px] text-indigo-400 hover:underline max-w-[190px] block truncate mt-1.5 font-mono"
                    >
                      {web.url}
                    </a>
                  </div>

                  {/* Client assignment lookup */}
                  {client ? (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-[10.5px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold text-slate-300 truncate max-w-[130px]">{client.name}</span>
                        <span className="text-slate-650">&bull;</span>
                        <span className="text-slate-400 truncate max-w-[100px]">{client.company}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-950/40 rounded-xl border border-dashed border-slate-850 text-[10px] text-slate-500 italic block text-center">
                      Not mapped to CRM Client
                    </div>
                  )}

                  {/* Hosting details summary */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-500 uppercase font-mono tracking-tight flex items-center gap-1">
                        <Server className="w-3 h-3 text-slate-500" /> Hosting Node
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        INR {web.hostingPrice.toLocaleString('en-IN')}/Y
                      </span>
                    </div>
                    
                    <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <p className="text-[11px] font-bold text-slate-200 truncate">{web.hostingProvider}</p>
                        <span className="text-[9.5px] text-slate-500 block font-mono">Renew: {formatIndianDate(web.hostingBillDate)}</span>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        {hostDiff < 0 ? (
                          <div className="text-[9.5px] text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono font-bold flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            OVERDUE
                          </div>
                        ) : hostDiff <= 7 ? (
                          <div className="text-[9.5px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/15 font-mono font-medium">
                            {hostDiff} days
                          </div>
                        ) : (
                          <span className="text-[9.5px] text-slate-500 font-mono">{hostDiff}d left</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Domain details summary */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-500 uppercase font-mono tracking-tight flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" /> Domain DNS
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        INR {web.domainPrice.toLocaleString('en-IN')}/Y
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <p className="text-[11px] font-bold text-slate-200 truncate">{web.domainRegistrar}</p>
                        <span className="text-[9.5px] text-slate-500 block font-mono">Renew: {formatIndianDate(web.domainBillDate)}</span>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        {domDiff < 0 ? (
                          <div className="text-[9.5px] text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono font-bold flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            OVERDUE
                          </div>
                        ) : domDiff <= 7 ? (
                          <div className="text-[9.5px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/15 font-mono font-medium">
                            {domDiff} days
                          </div>
                        ) : (
                          <span className="text-[9.5px] text-slate-500 font-mono">{domDiff}d left</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  {web.notes && (
                    <div className="text-[10.5px] leading-relaxed text-slate-400 border-t border-slate-850/60 pt-2 italic">
                      &ldquo;{web.notes}&rdquo;
                    </div>
                  )}

                </div>

                {/* Card Controls Footer */}
                <div className="flex justify-between items-center pt-3 mt-4 border-t border-slate-850/70">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(web)}
                      className="p-1.5 bg-slate-950 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 cursor-pointer transition-colors"
                      title="Edit website configurations"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrigger(web.id, web.name)}
                      className="p-1.5 bg-slate-950 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-850 cursor-pointer transition-colors"
                      title="Delete website monitor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex bg-slate-950 rounded-lg p-0.5 gap-1 border border-slate-850">
                    <button
                      onClick={() => handleRenewItem(web, 'all')}
                      title="Instantly trigger payment loop renewals"
                      className="px-2.5 py-0.7 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/20 rounded text-[9.5px] font-semibold text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      Pay Full Renew
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl max-w-xl mx-auto space-y-4">
          <Globe className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
          <h4 className="text-base font-bold text-white">No Sites Matched Filters</h4>
          <p className="text-slate-400 text-xs leading-normal">
            No monitored websites match your search queries or filter statuses. Try editing status indicators or adding a brand new record below.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('All'); setBillingFilter('All'); }} 
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-400 hover:bg-slate-850 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* RENDER DYNAMIC DRAWER ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto flex flex-col justify-between h-full">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-indigo-400" /> Build Website Monitor
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-sans">
                
                {/* Site Name and domain URL */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-405 font-medium uppercase font-mono text-[10px]">Website Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Corporate Portfolio"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-405 font-medium uppercase font-mono text-[10px]">Domain URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. apexretail.in"
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Client selection mapper */}
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-medium uppercase font-mono text-[10px]">Map to CRM Client (Optional)</label>
                  <select
                    value={formClientId}
                    onChange={e => setFormClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- No Asssigned Client CRM record --</option>
                    {clients.map(cl => (
                      <option key={cl.id} value={cl.id}>
                        {cl.company} ({cl.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* HOSTING PROVIDER SPECS */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold flex items-center gap-1">
                    <Server className="w-3 h-3" /> Hosting Server Configurations
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Hosting Provider</label>
                      <input
                        type="text"
                        placeholder="e.g. AWS Premium Node"
                        value={formHostingProvider}
                        onChange={e => setFormHostingProvider(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Annual Hosting Fee (INR)</label>
                      <input
                        type="number"
                        placeholder="8500"
                        value={formHostingPrice || ''}
                        onChange={e => setFormHostingPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-medium block">Hosting Renewal Due Date</label>
                    <input
                      type="date"
                      value={formHostingBillDate}
                      onChange={e => setFormHostingBillDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                    />
                  </div>
                </div>

                {/* DOMAIN REGISTRAR SPECS */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Domain DNS Provider
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Domain Registrar</label>
                      <input
                        type="text"
                        placeholder="e.g. Namecheap"
                        value={formDomainRegistrar}
                        onChange={e => setFormDomainRegistrar(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Annual Domain Fee (INR)</label>
                      <input
                        type="number"
                        placeholder="1100"
                        value={formDomainPrice || ''}
                        onChange={e => setFormDomainPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-medium block">Domain Renewal Due Date</label>
                    <input
                      type="date"
                      value={formDomainBillDate}
                      onChange={e => setFormDomainBillDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                    />
                  </div>
                </div>

                {/* Status selector options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-mono uppercase text-[9.5px]">DNS Status</label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 text-[11.5px]"
                    >
                      <option value="Active">Active / Online</option>
                      <option value="Inactive">Inactive / Offline</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Suspended">Suspended / Frozen</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-mono uppercase text-[9.5px]">Notes / Tags</label>
                    <input
                      type="text"
                      placeholder="e.g. Critical web app portal"
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11.5px]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    Confirm Registration
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
            
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC DRAWER EDIT MODAL */}
      {showEditModal && selectedWebsite && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto flex flex-col justify-between h-full">

            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <Edit className="w-4.5 h-4.5 text-indigo-400" /> Modify Website monitor
                </h3>
                <button 
                  onClick={() => { setShowEditModal(false); setSelectedWebsite(null); }}
                  className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-sans">

                {/* Site Name and URL */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-405 font-medium uppercase font-mono text-[10px]">Website Title *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-405 font-medium uppercase font-mono text-[10px]">Domain URL *</label>
                    <input
                      type="text"
                      required
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Client selection mapper */}
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-medium uppercase font-mono text-[10px]">Associated CRM Client</label>
                  <select
                    value={formClientId}
                    onChange={e => setFormClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- No Assigned Client CRM record --</option>
                    {clients.map(cl => (
                      <option key={cl.id} value={cl.id}>
                        {cl.company} ({cl.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* HOSTING PROVIDER SPECS */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold flex items-center gap-1">
                    <Server className="w-3 h-3" /> hosting Server settings
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Hosting Provider</label>
                      <input
                        type="text"
                        value={formHostingProvider}
                        onChange={e => setFormHostingProvider(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Annual hosting Fee (INR)</label>
                      <input
                        type="number"
                        value={formHostingPrice || ''}
                        onChange={e => setFormHostingPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-medium block">Hosting Renewal Due Date</label>
                    <input
                      type="date"
                      value={formHostingBillDate}
                      onChange={e => setFormHostingBillDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                    />
                  </div>
                </div>

                {/* DOMAIN REGISTRAR SPECS */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> domain DNS settings
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Domain Registrar</label>
                      <input
                        type="text"
                        value={formDomainRegistrar}
                        onChange={e => setFormDomainRegistrar(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-medium block">Annual domain Fee (INR)</label>
                      <input
                        type="number"
                        value={formDomainPrice || ''}
                        onChange={e => setFormDomainPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-medium block">Domain Renewal Due Date</label>
                    <input
                      type="date"
                      value={formDomainBillDate}
                      onChange={e => setFormDomainBillDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                    />
                  </div>
                </div>

                {/* Status select block */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-mono uppercase text-[9.5px]">DNS Status</label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 text-[11.5px]"
                    >
                      <option value="Active">Active / Online</option>
                      <option value="Inactive">Inactive / Offline</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Suspended">Suspended / Frozen</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-mono uppercase text-[9.5px]">Notes / Tags</label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-[11.5px]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6 font-sans">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setSelectedWebsite(null); }}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!websiteToDelete}
        onClose={() => setWebsiteToDelete(null)}
        onConfirm={() => {
          if (websiteToDelete) {
            onDeleteWebsite(websiteToDelete.id);
            onAuditLog('Website Deleted', `Removed '${websiteToDelete.name}' from agency monitors.`);
          }
        }}
        title="Delete Website Monitor"
        message="Are you sure you want to delete this website monitor? This action will permanently stop uptime and performance tracking."
        itemName={websiteToDelete?.name}
      />

    </div>
  );
}

// Visual layout helper values checks
function minorCheck(count: number) {
  return count > 0 ? count : '0';
}
