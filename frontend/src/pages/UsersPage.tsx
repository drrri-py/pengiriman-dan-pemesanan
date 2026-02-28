import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { adminUserService } from '../services/api';

type BackendUser = {
  user_id: number;
  username: string;
  nama_lengkap?: string | null;
  role: 'admin' | 'driver' | 'finance';
};

export default function UsersPage() {
  const [rows, setRows] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: '',
    nama_lengkap: '',
    role: 'driver' as BackendUser['role'],
    password: '',
  });

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminUserService.getAll();
      setRows(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal memuat data user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => a.username.localeCompare(b.username));
  }, [rows]);

  const handleCreate = async () => {
    setError(null);
    try {
      await adminUserService.create({
        username: form.username,
        nama_lengkap: form.nama_lengkap || null,
        role: form.role,
        password: form.password,
      });
      setForm({ username: '', nama_lengkap: '', role: 'driver', password: '' });
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal menambah user.');
    }
  };

  const handleUpdate = async (user_id: number, patch: Partial<BackendUser> & { password?: string }) => {
    setError(null);
    try {
      await adminUserService.update(user_id, patch);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal mengupdate user.');
    }
  };

  const handleDelete = async (user_id: number) => {
    if (!window.confirm('Hapus user ini?')) return;
    setError(null);
    try {
      await adminUserService.delete(user_id);
      await fetchRows();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Gagal menghapus user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500">Kelola akun Admin / Finance / Driver.</p>
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
          <h2 className="font-bold text-slate-900">Tambah User</h2>
          <button
            onClick={handleCreate}
            disabled={!form.username.trim() || !form.password}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="driver@ptyusuf.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
            <input
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              placeholder="Nama Pegawai"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">admin</option>
              <option value="finance">finance</option>
              <option value="driver">driver</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="********"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Daftar User</h2>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono">{u.user_id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{u.username}</td>
                  <td className="px-6 py-4">
                    <input
                      defaultValue={u.nama_lengkap || ''}
                      onBlur={(e) => {
                        const next = e.target.value;
                        if (next !== (u.nama_lengkap || '')) handleUpdate(u.user_id, { nama_lengkap: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      defaultValue={u.role}
                      onChange={(e) => handleUpdate(u.user_id, { role: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">admin</option>
                      <option value="finance">finance</option>
                      <option value="driver">driver</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(u.user_id)}
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
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Belum ada data user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
          Edit nama/role langsung di tabel.
        </div>
      </div>
    </div>
  );
}

