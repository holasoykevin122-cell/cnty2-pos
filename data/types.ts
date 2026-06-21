export type Product = {
  id: string;
  name: string;
  category: string;
  /** Costo: lo que te cuesta el producto (para calcular ganancia). */
  cost: number;
  /** Precio de venta sugerido. Si priceVariable es true, se ajusta al vender. */
  price: number;
  priceVariable: boolean;
  stock: number;
  sold: number;
  image: string | null;
  createdAt: number;
};

export type Sale = {
  id: string;
  /** epoch ms del momento de la venta */
  date: number;
  items: {
    productId: string;
    name: string;
    qty: number;
    unitPrice: number;
    /** Costo unitario al momento de la venta (para ganancia histórica fiel). */
    unitCost: number;
  }[];
  total: number;
};

export type Period = 'day' | '7d' | '14d' | 'month';

export const PERIODS: { key: Period; label: string; days: number }[] = [
  { key: 'day', label: 'Hoy', days: 1 },
  { key: '7d', label: '7 días', days: 7 },
  { key: '14d', label: '14 días', days: 14 },
  { key: 'month', label: '1 mes', days: 30 },
];
