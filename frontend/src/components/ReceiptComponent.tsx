import React from 'react';
import { Invoice, CompanySettings } from '../types';
import { terbilang } from '../lib/terbilang';

interface Props {
  invoice: Invoice;
  settings: CompanySettings;
}

export default function ReceiptComponent({ invoice, settings }: Props) {
  const subtotal = invoice.totalAmount;
  const ppn = invoice.isTaxExempt ? 0 : subtotal * 0.12;
  const total = subtotal + ppn;

  return (
    <div className="bg-white p-12 border-4 border-double border-slate-900 shadow-sm print:shadow-none print:border-slate-900">
      <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900">{settings.name}</h1>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Official Receipt</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-400">No: {invoice.number.replace('INV', 'KWT')}</p>
          <p className="text-sm text-slate-500">{invoice.date}</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-4 gap-4 items-center">
          <span className="text-slate-500 text-sm font-medium">Telah terima dari:</span>
          <div className="col-span-3 border-b border-dotted border-slate-400 pb-1 font-bold text-slate-900">
            {invoice.clientName}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 items-center">
          <span className="text-slate-500 text-sm font-medium">Uang sejumlah:</span>
          <div className="col-span-3 bg-slate-50 p-4 rounded-lg border border-slate-100 italic font-serif text-slate-700">
            "{terbilang(total)} Rupiah"
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 items-start">
          <span className="text-slate-500 text-sm font-medium">Untuk pembayaran:</span>
          <div className="col-span-3 border-b border-dotted border-slate-400 pb-1 text-slate-900 leading-relaxed">
            Pembayaran Invoice No. {invoice.number} - Jasa Angkutan BBM Supply Point {invoice.supplyPoint} ke {invoice.destination}
          </div>
        </div>

        <div className="flex justify-between items-end pt-12">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-lg text-2xl font-black flex items-center gap-4">
            <span className="text-sm font-normal opacity-60">Jumlah:</span>
            Rp {total.toLocaleString()}
          </div>

          <div className="relative text-center w-64">
            {/* Meterai Placeholder */}
            <div className="absolute -left-12 top-0 w-24 h-16 border-2 border-dashed border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-200 rotate-12 pointer-events-none">
              METERAI<br />10.000
            </div>
            
            <p className="text-sm mb-24">Indramayu, {invoice.date}</p>
            <p className="font-bold border-b-2 border-slate-900 inline-block px-8 pb-1">YUSUF ALDI LAKSANA</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Director</p>
          </div>
        </div>
      </div>
    </div>
  );
}
