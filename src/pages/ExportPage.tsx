import { useState } from 'react';
import { useProductionData } from '@/hooks/useProductionData';
import { DayRecord, SalarySettings, Worker } from '@/types/production';
import Icon from '@/components/ui/icon';

const loadSalarySettings = (): SalarySettings => {
  try {
    const raw = localStorage.getItem('salary_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return { workers: [], rates: [] };
};

const download = (filename: string, content: string) => {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const recordToRows = (record: DayRecord): string[] => {
  const rows: string[] = [];
  record.workspaces.forEach((ws) => {
    ws.products.forEach((p) => {
      const v10 = p.subItems[0]?.value ?? 0;
      const v8 = p.subItems[1]?.value ?? 0;
      rows.push(`${record.date};${ws.name};${p.name};${v10};${v8};${v10 + v8}`);
    });
  });
  return rows;
};

const calcWorkerSalary = (worker: Worker, salary: SalarySettings, workspaces: DayRecord['workspaces']): number => {
  if (!worker.workspaceId) return 0;
  const ws = workspaces.find((w) => w.id === worker.workspaceId);
  if (!ws) return 0;
  return ws.products.reduce((sum, p) => {
    const rate = salary.rates.find((r) => r.productName === p.name);
    if (!rate) return sum;
    return sum + (p.subItems[0]?.value ?? 0) * rate.rate10 + (p.subItems[1]?.value ?? 0) * rate.rate8;
  }, 0);
};

const ExportPage = () => {
  const { workspaces, history, getTotalForWorkspace, getGrandTotal } = useProductionData();
  const salary = loadSalarySettings();

  const today = new Date().toISOString().split('T')[0];

  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<string>('all');

  const currentMonth = today.slice(0, 7);
  const monthRecords = history.filter((r) => r.date.startsWith(currentMonth));

  const periodRecords = history.filter((r) => {
    if (!periodFrom && !periodTo) return true;
    if (periodFrom && r.date < periodFrom) return false;
    if (periodTo && r.date > periodTo) return false;
    return true;
  });

  // --- Exports ---

  const exportToday = () => {
    const header = 'Дата;Рабочее место;Продукция;На 10 рамок;На 8 рамок;Итого';
    const todayRecord: DayRecord = { date: today, workspaces };
    const rows = recordToRows(todayRecord);
    rows.push(`${today};ВСЕГО;;;; ${getGrandTotal()}`);
    download('export_today.csv', [header, ...rows].join('\n'));
  };

  const exportMonth = () => {
    const header = 'Дата;Рабочее место;Продукция;На 10 рамок;На 8 рамок;Итого';
    const rows = monthRecords.flatMap(recordToRows);
    download(`export_${currentMonth}.csv`, [header, ...rows].join('\n'));
  };

  const exportPeriod = () => {
    const header = 'Дата;Рабочее место;Продукция;На 10 рамок;На 8 рамок;Итого';
    const rows = periodRecords.flatMap(recordToRows);
    const name = `export_${periodFrom || 'start'}_${periodTo || 'end'}.csv`;
    download(name, [header, ...rows].join('\n'));
  };

  const exportSalary = () => {
    const header = 'Работник;Рабочее место;Продукция;На 10 рамок;Цена 10;На 8 рамок;Цена 8;Сумма';
    const rows: string[] = [];

    const workers = selectedWorker === 'all'
      ? salary.workers
      : salary.workers.filter((w) => w.id === selectedWorker);

    workers.forEach((worker) => {
      if (!worker.workspaceId) {
        rows.push(`${worker.name};—;—;—;—;—;—;0.00`);
        return;
      }
      const ws = workspaces.find((w) => w.id === worker.workspaceId);
      if (!ws) return;
      ws.products.forEach((p) => {
        const rate = salary.rates.find((r) => r.productName === p.name);
        const v10 = p.subItems[0]?.value ?? 0;
        const v8 = p.subItems[1]?.value ?? 0;
        const r10 = rate?.rate10 ?? 0;
        const r8 = rate?.rate8 ?? 0;
        const sum = v10 * r10 + v8 * r8;
        rows.push(`${worker.name};${ws.name};${p.name};${v10};${r10};${v8};${r8};${sum.toFixed(2)}`);
      });
      const total = calcWorkerSalary(worker, salary, workspaces);
      rows.push(`${worker.name};ИТОГО;;;;;;${total.toFixed(2)}`);
    });

    download('export_salary.csv', [header, ...rows].join('\n'));
  };

  const CardWrap = ({ children, color = 'primary' }: { children: React.ReactNode; color?: string }) => (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4">{children}</div>
  );

  const IconBox = ({ icon, color }: { icon: string; color: string }) => (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon name={icon} size={20} className="text-current" />
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Данные</p>
        <h1 className="text-xl font-semibold text-foreground">Экспорт данных</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        {/* 1. Сегодня */}
        <CardWrap>
          <div className="flex items-center gap-3">
            <IconBox icon="CalendarCheck" color="bg-primary/10 text-primary" />
            <div>
              <p className="font-semibold text-foreground">За сегодня</p>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-md p-3 space-y-1">
            {workspaces.map((ws) => (
              <div key={ws.id} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{ws.name}</span>
                <span className="mono font-medium text-foreground">{getTotalForWorkspace(ws)} ед.</span>
              </div>
            ))}
            <div className="flex justify-between text-xs border-t border-border pt-1 mt-1">
              <span className="font-semibold text-foreground">Итого</span>
              <span className="mono font-semibold text-primary">{getGrandTotal()} ед.</span>
            </div>
          </div>
          <button
            onClick={exportToday}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="Download" size={15} />
            Скачать CSV (сегодня)
          </button>
        </CardWrap>

        {/* 2. За месяц */}
        <CardWrap>
          <div className="flex items-center gap-3">
            <IconBox icon="CalendarDays" color="bg-green-500/10 text-green-400" />
            <div>
              <p className="font-semibold text-foreground">За текущий месяц</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-md p-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Сохранённых дней</span>
              <span className="mono font-medium text-foreground">{monthRecords.length}</span>
            </div>
            {monthRecords.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Период</span>
                <span className="mono text-foreground">
                  {new Date(monthRecords[monthRecords.length - 1].date).toLocaleDateString('ru-RU')}
                  {' — '}
                  {new Date(monthRecords[0].date).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={exportMonth}
            disabled={monthRecords.length === 0}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-md text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={15} />
            Скачать CSV (месяц)
          </button>
        </CardWrap>

        {/* 3. Произвольный период */}
        <CardWrap>
          <div className="flex items-center gap-3">
            <IconBox icon="CalendarRange" color="bg-violet-500/10 text-violet-400" />
            <div>
              <p className="font-semibold text-foreground">За выбранный период</p>
              <p className="text-xs text-muted-foreground">Укажите диапазон дат</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">С</label>
              <input
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">По</label>
              <input
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="bg-muted/40 rounded-md px-3 py-2 text-xs flex justify-between">
            <span className="text-muted-foreground">Найдено записей</span>
            <span className="mono font-medium text-foreground">{periodRecords.length} дней</span>
          </div>
          <button
            onClick={exportPeriod}
            disabled={periodRecords.length === 0}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-md text-sm font-medium hover:bg-violet-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={15} />
            Скачать CSV (период)
          </button>
        </CardWrap>

        {/* 4. Зарплата */}
        <CardWrap>
          <div className="flex items-center gap-3">
            <IconBox icon="Wallet" color="bg-amber-500/10 text-amber-400" />
            <div>
              <p className="font-semibold text-foreground">Данные по зарплате</p>
              <p className="text-xs text-muted-foreground">Сводка за сегодня по работникам</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Работник</label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">Все работники</option>
              {salary.workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name}{w.workspaceId ? ` (МС-${w.workspaceId})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="bg-muted/40 rounded-md p-3 space-y-1">
            {(selectedWorker === 'all' ? salary.workers : salary.workers.filter((w) => w.id === selectedWorker)).map((w) => {
              const total = calcWorkerSalary(w, salary, workspaces);
              return (
                <div key={w.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{w.name}{w.workspaceId ? ` · МС-${w.workspaceId}` : ''}</span>
                  <span className="mono font-medium text-amber-400">{total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                </div>
              );
            })}
            {salary.workers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-1">Работники не добавлены</p>
            )}
          </div>

          <button
            onClick={exportSalary}
            disabled={salary.workers.length === 0}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-sm font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={15} />
            Скачать CSV (зарплата)
          </button>
        </CardWrap>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={16} className="text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Файлы CSV открываются в Microsoft Excel и Google Таблицах. Разделитель — точка с запятой (;). Кодировка UTF-8 с BOM.
        </p>
      </div>
    </div>
  );
};

export default ExportPage;
