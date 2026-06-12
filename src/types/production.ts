export type ProductName = 'Корпуса' | 'Магазины' | 'Донья' | 'Крышки';

export interface SubItem {
  label: string;
  value: number;
}

export interface ProductItem {
  name: ProductName;
  collapsed: boolean;
  subItems: SubItem[];
}

export interface Workspace {
  id: number;
  name: string;
  products: ProductItem[];
}

export interface DayRecord {
  date: string;
  workspaces: Workspace[];
}

export type ActivePage = 'dashboard' | 'statistics' | 'history' | 'settings' | 'export' | 'salary';

export interface Worker {
  id: string;
  name: string;
  workspaceId: number | null;
}

export interface ProductRate {
  productName: ProductName;
  rate10: number;
  rate8: number;
}

export interface SalarySettings {
  workers: Worker[];
  rates: ProductRate[];
}

export const PRODUCT_NAMES: ProductName[] = ['Корпуса', 'Магазины', 'Донья', 'Крышки'];
export const SUB_ITEM_LABELS = ['На 10 рамок', 'На 8 рамок'];