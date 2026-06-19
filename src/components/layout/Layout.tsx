import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-navy-900">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <Header />
        <main className="p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
