import { useState } from 'react';
import { Workspace } from '@/types/production';
import Icon from '@/components/ui/icon';

interface Props {
  workspace: Workspace;
  total: number;
  onUpdateSubItem: (productIdx: number, subIdx: number, value: number) => void;
  onToggleCollapse: (productIdx: number) => void;
  onToggleAllCollapse: (collapsed: boolean) => void;
  colorVar: string;
}

const WorkspaceCard = ({ workspace, total, onUpdateSubItem, onToggleCollapse, onToggleAllCollapse, colorVar }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const allCollapsed = workspace.products.every((p) => p.collapsed);
  const allExpanded = workspace.products.every((p) => !p.collapsed);

  return (
    <div
      className={`workspace-card rounded-lg bg-card flex flex-col ${expanded ? 'active' : ''}`}
      style={{ borderColor: expanded ? `hsl(${colorVar} / 0.6)` : undefined }}
    >
      {/* Header — click to expand */}
      <button
        className="flex flex-col p-5 text-left w-full group"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="tag"
              style={{ background: `hsl(${colorVar} / 0.15)`, color: `hsl(${colorVar})` }}
            >
              МС-{workspace.id}
            </span>
            <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
              {workspace.name}
            </span>
          </div>
          <Icon
            name={expanded ? 'ChevronUp' : 'ChevronDown'}
            size={16}
            className="text-muted-foreground group-hover:text-foreground transition-colors"
          />
        </div>
        <div className="flex items-end gap-2">
          <span className="value-display" style={{ color: `hsl(${colorVar})` }}>
            {total.toLocaleString('ru-RU')}
          </span>
          <span className="text-muted-foreground text-sm mb-1">ед.</span>
        </div>
        <div className="flex gap-3 mt-3">
          {workspace.products.map((p) => {
            const pTotal = p.subItems.reduce((s, si) => s + si.value, 0);
            return (
              <div key={p.name} className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{pTotal}</span>{' '}
                {p.name.toLowerCase()}
              </div>
            );
          })}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 animate-fade-in">
          <div className="flex justify-end mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleAllCollapse(!allCollapsed); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Icon name={allCollapsed ? 'ChevronsDown' : 'ChevronsUp'} size={13} />
              {allCollapsed ? 'Развернуть все' : 'Свернуть все'}
            </button>
          </div>
          <div className="space-y-4">
            {workspace.products.map((product, pi) => {
              const productTotal = product.subItems.reduce((s, si) => s + si.value, 0);
              return (
                <div key={product.name} className="rounded-md bg-muted/40 overflow-hidden">
                  {/* Product header */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/60 transition-colors"
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(pi); }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        name={product.collapsed ? 'ChevronRight' : 'ChevronDown'}
                        size={14}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm font-semibold text-foreground">{product.name}</span>
                    </div>
                    <span
                      className="mono text-sm font-medium"
                      style={{ color: `hsl(${colorVar})` }}
                    >
                      {productTotal}
                    </span>
                  </button>

                  {/* Sub-items */}
                  {!product.collapsed && (
                    <div className="px-4 pb-3 pt-1 space-y-2 border-t border-border/50">
                      {product.subItems.map((sub, si) => (
                        <div key={sub.label} className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground flex-1">{sub.label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              className="w-6 h-6 rounded flex items-center justify-center bg-secondary hover:bg-border transition-colors text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateSubItem(pi, si, sub.value - 1);
                              }}
                            >
                              <Icon name="Minus" size={12} />
                            </button>
                            <input
                              className="mono text-sm w-14 text-center bg-background border border-border rounded px-1 py-0.5 text-foreground focus:outline-none focus:border-primary"
                              value={sub.value}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const v = parseInt(e.target.value) || 0;
                                onUpdateSubItem(pi, si, v);
                              }}
                            />
                            <button
                              className="w-6 h-6 rounded flex items-center justify-center bg-secondary hover:bg-border transition-colors text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateSubItem(pi, si, sub.value + 1);
                              }}
                            >
                              <Icon name="Plus" size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCard;