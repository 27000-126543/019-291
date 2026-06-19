import { useLocation } from 'react-router-dom';
import { Bell, Settings, AlertTriangle, Clock } from 'lucide-react';
import { useMemo } from 'react';

const pageTitles: Record<string, string> = {
  '/dashboard': '舆情总览',
  '/timeline': '事件时间线',
  '/actions': '处置记录',
};

export default function Header() {
  const location = useLocation();

  const pageTitle = useMemo(() => {
    return pageTitles[location.pathname] || '舆情指挥台';
  }, [location.pathname]);

  const currentTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, []);

  return (
    <header className="h-16 glass-card border-b border-navy-700/50 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center">
        <h2 className="font-serif text-xl font-semibold text-white">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-alert-red/15 border border-alert-red/30">
          <AlertTriangle size={16} className="text-alert-red animate-pulse-slow" strokeWidth={2} />
          <span className="text-sm font-medium text-alert-red">高风险警报</span>
        </div>

        <div className="flex items-center gap-2 text-navy-200/70">
          <Clock size={16} strokeWidth={2} />
          <span className="text-sm tabular-nums">实时更新 · {currentTime}</span>
        </div>

        <button className="relative p-2 rounded-md text-navy-200/70 hover:text-white hover:bg-navy-700/40 transition-all">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-alert-red animate-pulse-slow" />
        </button>

        <button className="p-2 rounded-md text-navy-200/70 hover:text-white hover:bg-navy-700/40 transition-all">
          <Settings size={20} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
