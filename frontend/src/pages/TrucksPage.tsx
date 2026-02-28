import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { truckService } from '../services/api';

type TruckRow = {
  truck_id: number;
  plat_nomor: string;
  kapasitas_kl: number;
};

export default function TrucksPage() {
  const [rows, setRows] = useState<TruckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newPlat, setNewPlat] = useState('');
  const [newCap, setNewCap] = useState<number>(16);

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await truckService.getAll();
      // truckService.getAll() returns mapped type for UI; convert to backend-like keys for table
      const normalized: TruckRow[] = data.map((t: any) => ({
        truck_id: Number(t.id),
        plat_nomor: t.plateNumber,
        kapasitas_kl: Number(t.capacity),
      }));
      setRows(normalized);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal memuat data truk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => a.plat_nomor.localeCompare(b.plat_nomor));
  }, [rows]);

  const handleCreate = async () => {
    setError(null);
    try {
      await truckService.create({ plat_nomor: newPlat, kapasitas_kl: newCap });
      setNewPlat('');
      setNewCap(16);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal menambah truk.');
    }
  };

  const handleUpdate = async (truck_id: number, patch: Partial<TruckRow>) => {
    setError(null);
    try {
      await truckService.update(truck_id, patch);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal mengupdate truk.');
    }
  };

  const handleDelete = async (truck_id: number) => {
    if (!window.confirm('Hapus truk ini?')) return;
    setError(null);
    try {
      await truckService.delete(truck_id);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal menghapus truk.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trucks</h1>
          <p className="text-slate-500">Kelola armada truk dan kapasitasnya.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Create */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Tambah Truk</h2>
          <button
            onClick={handleCreate}
            disabled={!newPlat.trim()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plat Nomor</label>
            <input
              value={newPlat}
              onChange={(e) => setNewPlat(e.target.value)}
              placeholder="B 1234 PAT"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas (KL)</label>
            <input
              type="number"
              value={newCap}
              onChange={(e) => setNewCap(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Daftar Truk</h2>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plat</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas (KL)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((t) => (
                <tr key={t.truck_id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono">{t.truck_id}</td>
                  <td className="px-6 py-4">
                    <input
                      defaultValue={t.plat_nomor}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next && next !== t.plat_nomor) handleUpdate(t.truck_id, { plat_nomor: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      defaultValue={t.kapasitas_kl}
                      onBlur={(e) => {
                        const next = Number(e.target.value);
                        if (!Number.isNaN(next) && next !== t.kapasitas_kl) handleUpdate(t.truck_id, { kapasitas_kl: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(t.truck_id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Belum ada data truk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
          Edit langsung di tabel: perubahan tersimpan saat input kehilangan fokus.
        </div>
      </div>
    </div>
  );
}

