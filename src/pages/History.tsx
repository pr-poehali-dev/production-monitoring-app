import { useState } from 'react';
import { useProductionData } from '@/hooks/useProductionData';
import { DayRecord, Workspace, PRODUCT_NAMES, SUB_ITEM_LABELS } from '@/types/production';
import Icon from '@/components/ui/icon';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const formatMonthYear = (year: number, month: number) =>
  new Date(year, month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year: number, month: number) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
};

const createEmptyWorkspaces = (): Workspace[] =>
  [1, 2, 3, 4].map((id) => ({
    id,
    name: `${id} рабочее место`,
    products: PRODUCT_NAMES.map((name) => ({
      name,
      collapsed: false,
      subItems: SUB_ITEM_LABELS.map((label) => ({ label, value: 0 })),
    })),
  }));

const calcTotal = (workspaces: Workspace[]) =>
  workspaces.reduce((s, ws) =>
    s + ws.products.reduce((ps, p) =>
      ps + p.subItems.reduce((ss, si) => ss + si.value, 0), 0), 0);

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const History = () => {
  const { history, updateHistoryRecord } = useProductionData();
  const today = getTodayKey();
  const todayDate = new Date(today + 'T00:00:00');

  const [calYear, setCalYear] = useState(todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editWs, setEditWs] = useState<Workspace[] | null>(null);
  const [saved, setSaved] = useState(false);

  const historyMap = new Map(history.map((r) => [r.date, r]));

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (calYear > now.getFullYear() || (calYear === now.getFullYear() && calMonth >= now.getMonth())) return;
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const selectDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    // Block future dates (tomorrow and beyond)
    if (d > todayDate) return;

    setSelectedDate(dateStr);
    setSaved(false);
    const record = historyMap.get(dateStr);
    setEditWs(record
      ? JSON.parse(JSON.stringify(record.workspaces))
      : createEmptyWorkspaces()
    );
  };

  const updateSubItem = (wsId: number, pi: number, si: number, value: number) => {
    if (!editWs) return;
    setEditWs(editWs.map(ws => {
      if (ws.id !== wsId) return ws;
      return {
        ...ws,
        products: ws.products.map((p, pIdx) => {
          if (pIdx !== pi) return p;
          return {
            ...p,
            subItems: p.subItems.map((s, sIdx) =>
              sIdx === si ? { ...s, value: Math.max(0, value) } : s
            ),
          };
        }),
      };
    }));
  };

  const saveEdit = () => {
    if (!selectedDate || !editWs) return;
    updateHistoryRecord(selectedDate, editWs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);
  const canGoNext = !(calYear === todayDate.getFullYear() && calMonth === todayDate.getMonth());

  const WORKSPACE_COLORS = ['199 89% 48%', '159 60% 45%', '38 92% 50%', '280 60% 58%'];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Архив</p>
        <h1 className="text-xl font-semibold text-foreground">История смен</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Calendar */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ChevronLeft" size={18} />
            </button>
            <span className="text-sm font-semibold text-foreground capitalize">
              {formatMonthYear(calYear, calMonth)}
            </span>
            <button
              onClick={nextMonth}
              disabled={!canGoNext}
              className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === today;
              const isFuture = new Date(dateStr + 'T00:00:00') > todayDate;
              const isSelected = dateStr === selectedDate;
              const hasData = historyMap.has(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => !isFuture && selectDay(dateStr)}
                  disabled={isFuture}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-md text-sm font-medium transition-all
                    ${isFuture ? 'text-muted-foreground/30 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                    ${!isSelected && isToday ? 'border border-primary text-primary' : ''}
                    ${!isSelected && !isToday && !isFuture ? 'hover:bg-muted/60 text-foreground' : ''}
                  `}
                >
                  {day}
                  {hasData && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Есть данные
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-primary inline-block" />
              Сегодня
            </span>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {selectedDate && editWs ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">{formatDate(selectedDate)}</p>
                  {selectedDate === today && (
                    <p className="text-xs text-primary">Сегодняшняя смена</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="mono text-sm font-semibold text-primary">
                    {calcTotal(editWs).toLocaleString('ru-RU')} ед.
                  </span>
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Icon name={saved ? 'Check' : 'Save'} size={13} />
                    {saved ? 'Сохранено!' : 'Сохранить'}
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[500px] divide-y divide-border">
                {editWs.map((ws, wi) => {
                  const wsTotal = ws.products.reduce((s, p) => s + p.subItems.reduce((ss, si) => ss + si.value, 0), 0);
                  return (
                    <div key={ws.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="tag text-[10px]"
                            style={{ background: `hsl(${WORKSPACE_COLORS[wi]} / 0.15)`, color: `hsl(${WORKSPACE_COLORS[wi]})` }}
                          >
                            МС-{ws.id}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">{ws.name}</span>
                        </div>
                        <span className="mono text-sm font-semibold" style={{ color: `hsl(${WORKSPACE_COLORS[wi]})` }}>
                          {wsTotal}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {ws.products.map((p, pi) => (
                          <div key={p.name} className="rounded-md bg-muted/30 px-3 py-2">
                            <p className="text-xs font-semibold text-foreground mb-2">{p.name}</p>
                            <div className="space-y-1.5">
                              {p.subItems.map((sub, si) => (
                                <div key={sub.label} className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground flex-1">{sub.label}</span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      className="w-6 h-6 rounded flex items-center justify-center bg-secondary hover:bg-border transition-colors text-foreground"
                                      onClick={() => updateSubItem(ws.id, pi, si, sub.value - 1)}
                                    >
                                      <Icon name="Minus" size={11} />
                                    </button>
                                    <input
                                      className="mono text-sm w-12 text-center bg-background border border-border rounded px-1 py-0.5 text-foreground focus:outline-none focus:border-primary"
                                      value={sub.value}
                                      onChange={(e) => updateSubItem(ws.id, pi, si, parseInt(e.target.value) || 0)}
                                    />
                                    <button
                                      className="w-6 h-6 rounded flex items-center justify-center bg-secondary hover:bg-border transition-colors text-foreground"
                                      onClick={() => updateSubItem(ws.id, pi, si, sub.value + 1)}
                                    >
                                      <Icon name="Plus" size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3">
              <Icon name="CalendarDays" size={32} className="text-muted-foreground/40" />
              <p>Выберите день в календаре</p>
              <p className="text-xs text-center max-w-[200px] text-muted-foreground/60">
                Дни с данными отмечены точкой. Будущие даты недоступны.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
