import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  MapPin,
  Truck as TruckIcon,
  User as UserIcon,
  Droplets,
  MoreHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import { Shipment } from '../types';
import { shipmentService } from '../services/api';
import { cn } from '../lib/utils';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

interface Props {
  shipments: Shipment[];
  onRefresh: () => void;
}

export default function AdminShipmentView({ shipments, onRefresh }: Props) {
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const handleVerify = async (id: string) => {
    setIsVerifying(id);
    try {
      await shipmentService.updateStatus(id, 'Verified');
      onRefresh();
    } catch (error) {
      console.error('Failed to verify shipment:', error);
    } finally {
      setIsVerifying(null);
    }
  };

  const handleExport = () => {
    // 1. Define CSV headers
    const headers = ['ID', 'Date', 'Driver', 'Truck', 'Destination', 'Volume (KL)', 'Status'];

    // 2. Convert shipments data to CSV rows
    const csvRows = shipments.map(shipment => [
      shipment.id,
      shipment.date,
      `"${shipment.driver}"`, // Wrap in quotes to handle potential commas
      `"${shipment.truck}"`,
      `"${shipment.destination}"`,
      shipment.volume,
      shipment.status
    ]);

    // 3. Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    // 4. Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shipment_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipment Monitoring</h1>
          <p className="text-slate-500">Overview of all fuel logistics operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by driver, truck, or destination..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver & Truck</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{shipment.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <UserIcon size={14} className="text-slate-400" />
                        {shipment.driver}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                        <TruckIcon size={12} />
                        {shipment.truck}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-blue-600 font-black">
                      <Droplets size={14} />
                      {shipment.volume} KL
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <MapPin size={14} className="text-slate-400" />
                      {shipment.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5",
                      shipment.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                        shipment.status === 'Verified' ? "bg-blue-100 text-blue-700" :
                          shipment.status === 'Delivered' ? "bg-emerald-100 text-emerald-700" :
                            "bg-slate-100 text-slate-500"
                    )}>
                      {shipment.status === 'Pending' && <Clock size={12} />}
                      {shipment.status === 'Verified' && <CheckCircle2 size={12} />}
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {shipment.proofUrl && (
                        <a
                          href={`${API_URL}${shipment.proofUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                        >
                          <ImageIcon size={14} />
                          View Proof
                        </a>
                      )}

                      {shipment.status === 'Pending' ? (
                        <button
                          onClick={() => handleVerify(shipment.id)}
                          disabled={isVerifying === shipment.id}
                          className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                          {isVerifying === shipment.id ? '...' : 'Verify'}
                        </button>
                      ) : (
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
