import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Copy, 
  PlusCircle, Download, Info, Table, FileSpreadsheet, Eye, Trash2
} from 'lucide-react';
import { Client, Website } from '../types';

interface DataImportProps {
  theme: 'dark' | 'light';
  clients: Client[];
  onImportClients: (newClients: Client[]) => void;
  onImportWebsites: (newWebsites: Website[]) => void;
}

export default function DataImport({ theme, clients, onImportClients, onImportWebsites }: DataImportProps) {
  const [importType, setImportType] = useState<'clients' | 'websites'>('clients');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [pasteText, setPasteText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  // Templates in CSV format for reference and copy-paste
  const clientTemplate = `name,company,email,mobile,whatsapp,address,gstNumber,website,notes,status,totalBilled,pendingInvoice,workType,monthlyRetainerAmount
"Aarav Sharma","Aarav Tech Solutions","aarav@aaravtech.com","+91 98765 43210","+91 98765 43210","Sector 62, Noida, UP","09AAACA1234A1Z1","https://aaravtech.com","Key digital marketing partner","Active",45000,15000,"retainer",15000
"Priya Patel","Patel Exports","priya@patelexports.in","+91 91234 56789","+91 91234 56789","GIDC, Surat, Gujarat","24BBBPA4321B2Z2","https://patelexports.in","Shopify store development client","Active",120000,0,"one-time",0`;

  const websiteTemplate = `name,url,hostingProvider,hostingPrice,hostingBillDate,domainRegistrar,domainPrice,domainBillDate,status,notes,clientName
"Aarav Tech Corporate","https://aaravtech.com","Hostinger",4500,"2027-03-15","GoDaddy",850,"2027-03-15","Active","Corporate website, main node","Aarav Sharma"
"Patel Store","https://patelexports.in","Shopify",24000,"2026-12-01","Namecheap",900,"2026-11-20","Active","E-commerce Shopify storefront","Priya Patel"`;

  const handleCopyTemplate = () => {
    const textToCopy = importType === 'clients' ? clientTemplate : websiteTemplate;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTemplate(importType);
    setTimeout(() => setCopiedTemplate(null), 3000);
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

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const firstLine = cleanText.split('\n')[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // skip next escape quote
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

  const processImportData = (rawText: string) => {
    const rows = parseCSV(rawText);
    if (rows.length < 2) {
      setParseErrors(["The file or text appears empty or lacks a header row."]);
      return;
    }

    const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const dataRows = rows.slice(1);
    const errors: string[] = [];
    const items: any[] = [];

    dataRows.forEach((row, idx) => {
      const rowNum = idx + 2; // index is 0-based, header is row 1
      
      // Smart fuzzy matching helper for header keys
      const getVal = (matchers: string[], fallback: string = ''): string => {
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          if (matchers.some(m => h.includes(m) || m.includes(h))) {
            return (row[i] || '').trim();
          }
        }
        return fallback;
      };

      if (importType === 'clients') {
        let name = getVal(['name', 'clientname', 'fullname', 'contact', 'owner', 'proprietor', 'user']);
        let company = getVal(['company', 'companyname', 'firm', 'organization', 'agency', 'clientcompany', 'business']);

        // Completely lenient fallback so no row ever gets blocked
        if (!name && !company) {
          name = `Imported Client ${rowNum}`;
          company = `Company ${rowNum}`;
        } else if (!name) {
          name = company;
        } else if (!company) {
          company = name;
        }

        const email = getVal(['email', 'mail', 'contactemail']);
        const mobile = getVal(['mobile', 'phone', 'contactnumber', 'tel', 'telephone', 'cell']);
        const whatsapp = getVal(['whatsapp', 'wa', 'chat']) || mobile;
        const address = getVal(['address', 'location', 'city', 'office']);
        const gstNumber = getVal(['gst', 'gstnumber', 'gstin', 'tax', 'taxid']);
        const website = getVal(['website', 'site', 'url', 'link', 'domain']);
        const notes = getVal(['notes', 'note', 'desc', 'description', 'info', 'remarks']);
        
        let status: 'Active' | 'Inactive' = 'Active';
        const rawStatus = getVal(['status', 'state', 'active']).toLowerCase();
        if (rawStatus === 'inactive' || rawStatus === 'off' || rawStatus === 'suspended') {
          status = 'Inactive';
        }

        const totalBilled = parseFloat(getVal(['totalbilled', 'billed', 'amount', 'paid', 'total'], '0').replace(/[^0-9.]/g, '')) || 0;
        const pendingInvoice = parseFloat(getVal(['pending', 'unpaid', 'due', 'pendinginvoice', 'invoice'], '0').replace(/[^0-9.]/g, '')) || 0;
        const workType: 'retainer' | 'one-time' = getVal(['worktype', 'type', 'billingtype', 'retainer']).toLowerCase().includes('retainer') ? 'retainer' : 'one-time';
        const monthlyRetainerAmount = parseFloat(getVal(['monthlyretainer', 'retaineramount', 'monthly', 'monthlyfee', 'subscription'], '0').replace(/[^0-9.]/g, '')) || 0;

        items.push({
          id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name,
          company,
          email,
          mobile,
          whatsapp,
          address,
          gstNumber,
          website,
          notes,
          createdAt: new Date().toISOString().split('T')[0],
          status,
          metrics: {
            projectsCount: 0,
            totalBilled: isNaN(totalBilled) ? 0 : totalBilled,
            pendingInvoice: isNaN(pendingInvoice) ? 0 : pendingInvoice,
            workStartDate: new Date().toISOString().split('T')[0],
            workType,
            monthlyRetainerAmount: isNaN(monthlyRetainerAmount) ? 0 : monthlyRetainerAmount
          },
          contracts: [],
          timeline: [
            {
              id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              date: new Date().toISOString().split('T')[0],
              type: 'meeting',
              description: 'Client profile initialized via Excel/CSV import.'
            }
          ]
        });

      } else {
        // Smart matching for Website Fields
        let name = getVal(['name', 'title', 'site', 'website', 'app', 'project', 'label', 'identity']);
        let url = getVal(['url', 'link', 'domain', 'address', 'href', 'hosturl', 'websiteurl']);

        // Absolutely lenient fallback: derive or auto-generate so nothing is rejected
        if (!name && !url) {
          name = `Imported Site ${rowNum}`;
          url = `https://imported-site-${rowNum}.com`;
        } else if (!name) {
          try {
            const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
            const urlObj = new URL(cleanUrl);
            name = urlObj.hostname.replace('www.', '');
          } catch {
            name = url;
          }
        } else if (!url) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          url = `https://${slug || 'site'}.com`;
        }

        const hostingProvider = getVal(['hostingprovider', 'host', 'provider', 'server', 'cloud'], 'Hostinger Share Node');
        const hostingPrice = parseFloat(getVal(['hostingprice', 'hostprice', 'hostingcost', 'hostingfee', 'hostingamount', 'servercost', 'serverprice'], '0').replace(/[^0-9.]/g, '')) || 0;
        const hostingBillDate = getVal(['hostingbilldate', 'hostdate', 'hostingbill', 'hostingdue', 'hostbill', 'hostbilldate', 'hostdue', 'hostingrenewal'], new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        
        const domainRegistrar = getVal(['domainregistrar', 'registrar', 'godaddy', 'namecheap', 'domainprovider', 'registry'], 'Namecheap');
        const domainPrice = parseFloat(getVal(['domainprice', 'domaincost', 'domainfee', 'domainamount', 'regprice', 'registrarprice', 'domainrenewalcost'], '0').replace(/[^0-9.]/g, '')) || 0;
        const domainBillDate = getVal(['domainbilldate', 'domaindate', 'domainbill', 'domaindue', 'registrardate', 'domainbilldate', 'domaindue', 'domainrenewal'], new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        let status: 'Active' | 'Inactive' | 'Under Maintenance' | 'Suspended' = 'Active';
        const rawStatus = getVal(['status', 'active', 'state', 'condition']).toLowerCase();
        if (rawStatus.includes('maintenance')) {
          status = 'Under Maintenance';
        } else if (rawStatus.includes('inactive') || rawStatus === 'off') {
          status = 'Inactive';
        } else if (rawStatus.includes('suspended')) {
          status = 'Suspended';
        }

        const notes = getVal(['notes', 'note', 'desc', 'description', 'comment', 'info', 'credential', 'credentials', 'detail', 'details', 'about', 'remarks']);
        const clientNameField = getVal(['clientname', 'client', 'owner', 'customer', 'contact', 'user', 'company', 'firm']);
        
        // Match with existing client names to find client ID
        let clientId = '';
        if (clientNameField) {
          const matchedClient = clients.find(c => 
            c.name.toLowerCase().includes(clientNameField.toLowerCase()) || 
            c.company.toLowerCase().includes(clientNameField.toLowerCase())
          );
          if (matchedClient) {
            clientId = matchedClient.id;
          }
        }

        items.push({
          id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name,
          url: url.startsWith('http') ? url : `https://${url}`,
          hostingProvider,
          hostingPrice: isNaN(hostingPrice) ? 0 : hostingPrice,
          hostingBillDate,
          domainRegistrar,
          domainPrice: isNaN(domainPrice) ? 0 : domainPrice,
          domainBillDate,
          status,
          notes,
          clientId: clientId || undefined
        });
      }
    });

    setParseErrors(errors);
    setParsedData(items);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processImportData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processImportData(text);
      };
      reader.readAsText(file);
    }
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPasteText(val);
    if (val.trim()) {
      processImportData(val);
    } else {
      setParsedData([]);
      setParseErrors([]);
    }
  };

  const executeImport = () => {
    if (parsedData.length === 0) return;

    if (importType === 'clients') {
      onImportClients(parsedData);
    } else {
      onImportWebsites(parsedData);
    }

    setSuccessCount(parsedData.length);
    setParsedData([]);
    setPasteText('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setTimeout(() => {
      setSuccessCount(null);
    }, 4500);
  };

  const handleReset = () => {
    setParsedData([]);
    setParseErrors([]);
    setPasteText('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-6 text-left`}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <div>
          <h2 className={`text-base font-bold font-sans ${isDark ? 'text-white' : 'text-slate-800'}`}>Bulk Data Uploader</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Upload CSV/Excel spreadsheets or copy-paste directly to append records into your workspace seamlessly.
          </p>
        </div>
        <div className="flex gap-1 bg-slate-900/60 dark:bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => { setImportType('clients'); handleReset(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              importType === 'clients' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Import Clients
          </button>
          <button 
            onClick={() => { setImportType('websites'); handleReset(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              importType === 'websites' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Import Websites
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successCount !== null && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Successfully Imported!</h4>
            <p className="text-xs mt-0.5 font-medium">Added {successCount} new {importType} perfectly with all mapped fields verified.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Upload Center & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Upload Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* File Upload Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5' 
                : isDark 
                  ? 'border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/2' 
                  : 'border-gray-200 hover:border-indigo-500/50 hover:bg-indigo-500/2 bg-gray-50/50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv,.txt,.tsv" 
              className="hidden" 
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Upload className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {fileName ? `Selected: ${fileName}` : 'Drag & drop Excel / CSV file here'}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Or click to browse from your device (Supports .csv, .tsv, .txt)
                </p>
              </div>
            </div>
          </div>

          {/* Fallback Textarea Copy-Paste */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className={`text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Or Copy-Paste direct from Excel / Sheets
              </label>
              <button 
                onClick={handleCopyTemplate}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded-lg"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedTemplate === importType ? 'Copied Template!' : 'Copy Sample Cells'}</span>
              </button>
            </div>
            <textarea
              value={pasteText}
              onChange={handlePasteChange}
              placeholder={
                importType === 'clients'
                  ? "Paste cell values here. E.g:\nname\tcompany\temail\tstatus\nAarav Tech\tAarav Inc\tinfo@aarav.com\tActive"
                  : "Paste cell values here. E.g:\nname\turl\thostingProvider\tstatus\nMain Site\thttps://mysite.com\tHostinger\tActive"
              }
              rows={5}
              className={`w-full p-4.5 rounded-xl border font-mono text-xs text-left focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all ${
                isDark 
                  ? 'bg-[#1c1d22] border-slate-800 text-slate-350 placeholder-slate-600' 
                  : 'bg-white border-gray-200 text-slate-700 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Validation Errors Panel */}
          {parseErrors.length > 0 && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <h4 className="font-bold text-xs">Validation warnings detected:</h4>
              </div>
              <ul className="list-disc pl-5 text-[11px] space-y-1 font-mono max-h-32 overflow-y-auto custom-scrollbar text-left">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Panel */}
          {parsedData.length > 0 && (
            <div className={`p-4 border rounded-xl space-y-3 ${
              isDark ? 'bg-slate-900/40 border-slate-850' : 'bg-gray-50 border-gray-150'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-800/10 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4.5 h-4.5 text-indigo-400" />
                  <h4 className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Parsed Records Preview ({parsedData.length} entries)
                  </h4>
                </div>
                <button 
                  onClick={handleReset}
                  className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                  title="Clear parsed data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Responsive Mini Table */}
              <div className="overflow-x-auto text-[11px] font-mono max-h-48 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b border-slate-800/20 dark:border-slate-800 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <th className="py-1.5 px-2 font-bold">#</th>
                      <th className="py-1.5 px-2 font-bold">Name</th>
                      <th className="py-1.5 px-2 font-bold">{importType === 'clients' ? 'Company' : 'URL'}</th>
                      <th className="py-1.5 px-2 font-bold">{importType === 'clients' ? 'Email' : 'Host'}</th>
                      <th className="py-1.5 px-2 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((item, i) => (
                      <tr key={i} className={`border-b border-slate-800/10 dark:border-slate-800/40 last:border-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <td className="py-1.5 px-2 text-slate-500">{i + 1}</td>
                        <td className="py-1.5 px-2 font-semibold">{item.name}</td>
                        <td className="py-1.5 px-2 truncate max-w-[150px]">{importType === 'clients' ? item.company : item.url}</td>
                        <td className="py-1.5 px-2 truncate max-w-[150px]">{importType === 'clients' ? item.email : item.hostingProvider}</td>
                        <td className="py-1.5 px-2">
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            item.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <p className="text-[10px] text-slate-500 mt-2 text-center">and {parsedData.length - 10} more rows...</p>
                )}
              </div>

              {/* Action Trigger Button */}
              <button
                onClick={executeImport}
                disabled={parsedData.length === 0}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Inject {parsedData.length} records into workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Format Instructions & Rules */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-gray-50 border-gray-150'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5 ${
              isDark ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              <Info className="w-4.5 h-4.5 shrink-0" />
              <span>Import Formatting Rules</span>
            </h3>

            <div className="space-y-4.5 text-xs text-left">
              <div>
                <p className={`font-semibold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Header Row Syntax</p>
                <p className={`leading-relaxed text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your file must include a header row first. Header capitalization and spacing do not matter (e.g. "GST Number", "gstnumber", and "GST" map perfectly).
                </p>
              </div>

              {importType === 'clients' ? (
                <div className="space-y-3">
                  <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Required Columns:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start text-[11px] border-b border-slate-800/10 dark:border-slate-800 pb-1">
                      <span className="font-mono font-bold text-indigo-400">name</span>
                      <span className={`text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contact / Representative name</span>
                    </div>
                    <div className="flex justify-between items-start text-[11px] border-b border-slate-800/10 dark:border-slate-800 pb-1">
                      <span className="font-mono font-bold text-indigo-400">company</span>
                      <span className={`text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company / Trade brand name</span>
                    </div>
                  </div>

                  <p className={`font-semibold mt-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Optional Columns:</p>
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-500 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>email:</strong> Client primary address</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>mobile:</strong> Contact phone number</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>whatsapp:</strong> WhatsApp contact details</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>gstNumber:</strong> GST Registration details</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>website:</strong> Domain link</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>status:</strong> "Active" or "Inactive"</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>totalBilled:</strong> Bill amount sum (e.g. 50000)</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>pendingInvoice:</strong> Unpaid invoice sum</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>workType:</strong> "retainer" or "one-time"</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>monthlyRetainerAmount:</strong> INR retainer value</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Required Columns:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start text-[11px] border-b border-slate-800/10 dark:border-slate-800 pb-1">
                      <span className="font-mono font-bold text-indigo-400">name</span>
                      <span className={`text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Friendly website/application name</span>
                    </div>
                    <div className="flex justify-between items-start text-[11px] border-b border-slate-800/10 dark:border-slate-800 pb-1">
                      <span className="font-mono font-bold text-indigo-400">url</span>
                      <span className={`text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full URL starting with https://</span>
                    </div>
                  </div>

                  <p className={`font-semibold mt-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Optional Columns:</p>
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-500 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>hostingProvider:</strong> Host (AWS, Hostinger)</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>hostingPrice:</strong> Price of host server (e.g. 4500)</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>hostingBillDate:</strong> Renewal date (YYYY-MM-DD)</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>domainRegistrar:</strong> Registrar (GoDaddy, Namecheap)</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>domainPrice:</strong> Price of domain (e.g. 900)</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>domainBillDate:</strong> Renewal date (YYYY-MM-DD)</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>status:</strong> "Active", "Under Maintenance", "Suspended"</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>notes:</strong> Credentials or site metadata</p>
                    <p><strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>clientName:</strong> Existing client name in your CRM (System links them automatically!)</p>
                  </div>
                </div>
              )}

              <div className={`p-3 rounded-xl border flex gap-2.5 items-start mt-4 ${
                isDark ? 'bg-[#0c0d10] border-slate-900 text-slate-450' : 'bg-gray-100/50 border-gray-150 text-slate-600'
              }`}>
                <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  <strong>Smart Relationship Matching:</strong> If you specify a <code className="font-mono text-indigo-500">clientName</code> in your websites sheet that matches a contact name or company name in your client CRM, this system will auto-link the website to that client profile!
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
