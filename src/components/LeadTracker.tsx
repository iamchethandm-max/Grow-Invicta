/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Megaphone, Check, Calendar, Mail, 
  Phone, Briefcase, ChevronRight, X, AlertCircle, Sparkles
} from 'lucide-react';
import { Lead } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { formatIndianDate } from '../utils/dateUtils';


interface LeadTrackerProps {
  leads: Lead[];
  onAddLead: (newLead: Lead) => void;
  onEditLead: (updatedLead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

export default function LeadTracker({ leads, onAddLead, onEditLead, onDeleteLead }: LeadTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedPipelineStatus, setSelectedPipelineStatus] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Modal forms
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSource, setFormSource] = useState<Lead['source']>('Website');
  const [formStatus, setFormStatus] = useState<Lead['status']>('New');
  const [formValue, setFormValue] = useState<number>(100000);
  const [formFollowUp, setFormFollowUp] = useState('2026-06-25');
  const [formNotes, setFormNotes] = useState('');

  const leadSources: Lead['source'][] = [
    'Website', 'Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'Referral', 'Direct Call'
  ];

  const pipelineStatuses: Lead['status'][] = [
    'New', 'Contacted', 'Follow Up', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'
  ];

  // Pipeline Filter logic
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'All' || l.source === selectedSource;
    const matchesStatus = selectedPipelineStatus === 'All' || l.status === selectedPipelineStatus;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormCompany('');
    setFormPhone('');
    setFormEmail('');
    setFormSource('Website');
    setFormStatus('New');
    setFormValue(150000);
    setFormFollowUp('2026-06-25');
    setFormNotes('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (l: Lead) => {
    setFormName(l.name);
    setFormCompany(l.company);
    setFormPhone(l.phone);
    setFormEmail(l.email);
    setFormSource(l.source);
    setFormStatus(l.status);
    setFormValue(l.value);
    setFormFollowUp(l.followUpDate);
    setFormNotes(l.notes);
    setIsEditOpen(true);
  };

  const submitAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail) return;

    const newLeadObj: Lead = {
      id: `lead_${Date.now()}`,
      name: formName,
      company: formCompany || 'Independent Buyer',
      phone: formPhone,
      email: formEmail,
      source: formSource,
      status: formStatus,
      value: Number(formValue),
      followUpDate: formFollowUp,
      notes: formNotes,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddLead(newLeadObj);
    setSelectedLead(newLeadObj);
    setIsAddOpen(false);
  };

  const submitEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const updatedLeadObj: Lead = {
      ...selectedLead,
      name: formName,
      company: formCompany,
      phone: formPhone,
      email: formEmail,
      source: formSource,
      status: formStatus,
      value: Number(formValue),
      followUpDate: formFollowUp,
      notes: formNotes
    };

    onEditLead(updatedLeadObj);
    setSelectedLead(updatedLeadObj);
    setIsEditOpen(false);
  };

  // Convert status on press
  const handleQuickStatusChange = (status: Lead['status']) => {
    if (!selectedLead) return;
    const updated = {
      ...selectedLead,
      status
    };
    onEditLead(updated);
    setSelectedLead(updated);
  };

  return (
    <div id="lead-management-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto font-sans">
      
      {/* Search & Filter bar across the header */}
      <div className="lg:col-span-12 bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Filter leads by contact client name, company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
          >
            <option value="All">All Sources</option>
            {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={selectedPipelineStatus}
            onChange={(e) => setSelectedPipelineStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
          >
            <option value="All">All Statuses</option>
            {pipelineStatuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Prospect Lead</span>
        </button>
      </div>

      {/* Primary Pipeline View (Divided into visual columns or rich rows list) */}
      <div className="lg:col-span-5 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col h-[650px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase font-mono">Deal Funnel Pipeline</h3>
          <span className="text-[10px] text-slate-500 font-mono italic">{filteredLeads.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(l => (
              <div
                key={l.id}
                onClick={() => setSelectedLead(l)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedLead?.id === l.id 
                    ? 'bg-slate-950 border-indigo-500/80 shadow-md' 
                    : 'bg-slate-900/40 border-slate-850 hover:bg-slate-950/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">{l.company}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{l.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono leading-none ${
                    l.status === 'Won' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    l.status === 'Lost' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {l.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>{l.source}</span>
                  </div>
                  <span className="text-slate-200 font-semibold">₹{l.value.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">No prospective leads recorded.</div>
          )}
        </div>
      </div>

      {/* Selected Prospect Details */}
      <div className="lg:col-span-7">
        {selectedLead ? (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 h-[650px] flex flex-col justify-between">
            <div className="space-y-5">
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider block mb-1">
                    {selectedLead.source} Campaign Lead
                  </span>
                  <h2 className="text-lg font-bold text-white font-sans">{selectedLead.company}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Prospect Client: <strong className="text-slate-200">{selectedLead.name}</strong></p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(selectedLead)}
                    className="p-1 px-2 text-xs text-slate-300 bg-slate-950 border border-slate-805 rounded-lg hover:bg-slate-850 flex items-center gap-1 cursor-pointer"
                  >
                    Configure Lead
                  </button>
                  <button 
                    onClick={() => {
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 text-rose-450 bg-rose-950/20 border border-rose-500/20 rounded-lg hover:bg-rose-900/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status workflow stepping bars */}
              <div className="py-2">
                <span className="text-[9.5px] font-mono text-slate-500 uppercase block mb-2">Deal Progression Pipeline</span>
                <div className="grid grid-cols-7 gap-1 bg-slate-950 p-1.5 rounded-xl">
                  {pipelineStatuses.map((step, idx) => {
                    const activeIndex = pipelineStatuses.indexOf(selectedLead.status);
                    const isPassed = pipelineStatuses.indexOf(step) <= activeIndex;
                    const isWon = selectedLead.status === 'Won';
                    
                    return (
                      <button
                        key={step}
                        onClick={() => handleQuickStatusChange(step)}
                        className={`py-1 rounded text-[8px] font-mono font-bold uppercase transition-all tracking-tight ${
                          step === selectedLead.status 
                            ? isWon ? 'bg-emerald-500 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm'
                            : isPassed 
                              ? isWon ? 'bg-emerald-950/40 text-emerald-400' : 'bg-indigo-950/40 text-indigo-400'
                              : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {step.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CRM Contact Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-850 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider mb-1">Estimated Value</span>
                  <span className="text-white font-bold font-sans text-sm">₹{selectedLead.value.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider mb-1">Follow-up Target</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedLead.followUpDate ? formatIndianDate(selectedLead.followUpDate) : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider mb-1">Lead Source</span>
                  <span className="text-slate-300">{selectedLead.source}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider mb-1">Channel Phone</span>
                  <span className="text-slate-300">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider mb-1">Dossier Email</span>
                  <span className="text-slate-300 break-words">{selectedLead.email}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider mb-1">Logged Date</span>
                  <span className="text-slate-400">{selectedLead.createdAt}</span>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Lead Log notes & follow-up specs</span>
                <p className="text-xs text-slate-300 italic">
                  {selectedLead.notes || 'No custom campaign details written for lead.'}
                </p>
              </div>

            </div>

            {/* Won / Converted highlights panel */}
            <div className="p-4 bg-slate-950 border-t border-slate-855 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Convert to GrowInvicta Client</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Finalize deal workflow and push to core project boards automatically.</p>
                </div>
              </div>
              
              {selectedLead.status === 'Won' ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold">
                  <Check className="w-4.5 h-4.5" />
                  <span>CONVERTED</span>
                </div>
              ) : (
                <button
                  onClick={() => handleQuickStatusChange('Won')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  Win Deal
                </button>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 text-xs font-mono rounded-2xl">
            Select a prospective lead record to examine deals.
          </div>
        )}
      </div>

      {/* Add Lead Dialog Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Log Prospective Pitch Lead</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAddLead} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Company / Brand Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formCompany} 
                    onChange={e => setFormCompany(e.target.value)} 
                    placeholder="E.g. SpaceX Logistics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Contact Pitch Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    placeholder="E.g. Elon Musk"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Mobile Phone *</label>
                  <input 
                    type="text" 
                    required 
                    value={formPhone} 
                    onChange={e => setFormPhone(e.target.value)} 
                    placeholder="9988001122"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Email Coordinates *</label>
                  <input 
                    type="email" 
                    required 
                    value={formEmail} 
                    onChange={e => setFormEmail(e.target.value)} 
                    placeholder="ceo@spacex.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Campaign Source</label>
                  <select 
                    value={formSource} 
                    onChange={e => setFormSource(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Status Step</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    {pipelineStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Est Value (INR) *</label>
                  <input 
                    type="number" 
                    required 
                    value={formValue || ''} 
                    onChange={e => setFormValue(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Schedule Follow-up Target</label>
                <input 
                  type="date" 
                  value={formFollowUp} 
                  onChange={e => setFormFollowUp(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Pitch details & Client requirements</label>
                <textarea 
                  value={formNotes} 
                  onChange={e => setFormNotes(e.target.value)} 
                  placeholder="E.g. Rebrand corporate blog, set up dynamic localization templates..."
                  rows={3} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-medium"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Dialog Overlay */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Edit Deal Metrics</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitEditLead} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Company</label>
                  <input 
                    type="text" 
                    required 
                    value={formCompany} 
                    onChange={e => setFormCompany(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Contact Name</label>
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
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Mobile Phone</label>
                  <input 
                    type="text" 
                    required 
                    value={formPhone} 
                    onChange={e => setFormPhone(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Email coordinates</label>
                  <input 
                    type="email" 
                    required 
                    value={formEmail} 
                    onChange={e => setFormEmail(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Source</label>
                  <select 
                    value={formSource} 
                    onChange={e => setFormSource(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Progression Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    {pipelineStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Deal value (INR)</label>
                  <input 
                    type="number" 
                    required 
                    value={formValue || ''} 
                    onChange={e => setFormValue(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Follow up date</label>
                <input 
                  type="date" 
                  value={formFollowUp} 
                  onChange={e => setFormFollowUp(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Notes</label>
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
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (selectedLead) {
            onDeleteLead(selectedLead.id);
            const remaining = leads.filter(l => l.id !== selectedLead.id);
            setSelectedLead(remaining[0] || null);
          }
        }}
        title="Remove Prospective Lead"
        message="Are you sure you want to remove this prospective lead? It will be archived and moved to the Archive Center."
        itemName={selectedLead?.company}
      />

    </div>
  );
}
