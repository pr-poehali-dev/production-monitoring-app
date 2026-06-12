import { useState } from 'react';
import { ActivePage } from '@/types/production';
import Icon from '@/components/ui/icon';
import Dashboard from './Dashboard';
import Statistics from './Statistics';
import History from './History';
import Settings from './Settings';
import ExportPage from './ExportPage';
import Salary from './Salary';

const NAV_ITEMS: { id: ActivePage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Производство', icon: 'LayoutDashboard' },
  { id: 'salary', label: 'Зарплата', icon: 'Wallet' },
  { id: 'statistics', label: 'Статистика', icon: 'BarChart2' },
  { id: 'history', label: 'История', icon: 'Archive' },
  { id: 'export', label: 'Экспорт', icon: 'Download' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

const Index = () => {
  const [page, setPage] = useState<ActivePage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'salary': return <Salary />;
      case 'statistics': return <Statistics />;
      case 'history': return <History />;
      case 'export': return <ExportPage />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-56 bg-card border-r border-border flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:flex
        `}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <img
              src="https://cdn.poehali.dev/projects/3527bc2d-caaa-45c4-a76d-713ddff9e895/bucket/150018e1-7d0c-4caa-a53e-1c0d8b5811f4.jpeg"
              alt="Золотой рой"
              className="w-9 h-9 flex-shrink-0"
              style={{ filter: 'invert(1) sepia(1) saturate(3) hue-rotate(170deg) brightness(1.4)' }}
            />
            <div>
              <p className="text-xs font-bold text-foreground tracking-wide leading-none">ЗОЛОТОЙ РОЙ</p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">Контроль</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium border-l-2 ${
                page === item.id
                  ? 'active border-primary bg-primary/10 text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">v1.0.0 · 4 рабочих места</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Icon name="Menu" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.poehali.dev/projects/3527bc2d-caaa-45c4-a76d-713ddff9e895/bucket/150018e1-7d0c-4caa-a53e-1c0d8b5811f4.jpeg"
              alt="logo"
              className="w-6 h-6"
              style={{ filter: 'invert(1) sepia(1) saturate(3) hue-rotate(170deg) brightness(1.4)' }}
            />
            <span className="text-sm font-bold tracking-wide">ЗОЛОТОЙ РОЙ</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Desktop top bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              {NAV_ITEMS.find((n) => n.id === page)?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Онлайн · данные сохраняются локально
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;