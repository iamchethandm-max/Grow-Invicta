/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, IndianRupee, FileText, Download, 
  Send, RefreshCcw, Landmark, Percent, PieChart, Calendar, X, CheckSquare, Wallet, HelpCircle
} from 'lucide-react';
import { Payment, FinanceLedger } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { formatIndianDate } from '../utils/dateUtils';


interface FinanceManagerProps {
  payments: Payment[];
  finances: FinanceLedger[];
  onAddPayment: (newPay: Payment) => void;
  onEditPayment: (updatedPay: Payment) => void;
  onDeletePayment: (id: string) => void;
  onAddFinance: (item: FinanceLedger) => void;
  onEditFinance: (item: FinanceLedger) => void;
  onDeleteFinance: (id: string) => void;
}

export default function FinanceManager({ 
  payments, finances, onAddPayment, onEditPayment, onDeletePayment, 
  onAddFinance, onEditFinance, onDeleteFinance 
}: FinanceManagerProps) {
  // Tabs updated to: Client_Payments, My_Expenses
  const [activeFinanceTab, setActiveFinanceTab] = useState<'Client_Payments' | 'My_Expenses'>('Client_Payments');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(payments[0] || null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'payment' | 'finance';
    id: string;
    name: string;
  } | null>(null);

  // Invoice generator triggers
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);

  // New payment form states
  const [formClient, setFormClient] = useState('');
  const [formAmount, setFormAmount] = useState<number>(250000);
  const [formPaid, setFormPaid] = useState<number>(0);
  const [formDueDate, setFormDueDate] = useState('2026-06-30');
  const [formMode, setFormMode] = useState<Payment['mode']>('Bank Transfer');
  const [formStatus, setFormStatus] = useState<Payment['status']>('Pending');
  const [addGst, setAddGst] = useState(true); // GST toggle state as requested

  // My expenses item form states
  const [cashType, setCashType] = useState<'Income' | 'Expense'>('Expense');
  const [cashSource, setCashSource] = useState('');
  const [cashCategory, setCashCategory] = useState('Rent');
  const [cashAmount, setCashAmount] = useState<number>(5000);
  const [cashDate, setCashDate] = useState('2026-06-25');
  const [cashNotes, setCashNotes] = useState('');

  // Custom presets for regular expenditures
  const [regularExpenditures, setRegularExpenditures] = useState<{ id: string; label: string; placeholderAmount: number; desc: string }[]>(() => {
    const saved = localStorage.getItem('custom_regular_expenditures');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 'Rent', label: 'Rent', placeholderAmount: 18000, desc: 'Monthly rent payment' },
      { id: 'Medicines', label: 'Medicines', placeholderAmount: 1500, desc: 'Regular medicines prescription' },
      { id: 'Home', label: 'Home', placeholderAmount: 8000, desc: 'Household groceries and bills' },
      { id: 'Traveling', label: 'Traveling', placeholderAmount: 4000, desc: 'Vehicle fuel and travel expenditure' },
      { id: 'Personal', label: 'Personal', placeholderAmount: 3000, desc: 'Personal personal expenses' }
    ];
  });

  const saveRegularExpenditures = (items: typeof regularExpenditures) => {
    setRegularExpenditures(items);
    localStorage.setItem('custom_regular_expenditures', JSON.stringify(items));
  };

  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetAmount, setNewPresetAmount] = useState<number>(5000);
  const [newPresetDesc, setNewPresetDesc] = useState('');

  // Invoice specific calculations
  const totalInvoicedValue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalReceivedInvoices = payments.filter(p => ['Paid', 'Partial'].includes(p.status)).reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPendingInvoices = payments.reduce((sum, p) => sum + p.pendingAmount, 0);

  // Miscellaneous income that doesn't represent invoice payment to avoid double counting
  const miscIncomeValue = finances
    .filter(f => f.type === 'Income' && f.category !== 'Client Payments' && !f.notes.toLowerCase().includes('inv-'))
    .reduce((sum, f) => sum + f.amount, 0);

  // Total Income = received client payments + misc income
  const totalIncomeValue = totalReceivedInvoices + miscIncomeValue;

  // Gross Expenses
  const totalExpense = finances.filter(f => f.type === 'Expense').reduce((sum, f) => sum + f.amount, 0);

  // Net earnings (Savings / Remaining) till next month 1st - clamped to never go negative as requested
  const netEarnings = Math.max(0, totalIncomeValue - totalExpense);

  // Tax calculations: Standard 18% GST on received invoices
  const estimatedTax = Math.round(totalReceivedInvoices * 0.18);

  const gstCalculationRatio = (amount: number) => {
    return Math.round(amount * 0.18);
  };

  // Savings and Days Remaining calculation till next month 1st
  const getRemainingDaysAndMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // First day of next month
    const nextMonth1st = new Date(currentYear, currentMonth + 1, 1);
    const diffTime = nextMonth1st.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const nextMonthName = monthNames[(currentMonth + 1) % 12];
    
    return { days: diffDays, nextMonthName };
  };

  const { days: daysRemaining, nextMonthName } = getRemainingDaysAndMonth();
  const savingsPercentage = totalIncomeValue > 0 ? Math.max(0, Math.min(100, Math.round((netEarnings / totalIncomeValue) * 100))) : 100;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClient) return;

    const baseAmount = Number(formAmount);
    // Add GST if addGst check is checked, else 0 GST
    const calculatedGst = addGst ? gstCalculationRatio(baseAmount) : 0;
    const invoiceNum = `INV-2026-00${payments.length + 1}`;

    const newPaymentObj: Payment = {
      id: `pay_${Date.now()}`,
      clientName: formClient,
      invoiceNumber: invoiceNum,
      amount: baseAmount,
      paidAmount: Number(formPaid),
      pendingAmount: baseAmount - Number(formPaid),
      paymentDate: Number(formPaid) > 0 ? new Date().toISOString().split('T')[0] : '--',
      dueDate: formDueDate,
      mode: formMode,
      status: formStatus,
      gstAmount: calculatedGst
    };

    onAddPayment(newPaymentObj);
    setSelectedPayment(newPaymentObj);
    setIsNewInvoiceOpen(false);

    // Prompt automatic entry inside ledgers if paid
    if (Number(formPaid) > 0) {
      onAddFinance({
        id: `f_pay_ref_${Date.now()}`,
        type: 'Income',
        sourceOrName: `${formClient} - Ref ${invoiceNum}`,
        category: 'Client Payments',
        amount: Number(formPaid),
        date: new Date().toISOString().split('T')[0],
        notes: `Ledger reference sync for Invoice ${invoiceNum}`
      });
    }
  };

  const handlePostCashLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashSource || !cashAmount) return;

    onAddFinance({
      id: `f_v_${Date.now()}`,
      type: cashType,
      sourceOrName: cashSource,
      category: cashCategory,
      amount: Number(cashAmount),
      date: cashDate,
      notes: cashNotes
    });

    // Reset fields
    setCashSource('');
    setCashAmount(5000);
    setCashNotes('');
  };

  const handleQuickMarkPaid = (p: Payment) => {
    const updated = {
      ...p,
      paidAmount: p.amount,
      pendingAmount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Paid' as const
    };
    onEditPayment(updated);
    if (selectedPayment?.id === p.id) {
      setSelectedPayment(updated);
    }

    // Append to finance ledgers automatically
    onAddFinance({
      id: `f_upd_${Date.now()}`,
      type: 'Income',
      sourceOrName: `${p.clientName} - Invoice ${p.invoiceNumber}`,
      category: 'Client Payments',
      amount: p.amount,
      date: new Date().toISOString().split('T')[0],
      notes: `Settlement for Invoice ${p.invoiceNumber}`
    });
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Source/Category,Date,Amount,Notes\r\n";
    finances.forEach(f => {
      csvContent += `${f.type},"${f.sourceOrName} (${f.category})",${f.date},${f.amount},"${f.notes}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `growinvicta_expenses_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="finance-management-module" className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header KPIs - Adjusted with requested custom Savings / remaining month 1st parameters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-1 text-slate-400 text-xs">
            <span>Total Invoiced</span>
            <Landmark className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl font-bold text-slate-100 font-sans">
            ₹{totalInvoicedValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Gross billed clients files</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-1 text-slate-400 text-xs font-mono">
            <span>Received Revenue</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-sans">
            ₹{totalReceivedInvoices.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-500 font-mono">Invoiced funds reconciled</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-1 text-slate-400 text-xs font-mono">
            <span>Total Income</span>
            <IndianRupee className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400 font-sans">
            ₹{totalIncomeValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-indigo-400 font-mono">Received + Misc Income</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-1 text-slate-400 text-xs font-mono">
            <span>Gross Expenses</span>
            <Percent className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-450 font-sans">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-rose-500/80 font-mono">Salaries, rentals & regular spend</p>
        </div>

        {/* RECONCILED BOX REPLACED WITH DYNAMIC MONTHLY SAVINGS AND TIME REMAINING TILL NEXT MONTH 1st */}
        <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
          <div className="flex justify-between items-center mb-1 text-slate-400 text-xs font-mono">
            <span>Savings & Remaining</span>
            <Wallet className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 font-sans">
            ₹{netEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-indigo-400 font-mono font-medium truncate">
            {savingsPercentage}% saved • {daysRemaining} days left till {nextMonthName} 1st
          </p>
        </div>
      </div>

      {/* 2. Control Tabs - Profit & Loss statement removed as requested */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFinanceTab('Client_Payments')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
              activeFinanceTab === 'Client_Payments' 
                ? 'bg-slate-950 border-slate-700 text-indigo-400 shadow-sm' 
                : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-850'
            }`}
          >
            Client Payments
          </button>
          <button
            onClick={() => setActiveFinanceTab('My_Expenses')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
              activeFinanceTab === 'My_Expenses' 
                ? 'bg-slate-950 border-slate-700 text-indigo-400 shadow-sm' 
                : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-850'
            }`}
          >
            My Expenses
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono hover:bg-slate-850 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ledger.csv</span>
          </button>
          {activeFinanceTab === 'Client_Payments' && (
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-indigo-200 inline mr-1" />
              <span>Add Client Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW SECTION 1: CLIENT PAYMENTS */}
      {activeFinanceTab === 'Client_Payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 p-5 border border-slate-800 rounded-2xl h-[560px] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-3">payment records</h3>
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {payments.map(pay => (
                  <div
                    key={pay.id}
                    onClick={() => setSelectedPayment(pay)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPayment?.id === pay.id 
                        ? 'bg-slate-950 border-indigo-500/80 shadow-md' 
                        : 'bg-slate-900/40 border-slate-850 hover:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-200 block truncate max-w-[170px]">{pay.clientName}</span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{pay.invoiceNumber} &bull; {pay.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-100 font-bold block">₹{pay.amount.toLocaleString('en-IN')}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono leading-none inline-block mt-1 ${
                          pay.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          pay.status === 'Overdue' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {pay.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs">
                    No client payments tracked yet. Click "Add Client Payment" to begin.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedPayment ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 h-[560px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block mb-1">
                        invoice summary report
                      </span>
                      <h2 className="text-base font-bold text-slate-100 font-sans">{selectedPayment.clientName}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Reference: <strong className="text-slate-300 font-mono">{selectedPayment.invoiceNumber}</strong></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsInvoicePreviewOpen(true)}
                        className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 flex items-center gap-1 cursor-pointer hover:bg-slate-850"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Print PDF
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget({
                            type: 'payment',
                            id: selectedPayment.id,
                            name: selectedPayment.invoiceNumber
                          });
                        }}
                        className="p-1.5 text-rose-450 bg-rose-500/5 hover:bg-rose-950/20 border border-rose-500/20 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing and parameters grids with dynamic GST display */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block mb-1">Base value</span>
                      <span className="text-slate-200">₹{selectedPayment.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block mb-1">GST Appended</span>
                      <span className={selectedPayment.gstAmount > 0 ? "text-amber-500 font-semibold" : "text-slate-500"}>
                        {selectedPayment.gstAmount > 0 ? `₹${selectedPayment.gstAmount.toLocaleString('en-IN')}` : 'No GST'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block mb-1">Paid ratio</span>
                      <span className="text-slate-200">₹{selectedPayment.paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block mb-1 font-bold">Outstanding credit</span>
                      <span className="text-rose-400 font-bold">₹{selectedPayment.pendingAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Core accounting timelines */}
                  <div className="pt-3 border-t border-slate-850 text-xs font-mono space-y-2 text-slate-300">
                    <p>&bull; <strong>Associated payment mode:</strong> {selectedPayment.mode}</p>
                    <p>&bull; <strong>Scheduled due deadline:</strong> {formatIndianDate(selectedPayment.dueDate)}</p>
                    <p>&bull; <strong>Settlement matching date:</strong> {formatIndianDate(selectedPayment.paymentDate)}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-100">Audit Settlement Reconciliation status</span>
                    <p className="text-[10px] text-slate-400">Marking invoices as settled will automatically update GrowInvicta balance sheets.</p>
                  </div>

                  {selectedPayment.status === 'Paid' ? (
                    <span className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold leading-none">
                      RECONCILED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleQuickMarkPaid(selectedPayment)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
                    >
                      Collect Paid
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs font-mono text-center py-8">Select or generate invoices to inspect balances.</p>
            )}
          </div>
        </div>
      )}

      {/* VIEW SECTION 2: MY EXPENSES */}
      {activeFinanceTab === 'My_Expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Post item ledger form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400">Record Expenditure</h3>
            <form onSubmit={handlePostCashLedger} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Transaction flow</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCashType('Expense')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      cashType === 'Expense' 
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-450' 
                        : 'bg-transparent border-slate-800 text-slate-400'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashType('Income')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      cashType === 'Income' 
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' 
                        : 'bg-transparent border-slate-800 text-slate-400'
                    }`}
                  >
                    Misc Income (+)
                  </button>
                </div>
              </div>

              {/* Monthly Regular Expenditures - Quick Add Presets as explicitly requested */}
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                  Monthly Regular Expenditures
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {regularExpenditures.map(preset => {
                    const isSelected = cashCategory === preset.id;
                    return (
                      <span
                        key={preset.id}
                        className={`inline-flex items-center gap-1.5 rounded-full border transition-all px-3 py-1 text-xs font-medium ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCashCategory(preset.id);
                            setCashSource(preset.desc);
                            setCashAmount(preset.placeholderAmount);
                          }}
                          className="font-sans font-medium transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = regularExpenditures.filter(p => p.id !== preset.id);
                            saveRegularExpenditures(updated);
                          }}
                          className={`hover:text-rose-450 p-0.5 rounded transition-colors ${
                            isSelected ? 'text-indigo-200 hover:text-white' : 'text-slate-600'
                          }`}
                          title={`Remove ${preset.label} preset`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  {!showAddPreset ? (
                    <button
                      type="button"
                      onClick={() => setShowAddPreset(true)}
                      className="px-3 py-1 rounded-full text-xs font-sans font-medium border border-dashed border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Custom Name</span>
                    </button>
                  ) : null}
                </div>

                {showAddPreset && (
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">
                      Create Custom Expenditure Preset
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Name (e.g. WiFi)"
                        value={newPresetLabel}
                        onChange={e => setNewPresetLabel(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs text-white px-2.5 py-1.5 rounded-lg w-full"
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Amt (e.g. 1200)"
                        value={newPresetAmount || ''}
                        onChange={e => setNewPresetAmount(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-800 text-xs text-white px-2.5 py-1.5 rounded-lg w-full font-mono"
                        required
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Default description/purpose (optional)"
                      value={newPresetDesc}
                      onChange={e => setNewPresetDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-2.5 py-1.5 rounded-lg"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddPreset(false);
                          setNewPresetLabel('');
                          setNewPresetDesc('');
                        }}
                        className="px-2.5 py-1 text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newPresetLabel.trim()) return;
                          const label = newPresetLabel.trim();
                          const newPreset = {
                            id: label,
                            label: label,
                            placeholderAmount: newPresetAmount || 0,
                            desc: newPresetDesc.trim() || `${label} payment`
                          };
                          const updated = [...regularExpenditures, newPreset];
                          saveRegularExpenditures(updated);
                          
                          setCashCategory(label);
                          setCashSource(newPreset.desc);
                          setCashAmount(newPreset.placeholderAmount);

                          // Reset
                          setNewPresetLabel('');
                          setNewPresetAmount(5000);
                          setNewPresetDesc('');
                          setShowAddPreset(false);
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Add Preset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Category type</label>
                <input 
                  type="text" 
                  required
                  value={cashCategory} 
                  onChange={e => setCashCategory(e.target.value)} 
                  placeholder="Rent, Medicines, Personal etc."
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Expenditure Item / Source</label>
                <input 
                  type="text" 
                  required
                  value={cashSource} 
                  onChange={e => setCashSource(e.target.value)} 
                  placeholder="E.g., June Apartment Rent"
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-1">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Value (INR)</label>
                  <input 
                    type="number" 
                    required
                    value={cashAmount || ''} 
                    onChange={e => setCashAmount(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-805 px-3 py-2 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Expenditure Date</label>
                  <input 
                    type="date" 
                    value={cashDate} 
                    onChange={e => setCashDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Expenditure Notes (Optional)</label>
                <textarea 
                  value={cashNotes} 
                  onChange={e => setCashNotes(e.target.value)} 
                  placeholder="Additional receipt references..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Log Expenditure Entry
              </button>
            </form>
          </div>

          {/* Ledger logs view */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-[510px]">
            <div className="flex flex-col h-full">
              <h3 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3">Expenses Ledger history</h3>
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {finances.map(f => (
                  <div key={f.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        f.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'
                      }`}>
                        {f.type === 'Income' ? 'Income' : 'Expense'}
                      </span>
                      <div>
                        <span className="text-slate-100 font-sans block font-semibold">{f.sourceOrName}</span>
                        <p className="text-[10px] text-slate-500 font-normal italic mt-0.5">{f.category} &bull; {formatIndianDate(f.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`font-bold ${f.type === 'Income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {f.type === 'Income' ? '+' : '-'} ₹{f.amount.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[8.5px] text-slate-500 max-w-[150px] truncate">{f.notes}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget({
                            type: 'finance',
                            id: f.id,
                            name: `${f.category} (${f.type}: ₹${f.amount.toLocaleString('en-IN')})`
                          });
                        }}
                        className="p-1.5 hover:bg-slate-900 rounded-lg text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {finances.length === 0 && (
                  <div className="text-center py-20 text-slate-500 font-mono text-xs">
                    No transactions recorded. Fill out the "Record Expenditure" form to add.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Overlay Modal with Add/Remove GST option */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-sm font-bold text-slate-100">Add Client Payment Record</h3>
              <button onClick={() => setIsNewInvoiceOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Client Name / Business *</label>
                <input 
                  type="text" 
                  required 
                  value={formClient} 
                  onChange={e => setFormClient(e.target.value)} 
                  placeholder="Apex Retail Solutions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Base Invoice Amount (INR) *</label>
                  <input 
                     type="number" 
                     required 
                     value={formAmount || ''} 
                     onChange={e => setFormAmount(Number(e.target.value))} 
                     className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Received amount (INR)</label>
                  <input 
                     type="number" 
                     value={formPaid || ''} 
                     onChange={e => setFormPaid(Number(e.target.value))} 
                     className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                  />
                </div>
              </div>

              {/* GST ADD / REMOVE Option as requested */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Append Service GST</span>
                  <p className="text-[10px] text-slate-400">Adds 18% standard Indian Agency Service tax to printable PDF.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="addGstCheckbox"
                    checked={addGst}
                    onChange={e => setAddGst(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="addGstCheckbox" className="text-xs font-bold text-slate-300 font-mono select-none cursor-pointer">
                    GST (18%)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Payment Mode</label>
                  <select 
                    value={formMode} 
                    onChange={e => setFormMode(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI network</option>
                    <option value="Cash">Cash Ledger</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Invoice Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value as any)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  >
                    <option value="Pending">Pending Due</option>
                    <option value="Paid">Paid Fully</option>
                    <option value="Partial">Partial Paid</option>
                    <option value="Overdue">Overdue Outstanding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Billing Deadline Target</label>
                <input 
                  type="date" 
                  value={formDueDate} 
                  onChange={e => setFormDueDate(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono" 
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-xs hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice PDF overlay mock sheet */}
      {isInvoicePreviewOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-350 rounded-xl max-w-2xl w-full text-slate-900 p-8 shadow-2xl relative font-sans">
            
            <button 
              onClick={() => setIsInvoicePreviewOpen(false)} 
              className="absolute right-4 top-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* PDF Header logo and invoice ID */}
            <div className="flex justify-between items-start pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs uppercase text-slate-400 font-mono tracking-wider block">official invoice receipt</span>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">GrowInvicta Agency Ltd</h1>
                <p className="text-[11px] text-slate-500">TechHub Park Sector 62, Noida, India</p>
                <p className="text-[11px] text-slate-500 font-mono">GSTIN: 09AAACA1234F1ZP</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-mono font-bold text-slate-800">{selectedPayment.invoiceNumber}</h2>
                <p className="text-xs text-slate-500">Date: {new Date().toISOString().split('T')[0]}</p>
                <p className="text-xs text-slate-500">Due: {selectedPayment.dueDate}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="py-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-mono block">client bill to:</span>
                <strong className="text-slate-900 text-sm block mt-1">{selectedPayment.clientName}</strong>
                <p className="text-slate-500 mt-0.5">Corporate business customer</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase font-mono block">payment parameters:</span>
                <strong className="text-slate-900 block mt-1">{selectedPayment.mode}</strong>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-indigo-600 font-bold border border-indigo-200 inline-block mt-1">
                  {selectedPayment.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Simple invoice lines table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200">
                  <tr>
                    <th className="p-3">line specifications</th>
                    <th className="p-3 text-right">Tax scope</th>
                    <th className="p-3 text-right">Amount line</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-3">
                      <strong>Agency Custom Campaign Development</strong>
                      <p className="text-[10px] text-slate-400 mt-0.5">Custom layout templates, SEO tags and database reconciliation.</p>
                    </td>
                    <td className="p-3 text-right font-mono">
                      {selectedPayment.gstAmount > 0 ? "18% Indian Service GST" : "Exempt / No Tax"}
                    </td>
                    <td className="p-3 text-right font-sans font-medium">₹{selectedPayment.amount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Invoice reconciliation totals */}
            <div className="py-6 font-mono text-xs space-y-2 max-w-sm ml-auto">
              <div className="grid grid-cols-2 gap-2 text-slate-500">
                <span>Subtotal amount</span>
                <span className="text-right text-slate-900">₹{selectedPayment.amount.toLocaleString('en-IN')}</span>
              </div>
              {selectedPayment.gstAmount > 0 && (
                <div className="grid grid-cols-2 gap-2 text-slate-500">
                  <span>18% GST Service Tax</span>
                  <span className="text-right text-slate-900">₹{selectedPayment.gstAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-900 font-bold pt-2 border-t border-slate-200">
                <span>Total invoice bill</span>
                <span className="text-right">₹{(selectedPayment.amount + selectedPayment.gstAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-emerald-600 font-semibold pt-1 border-t border-slate-100">
                <span>Paid amount (INR)</span>
                <span className="text-right">₹{selectedPayment.paidAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
              Thank you for trusting GrowInvicta Agency with your enterprise builds.
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'payment') {
              onDeletePayment(deleteTarget.id);
              const remaining = payments.filter(p => p.id !== deleteTarget.id);
              setSelectedPayment(remaining[0] || null);
            } else {
              onDeleteFinance(deleteTarget.id);
            }
          }
        }}
        title={deleteTarget?.type === 'payment' ? "Deprovision Invoice Register" : "Delete Expenditure Record"}
        message={
          deleteTarget?.type === 'payment'
            ? "Are you sure you want to deprovision this invoicing register? It will be archived and moved to the Archive Center."
            : "Are you sure you want to permanently delete this expenditure ledger record? This action cannot be undone."
        }
        itemName={deleteTarget?.name}
      />

    </div>
  );
}
