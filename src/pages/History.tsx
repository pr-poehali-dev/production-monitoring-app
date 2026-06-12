import { useState } from 'react';
import { useProductionData } from '@/hooks/useProductionData';
import { DayRecord } from '@/types/production';
import Icon from '@/components/ui/icon';

const calcTotal = (record: DayRecord) =>
  record.workspaces.reduce(
    (s, ws) => s + ws.products.reduce((ps, p) => ps + p.subItems.reduce((ss, si) => ss + si.value, 0), 0),
    0
  );

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

const History = () => {
  const { history } = useProductionData();
  const [selected, setSelected] = useState<DayRecord | null>(null);

  if (history.length === 0) {
    return (
      <div className="animate-fade-in space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Архив</p>
          <h1 className="text-xl font-semibold text-foreground">История изменений</h1>
        </div>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Icon name="Archive" size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Архив пуст. Сохраните первый день через панель управления.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Архив</p>
        <h1 className="text-xl font-semibold text-foreground">История изменений</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">Записи</span>
            <span className="tag bg-muted text-muted-foreground">{history.length} дней</span>
          </div>
          <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
            {history.map((record) => {
              const t = calcTotal(record);
              const isSelected = selected?.date === record.date;
              return (
                <button
                  key={record.date}
                  onClick={() => setSelected(isSelected ? null : record)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                    isSelected ? 'bg-primary/10' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDate(record.date)}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                  </div>
                  <span className="mono text-sm font-semibold text-primary">{t.toLocaleString('ru-RU')} ед.</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {selected ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium">{formatDate(selected.date)}</span>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="divide-y divide-border overflow-y-auto max-h-[480px]">
                {selected.workspaces.map((ws) => {
                  const wsTotal = ws.products.reduce((s, p) => s + p.subItems.reduce((ss, si) => ss + si.value, 0), 0);
                  return (
                    <div key={ws.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">{ws.name}</span>
                        <span className="mono text-sm font-semibold text-primary">{wsTotal}</span>
                      </div>
                      <div className="space-y-1">
                        {ws.products.map((p) => {
                          const pt = p.subItems.reduce((s, si) => s + si.value, 0);
                          return (
                            <div key={p.name} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{p.name}</span>
                              <div className="flex gap-3">
                                {p.subItems.map((si) => (
                                  <span key={si.label} className="text-muted-foreground">
                                    {si.label}: <span className="text-foreground font-medium">{si.value}</span>
                                  </span>
                                ))}
                                <span className="text-foreground font-semibold">= {pt}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
              <Icon name="MousePointerClick" size={24} />
              Выберите день для просмотра деталей
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
