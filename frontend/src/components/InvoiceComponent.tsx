import React from 'react';
import { Invoice, CompanySettings } from '../types';
import { MapPin, Globe, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { terbilang } from '../lib/terbilang';

interface Props {
  invoice: Invoice;
  settings: CompanySettings;
}

export default function InvoiceComponent({ invoice, settings }: Props) {
  const subtotal = invoice.totalAmount;
  const ppn = invoice.isTaxExempt ? 0 : subtotal * 0.12;
  const total = subtotal + ppn;

  return (
    <div className="bg-white p-8 sm:p-12 shadow-sm print:shadow-none">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">{settings.name}</h1>
          <p className="text-blue-600 font-bold tracking-widest text-xs mt-1 uppercase">Fuel Logistics & Transportation</p>
          <div className="mt-6 space-y-1 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              {settings.address}
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} />
              www.pt-yusufaldi.com
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-light tracking-tight text-slate-300 uppercase">Invoice</h2>
          <p className="mt-4 text-xl font-bold text-blue-600">{invoice.number}</p>
          <p className="text-slate-500 text-sm mt-1">Date: {invoice.date}</p>
        </div>
      </div>

      {/* Billing Info */}
      <div className="grid grid-cols-2 gap-12 mt-12">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bill To:</h3>
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-900">{invoice.clientName}</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Gedung Patra Jasa Lt. 12<br />
              Jl. Jend. Gatot Subroto Kav. 32-34<br />
              Jakarta Selatan 12950
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Payment Details:</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Bank:</span>
              <span className="text-sm font-bold text-slate-900">{settings.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Account Name:</span>
              <span className="text-sm font-bold text-slate-900">{settings.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Account Number:</span>
              <span className="text-sm font-bold text-blue-600">{settings.bankAccount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-12">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Description</th>
              <th className="py-4 text-center text-xs font-bold text-slate-900 uppercase tracking-wider">Supply Point</th>
              <th className="py-4 text-center text-xs font-bold text-slate-900 uppercase tracking-wider">Tujuan</th>
              <th className="py-4 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-6">
                <p className="font-bold text-slate-900">Fuel Transportation Service</p>
                <p className="text-xs text-slate-500 mt-1">Verified Realisasi Thruput</p>
              </td>
              <td className="py-6 text-center text-sm text-slate-600">{invoice.supplyPoint}</td>
              <td className="py-6 text-center text-sm text-slate-600">{invoice.destination}</td>
              <td className="py-6 text-right font-bold text-slate-900">Rp {subtotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mt-8">
        <div className="w-full max-w-xs space-y-3">
          <div className="flex justify-between text-slate-500 text-sm">
            <span>DPP (Dasar Pengenaan Pajak)</span>
            <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-500 text-sm">
            <span>PPN (12%)</span>
            <span className="font-medium">
              {invoice.isTaxExempt ? 'Rp 0 (Dibebaskan)' : `Rp ${ppn.toLocaleString()}`}
            </span>
          </div>
          {invoice.isTaxExempt && (
            <p className="text-[10px] text-slate-400 italic text-right">
              * PPN Dibebaskan Berdasarkan {invoice.taxExemptReference}
            </p>
          )}
          <div className="flex justify-between pt-4 border-t-2 border-slate-900">
            <span className="text-lg font-bold text-slate-900">Total Amount</span>
            <span className="text-2xl font-black text-blue-600">Rp {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 grid grid-cols-2 gap-12">
        <div>
          <p className="text-xs font-bold text-slate-900 uppercase mb-2">Terbilang:</p>
          <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
            "{terbilang(total)} Rupiah"
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 mb-20">Authorized Signature,</p>
          <div className="relative inline-block">
            <CheckCircle2 size={40} className="text-blue-600/10 absolute -top-8 left-1/2 -translate-x-1/2" />
            <p className="text-lg font-black text-slate-900 border-b-2 border-slate-900 px-8 pb-1 uppercase">Yusuf Aldi L.</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Director</p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2"><Mail size={12} /> billing@pt-yusufaldi.com</div>
        <div className="flex items-center gap-2"><Phone size={12} /> +62 234 1234567</div>
        <div className="flex items-center gap-2"><MapPin size={12} /> NPWP: {settings.npwp}</div>
      </div>
    </div>
  );
}
