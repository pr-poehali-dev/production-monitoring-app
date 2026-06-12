import { useProductionData } from '@/hooks/useProductionData';
import Icon from '@/components/ui/icon';
import { PRODUCT_NAMES } from '@/types/production';

const WORKSPACE_COLORS = [
  '199 89% 48%',
  '159 60% 45%',
  '38 92% 50%',
  '280 60% 58%',
];

const Statistics = () => {
  const { workspaces, history, getTotalForWorkspace, getGrandTotal } = useProductionData();
  const grandTotal = getGrandTotal();

  const productTotals = PRODUCT_NAMES.map((name) => {
    const total = workspaces.reduce((sum, ws) => {
      const p = ws.products.find((pr) => pr.name === name);
      return sum + (p ? p.subItems.reduce((s, si) => s + si.value, 0) : 0);
    }, 0);
    return { name, total };
  });

  const avgDay =
    history.length > 0
      ? Math.round(
          history.reduce((sum, d) => {
            const t = d.workspaces.reduce(
              (s, ws) => s + ws.products.reduce((ps, p) => ps + p.subItems.reduce((ss, si) => ss + si.value, 0), 0),
              0
            );
            return sum + t;
          }, 0) / history.length
        )
      : 0;

  const bestDay = history.reduce(
    (best, d) => {
      const t = d.workspaces.reduce(
        (s, ws) => s + ws.products.reduce((ps, p) => ps + p.subItems.reduce((ss, si) => ss + si.value, 0), 0),
        0
      );
      return t > best.total ? { date: d.date, total: t } : best;
    },
    { date: '—', total: 0 }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Аналитика</p>
        <h1 className="text-xl font-semibold text-foreground">Статистика производства</h1>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Сегодня', value: grandTotal, icon: 'Activity', color: '199 89% 48%' },
          { label: 'Дней в архиве', value: history.length, icon: 'Calendar', color: '159 60% 45%' },
          { label: 'Среднее/день', value: avgDay, icon: 'TrendingUp', color: '38 92% 50%' },
          { label: 'Рекорд дня', value: bestDay.total, icon: 'Award', color: '280 60% 58%' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ background: `hsl(${kpi.color} / 0.15)` }}
              >
                <Icon name={kpi.icon} size={14} style={{ color: `hsl(${kpi.color})` }} />
              </div>
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="mono text-2xl font-semibold text-foreground">{kpi.value.toLocaleString('ru-RU')}</p>
          </div>
        ))}
      </div>

      {/* Per-workspace today */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Icon name="BarChart2" size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium">Рабочие места — сегодня</span>
        </div>
        <div className="divide-y divide-border">
          {workspaces.map((ws, i) => {
            const t = getTotalForWorkspace(ws);
            const pct = grandTotal > 0 ? (t / grandTotal) * 100 : 0;
            return (
              <div key={ws.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{ws.name}</span>
                  <span className="mono text-sm font-semibold" style={{ color: `hsl(${WORKSPACE_COLORS[i]})` }}>
                    {t} ед.
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `hsl(${WORKSPACE_COLORS[i]})` }}
                  />
                </div>
                <div className="flex gap-4 mt-2">
                  {ws.products.map((p) => {
                    const pt = p.subItems.reduce((s, si) => s + si.value, 0);
                    return (
                      <span key={p.name} className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{pt}</span> {p.name.toLowerCase()}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-product */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Icon name="Package" size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium">По видам продукции — сегодня</span>
        </div>
        <div className="divide-y divide-border">
          {productTotals.map((pt, i) => {
            const pct = grandTotal > 0 ? (pt.total / grandTotal) * 100 : 0;
            const color = WORKSPACE_COLORS[i];
            return (
              <div key={pt.name} className="px-5 py-3 flex items-center gap-4">
                <span className="text-sm text-foreground w-24">{pt.name}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: `hsl(${color})` }}
                  />
                </div>
                <span className="mono text-sm font-medium text-foreground w-16 text-right">{pt.total}</span>
              </div>
            );
          })}
        </div>
      </div>

      {bestDay.total > 0 && (
        <div className="bg-card border border-border rounded-lg px-5 py-4 flex items-center gap-3">
          <Icon name="Award" size={18} className="text-yellow-400" />
          <span className="text-sm text-muted-foreground">
            Лучший день:{' '}
            <span className="text-foreground font-medium">
              {new Date(bestDay.date).toLocaleDateString('ru-RU')}
            </span>{' '}
            — <span className="mono font-semibold text-foreground">{bestDay.total} ед.</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Statistics;
