import React from 'react';
import { Invoice, CompanySettings } from '../types';

interface Props {
  invoice: Invoice;
  settings: CompanySettings;
}

export default function TaxInvoiceComponent({ invoice, settings }: Props) {
  const subtotal = invoice.totalAmount;
  const ppn = invoice.isTaxExempt ? 0 : subtotal * 0.12;

  return (
    <div className="bg-white p-12 border border-slate-200 shadow-sm print:shadow-none print:border-none">
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
        <h1 className="text-xl font-bold uppercase">Faktur Pajak</h1>
      </div>

      <div className="space-y-6 text-sm">
        {/* NSFP */}
        <div className="grid grid-cols-3 border border-slate-900">
          <div className="p-2 border-r border-slate-900 font-bold bg-slate-50">Kode dan Nomor Seri Faktur Pajak</div>
          <div className="p-2 col-span-2 font-mono">{invoice.nsfp || '000.000-00.00000000'}</div>
        </div>

        {/* Pengusaha Kena Pajak */}
        <div className="border border-slate-900">
          <div className="p-2 border-b border-slate-900 font-bold bg-slate-50 uppercase">Pengusaha Kena Pajak</div>
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Nama:</span>
              <span className="col-span-2 font-bold">{settings.name}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Alamat:</span>
              <span className="col-span-2">{settings.address}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">NPWP:</span>
              <span className="col-span-2 font-mono">{settings.npwp}</span>
            </div>
          </div>
        </div>

        {/* Pembeli Barang Kena Pajak */}
        <div className="border border-slate-900">
          <div className="p-2 border-b border-slate-900 font-bold bg-slate-50 uppercase">Pembeli Barang Kena Pajak / Penerima Jasa Kena Pajak</div>
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Nama:</span>
              <span className="col-span-2 font-bold">{invoice.clientName}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Alamat:</span>
              <span className="col-span-2">Gedung Patra Jasa Lt. 12, Jakarta Selatan</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">NPWP:</span>
              <span className="col-span-2 font-mono">01.000.000.0-000.000</span>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <table className="w-full border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-900 p-2 text-left">No.</th>
              <th className="border border-slate-900 p-2 text-left">Nama Barang Kena Pajak / Jasa Kena Pajak</th>
              <th className="border border-slate-900 p-2 text-right">Harga Jual/Penggantian/Uang Muka/Termin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-900 p-2 align-top">1</td>
              <td className="border border-slate-900 p-2">
                Jasa Angkutan BBM / Fuel Transportation Service<br />
                <span className="text-xs text-slate-500">Supply Point: {invoice.supplyPoint}</span>
              </td>
              <td className="border border-slate-900 p-2 text-right">Rp {subtotal.toLocaleString()}</td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={2} className="border border-slate-900 p-2 text-right">Harga Jual / Penggantian</td>
              <td className="border border-slate-900 p-2 text-right">Rp {subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={2} className="border border-slate-900 p-2 text-right">Dikurangi Potongan Harga</td>
              <td className="border border-slate-900 p-2 text-right">Rp 0</td>
            </tr>
            <tr>
              <td colSpan={2} className="border border-slate-900 p-2 text-right">Dikurangi Uang Muka yang telah diterima</td>
              <td className="border border-slate-900 p-2 text-right">Rp 0</td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={2} className="border border-slate-900 p-2 text-right">Dasar Pengenaan Pajak (DPP)</td>
              <td className="border border-slate-900 p-2 text-right">Rp {subtotal.toLocaleString()}</td>
            </tr>
            <tr className="bg-blue-50 font-bold">
              <td colSpan={2} className="border border-slate-900 p-2 text-right">PPN = 12% x Dasar Pengenaan Pajak</td>
              <td className="border border-slate-900 p-2 text-right">Rp {ppn.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax Exempt Note */}
        {invoice.isTaxExempt && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs italic text-amber-800">
            PPN DIBEBASKAN SESUAI DENGAN {invoice.taxExemptReference || 'KETENTUAN YANG BERLAKU'}
          </div>
        )}

        {/* Signature */}
        <div className="flex justify-end pt-8">
          <div className="text-center w-64">
            <p className="mb-20">Indramayu, {invoice.date}</p>
            <p className="font-bold border-b border-slate-900 inline-block px-4">YUSUF ALDI LAKSANA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
