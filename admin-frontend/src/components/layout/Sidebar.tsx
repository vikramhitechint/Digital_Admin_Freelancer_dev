import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FolderKanban,
  GitBranch, MessageSquare, CreditCard, TrendingUp,
  Wallet, AlertTriangle, ArrowDownCircle, Bell,
  BarChart3, Settings, ScrollText, LogOut,
  Menu
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import toast from 'react-hot-toast';

type NavItem = {
  to: string;
  icon: any;
  label: string;
  badge?: string;
  badgeColor?: string;
  count?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Core Operations',
    items: [
      { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard', badge: 'LIVE', badgeColor: 'bg-slate-800 text-slate-400' },
      { to: '/admin/projects',      icon: FolderKanban,    label: 'Projects & Dispatch', count: '12' },
      { to: '/admin/companies',     icon: Building2,       label: 'Companies', count: '7' },
      { to: '/admin/freelancers',   icon: Users,           label: 'Freelancers', count: '142' },
    ],
  },
  {
    label: 'Ledger & Settlement',
    items: [
      { to: '/admin/payments',      icon: CreditCard,      label: 'Payments', count: '9' },
    ],
  },
  {
    label: 'Governance & Security',
    items: [
      { to: '/admin/settings',      icon: Settings,        label: 'Settings' },
    ],
  },
];

export default function Sidebar() {
  const { admin, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-40 h-full shadow-sm">
      <div className="flex flex-col overflow-hidden h-full">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-lg tracking-wider">
              D
            </div>
            <div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900 tracking-wide leading-tight">Digital Freelancer</span>
                <span className="font-bold text-sm text-blue-600 tracking-wide leading-tight">Admin</span>
              </div>
              <p className="text-xs text-emerald-600 font-mono flex items-center space-x-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active Core</span>
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto custom-audit-scrollbar flex-1">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-3 pb-2 text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">
                {section.label}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex items-center space-x-3">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                            {item.badge}
                          </span>
                        )}
                        {item.count && !item.badge && (
                          <span className={`text-xs font-mono font-medium ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                            {item.label === 'Notifications' && unreadCount > 0 ? unreadCount : item.count}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Admin User Profile Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-700 font-bold text-xs">
              {admin?.full_name?.slice(0, 2).toUpperCase() ?? 'EV'}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-900 truncate">{admin?.full_name ?? 'Elena Vance'}</div>
            <div className="text-[10px] text-slate-500 font-mono truncate">{admin?.role ?? 'Super Administrator'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
