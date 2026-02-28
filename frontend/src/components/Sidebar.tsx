import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X } from 'lucide-react';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Truck, label: 'Shipments', path: '/shipments', allowedRoles: ['Admin', 'Driver'] },
  { icon: FileText, label: 'Contracts', path: '/contracts', allowedRoles: ['Admin'] },
  { icon: Truck, label: 'Trucks', path: '/trucks', allowedRoles: ['Admin'] },
  { icon: Receipt, label: 'Invoices', path: '/invoices', allowedRoles: ['Admin', 'Finance'] },
  { icon: FileText, label: 'Users', path: '/users', allowedRoles: ['Admin'] },
  { icon: Settings, label: 'Settings', path: '/settings', allowedRoles: ['Admin'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const filteredItems = navItems.filter(item => 
    !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <aside className={cn(
      "w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            PT YUSUF ALDI LAKSANA
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Logistics Management</p>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 768) onClose();
            }}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
