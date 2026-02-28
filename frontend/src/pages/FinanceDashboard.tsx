import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowRight,
  Truck,
  MapPin,
  Droplets,
  ChevronRight,
  Ban,
  History,
  Send,
  CreditCard,
  Edit3
} from 'lucide-react';
import { invoiceService, shipmentService } from '../services/api';
import { Invoice, Shipment } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

type ViewMode = 'Invoices' | 'BillingReady';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('Invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [verifiedShipments, setVerifiedShipments] = useState<Shipment[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unpaid' | 'Paid' | 'Overdue' | 'Voided'>('All');

  const isFinance = user?.role === 'Finance';
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    invoiceService.getAll().then(setInvoices);
    shipmentService.getAll().then(all => {
      setVerifiedShipments(all.filter(s => s.status === 'Verified'));
    });
  }, []);

  const filteredInvoices = invoices.filter(inv => filter === 'All' || inv.status === filter);

  const stats = {
    unpaid: invoices.filter(i => i.status === 'Unpaid').length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    overdue: invoices.filter(i => i.status === 'Overdue').length,
    voided: invoices.filter(i => i.status === 'Voided').length,
    totalUnpaid: invoices.filter(i => i.status !== 'Paid' && i.status !== 'Voided').reduce((acc, curr) => acc + curr.totalAmount * 1.12, 0),
    totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount * 1.12, 0),
    pendingTaxSerial: invoices.filter(i => !i.nsfp && i.status !== 'Voided').length
  };

  const toggleShipmentSelection = (id: string) => {
    setSelectedShipments(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleGenerateInvoice = () => {
    if (selectedShipments.length === 0) return;
    navigate('/invoices/generate', { state: { selectedShipmentIds: selectedShipments } });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Finance Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage billing, tax documentation, and verified throughput.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode('Invoices')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              viewMode === 'Invoices' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Invoice List
          </button>
          {isFinance && (
            <button 
              onClick={() => setViewMode('BillingReady')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                viewMode === 'BillingReady' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Billing Ready
              {verifiedShipments.length > 0 && (
                <span className={cn(
                  "w-5 h-5 rounded-full text-[10px] flex items-center justify-center",
                  viewMode === 'BillingReady' ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"
                )}>
                  {verifiedShipments.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {viewMode === 'Invoices' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {isFinance ? (
              <>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-600 mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg"><Clock size={20} /></div>
                    <span className="text-sm font-bold uppercase tracking-wider">Unpaid</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.unpaid}</h3>
                  <p className="text-xs text-slate-500 mt-1">Awaiting settlement</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-blue-600 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg"><FileText size={20} /></div>
                    <span className="text-sm font-bold uppercase tracking-wider">Pending Tax Serial</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.pendingTaxSerial}</h3>
                  <p className="text-xs text-slate-500 mt-1">Requires NSFP update</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-rose-600 mb-4">
                    <div className="p-2 bg-rose-50 rounded-lg"><AlertCircle size={20} /></div>
                    <span className="text-sm font-bold uppercase tracking-wider">Overdue</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.overdue}</h3>
                  <p className="text-xs text-slate-500 mt-1">Requires immediate action</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-900/20">
                  <div className="flex items-center gap-3 text-blue-400 mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider">Total Outstanding</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Rp {stats.totalUnpaid.toLocaleString()}</h3>
                  <p className="text-xs text-slate-400 mt-1">Including PPN 12%</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-emerald-600 mb-4">
                    <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle2 size={20} /></div>
                    <span className="text-sm font-bold uppercase tracking-wider">Revenue (Month)</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Rp {stats.totalRevenue.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-1">Total settled payments</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-rose-600 mb-4">
                    <div className="p-2 bg-rose-50 rounded-lg"><Ban size={20} /></div>
                    <span className="text-sm font-bold uppercase tracking-wider">Voided Invoices</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.voided}</h3>
                  <p className="text-xs text-slate-500 mt-1">Canceled for audit</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-600 mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg"><Clock size={20} /></div>
                    <span className="text-sm font-bold uppercase tracking-wider">Unpaid Count</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{stats.unpaid}</h3>
                  <p className="text-xs text-slate-500 mt-1">Active receivables</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-900/20">
                  <div className="flex items-center gap-3 text-blue-400 mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider">Total Receivables</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Rp {stats.totalUnpaid.toLocaleString()}</h3>
                  <p className="text-xs text-slate-400 mt-1">Outstanding balance</p>
                </div>
              </>
            )}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search invoices..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                {(['All', 'Unpaid', 'Paid', 'Overdue', 'Voided'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                      filter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Details</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Route</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount (DPP)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{invoice.number}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{invoice.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-700">{invoice.clientName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{invoice.supplyPoint} → {invoice.destination}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="font-black text-slate-900">Rp {invoice.totalAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-medium">+ PPN 12%</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                          invoice.isTaxExempt ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {invoice.isTaxExempt ? 'Exempt' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            invoice.status === 'Paid' ? "bg-emerald-500" : 
                            invoice.status === 'Overdue' ? "bg-rose-500" : 
                            invoice.status === 'Voided' ? "bg-slate-400" : "bg-amber-500"
                          )} />
                          <span className="text-xs font-bold text-slate-700">{invoice.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isFinance && invoice.status !== 'Voided' && (
                            <>
                              <button 
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit Tax Serial"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Send to Client"
                              >
                                <Send size={16} />
                              </button>
                              {invoice.status !== 'Paid' && (
                                <button 
                                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                  title="Record Payment"
                                >
                                  <CreditCard size={16} />
                                </button>
                              )}
                            </>
                          )}
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                title="View History"
                              >
                                <History size={16} />
                              </button>
                              {invoice.status !== 'Voided' && (
                                <button 
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to void this invoice?')) {
                                      invoiceService.void(invoice.id, user?.name || 'Admin').then(() => {
                                        invoiceService.getAll().then(setInvoices);
                                      });
                                    }
                                  }}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Void/Cancel Invoice"
                                >
                                  <Ban size={16} />
                                </button>
                              )}
                            </>
                          )}
                          <Link 
                            to={`/invoices/${invoice.id}`}
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all ml-2"
                          >
                            View
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-600/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Truck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Verified Shipment Aggregation</h2>
                <p className="text-blue-100 text-sm">Select shipments to bundle into a single invoice.</p>
              </div>
            </div>
            {selectedShipments.length > 0 && (
              <button 
                onClick={handleGenerateInvoice}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all animate-in slide-in-from-right-4"
              >
                Generate Invoice ({selectedShipments.length})
                <ArrowRight size={18} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedShipments.map((s) => {
              const isSelected = selectedShipments.includes(s.id);
              return (
                <div 
                  key={s.id}
                  onClick={() => toggleShipmentSelection(s.id)}
                  className={cn(
                    "bg-white p-6 rounded-3xl border-2 transition-all cursor-pointer group relative overflow-hidden",
                    isSelected ? "border-blue-600 shadow-lg shadow-blue-600/5" : "border-slate-200 hover:border-blue-300"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600 flex items-center justify-center rounded-bl-3xl animate-in fade-in zoom-in duration-200">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                      )}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.truck}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.date}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-xs font-medium truncate">{s.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Droplets size={14} className="text-blue-400" />
                        <span className="text-sm font-black">{s.volume} KL</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Verified</span>
                      <ChevronRight size={16} className={cn(
                        "transition-transform",
                        isSelected ? "text-blue-600 translate-x-1" : "text-slate-300 group-hover:text-blue-400"
                      )} />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {verifiedShipments.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No verified shipments ready for billing.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
