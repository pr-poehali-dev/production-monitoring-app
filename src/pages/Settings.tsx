import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface ReminderSetting {
  enabled: boolean;
  time: string;
  label: string;
}

const DEFAULT_REMINDERS: ReminderSetting[] = [
  { enabled: false, time: '08:00', label: 'Начало смены' },
  { enabled: false, time: '12:00', label: 'Обед — промежуточный итог' },
  { enabled: false, time: '17:00', label: 'Конец смены — сохранить день' },
];

const loadReminders = (): ReminderSetting[] => {
  try {
    const raw = localStorage.getItem('reminders');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_REMINDERS;
};

const Settings = () => {
  const [reminders, setReminders] = useState<ReminderSetting[]>(loadReminders);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>('default');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setNotifStatus(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifStatus(result);
  };

  const updateReminder = (idx: number, field: keyof ReminderSetting, value: string | boolean) => {
    setReminders((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const saveSettings = () => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (notifStatus === 'granted') {
      reminders.forEach((r) => {
        if (!r.enabled) return;
        const [h, m] = r.time.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(h, m, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 1);
        const delay = target.getTime() - now.getTime();
        setTimeout(() => {
          new Notification('Контроль производства', {
            body: r.label,
            icon: '/favicon.svg',
          });
        }, delay);
      });
    }
  };

  const statusColor = {
    granted: 'text-green-400',
    denied: 'text-red-400',
    default: 'text-yellow-400',
  }[notifStatus];

  const statusLabel = {
    granted: 'Разрешены',
    denied: 'Запрещены',
    default: 'Не запрошены',
  }[notifStatus];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Конфигурация</p>
        <h1 className="text-xl font-semibold text-foreground">Настройки</h1>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Icon name="Bell" size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium">Пуш-уведомления</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Статус разрешений браузера</p>
              <p className={`text-xs font-medium mt-0.5 ${statusColor}`}>{statusLabel}</p>
            </div>
            {notifStatus !== 'granted' && notifStatus !== 'denied' && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Разрешить
              </button>
            )}
            {notifStatus === 'denied' && (
              <span className="text-xs text-muted-foreground max-w-[180px] text-right">
                Разрешите уведомления в настройках браузера вручную
              </span>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Напоминания</p>
            {reminders.map((r, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-muted/40 rounded-md px-4 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => updateReminder(idx, 'enabled', !r.enabled)}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                      r.enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        r.enabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{r.label}</p>
                </div>
                <input
                  type="time"
                  value={r.time}
                  onChange={(e) => updateReminder(idx, 'time', e.target.value)}
                  className="mono text-sm bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Icon name="Info" size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium">О приложении</span>
        </div>
        <div className="p-5 space-y-2">
          {[
            ['Название', 'ПроизводствоКонтроль'],
            ['Версия', '1.0.0'],
            ['Рабочих мест', '4'],
            ['Позиций продукции', '4 × 2 подпункта'],
            ['Хранение данных', 'Локально в браузере'],
            ['Архив', 'До 90 дней'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={saveSettings}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Icon name={saved ? 'Check' : 'Save'} size={15} />
        {saved ? 'Сохранено!' : 'Сохранить настройки'}
      </button>
    </div>
  );
};

export default Settings;
