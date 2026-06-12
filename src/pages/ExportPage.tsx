import { useProductionData } from '@/hooks/useProductionData';
import { DayRecord } from '@/types/production';
import Icon from '@/components/ui/icon';

const calcTotal = (record: DayRecord) =>
  record.workspaces.reduce(
    (s, ws) => s + ws.products.reduce((ps, p) => ps + p.subItems.reduce((ss, si) => ss + si.value, 0), 0),
    0
  );

const ExportPage = () => {
  const { workspaces, history, getTotalForWorkspace, getGrandTotal } = useProductionData();

  const exportTodayCSV = () => {
    const rows: string[] = ['Рабочее место;Продукция;На 10 рамок;На 8 рамок;Итого'];
    workspaces.forEach((ws) => {
      ws.products.forEach((p) => {
        const v10 = p.subItems[0]?.value ?? 0;
        const v8 = p.subItems[1]?.value ?? 0;
        rows.push(`${ws.name};${p.name};${v10};${v8};${v10 + v8}`);
      });
      rows.push(`${ws.name};ИТОГО;;;${getTotalForWorkspace(ws)}`);
    });
    rows.push(`ВСЕГО;;;;${getGrandTotal()}`);
    download('export_today.csv', rows.join('\n'), 'text/csv;charset=utf-8;');
  };

  const exportHistoryCSV = () => {
    const rows: string[] = ['Дата;Рабочее место;Продукция;На 10 рамок;На 8 рамок;Итого'];
    history.forEach((record) => {
      record.workspaces.forEach((ws) => {
        ws.products.forEach((p) => {
          const v10 = p.subItems[0]?.value ?? 0;
          const v8 = p.subItems[1]?.value ?? 0;
          rows.push(`${record.date};${ws.name};${p.name};${v10};${v8};${v10 + v8}`);
        });
      });
    });
    download('export_history.csv', rows.join('\n'), 'text/csv;charset=utf-8;');
  };

  const download = (filename: string, content: string, mime: string) => {
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Данные</p>
        <h1 className="text-xl font-semibold text-foreground">Экспорт данных</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today export */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="FileSpreadsheet" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Сегодняшние данные</p>
              <p className="text-xs text-muted-foreground">CSV — Excel, Google Sheets</p>
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
            onClick={exportTodayCSV}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="Download" size={15} />
            Скачать CSV (сегодня)
          </button>
        </div>

        {/* History export */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Icon name="Archive" size={20} className="text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">История за все дни</p>
              <p className="text-xs text-muted-foreground">CSV — все сохранённые записи</p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-md p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Записей в архиве</span>
              <span className="mono font-medium text-foreground">{history.length} дней</span>
            </div>
            {history.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Период</span>
                <span className="mono text-foreground">
                  {new Date(history[history.length - 1].date).toLocaleDateString('ru-RU')} —{' '}
                  {new Date(history[0].date).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={exportHistoryCSV}
            disabled={history.length === 0}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-md text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={15} />
            Скачать CSV (история)
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
        <Icon name="Info" size={16} className="text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Файлы CSV открываются в Microsoft Excel и Google Таблицах. Разделитель — точка с запятой (;).
          Кодировка UTF-8. Перед открытием в Excel выберите разделитель «точка с запятой».
        </p>
      </div>
    </div>
  );
};

export default ExportPage;
