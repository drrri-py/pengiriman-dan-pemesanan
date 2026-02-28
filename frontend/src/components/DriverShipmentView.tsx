import React, { useState } from 'react';
import {
  Plus,
  Truck as TruckIcon,
  MapPin,
  Droplets,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Shipment } from '../types';
import { cn } from '../lib/utils';
import ShipmentFormModal from './ShipmentFormModal';
import ProofUploadModal from './ProofUploadModal';

// Provide a base URL fallback or use env var
// @ts-ignore
const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

interface Props {
  shipments: Shipment[];
  onRefresh: () => void;
}

export default function DriverShipmentView({ shipments, onRefresh }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  const handleOpenProofModal = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    setIsProofModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Shipments</h1>
          <p className="text-slate-500">Track your fuel delivery history.</p>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4">
        {shipments.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No shipments recorded yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-blue-600 font-bold text-sm hover:underline"
            >
              Add your first shipment
            </button>
          </div>
        ) : (
          shipments.map((shipment) => (
            <div key={shipment.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <TruckIcon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{shipment.truck}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                      <Calendar size={10} />
                      {shipment.date}
                    </div>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  shipment.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                    shipment.status === 'Verified' ? "bg-blue-100 text-blue-700" :
                      shipment.status === 'Delivered' ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-500"
                )}>
                  {shipment.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="text-sm font-medium">{shipment.destination}</span>
                </div>
                <div className="flex items-center gap-3 text-blue-600">
                  <Droplets size={16} className="text-blue-400" />
                  <span className="text-sm font-black">{shipment.volume} KL</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shipment.status === 'Pending' ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase">
                      <Clock size={12} />
                      Awaiting Verification
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase">
                      <CheckCircle2 size={12} />
                      Verified
                    </div>
                  )}
                </div>
                {shipment.proofUrl ? (
                  <a
                    href={`${API_URL}${shipment.proofUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <ImageIcon size={14} />
                    View Proof
                  </a>
                ) : (
                  <button
                    onClick={() => handleOpenProofModal(shipment.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Upload size={14} />
                    Upload Proof
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:hidden"
      >
        <Plus size={28} />
      </button>

      {/* Desktop Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
      >
        <Plus size={20} />
        Add New Shipment
      </button>

      <ShipmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />

      <ProofUploadModal
        isOpen={isProofModalOpen}
        onClose={() => {
          setIsProofModalOpen(false);
          setSelectedShipmentId(null);
        }}
        shipmentId={selectedShipmentId}
        onSuccess={onRefresh}
      />
    </div>
  );
}
