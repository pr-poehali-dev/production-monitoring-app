import { useState, useEffect } from 'react';
import { Workspace, DayRecord, PRODUCT_NAMES, SUB_ITEM_LABELS } from '@/types/production';

const createInitialWorkspaces = (): Workspace[] =>
  [1, 2, 3, 4].map((id) => ({
    id,
    name: `${id} рабочее место`,
    products: PRODUCT_NAMES.map((name) => ({
      name,
      collapsed: false,
      subItems: SUB_ITEM_LABELS.map((label) => ({ label, value: 0 })),
    })),
  }));

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadFromStorage = (): { workspaces: Workspace[]; history: DayRecord[] } => {
  try {
    const raw = localStorage.getItem('production_data');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage read error', e);
  }
  return { workspaces: createInitialWorkspaces(), history: [] };
};

const saveToStorage = (workspaces: Workspace[], history: DayRecord[]) => {
  localStorage.setItem('production_data', JSON.stringify({ workspaces, history }));
};

export const useProductionData = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadFromStorage().workspaces);
  const [history, setHistory] = useState<DayRecord[]>(() => loadFromStorage().history);
  const [lastSaved, setLastSaved] = useState<string>(getTodayKey());

  useEffect(() => {
    saveToStorage(workspaces, history);
  }, [workspaces, history]);

  const updateSubItem = (wsId: number, productIdx: number, subIdx: number, value: number) => {
    setWorkspaces((prev) => {
      const next = prev.map((ws) => {
        if (ws.id !== wsId) return ws;
        return {
          ...ws,
          products: ws.products.map((p, pi) => {
            if (pi !== productIdx) return p;
            return {
              ...p,
              subItems: p.subItems.map((s, si) =>
                si === subIdx ? { ...s, value: Math.max(0, value) } : s
              ),
            };
          }),
        };
      });
      return next;
    });
  };

  const toggleProductCollapse = (wsId: number, productIdx: number) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== wsId) return ws;
        return {
          ...ws,
          products: ws.products.map((p, pi) =>
            pi === productIdx ? { ...p, collapsed: !p.collapsed } : p
          ),
        };
      })
    );
  };

  const toggleAllProductsCollapse = (wsId: number, collapsed: boolean) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== wsId) return ws;
        return { ...ws, products: ws.products.map((p) => ({ ...p, collapsed })) };
      })
    );
  };

  const updateHistoryRecord = (date: string, updatedWorkspaces: Workspace[]) => {
    setHistory((prev) =>
      prev.map((r) => (r.date === date ? { ...r, workspaces: JSON.parse(JSON.stringify(updatedWorkspaces)) } : r))
    );
  };

  const saveDay = () => {
    const today = getTodayKey();
    const record: DayRecord = { date: today, workspaces: JSON.parse(JSON.stringify(workspaces)) };
    setHistory((prev) => {
      const filtered = prev.filter((d) => d.date !== today);
      return [record, ...filtered].slice(0, 90);
    });
    setLastSaved(today);
  };

  const resetDay = () => {
    setWorkspaces(createInitialWorkspaces());
  };

  const getTotalForWorkspace = (ws: Workspace) =>
    ws.products.reduce((sum, p) => sum + p.subItems.reduce((s, si) => s + si.value, 0), 0);

  const getGrandTotal = () => workspaces.reduce((sum, ws) => sum + getTotalForWorkspace(ws), 0);

  return {
    workspaces,
    history,
    lastSaved,
    updateSubItem,
    toggleProductCollapse,
    toggleAllProductsCollapse,
    updateHistoryRecord,
    saveDay,
    resetDay,
    getTotalForWorkspace,
    getGrandTotal,
  };
};