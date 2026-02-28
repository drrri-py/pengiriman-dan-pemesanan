import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Receipt as ReceiptIcon,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  History as HistoryIcon,
  Save,
  Edit3
} from 'lucide-react';
import { invoiceService, settingsService } from '../services/api';
import { Invoice, CompanySettings } from '../types';
import InvoiceComponent from '../components/InvoiceComponent';
import TaxInvoiceComponent from '../components/TaxInvoiceComponent';
import ReceiptComponent from '../components/ReceiptComponent';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

type TabType = 'invoice' | 'tax' | 'receipt';

export default function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('invoice');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditingNSFP, setIsEditingNSFP] = useState(false);
  const [nsfpValue, setNsfpValue] = useState('');

  const isFinance = user?.role === 'Finance';
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (id) {
      invoiceService.getById(id).then(inv => {
        setInvoice(inv || null);
        if (inv) setNsfpValue(inv.nsfp || '');
      });
      settingsService.get().then(setSettings);
    }
  }, [id]);

  if (!invoice || !settings) return <div className="p-8 text-center text-slate-500">Loading documents...</div>;

  const isPaid = invoice.status === 'Paid';
  const isVoided = invoice.status === 'Voided';

  const handleConfirmPayment = async () => {
    if (!id) return;
    try {
      await invoiceService.updateStatus(id, 'Paid', user?.name || 'Finance');
      const updated = await invoiceService.getById(id);
      if (updated) setInvoice(updated);
      setIsConfirmingPayment(false);
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    }
  };

  const handleUpdateNSFP = async () => {
    if (!id) return;
    try {
      await invoiceService.updateNSFP(id, nsfpValue, user?.name || 'Finance');
      const updated = await invoiceService.getById(id);
      if (updated) setInvoice(updated);
      setIsEditingNSFP(false);
    } catch (error) {
      console.error('Failed to update NSFP:', error);
    }
  };

  const tabs = [
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'tax', label: 'Faktur Pajak', icon: ShieldCheck },
    { id: 'receipt', label: 'Kwitansi', icon: ReceiptIcon, disabled: !isPaid },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Actions Bar */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Invoices
        </button>
        <div className="flex items-center gap-3">
          {isFinance && !isPaid && !isVoided && (
            <button 
              onClick={() => setIsConfirmingPayment(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
            >
              <CreditCard size={20} />
              Record Payment
            </button>
          )}
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
          >
            <Printer size={20} />
            Print Document
          </button>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {isConfirmingPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
              <p className="text-xs text-slate-500 mt-0.5">Mark invoice {invoice.number} as paid</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                  Recording payment will generate the <strong>Official Receipt (Kwitansi)</strong> and update the ledger.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="date" 
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsConfirmingPayment(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmPayment}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Confirm & Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Document Controls / Timeline */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          {/* Tab Navigation */}
          <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                      : tab.disabled 
                        ? "text-slate-300 cursor-not-allowed" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.disabled && <Lock size={14} className="ml-auto opacity-50" />}
                </button>
              );
            })}
          </div>

          {isFinance ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Edit3 size={18} />
                <h3 className="text-sm font-bold uppercase tracking-tight">Finance Actions</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Serial (NSFP)</label>
                  {isEditingNSFP ? (
                    <div className="space-y-2">
                      <input 
                        type="text"
                        value={nsfpValue}
                        onChange={(e) => setNsfpValue(e.target.value)}
                        placeholder="000.000-00.00000000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingNSFP(false)}
                          className="flex-1 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleUpdateNSFP}
                          className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-mono text-slate-600">{invoice.nsfp || 'Not Set'}</span>
                      <button 
                        onClick={() => setIsEditingNSFP(true)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</label>
                  <div className={cn(
                    "p-3 rounded-xl border flex items-center justify-between",
                    isPaid ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
                  )}>
                    <span className="text-xs font-bold uppercase">{invoice.status}</span>
                    {!isPaid && !isVoided && (
                      <button 
                        onClick={() => setIsConfirmingPayment(true)}
                        className="text-[10px] font-black underline uppercase"
                      >
                        Record
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-slate-900">
                <HistoryIcon size={18} />
                <h3 className="text-sm font-bold uppercase tracking-tight">Audit Timeline</h3>
              </div>
              
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                {invoice.history.map((item, idx) => (
                  <div key={idx} className="relative pl-8 space-y-1">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                    <p className="text-xs font-bold text-slate-900 leading-tight">{item.action}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{item.user}</span>
                      <span>{format(new Date(item.timestamp), 'HH:mm')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Document Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
            {activeTab === 'invoice' && <InvoiceComponent invoice={invoice} settings={settings} />}
            {activeTab === 'tax' && <TaxInvoiceComponent invoice={invoice} settings={settings} />}
            {activeTab === 'receipt' && isPaid && <ReceiptComponent invoice={invoice} settings={settings} />}
          </div>
        </div>
      </div>

      {/* Print Footer - Only visible on print */}
      <div className="hidden print:block text-center text-[10px] text-slate-400 mt-8 border-t pt-4">
        This document was generated by PT YUSUF ALDI LAKSANA ERP on {new Date().toLocaleString()}
      </div>
    </div>
  );
}
