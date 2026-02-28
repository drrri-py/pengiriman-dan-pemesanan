import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Truck,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { shipmentService, contractService, invoiceService } from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : trend === 'down' ? <ArrowDownRight size={16} /> : null}
        {trendValue}
      </div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeContracts: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      shipmentService.getAll(),
      contractService.getAll(),
      invoiceService.getAll()
    ]).then(([shipments, contracts, invoices]) => {
      // 1. Calculate Stats
      const today = new Date().toISOString().slice(0, 10);

      const verifiedShipments = shipments.filter((s: any) => s.status === 'Verified');
      const totalVol = verifiedShipments.reduce((acc: number, curr: any) => acc + (curr.volume || 0), 0);

      const activeConts = contracts.filter((c: any) => c.tgl_mulai <= today && today <= c.tgl_selesai).length;

      const pendingInvs = invoices.filter((i: any) => i.status === 'Unpaid').length;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyRev = invoices
        .filter((i: any) => {
          if (i.status !== 'Paid') return false;
          const d = new Date(i.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);

      setStats({
        totalVolume: totalVol,
        activeContracts: activeConts,
        pendingInvoices: pendingInvs,
        monthlyRevenue: monthlyRev,
      });

      // 2. Calculate Chart Data (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          monthIdx: d.getMonth(),
          year: d.getFullYear(),
          name: months[d.getMonth()]
        };
      });

      const aggregatedData = last6Months.map(m => {
        // Volume per month
        const kl = verifiedShipments
          .filter((s: any) => {
            const d = new Date(s.date);
            return d.getMonth() === m.monthIdx && d.getFullYear() === m.year;
          })
          .reduce((acc: number, curr: any) => acc + (curr.volume || 0), 0);

        // Revenue per month
        const rev = invoices
          .filter((inv: any) => {
            if (inv.status !== 'Paid') return false;
            const d = new Date(inv.date);
            return d.getMonth() === m.monthIdx && d.getFullYear() === m.year;
          })
          .reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);

        return { name: m.name, kl, rev };
      });

      setChartData(aggregatedData);
    }).catch(console.error);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}M`;
    return `Rp ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Volume (KL)"
          value={`${stats.totalVolume.toLocaleString()} KL`}
          icon={Truck}
          trend="neutral"
          trendValue="Verified"
          color="bg-blue-600"
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts.toString()}
          icon={Users}
          trend="neutral"
          trendValue="Current"
          color="bg-indigo-600"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices.toString()}
          icon={CreditCard}
          trend="neutral"
          trendValue="Unpaid"
          color="bg-amber-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={TrendingUp}
          trend="neutral"
          trendValue="This Month"
          color="bg-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Fuel Delivery Performance (KL)</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorKl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} KL`, 'Volume']}
                />
                <Area type="monotone" dataKey="kl" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorKl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Revenue Distribution (Rp)</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">View Details</button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => value >= 1e6 ? `${(value / 1e6).toFixed(0)}M` : value} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="rev" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div >
  );
}
