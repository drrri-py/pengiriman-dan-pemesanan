import React, { useState, useEffect } from 'react';
import { X, Upload, Truck as TruckIcon, MapPin, Droplets, Calendar } from 'lucide-react';
import { shipmentService, contractMetaService } from '../services/api';
import { Truck, Shipment } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ShipmentFormModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [contractRange, setContractRange] = useState<{ min?: string; max?: string; id?: number }>({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    truckId: '',
    volume: '',
    destination: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      Promise.all([shipmentService.getTrucks(), contractMetaService.getActive()]).then(([t, active]) => {
        setTrucks(t);
        if (active?.contract_id && active?.tgl_mulai && active?.tgl_selesai) {
          setContractRange({ id: active.contract_id, min: active.tgl_mulai, max: active.tgl_selesai });

          // Clamp tanggal form agar selalu di dalam range kontrak
          setFormData((prev) => {
            const nextDate = prev.date;
            if (active.tgl_mulai <= nextDate && nextDate <= active.tgl_selesai) return prev;
            const today = new Date().toISOString().slice(0, 10);
            const clamped = active.tgl_mulai <= today && today <= active.tgl_selesai ? today : active.tgl_mulai;
            return { ...prev, date: clamped };
          });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await shipmentService.create({
        date: formData.date,
        truckId: formData.truckId,
        driver: user.name,
        driverId: user.id,
        volume: Number(formData.volume),
        destination: formData.destination,
        status: 'Pending',
        contractId: contractRange.id,
      });
      onSuccess();
      onClose();
    } catch (error) {
      const detail = (error as any)?.response?.data?.detail;
      setSubmitError(detail || 'Gagal menyimpan shipment. Cek data yang diinput.');
      console.error('Failed to create shipment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Shipment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter fuel delivery details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {submitError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  min={contractRange.min}
                  max={contractRange.max}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Truck Plate</label>
              <div className="relative">
                <TruckIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  required
                  value={formData.truckId}
                  onChange={e => setFormData({...formData, truckId: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all"
                >
                  <option value="">Select Truck</option>
                  {trucks.map(t => (
                    <option key={t.id} value={t.id}>{t.plateNumber} ({t.capacity} KL)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                required
                placeholder="SPBU / Industry Name"
                value={formData.destination}
                onChange={e => setFormData({...formData, destination: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume (KL)</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="number" 
                required
                placeholder="e.g. 16"
                value={formData.volume}
                onChange={e => setFormData({...formData, volume: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proof of Delivery (Surat Jalan)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="text-blue-600" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-900 mt-4">Click to upload photo</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
