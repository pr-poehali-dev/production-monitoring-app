import { useState, useEffect } from 'react';
import { Worker, ProductRate, SalarySettings } from '@/types/production';
import { PRODUCT_NAMES } from '@/types/production';
import { useProductionData } from '@/hooks/useProductionData';
import Icon from '@/components/ui/icon';

const WORKSPACE_NAMES: Record<number, string> = {
  1: '1 рабочее место',
  2: '2 рабочее место',
  3: '3 рабочее место',
  4: '4 рабочее место',
};

const defaultRates = (): ProductRate[] =>
  PRODUCT_NAMES.map((name) => ({ productName: name, rate10: 0, rate8: 0 }));

const loadSettings = (): SalarySettings => {
  try {
    const raw = localStorage.getItem('salary_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return { workers: [], rates: defaultRates() };
};

const saveSettings = (s: SalarySettings) => {
  localStorage.setItem('salary_settings', JSON.stringify(s));
};

const Salary = () => {
  const { workspaces } = useProductionData();
  const [settings, setSettings] = useState<SalarySettings>(loadSettings);
  const [newName, setNewName] = useState('');
  const [saved, setSaved] = useState(false);
  const [uniformPrice, setUniformPrice] = useState('');

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const addWorker = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSettings((prev) => ({
      ...prev,
      workers: [
        ...prev.workers,
        { id: Date.now().toString(), name: trimmed, workspaceId: null },
      ],
    }));
    setNewName('');
  };

  const removeWorker = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      workers: prev.workers.filter((w) => w.id !== id),
    }));
  };

  const assignWorkspace = (workerId: string, wsId: number | null) => {
    setSettings((prev) => ({
      ...prev,
      workers: prev.workers.map((w) =>
        w.id === workerId ? { ...w, workspaceId: wsId } : w
      ),
    }));
  };

  const updateRate = (
    productName: string,
    field: 'rate10' | 'rate8',
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      rates: prev.rates.map((r) =>
        r.productName === productName ? { ...r, [field]: Math.max(0, value) } : r
      ),
    }));
  };

  const applyUniformPrice = () => {
    const price = parseFloat(uniformPrice);
    if (isNaN(price) || price < 0) return;
    setSettings((prev) => ({
      ...prev,
      rates: prev.rates.map((r) => ({ ...r, rate10: price, rate8: price })),
    }));
  };

  const calcWorkerSalary = (worker: Worker): number => {
    if (!worker.workspaceId) return 0;
    const ws = workspaces.find((w) => w.id === worker.workspaceId);
    if (!ws) return 0;
    return ws.products.reduce((sum, p) => {
      const rate = settings.rates.find((r) => r.productName === p.name);
      if (!rate) return sum;
      return sum + p.subItems[0].value * rate.rate10 + p.subItems[1].value * rate.rate8;
    }, 0);
  };

  const totalPayroll = settings.workers.reduce(
    (sum, w) => sum + calcWorkerSalary(w),
    0
  );

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Учёт</p>
        <h1 className="text-xl font-semibold text-foreground">Зарплата</h1>
      </div>

      {/* Total */}
      <div className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Wallet" size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Фонд оплаты сегодня</p>
            <p className="mono text-2xl font-semibold text-primary">
              {totalPayroll.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name={saved ? 'Check' : 'Save'} size={14} />
          {saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Workers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Users" size={15} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Работники</span>
          </div>

          {/* Add worker */}
          <div className="flex gap-2">
            <input
              className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              placeholder="Имя работника..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addWorker()}
            />
            <button
              onClick={addWorker}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              <Icon name="UserPlus" size={16} />
            </button>
          </div>

          {settings.workers.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Icon name="Users" size={28} className="text-muted-foreground/40" />
              Добавьте первого работника
            </div>
          )}

          <div className="space-y-2">
            {settings.workers.map((worker) => {
              const salary = calcWorkerSalary(worker);
              return (
                <div
                  key={worker.id}
                  className="bg-card border border-border rounded-lg px-4 py-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" size={14} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{worker.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="mono text-sm font-semibold text-primary">
                        {salary.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                      </span>
                      <button
                        onClick={() => removeWorker(worker.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Workspace assignment */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Рабочее место:</span>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => assignWorkspace(worker.id, null)}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          worker.workspaceId === null
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        —
                      </button>
                      {[1, 2, 3, 4].map((wsId) => (
                        <button
                          key={wsId}
                          onClick={() => assignWorkspace(worker.id, wsId)}
                          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                            worker.workspaceId === wsId
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          МС-{wsId}
                        </button>
                      ))}
                    </div>
                  </div>
                  {worker.workspaceId && (
                    <p className="text-xs text-muted-foreground">
                      {WORKSPACE_NAMES[worker.workspaceId]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Tag" size={15} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Цена за изделие</span>
          </div>

          {/* Единая цена */}
          <div className="bg-card border border-border rounded-lg px-4 py-3 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Единая цена для всех изделий</p>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                step={0.5}
                placeholder="0.00"
                className="mono text-sm w-28 bg-background border border-border rounded-md px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                value={uniformPrice}
                onChange={(e) => setUniformPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyUniformPrice()}
              />
              <span className="text-sm text-muted-foreground">₽</span>
              <button
                onClick={applyUniformPrice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Icon name="Check" size={13} />
                Применить ко всем
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Заполняет одновременно «На 10 рамок» и «На 8 рамок» для каждой позиции</p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-2 border-b border-border bg-muted/40 text-xs text-muted-foreground font-medium">
              <span>Продукция</span>
              <span className="text-center">На 10 рамок, ₽</span>
              <span className="text-center">На 8 рамок, ₽</span>
            </div>
            <div className="divide-y divide-border">
              {settings.rates.map((rate) => (
                <div key={rate.productName} className="grid grid-cols-3 items-center px-4 py-3 gap-2">
                  <span className="text-sm font-medium text-foreground">{rate.productName}</span>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="mono text-sm w-20 text-center bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                      value={rate.rate10}
                      onChange={(e) =>
                        updateRate(rate.productName, 'rate10', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="mono text-sm w-20 text-center bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                      value={rate.rate8}
                      onChange={(e) =>
                        updateRate(rate.productName, 'rate8', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Ставки применяются к текущему дню. Зарплата считается автоматически по количеству произведённых изделий.
          </p>

          {/* Per-workspace summary */}
          {settings.workers.length > 0 && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs text-muted-foreground font-medium">
                Итог по работникам
              </div>
              <div className="divide-y divide-border">
                {settings.workers.map((w) => (
                  <div key={w.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <span className="text-sm text-foreground font-medium">{w.name}</span>
                      {w.workspaceId && (
                        <span className="ml-2 text-xs text-muted-foreground">МС-{w.workspaceId}</span>
                      )}
                    </div>
                    <span className="mono text-sm font-semibold text-primary">
                      {calcWorkerSalary(w).toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ₽
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20">
                  <span className="text-sm font-semibold text-foreground">Итого</span>
                  <span className="mono text-sm font-bold text-primary">
                    {totalPayroll.toLocaleString('ru-RU', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ₽
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Salary;