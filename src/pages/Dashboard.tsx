import { useProductionData } from '@/hooks/useProductionData';
import WorkspaceCard from '@/components/WorkspaceCard';
import Icon from '@/components/ui/icon';

const WORKSPACE_COLORS = [
  '43 95% 54%',
  '34 88% 50%',
  '28 78% 44%',
  '19 68% 38%',
];

const getTodayFormatted = () => {
  return new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
};

const Dashboard = () => {
  const {
    workspaces,
    updateSubItem,
    toggleProductCollapse,
    saveDay,
    resetDay,
    getTotalForWorkspace,
    getGrandTotal,
  } = useProductionData();

  const grandTotal = getGrandTotal();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            {getTodayFormatted()}
          </p>
          <h1 className="text-xl font-semibold text-foreground">Панель управления</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Итого сегодня</span>
            <span className="mono text-2xl font-semibold text-primary">{grandTotal.toLocaleString('ru-RU')} ед.</span>
          </div>
          <div className="w-px h-10 bg-border" />
          <button
            onClick={saveDay}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span>🍯</span>
            Сохранить день
          </button>
          <button
            onClick={resetDay}
            className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-border transition-colors"
          >
            <span>🔄</span>
          </button>
        </div>
      </div>

      {/* Workspace grid: WS1 top-left | WS2 top-right | WS3 bottom-left | WS4 bottom-right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WorkspaceCard
          workspace={workspaces[0]}
          total={getTotalForWorkspace(workspaces[0])}
          onUpdateSubItem={(pi, si, v) => updateSubItem(1, pi, si, v)}
          onToggleCollapse={(pi) => toggleProductCollapse(1, pi)}
          colorVar={WORKSPACE_COLORS[0]}
        />
        <WorkspaceCard
          workspace={workspaces[1]}
          total={getTotalForWorkspace(workspaces[1])}
          onUpdateSubItem={(pi, si, v) => updateSubItem(2, pi, si, v)}
          onToggleCollapse={(pi) => toggleProductCollapse(2, pi)}
          colorVar={WORKSPACE_COLORS[1]}
        />
        <WorkspaceCard
          workspace={workspaces[2]}
          total={getTotalForWorkspace(workspaces[2])}
          onUpdateSubItem={(pi, si, v) => updateSubItem(3, pi, si, v)}
          onToggleCollapse={(pi) => toggleProductCollapse(3, pi)}
          colorVar={WORKSPACE_COLORS[2]}
        />
        <WorkspaceCard
          workspace={workspaces[3]}
          total={getTotalForWorkspace(workspaces[3])}
          onUpdateSubItem={(pi, si, v) => updateSubItem(4, pi, si, v)}
          onToggleCollapse={(pi) => toggleProductCollapse(4, pi)}
          colorVar={WORKSPACE_COLORS[3]}
        />
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {workspaces.map((ws, i) => {
          const t = getTotalForWorkspace(ws);
          const pct = grandTotal > 0 ? Math.round((t / grandTotal) * 100) : 0;
          return (
            <div key={ws.id} className="bg-card rounded-md p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">МС-{ws.id}</span>
                <span className="text-xs font-medium" style={{ color: `hsl(${WORKSPACE_COLORS[i]})` }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: `hsl(${WORKSPACE_COLORS[i]})` }}
                />
              </div>
              <p className="mono text-lg font-medium mt-2 text-foreground">{t}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;