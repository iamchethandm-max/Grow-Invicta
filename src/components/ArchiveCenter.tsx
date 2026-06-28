import React, { useState } from 'react';
import { 
  Archive, RotateCcw, Trash2, Search, Filter, 
  Users, Sparkles, Briefcase, CheckSquare, IndianRupee, Globe, FileText
} from 'lucide-react';
import { ArchivedItem } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';


interface ArchiveCenterProps {
  archivedItems: ArchivedItem[];
  onRestore: (item: ArchivedItem) => void;
  onDeletePermanent: (id: string) => void;
  theme: 'dark' | 'light';
}

export default function ArchiveCenter({ 
  archivedItems, 
  onRestore, 
  onDeletePermanent, 
  theme 
}: ArchiveCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<ArchivedItem | null>(null);

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'client':
        return <Users className={`${iconClass} text-indigo-500`} />;
      case 'lead':
        return <Sparkles className={`${iconClass} text-amber-500`} />;
      case 'project':
        return <Briefcase className={`${iconClass} text-blue-500`} />;
      case 'task':
        return <CheckSquare className={`${iconClass} text-emerald-500`} />;
      case 'payment':
        return <IndianRupee className={`${iconClass} text-purple-500`} />;
      case 'website':
        return <Globe className={`${iconClass} text-pink-500`} />;
      case 'finance':
        return <FileText className={`${iconClass} text-rose-500`} />;
      default:
        return <Archive className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-sans font-bold tracking-tight ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Archived Folder
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-1">
            Access, restore, or permanently remove deleted entries and assets.
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 ${
          theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-slate-900/40 border-slate-800 text-indigo-400'
        }`}>
          <Archive className="w-3.5 h-3.5" />
          <span>Total: {archivedItems.length} items</span>
        </div>
      </div>

      {/* Control panel (Search & filter) */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900/60 border-slate-850'
      }`}>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search archived files by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-hidden focus:ring-1 transition-all ${
              theme === 'light' 
                ? 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500' 
                : 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`w-full md:w-48 px-3 py-2 rounded-lg text-sm border focus:outline-hidden focus:ring-1 transition-all cursor-pointer ${
              theme === 'light' 
                ? 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500' 
                : 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          >
            <option value="all">All Types</option>
            <option value="client">Clients</option>
            <option value="lead">Leads</option>
            <option value="project">Projects</option>
            <option value="task">Tasks</option>
            <option value="payment">Payments</option>
            <option value="website">Websites</option>
            <option value="finance">Finance Ledger</option>
          </select>
        </div>
      </div>

      {/* Grid of items */}
      {filteredItems.length === 0 ? (
        <div className={`p-12 text-center rounded-xl border ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900/20 border-slate-850'
        }`}>
          <Archive className="w-12 h-12 text-slate-600 mx-auto opacity-40 mb-3" />
          <p className={`text-base font-sans font-medium ${theme === 'light' ? 'text-gray-900' : 'text-slate-300'}`}>
            No archived items found
          </p>
          <p className="text-xs text-slate-500 font-sans mt-1">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try modifying your search or filter options.' 
              : 'Deleted CRM records, website monitors, or milestones will appear here.'}
          </p>
        </div>
      ) : (
        <div className={`border rounded-xl overflow-hidden ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900/30 border-slate-850'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-mono uppercase tracking-wider text-slate-500 ${
                  theme === 'light' ? 'bg-gray-50' : 'bg-slate-950/40'
                }`}>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`text-sm transition-colors ${
                      theme === 'light' 
                        ? 'hover:bg-gray-50 border-b border-gray-100' 
                        : 'hover:bg-slate-900/30 border-b border-slate-850/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          theme === 'light' ? 'bg-gray-100' : 'bg-slate-950'
                        }`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <span className={`font-sans font-semibold block ${
                            theme === 'light' ? 'text-gray-900' : 'text-slate-200'
                          }`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-slate-500 font-mono block">
                            ID: {item.id.replace('arch_', '')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-400">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        theme === 'light' ? 'bg-gray-150 text-gray-700' : 'bg-slate-950 text-slate-400'
                      }`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {item.archivedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onRestore(item)}
                          className={`p-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all text-indigo-400 hover:text-indigo-500 cursor-pointer ${
                            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-950'
                          }`}
                          title="Restore back to Active panel"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className={`p-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all text-rose-400 hover:text-rose-500 cursor-pointer ${
                            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-950'
                          }`}
                          title="Delete Permanently from Cloud"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeletePermanent(itemToDelete.id);
          }
        }}
        title="PERMANENTLY DELETE RECORD"
        message="Are you absolutely sure you want to PERMANENTLY delete this record? This action is completely irreversible and the data will be lost forever."
        itemName={itemToDelete ? `${itemToDelete.type.toUpperCase()}: ${itemToDelete.name}` : ''}
      />

    </div>
  );
}
