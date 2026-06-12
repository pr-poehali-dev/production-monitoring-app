import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface ReminderSetting {
  id: string;
  enabled: boolean;
  time: string;
  label: string;
}

const DEFAULT_REMINDERS: ReminderSetting[] = [
  { id: '1', enabled: false, time: '08:00', label: 'Начало смены' },
  { id: '2', enabled: false, time: '12:00', label: 'Обед — промежуточный итог' },
  { id: '3', enabled: false, time: '17:00', label: 'Конец смены — сохранить день' },
];

interface Theme {
  id: string;
  name: string;
  description: string;
  vars: Record<string, string>;
  preview: string[];
}

const THEMES: Theme[] = [
  {
    id: 'ocean',
    name: 'Океан',
    description: 'Тёмно-синий с голубым акцентом (по умолчанию)',
    preview: ['#0e1420', '#1a2238', '#29abe2'],
    vars: {
      '--background': '220 16% 8%',
      '--foreground': '210 20% 92%',
      '--card': '220 14% 11%',
      '--card-foreground': '210 20% 92%',
      '--primary': '199 89% 48%',
      '--primary-foreground': '220 16% 8%',
      '--secondary': '220 12% 16%',
      '--secondary-foreground': '210 20% 80%',
      '--muted': '220 12% 14%',
      '--muted-foreground': '215 12% 50%',
      '--accent': '199 89% 48%',
      '--accent-foreground': '220 16% 8%',
      '--border': '220 12% 18%',
      '--input': '220 12% 18%',
      '--ring': '199 89% 48%',
    },
  },
  {
    id: 'honey',
    name: 'Мёд',
    description: 'Тёмно-коричневый с янтарным акцентом',
    preview: ['#170f07', '#1e1509', '#f5a623'],
    vars: {
      '--background': '25 22% 8%',
      '--foreground': '42 55% 88%',
      '--card': '25 18% 11%',
      '--card-foreground': '42 55% 88%',
      '--primary': '43 95% 54%',
      '--primary-foreground': '25 35% 8%',
      '--secondary': '25 16% 17%',
      '--secondary-foreground': '42 35% 70%',
      '--muted': '25 16% 14%',
      '--muted-foreground': '35 18% 48%',
      '--accent': '43 95% 54%',
      '--accent-foreground': '25 35% 8%',
      '--border': '25 16% 20%',
      '--input': '25 16% 20%',
      '--ring': '43 95% 54%',
    },
  },
  {
    id: 'forest',
    name: 'Лес',
    description: 'Тёмно-зелёный с изумрудным акцентом',
    preview: ['#091410', '#0e1f18', '#2ecc71'],
    vars: {
      '--background': '150 22% 7%',
      '--foreground': '140 20% 90%',
      '--card': '150 18% 10%',
      '--card-foreground': '140 20% 90%',
      '--primary': '145 63% 49%',
      '--primary-foreground': '150 22% 7%',
      '--secondary': '150 14% 16%',
      '--secondary-foreground': '140 15% 75%',
      '--muted': '150 14% 13%',
      '--muted-foreground': '145 12% 48%',
      '--accent': '145 63% 49%',
      '--accent-foreground': '150 22% 7%',
      '--border': '150 14% 19%',
      '--input': '150 14% 19%',
      '--ring': '145 63% 49%',
    },
  },
  {
    id: 'crimson',
    name: 'Бордо',
    description: 'Тёмный с красно-бордовым акцентом',
    preview: ['#110810', '#1c0f1a', '#c0392b'],
    vars: {
      '--background': '340 18% 7%',
      '--foreground': '340 15% 90%',
      '--card': '340 15% 10%',
      '--card-foreground': '340 15% 90%',
      '--primary': '348 83% 47%',
      '--primary-foreground': '340 18% 7%',
      '--secondary': '340 12% 16%',
      '--secondary-foreground': '340 12% 72%',
      '--muted': '340 12% 13%',
      '--muted-foreground': '340 10% 48%',
      '--accent': '348 83% 47%',
      '--accent-foreground': '340 18% 7%',
      '--border': '340 12% 19%',
      '--input': '340 12% 19%',
      '--ring': '348 83% 47%',
    },
  },
  {
    id: 'slate',
    name: 'Серый',
    description: 'Нейтральный тёмно-серый с белым акцентом',
    preview: ['#0c0c0e', '#141416', '#9b9ba8'],
    vars: {
      '--background': '240 6% 6%',
      '--foreground': '240 5% 90%',
      '--card': '240 5% 9%',
      '--card-foreground': '240 5% 90%',
      '--primary': '240 5% 65%',
      '--primary-foreground': '240 6% 6%',
      '--secondary': '240 4% 14%',
      '--secondary-foreground': '240 5% 72%',
      '--muted': '240 4% 12%',
      '--muted-foreground': '240 4% 46%',
      '--accent': '240 5% 65%',
      '--accent-foreground': '240 6% 6%',
      '--border': '240 4% 17%',
      '--input': '240 4% 17%',
      '--ring': '240 5% 65%',
    },
  },
];

const loadReminders = (): ReminderSetting[] => {
  try {
    const raw = localStorage.getItem('reminders_v2');
    if (raw) return JSON.parse(raw);
    const old = localStorage.getItem('reminders');
    if (old) return JSON.parse(old).map((r: ReminderSetting, i: number) => ({ ...r, id: String(i + 1) }));
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_REMINDERS;
};

const loadThemeId = (): string => localStorage.getItem('theme_id') || 'ocean';

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('theme_id', theme.id);
};

const Settings = () => {
  const [reminders, setReminders] = useState<ReminderSetting[]>(loadReminders);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>('default');
  const [saved, setSaved] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [activeTheme, setActiveTheme] = useState<string>(loadThemeId);

  useEffect(() => {
    if ('Notification' in window) setNotifStatus(Notification.permission);
    const theme = THEMES.find((t) => t.id === loadThemeId());
    if (theme) applyTheme(theme);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifStatus(result);
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const updateReminder = (id: string, field: keyof ReminderSetting, value: string | boolean) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const addReminder = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    setReminders((prev) => [
      ...prev,
      { id: Date.now().toString(), enabled: true, time: newTime, label: trimmed },
    ]);
    setNewLabel('');
    setNewTime('09:00');
  };

  const handleSelectTheme = (theme: Theme) => {
    applyTheme(theme);
    setActiveTheme(theme.id);
  };

  const saveSettings = () => {
    localStorage.setItem('reminders_v2', JSON.stringify(reminders));
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
          new Notification('Золотой Рой', { body: r.label, icon: '/favicon.svg' });
        }, delay);
      });
    }
  };

  const statusColor = { granted: 'text-green-400', denied: 'text-red-400', default: 'text-yellow-400' }[notifStatus];
  const statusLabel = { granted: 'Разрешены', denied: 'Запрещены', default: 'Не запрошены' }[notifStatus];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Конфигурация</p>
        <h1 className="text-xl font-semibold text-foreground">Настройки</h1>
      </div>

      {/* Theme */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Icon name="Palette" size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium">Тема оформления</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEMES.map((theme) => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40 bg-muted/20'
                  }`}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1 flex-shrink-0">
                    {theme.preview.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-white/10"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{theme.name}</p>
                      {isActive && (
                        <Icon name="Check" size={12} className="text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{theme.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Icon name="Bell" size={15} className="text-muted-foreground" />
          <span className="text-sm font-medium">Пуш-уведомления</span>
        </div>
        <div className="p-5 space-y-4">
          {/* Permission status */}
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

          {/* Reminders list */}
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Напоминания</p>

            {reminders.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 border transition-colors ${
                  r.enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
                }`}
              >
                {/* Toggle on/off */}
                <button
                  onClick={() => toggleReminder(r.id)}
                  title={r.enabled ? 'Выключить' : 'Включить'}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors relative ${
                    r.enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      r.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                {/* Label */}
                <input
                  className="flex-1 text-sm bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground"
                  value={r.label}
                  onChange={(e) => updateReminder(r.id, 'label', e.target.value)}
                />

                {/* Time */}
                <input
                  type="time"
                  value={r.time}
                  onChange={(e) => updateReminder(r.id, 'time', e.target.value)}
                  className="mono text-sm bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:border-primary w-24"
                />

                {/* Delete */}
                <button
                  onClick={() => deleteReminder(r.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Нет напоминаний — добавьте первое ниже
              </div>
            )}
          </div>

          {/* Add new reminder */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Добавить напоминание</p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder="Название напоминания..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addReminder()}
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mono text-sm bg-background border border-border rounded-md px-2 py-2 text-foreground focus:outline-none focus:border-primary w-24"
              />
              <button
                onClick={addReminder}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <Icon name="Plus" size={16} />
              </button>
            </div>
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
            ['Название', 'Золотой Рой'],
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
