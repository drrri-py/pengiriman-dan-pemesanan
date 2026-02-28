import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Info,
  Calculator,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { shipmentService, invoiceService, settingsService, contractMetaService } from '../services/api';
import { Shipment, CompanySettings, Invoice } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function InvoiceGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedShipmentIds = location.state?.selectedShipmentIds as string[] || [];

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [unitPrice, setUnitPrice] = useState(9375000); // Default unit price
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedShipmentIds.length === 0) {
      navigate('/invoices');
      return;
    }

    Promise.all([
      shipmentService.getAll(),
      settingsService.get()
    ]).then(([allShipments, companySettings]) => {
      setShipments(allShipments.filter(s => selectedShipmentIds.includes(s.id)));
      setSettings(companySettings);
    });
  }, [selectedShipmentIds, navigate]);

  if (!settings || shipments.length === 0) return <div className="p-8 text-center">Loading preview...</div>;

  const totalVolume = shipments.reduce((acc, curr) => acc + curr.volume, 0);
  const dpp = totalVolume * unitPrice;
  const ppn = isTaxExempt ? 0 : dpp * 0.12;
  const total = dpp + ppn;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dates = shipments.map(s => s.date).sort();
      const periode_awal = dates[0];
      const periode_akhir = dates[dates.length - 1];

      const activeContract = await contractMetaService.getActive();
      const contractId = activeContract?.contract_id || 1; // Fallback for safety

      await invoiceService.create({
        contract_id: contractId,
        periode_awal,
        periode_akhir,
        is_tax_exempt: isTaxExempt
      });
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to save invoice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Invoice Generation Preview</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <Calculator size={20} />
              <h2 className="font-bold uppercase tracking-wider text-sm">Billing Config</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price (per KL)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isTaxExempt}
                      onChange={() => setIsTaxExempt(!isTaxExempt)}
                    />
                    <div className={cn(
                      "w-10 h-6 rounded-full transition-colors",
                      isTaxExempt ? "bg-blue-600" : "bg-slate-200"
                    )} />
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                      isTaxExempt ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Tax Exempt (PPN 0%)</span>
                </label>
                {isTaxExempt && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2">
                    <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-700 leading-tight">
                      Applying exemption reference: <strong>PP No. 49 Tahun 2022</strong>. PPN will be calculated as Rp 0.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Confirm & Save Invoice'}
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
            <Info className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-700 leading-relaxed">
              Bundling <strong>{shipments.length} shipments</strong> into a single invoice. Ensure all verified volumes match the physical Surat Jalan before confirming.
            </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Shipment Breakdown</h3>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                {totalVolume} KL Total
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {shipments.map((s) => (
                <div key={s.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{s.destination}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{s.date}</span>
                      <span>{s.truck}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{s.volume} KL</p>
                    <p className="text-[10px] text-slate-400 font-medium">Rp {(s.volume * unitPrice).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-900 text-white">
              <div className="space-y-3">
                <div className="flex justify-between text-slate-400 text-sm font-medium">
                  <span>DPP (Dasar Pengenaan Pajak)</span>
                  <span>Rp {dpp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm font-medium">
                  <span>PPN (12%)</span>
                  <span>{isTaxExempt ? 'Rp 0 (Exempt)' : `Rp ${ppn.toLocaleString()}`}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Billing</p>
                    <p className="text-3xl font-black text-blue-400">Rp {total.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertCircle size={14} />
                      Draft / Unpaid
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
