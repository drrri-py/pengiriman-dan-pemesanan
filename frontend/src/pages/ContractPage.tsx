import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { clientService, contractService } from '../services/api';

type ClientRow = {
  client_id: number;
  nama_klien: string;
};

type ContractRow = {
  contract_id: number;
  client_id: number;
  no_kontrak: string;
  tgl_mulai: string;
  tgl_selesai: string;
  tarif_per_kl: string | number;
};

export default function ContractPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    client_id: '',
    no_kontrak: '',
    tgl_mulai: '',
    tgl_selesai: '',
    tarif_per_kl: '150000.00',
  });

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, k] = await Promise.all([clientService.getAll(), contractService.getAll()]);
      setClients(c);
      setContracts(k);
      if (!form.client_id && c?.[0]?.client_id) {
        setForm((prev) => ({ ...prev, client_id: String(c[0].client_id) }));
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal memuat master data kontrak.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientNameById = useMemo(() => {
    const map = new Map<number, string>();
    clients.forEach((c) => map.set(c.client_id, c.nama_klien));
    return map;
  }, [clients]);

  const sorted = useMemo(() => {
    return contracts
      .slice()
      .sort((a, b) => String(b.tgl_selesai).localeCompare(String(a.tgl_selesai)));
  }, [contracts]);

  const handleCreate = async () => {
    setError(null);
    try {
      await contractService.create({
        client_id: Number(form.client_id),
        no_kontrak: form.no_kontrak,
        tgl_mulai: form.tgl_mulai,
        tgl_selesai: form.tgl_selesai,
        tarif_per_kl: form.tarif_per_kl,
      });
      setForm((prev) => ({ ...prev, no_kontrak: '', tgl_mulai: '', tgl_selesai: '' }));
      await fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal menambah kontrak.');
    }
  };

  const handleUpdate = async (contract_id: number, patch: Partial<ContractRow>) => {
    setError(null);
    try {
      await contractService.update(contract_id, patch);
      await fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal mengupdate kontrak.');
    }
  };

  const handleDelete = async (contract_id: number) => {
    if (!window.confirm('Hapus kontrak ini?')) return;
    setError(null);
    try {
      await contractService.delete(contract_id);
      await fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal menghapus kontrak.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="text-slate-500">Kelola kontrak klien (periode & tarif per KL).</p>
        </div>
        {loading && <span className="text-sm text-slate-500">Loading...</span>}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Create */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Tambah Kontrak</h2>
          <button
            onClick={handleCreate}
            disabled={!form.client_id || !form.no_kontrak || !form.tgl_mulai || !form.tgl_selesai}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {clients.map((c) => (
                <option key={c.client_id} value={String(c.client_id)}>
                  {c.nama_klien} (id: {c.client_id})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Kontrak</label>
            <input
              value={form.no_kontrak}
              onChange={(e) => setForm({ ...form, no_kontrak: e.target.value })}
              placeholder="KTR-755/PL000010/2024-50"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mulai</label>
            <input
              type="date"
              value={form.tgl_mulai}
              onChange={(e) => setForm({ ...form, tgl_mulai: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai</label>
            <input
              type="date"
              value={form.tgl_selesai}
              onChange={(e) => setForm({ ...form, tgl_selesai: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarif/KL</label>
            <input
              value={form.tarif_per_kl}
              onChange={(e) => setForm({ ...form, tarif_per_kl: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Daftar Kontrak</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No Kontrak</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mulai</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarif/KL</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((k) => (
                <tr key={k.contract_id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono">{k.contract_id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {clientNameById.get(k.client_id) || `Client ${k.client_id}`}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      defaultValue={k.no_kontrak}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next && next !== k.no_kontrak) handleUpdate(k.contract_id, { no_kontrak: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      defaultValue={k.tgl_mulai}
                      onBlur={(e) => {
                        const next = e.target.value;
                        if (next && next !== k.tgl_mulai) handleUpdate(k.contract_id, { tgl_mulai: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      defaultValue={k.tgl_selesai}
                      onBlur={(e) => {
                        const next = e.target.value;
                        if (next && next !== k.tgl_selesai) handleUpdate(k.contract_id, { tgl_selesai: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      defaultValue={String(k.tarif_per_kl)}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next && next !== String(k.tarif_per_kl)) handleUpdate(k.contract_id, { tarif_per_kl: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(k.contract_id)}
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
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Belum ada data kontrak.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
          Edit langsung di tabel: perubahan tersimpan saat input kehilangan fokus. Perubahan kontrak akan mengosongkan cache kontrak aktif untuk shipment.
        </div>
      </div>
    </div>
  );
}
