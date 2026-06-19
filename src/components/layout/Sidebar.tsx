import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    to: '/dashboard',
    label: '舆情总览',
    icon: LayoutDashboard,
  },
  {
    to: '/timeline',
    label: '事件时间线',
    icon: History,
  },
  {
    to: '/actions',
    label: '处置记录',
    icon: ClipboardList,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 fixed left-0 top-0 h-screen glass-card flex flex-col border-r border-navy-700/50 z-50">
      <div className="px-6 py-6 border-b border-navy-700/40">
        <h1 className="font-serif text-2xl font-bold text-white glow-text-blue">
          舆情指挥台
        </h1>
        <p className="text-sm text-navy-200/60 mt-1">产品召回监控</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'nav-link',
                isActive && 'nav-link-active'
              )
            }
          >
            <item.icon size={20} strokeWidth={2} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-navy-700/40">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-navy-700/30 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-navy-700/60 flex items-center justify-center">
            <User size={18} className="text-navy-200" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">张总监</p>
            <p className="text-xs text-navy-200/60 truncate">公关负责人</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
