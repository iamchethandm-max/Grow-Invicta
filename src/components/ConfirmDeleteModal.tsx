/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Archive / Delete",
  message = "Are you sure you want to archive or permanently delete this record? This action might be irreversible.",
  itemName
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-100 font-sans">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 p-1 rounded-lg transition-colors cursor-pointer"
            id="btn-close-delete-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          {itemName && (
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Record Details</span>
              <span className="text-xs font-semibold text-rose-400 font-mono break-all">{itemName}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            id="btn-cancel-delete"
          >
            No, Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-lg shadow-rose-900/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            id="btn-confirm-delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Yes, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
