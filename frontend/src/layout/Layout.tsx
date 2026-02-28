import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>

            {/* Search Placeholder was here */}
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Notification Bell was here */}

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role} Access</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200 overflow-hidden">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs - Hidden on mobile */}
        <div className="px-8 py-4 bg-white border-b border-slate-200 hidden md:block">
          <nav className="flex text-sm text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer">Home</span>
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              return (
                <React.Fragment key={name}>
                  <span className="mx-2 text-slate-300">/</span>
                  <span className={isLast ? "text-slate-900 font-medium capitalize" : "hover:text-blue-600 cursor-pointer capitalize"}>
                    {name}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
