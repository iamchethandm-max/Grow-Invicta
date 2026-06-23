/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Mail, Phone, MapPin, 
  Globe, Info, FileText, PlusCircle, CheckCircle, Calendar, 
  ArrowRight, FileSpreadsheet, UploadCloud, X
} from 'lucide-react';
import { Client } from '../types';

interface ClientsCRMProps {
  clients: Client[];
  onAddClient: (newClient: Client) => void;
  onEditClient: (updatedClient: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientsCRM({ clients, onAddClient, onEditClient, onDeleteClient }: ClientsCRMProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  
  // Modals / Form toggles
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form States
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGst, setFormGst] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formWorkStartDate, setFormWorkStartDate] = useState('');
  const [formWorkType, setFormWorkType] = useState<'retainer' | 'one-time'>('retainer');
  const [formMonthlyRetainerAmount, setFormMonthlyRetainerAmount] = useState<number | ''>('');

  // Documents simulation state
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string[]>>({
    'c1': ['Signed_NDAs.pdf', 'Omnichannel_SOW_V2.pdf'],
    'c2': ['Architecture_Overview.xlsx', 'Terms_Of_Agreement.pdf'],
    'c3': ['Spice_Route_Branding_Final.zip']
  });
  const [newDocName, setNewDocName] = useState('');

  // Timeline input
  const [newTimelineDesc, setNewTimelineDesc] = useState('');

  // Contract form input
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newContractValue, setNewContractValue] = useState<number>(0);

  // Filter & Search logic
  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormCompany('');
    setFormMobile('');
    setFormWhatsapp('');
    setFormEmail('');
    setFormAddress('');
    setFormGst('');
    setFormWebsite('');
    setFormNotes('');
    setFormStatus('Active');
    setFormWorkStartDate('');
    setFormWorkType('retainer');
    setFormMonthlyRetainerAmount('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setFormName(c.name);
    setFormCompany(c.company);
    setFormMobile(c.mobile);
    setFormWhatsapp(c.whatsapp);
    setFormEmail(c.email);
    setFormAddress(c.address);
    setFormGst(c.gstNumber);
    setFormWebsite(c.website);
    setFormNotes(c.notes);
    setFormStatus(c.status);
    setFormWorkStartDate(c.metrics?.workStartDate || '');
    setFormWorkType(c.metrics?.workType || 'retainer');
    setFormMonthlyRetainerAmount(c.metrics?.monthlyRetainerAmount || '');
    setIsEditOpen(true);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCompany || !formEmail) return;

    const newClientObj: Client = {
      id: `c_${Date.now()}`,
      name: formName,
      company: formCompany,
      mobile: formMobile,
      whatsapp: formWhatsapp,
      email: formEmail,
      address: formAddress,
      gstNumber: formGst || 'Not Applicable',
      website: formWebsite,
      notes: formNotes,
      status: formStatus,
      createdAt: new Date().toISOString().split('T')[0],
      metrics: { 
        projectsCount: 0, 
        totalBilled: 0, 
        pendingInvoice: 0,
        workStartDate: formWorkStartDate || undefined,
        workType: formWorkType,
        monthlyRetainerAmount: formMonthlyRetainerAmount !== '' ? Number(formMonthlyRetainerAmount) : undefined
      },
      contracts: [],
      timeline: [
        { id: `t_${Date.now()}`, date: new Date().toISOString().split('T')[0], type: 'meeting', description: 'CRM entry created.' }
      ]
    };

    onAddClient(newClientObj);
    setSelectedClient(newClientObj);
    setIsAddOpen(false);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const updatedClient: Client = {
      ...selectedClient,
      name: formName,
      company: formCompany,
      mobile: formMobile,
      whatsapp: formWhatsapp,
      email: formEmail,
      address: formAddress,
      gstNumber: formGst,
      website: formWebsite,
      notes: formNotes,
      status: formStatus,
      metrics: {
        ...selectedClient.metrics,
        workStartDate: formWorkStartDate || undefined,
        workType: formWorkType,
        monthlyRetainerAmount: formMonthlyRetainerAmount !== '' ? Number(formMonthlyRetainerAmount) : undefined
      }
    };

    onEditClient(updatedClient);
    setSelectedClient(updatedClient);
    setIsEditOpen(false);
  };

  // Timeline Dispatcher
  const handleAddTimeline = () => {
    if (!selectedClient || !newTimelineDesc) return;
    const item = {
      id: `t_user_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'email' as const,
      description: newTimelineDesc
    };
    const updated = {
      ...selectedClient,
      timeline: [item, ...selectedClient.timeline]
    };
    onEditClient(updated);
    setSelectedClient(updated);
    setNewTimelineDesc('');
  };

  // Contract manager dispatcher
  const handleAddContract = () => {
    if (!selectedClient || !newContractTitle || !newContractValue) return;
    const contractObj = {
      id: `con_user_${Date.now()}`,
      title: newContractTitle,
      value: Number(newContractValue),
      date: new Date().toISOString().split('T')[0],
      status: 'Signed' as const
    };
    const updated = {
      ...selectedClient,
      contracts: [...selectedClient.contracts, contractObj],
      metrics: {
        ...selectedClient.metrics,
        totalBilled: selectedClient.metrics.totalBilled + Number(newContractValue)
      }
    };
    onEditClient(updated);
    setSelectedClient(updated);
    setNewContractTitle('');
    setNewContractValue(0);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newDocName) return;
    const currentList = uploadedDocs[selectedClient.id] || [];
    setUploadedDocs({
      ...uploadedDocs,
      [selectedClient.id]: [...currentList, newDocName]
    });
    setNewDocName('');
  };

  return (
    <div id="client-management-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      
      {/* 1. Left side Client Explorer list */}
      <div className="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col h-[740px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-white font-sans">CRM Directory</h2>
          
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Global Directory Searches */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search companies, profiles, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            {(['All', 'Active', 'Inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`flex-1 py-1 px-3 rounded-lg text-[11px] font-mono border ${
                  statusFilter === f 
                    ? 'bg-slate-950 border-slate-700 text-indigo-400 font-semibold' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-850'
                }`}
              >
                {f} Entries
              </button>
            ))}
          </div>
        </div>

        {/* Client Rows list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredClients.length > 0 ? (
            filteredClients.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedClient?.id === c.id 
                    ? 'bg-slate-950 border-indigo-500/80' 
                    : 'bg-slate-900/60 border-slate-850 hover:bg-slate-950'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-semibold text-white tracking-tight">{c.company}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${
                    c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
                  <div>
                    <span className="text-slate-500 uppercase block text-[8px]">Agreements value</span>
                    <span className="text-slate-200">₹{c.metrics.totalBilled.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 uppercase block text-[8px]">Website link</span>
                    <span className="text-indigo-400 truncate block">{c.website !== 'Not Applicable' ? c.website.replace('https://', '') : '--'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">No matching client CRM found.</div>
          )}
        </div>
      </div>

      {/* 2. Client Profile Detail Dashboard */}
      <div className="lg:col-span-7 space-y-6">
        {selectedClient ? (
          <>
            {/* Header info card */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-bold text-white font-sans">{selectedClient.company}</h1>
                  <span className="text-xs text-indigo-400 font-mono">ID: {selectedClient.id}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(selectedClient)}
                    className="p-1 px-2 text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-850 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit CRM
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to archive CRM file for ${selectedClient.company}?`)) {
                        onDeleteClient(selectedClient.id);
                        setSelectedClient(clients[0] || null);
                      }
                    }}
                    className="p-1.5 text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-lg hover:bg-rose-900/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CRM properties grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Primary Rep</span>
                  <span className="text-slate-200 font-medium">{selectedClient.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Email Address</span>
                  <span className="text-slate-200 break-words">{selectedClient.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Mobile Number</span>
                  <span className="text-slate-200 font-mono">{selectedClient.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">WhatsApp Hub</span>
                  <span className="text-emerald-400 font-mono font-medium">{selectedClient.whatsapp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">GSTIN ID</span>
                  <span className="text-slate-200 font-mono">{selectedClient.gstNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Client Website</span>
                  <a href={selectedClient.website} target="_blank" rel="noreferrer" className="text-indigo-400 underline font-mono">
                    {selectedClient.website !== 'Not Applicable' ? 'Open link' : '--'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Work Started From</span>
                  <span className="text-indigo-300 font-mono font-medium">{selectedClient.metrics?.workStartDate || '--'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Agreement Type</span>
                  <span className="text-indigo-300 font-mono font-medium capitalize">{selectedClient.metrics?.workType || 'Retainer'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-mono">Monthly Retainer agreed</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {selectedClient.metrics?.monthlyRetainerAmount ? `₹${selectedClient.metrics.monthlyRetainerAmount.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
              </div>

              {/* Address and Notes */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <p>
                  <MapPin className="w-3.5 h-3.5 inline text-slate-500 mr-1" />
                  <strong>Address: </strong>{selectedClient.address}
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/80">
                  <span className="text-[10px] text-slate-400 block font-mono font-semibold uppercase mb-1">Internal Notes</span>
                  <p className="italic text-slate-400">{selectedClient.notes || 'No description listed for client dossier.'}</p>
                </div>
              </div>
            </div>

            {/* Contract list & Activity Logs tabs */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-5">
              {/* Uploaded Dossier Document Center */}
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-3">
                  Document Storage Vault
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  {(uploadedDocs[selectedClient.id] || []).map((doc, index) => (
                    <div key={index} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] text-slate-300 font-mono break-all group">
                      <span className="truncate">{doc}</span>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-indigo-400 group-hover:underline text-[9px] font-sans">View</a>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleUploadDoc} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Document_FileName.pdf" 
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-mono placeholder-slate-600"
                  />
                  <button 
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono cursor-pointer flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </form>
              </div>

              {/* Activity timelines input */}
              <div className="pt-4 border-t border-slate-800/80">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-3">
                  Interchange logs & Activity History
                </h3>
                
                {/* Timeline display list */}
                <div className="space-y-3 max-h-52 overflow-y-auto mb-4 pr-1">
                  {selectedClient.timeline?.map(tm => (
                    <div key={tm.id} className="text-xs border-l-2 border-indigo-500 pl-3 py-0.5 ml-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>{tm.date}</span>
                        <span className="uppercase text-[9px] text-indigo-400 font-semibold">{tm.type}</span>
                      </div>
                      <p className="text-slate-300">{tm.description}</p>
                    </div>
                  ))}
                </div>

                {/* Add timeline update block */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Log client call outcome or email update summary..." 
                    value={newTimelineDesc}
                    onChange={(e) => setNewTimelineDesc(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleAddTimeline}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Post Log
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 text-xs font-mono rounded-2xl">
            Select a Client to parse their core portfolio.
          </div>
        )}
      </div>

      {/* Add Client Dialog Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Create GrowInvicta CRM Dossier</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAdd} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Company Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formCompany} 
                    onChange={e => setFormCompany(e.target.value)} 
                    placeholder="Nvidia Labs Inc"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Primary Representative *</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    placeholder="Jensen Huang"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Email Dossier *</label>
                  <input 
                    type="email" 
                    required 
                    value={formEmail} 
                    onChange={e => setFormEmail(e.target.value)} 
                    placeholder="jensen@nvidia.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Primary Mobile Number</label>
                  <input 
                    type="text" 
                    value={formMobile} 
                    onChange={e => setFormMobile(e.target.value)} 
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">WhatsApp Broadcast Link</label>
                  <input 
                    type="text" 
                    value={formWhatsapp} 
                    onChange={e => setFormWhatsapp(e.target.value)} 
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">GSTIN Number (Optional)</label>
                  <input 
                    type="text" 
                    value={formGst} 
                    onChange={e => setFormGst(e.target.value)} 
                    placeholder="09AAACA1234F1ZP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Dossier Website URL</label>
                  <input 
                    type="text" 
                    value={formWebsite} 
                    onChange={e => setFormWebsite(e.target.value)} 
                    placeholder="https://nvidia.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Operational Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="Active">Active Business</option>
                    <option value="Inactive">Archived File</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Regional Office Address</label>
                <input 
                  type="text" 
                  value={formAddress} 
                  onChange={e => setFormAddress(e.target.value)} 
                  placeholder="Santa Clara, California"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-slate-800/60 py-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Work Start Date</label>
                  <input 
                    type="date" 
                    value={formWorkStartDate} 
                    onChange={e => setFormWorkStartDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Agreement Type</label>
                  <select 
                    value={formWorkType} 
                    onChange={e => setFormWorkType(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="retainer">Retainer</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Monthly Retainer (Agreed)</label>
                  <input 
                    type="number" 
                    value={formMonthlyRetainerAmount} 
                    onChange={e => setFormMonthlyRetainerAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="INR"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Key Objectives & Requirements</label>
                <textarea 
                  value={formNotes} 
                  onChange={e => setFormNotes(e.target.value)} 
                  placeholder="Notes about milestones, budget approvals, and team assignment configurations..."
                  rows={3} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Create Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Dialog Overlay */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Edit Client Dossier</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitEdit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Company Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formCompany} 
                    onChange={e => setFormCompany(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Representative Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={formEmail} 
                    onChange={e => setFormEmail(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Mobile Number</label>
                  <input 
                    type="text" 
                    value={formMobile} 
                    onChange={e => setFormMobile(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    value={formWhatsapp} 
                    onChange={e => setFormWhatsapp(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">GST Number</label>
                  <input 
                    type="text" 
                    value={formGst} 
                    onChange={e => setFormGst(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Website URL</label>
                  <input 
                    type="text" 
                    value={formWebsite} 
                    onChange={e => setFormWebsite(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Office Address</label>
                <input 
                  type="text" 
                  value={formAddress} 
                  onChange={e => setFormAddress(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-slate-800/60 py-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Work Start Date</label>
                  <input 
                    type="date" 
                    value={formWorkStartDate} 
                    onChange={e => setFormWorkStartDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Agreement Type</label>
                  <select 
                    value={formWorkType} 
                    onChange={e => setFormWorkType(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="retainer">Retainer</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Monthly Retainer (Agreed)</label>
                  <input 
                    type="number" 
                    value={formMonthlyRetainerAmount} 
                    onChange={e => setFormMonthlyRetainerAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="INR"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Key dossier Notes</label>
                <textarea 
                  value={formNotes} 
                  onChange={e => setFormNotes(e.target.value)} 
                  rows={3} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
