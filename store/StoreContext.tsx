import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Expense, Period, PERIODS, Product, Sale } from '../data/types';
import { generateInitialExpenses, generateInitialSales, initialProducts } from '../data/mock';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  fetchProducts,
  fetchSales,
  fetchExpenses,
  insertProduct,
  updateProductDb,
  deleteProductDb,
  recordSaleRpc,
  insertExpense,
  deleteExpenseDb,
} from './supabaseApi';

const DAY = 24 * 60 * 60 * 1000;

export type CartItem = { product: Product; qty: number; unitPrice: number };

export type SeriesPoint = { label: string; value: number; isToday?: boolean };

export type Metrics = {
  revenue: number;
  profit: number;
  marginPct: number;
  orders: number;
  units: number;
  avgTicket: number;
  deltaPct: number | null;
  series: SeriesPoint[];
  topProducts: { product: Product; units: number; revenue: number }[];
};

export type ProductStats = {
  unitsSold: number;
  revenue: number;
  profit: number;
  marginPct: number;
  series: SeriesPoint[];
  recent: { date: number; qty: number; total: number }[];
};

export type DayRow = {
  date: number;
  label: string;
  revenue: number;
  profit: number;
  marginPct: number;
  orders: number;
};

export type Balance = {
  /** Ganancia de las ventas (precio − costo). */
  profit: number;
  /** Total de gastos del periodo. */
  expenses: number;
  /** Resultado neto: ganancia − gastos. Positivo = ganando, negativo = perdiendo. */
  net: number;
};

type StoreContextValue = {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  addProduct: (p: Omit<Product, 'id' | 'sold' | 'createdAt'>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordSale: (items: CartItem[]) => void;
  addExpense: (concept: string, amount: number) => void;
  deleteExpense: (id: string) => void;
  getMetrics: (period: Period) => Metrics;
  getProductStats: (productId: string) => ProductStats;
  getDailyBreakdown: (period: Period) => DayRow[];
  /** Métricas para un rango [start, end) personalizado (ej. un mes). */
  getMetricsRange: (start: number, end: number) => Metrics;
  /** Desglose día por día para un rango [start, end). */
  getBreakdownRange: (start: number, end: number) => DayRow[];
  /** Balance ganancia vs gastos para un periodo. */
  getBalance: (period: Period) => Balance;
  /** Gastos dentro de un periodo (más reciente primero). */
  getExpenses: (period: Period) => Expense[];
  /** Balance para un rango [start, end) personalizado. */
  getBalanceRange: (start: number, end: number) => Balance;
  /** Gastos dentro de un rango [start, end). */
  getExpensesRange: (start: number, end: number) => Expense[];
};

function dayLabel(dayStart: number, today: number) {
  if (dayStart === today) return 'Hoy';
  if (dayStart === today - DAY) return 'Ayer';
  const d = new Date(dayStart);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  // Usa la nube solo si hay credenciales Y sesión iniciada; si no, modo demo.
  const useSb = isSupabaseConfigured && !!userId;

  const [products, setProducts] = useState<Product[]>(isSupabaseConfigured ? [] : initialProducts);
  const [sales, setSales] = useState<Sale[]>(() =>
    isSupabaseConfigured ? [] : generateInitialSales(initialProducts)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    isSupabaseConfigured ? [] : generateInitialExpenses()
  );

  // Carga inicial: desde Supabase (si hay sesión) o datos de ejemplo.
  useEffect(() => {
    let active = true;
    if (useSb) {
      (async () => {
        try {
          const [p, s, e] = await Promise.all([fetchProducts(), fetchSales(), fetchExpenses()]);
          if (active) {
            setProducts(p);
            setSales(s);
            setExpenses(e);
          }
        } catch (err) {
          console.warn('Error cargando datos de Supabase:', err);
        }
      })();
    } else if (!isSupabaseConfigured) {
      setProducts(initialProducts);
      setSales(generateInitialSales(initialProducts));
      setExpenses(generateInitialExpenses());
    } else {
      setProducts([]);
      setSales([]);
      setExpenses([]);
    }
    return () => {
      active = false;
    };
  }, [useSb]);

  const reload = useCallback(async () => {
    if (!useSb) return;
    try {
      const [p, s, e] = await Promise.all([fetchProducts(), fetchSales(), fetchExpenses()]);
      setProducts(p);
      setSales(s);
      setExpenses(e);
    } catch (err) {
      console.warn('Error recargando datos:', err);
    }
  }, [useSb]);

  const addProduct = useCallback(
    async (p: Omit<Product, 'id' | 'sold' | 'createdAt'>) => {
      if (useSb && userId) {
        try {
          const created = await insertProduct(p, userId);
          setProducts((prev) => [created, ...prev]);
        } catch (e) {
          console.warn(e);
          Alert.alert('Error', 'No se pudo guardar el producto en la nube.');
        }
      } else {
        setProducts((prev) => [
          { ...p, id: 'p' + Date.now(), sold: 0, createdAt: Date.now() },
          ...prev,
        ]);
      }
    },
    [useSb, userId]
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      if (useSb && userId) {
        try {
          const updated = await updateProductDb(id, patch, userId);
          setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        } catch (e) {
          console.warn(e);
          Alert.alert('Error', 'No se pudo actualizar el producto.');
        }
      } else {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      }
    },
    [useSb, userId]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      if (useSb) {
        try {
          await deleteProductDb(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
          console.warn(e);
          Alert.alert('Error', 'No se pudo eliminar el producto.');
        }
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [useSb]
  );

  const recordSale = useCallback(
    async (items: CartItem[]) => {
      if (items.length === 0) return;
      if (useSb) {
        try {
          await recordSaleRpc(items);
          await reload();
        } catch (e) {
          console.warn(e);
          Alert.alert('Error', 'No se pudo registrar la venta.');
        }
        return;
      }
      const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      const sale: Sale = {
        id: 's' + Date.now(),
        date: Date.now(),
        items: items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          qty: it.qty,
          unitPrice: it.unitPrice,
          unitCost: it.product.cost,
        })),
        total,
      };
      setSales((prev) => [sale, ...prev]);
      setProducts((prev) =>
        prev.map((p) => {
          const sold = items.find((it) => it.product.id === p.id);
          if (!sold) return p;
          return {
            ...p,
            stock: Math.max(0, p.stock - sold.qty),
            sold: p.sold + sold.qty,
          };
        })
      );
    },
    [useSb, reload]
  );

  const addExpense = useCallback(
    async (concept: string, amount: number) => {
      if (!concept.trim() || amount <= 0) return;
      if (useSb) {
        try {
          const created = await insertExpense(concept.trim(), amount);
          setExpenses((prev) => [created, ...prev]);
        } catch (e) {
          console.warn(e);
          Alert.alert('Error', 'No se pudo guardar el gasto.');
        }
      } else {
        setExpenses((prev) => [
          { id: 'e' + Date.now(), date: Date.now(), concept: concept.trim(), amount },
          ...prev,
        ]);
      }
    },
    [useSb]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (useSb) {
        try {
          await deleteExpenseDb(id);
          setExpenses((prev) => prev.filter((e) => e.id !== id));
        } catch (e) {
          console.warn(e);
          Alert.alert('Error', 'No se pudo eliminar el gasto.');
        }
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      }
    },
    [useSb]
  );

  const getMetrics = useCallback(
    (period: Period): Metrics => {
      const days = PERIODS.find((p) => p.key === period)!.days;
      const now = Date.now();
      const todayStart = startOfDay(now);
      const windowStart = period === 'day' ? todayStart : now - days * DAY;
      const prevStart =
        period === 'day' ? todayStart - DAY : now - 2 * days * DAY;
      const prevEnd = windowStart;

      const inWindow = sales.filter((s) => s.date >= windowStart);
      const inPrev = sales.filter((s) => s.date >= prevStart && s.date < prevEnd);

      const revenue = inWindow.reduce((s, x) => s + x.total, 0);
      const prevRevenue = inPrev.reduce((s, x) => s + x.total, 0);
      const profit = inWindow.reduce(
        (s, x) => s + x.items.reduce((a, it) => a + it.qty * (it.unitPrice - it.unitCost), 0),
        0
      );
      const marginPct = revenue > 0 ? profit / revenue : 0;
      const orders = inWindow.length;
      const units = inWindow.reduce(
        (s, x) => s + x.items.reduce((a, it) => a + it.qty, 0),
        0
      );
      const avgTicket = orders ? revenue / orders : 0;
      const deltaPct =
        prevRevenue > 0 ? (revenue - prevRevenue) / prevRevenue : null;

      // Serie diaria para el gráfico. "Hoy" muestra los últimos 7 días de contexto.
      const chartDays = period === 'day' ? 7 : days;
      const buckets = new Map<number, number>();
      for (let i = chartDays - 1; i >= 0; i--) {
        buckets.set(startOfDay(now - i * DAY), 0);
      }
      const chartStart = startOfDay(now - (chartDays - 1) * DAY);
      sales
        .filter((s) => s.date >= chartStart)
        .forEach((s) => {
          const k = startOfDay(s.date);
          if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + s.total);
        });

      const entries = [...buckets.entries()];
      const series: SeriesPoint[] = entries.map(([k, v], idx) => {
        const date = new Date(k);
        // En ventanas largas mostramos día del mes; en cortas el día de semana
        const label =
          chartDays > 14
            ? idx % 5 === 0 || idx === entries.length - 1
              ? `${date.getDate()}`
              : ''
            : chartDays > 7
            ? `${date.getDate()}`
            : WEEKDAYS[date.getDay()];
        return { label, value: v, isToday: k === todayStart };
      });

      // Top productos en la ventana
      const agg = new Map<string, { units: number; revenue: number }>();
      inWindow.forEach((s) =>
        s.items.forEach((it) => {
          const cur = agg.get(it.productId) || { units: 0, revenue: 0 };
          cur.units += it.qty;
          cur.revenue += it.qty * it.unitPrice;
          agg.set(it.productId, cur);
        })
      );
      const topProducts = [...agg.entries()]
        .map(([id, v]) => ({
          product: products.find((p) => p.id === id)!,
          ...v,
        }))
        .filter((x) => x.product)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      return { revenue, profit, marginPct, orders, units, avgTicket, deltaPct, series, topProducts };
    },
    [sales, products]
  );

  const getProductStats = useCallback(
    (productId: string): ProductStats => {
      const now = Date.now();
      const todayStart = startOfDay(now);
      let unitsSold = 0;
      let revenue = 0;
      let profit = 0;
      const recent: { date: number; qty: number; total: number }[] = [];

      // Serie de ingresos por día de este producto (últimos 14 días)
      const chartDays = 14;
      const buckets = new Map<number, number>();
      for (let i = chartDays - 1; i >= 0; i--) buckets.set(startOfDay(now - i * DAY), 0);
      const chartStart = startOfDay(now - (chartDays - 1) * DAY);

      sales.forEach((s) => {
        const line = s.items.filter((it) => it.productId === productId);
        if (line.length === 0) return;
        let qty = 0;
        let total = 0;
        line.forEach((it) => {
          qty += it.qty;
          total += it.qty * it.unitPrice;
          profit += it.qty * (it.unitPrice - it.unitCost);
        });
        unitsSold += qty;
        revenue += total;
        if (s.date >= chartStart) {
          const k = startOfDay(s.date);
          if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + total);
        }
        recent.push({ date: s.date, qty, total });
      });

      const entries = [...buckets.entries()];
      const series: SeriesPoint[] = entries.map(([k, v], idx) => {
        const date = new Date(k);
        const label = idx % 3 === 0 || idx === entries.length - 1 ? `${date.getDate()}` : '';
        return { label, value: v, isToday: k === todayStart };
      });

      return {
        unitsSold,
        revenue,
        profit,
        marginPct: revenue > 0 ? profit / revenue : 0,
        series,
        recent: recent.sort((a, b) => b.date - a.date).slice(0, 8),
      };
    },
    [sales]
  );

  const getDailyBreakdown = useCallback(
    (period: Period): DayRow[] => {
      const days = PERIODS.find((p) => p.key === period)!.days;
      const now = Date.now();
      const today = startOfDay(now);
      const rows: DayRow[] = [];
      for (let i = 0; i < days; i++) {
        const dayStart = today - i * DAY;
        const dayEnd = dayStart + DAY;
        const inDay = sales.filter((s) => s.date >= dayStart && s.date < dayEnd);
        const revenue = inDay.reduce((a, x) => a + x.total, 0);
        const profit = inDay.reduce(
          (a, x) => a + x.items.reduce((b, it) => b + it.qty * (it.unitPrice - it.unitCost), 0),
          0
        );
        const d = new Date(dayStart);
        const label =
          i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
        rows.push({
          date: dayStart,
          label,
          revenue,
          profit,
          marginPct: revenue > 0 ? profit / revenue : 0,
          orders: inDay.length,
        });
      }
      return rows; // ya viene de hoy hacia atrás
    },
    [sales]
  );

  const getMetricsRange = useCallback(
    (start: number, end: number): Metrics => {
      const todayStart = startOfDay(Date.now());
      const inWindow = sales.filter((s) => s.date >= start && s.date < end);
      const len = end - start;
      const prevStart = start - len;
      const inPrev = sales.filter((s) => s.date >= prevStart && s.date < start);

      const revenue = inWindow.reduce((s, x) => s + x.total, 0);
      const prevRevenue = inPrev.reduce((s, x) => s + x.total, 0);
      const profit = inWindow.reduce(
        (s, x) => s + x.items.reduce((a, it) => a + it.qty * (it.unitPrice - it.unitCost), 0),
        0
      );
      const orders = inWindow.length;
      const units = inWindow.reduce((s, x) => s + x.items.reduce((a, it) => a + it.qty, 0), 0);
      const avgTicket = orders ? revenue / orders : 0;
      const deltaPct = prevRevenue > 0 ? (revenue - prevRevenue) / prevRevenue : null;

      const dayStarts: number[] = [];
      for (let t = startOfDay(start); t < end; t += DAY) dayStarts.push(t);
      const buckets = new Map<number, number>(dayStarts.map((t) => [t, 0]));
      inWindow.forEach((s) => {
        const k = startOfDay(s.date);
        if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + s.total);
      });
      const entries = [...buckets.entries()];
      const series: SeriesPoint[] = entries.map(([k, v], idx) => {
        const d = new Date(k);
        const label =
          entries.length > 14
            ? idx % 5 === 0 || idx === entries.length - 1
              ? `${d.getDate()}`
              : ''
            : `${d.getDate()}`;
        return { label, value: v, isToday: k === todayStart };
      });

      const agg = new Map<string, { units: number; revenue: number }>();
      inWindow.forEach((s) =>
        s.items.forEach((it) => {
          const cur = agg.get(it.productId) || { units: 0, revenue: 0 };
          cur.units += it.qty;
          cur.revenue += it.qty * it.unitPrice;
          agg.set(it.productId, cur);
        })
      );
      const topProducts = [...agg.entries()]
        .map(([id, v]) => ({ product: products.find((p) => p.id === id)!, ...v }))
        .filter((x) => x.product)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      return {
        revenue,
        profit,
        marginPct: revenue > 0 ? profit / revenue : 0,
        orders,
        units,
        avgTicket,
        deltaPct,
        series,
        topProducts,
      };
    },
    [sales, products]
  );

  const getBreakdownRange = useCallback(
    (start: number, end: number): DayRow[] => {
      const today = startOfDay(Date.now());
      const dayStarts: number[] = [];
      for (let t = startOfDay(start); t < end; t += DAY) dayStarts.push(t);
      dayStarts.reverse(); // más reciente primero
      return dayStarts.map((dayStart) => {
        const dayEnd = dayStart + DAY;
        const inDay = sales.filter((s) => s.date >= dayStart && s.date < dayEnd);
        const revenue = inDay.reduce((a, x) => a + x.total, 0);
        const profit = inDay.reduce(
          (a, x) => a + x.items.reduce((b, it) => b + it.qty * (it.unitPrice - it.unitCost), 0),
          0
        );
        return {
          date: dayStart,
          label: dayLabel(dayStart, today),
          revenue,
          profit,
          marginPct: revenue > 0 ? profit / revenue : 0,
          orders: inDay.length,
        };
      });
    },
    [sales]
  );

  const periodWindowStart = (period: Period) => {
    const days = PERIODS.find((p) => p.key === period)!.days;
    const now = Date.now();
    return period === 'day' ? startOfDay(now) : now - days * DAY;
  };

  const getBalance = useCallback(
    (period: Period): Balance => {
      const start = periodWindowStart(period);
      const profit = sales
        .filter((s) => s.date >= start)
        .reduce((a, x) => a + x.items.reduce((b, it) => b + it.qty * (it.unitPrice - it.unitCost), 0), 0);
      const exp = expenses.filter((e) => e.date >= start).reduce((a, e) => a + e.amount, 0);
      return { profit, expenses: exp, net: profit - exp };
    },
    [sales, expenses]
  );

  const getExpenses = useCallback(
    (period: Period): Expense[] => {
      const start = periodWindowStart(period);
      return expenses.filter((e) => e.date >= start).sort((a, b) => b.date - a.date);
    },
    [expenses]
  );

  const getBalanceRange = useCallback(
    (start: number, end: number): Balance => {
      const inRange = sales.filter((s) => s.date >= start && s.date < end);
      const profit = inRange.reduce(
        (a, x) => a + x.items.reduce((b, it) => b + it.qty * (it.unitPrice - it.unitCost), 0),
        0
      );
      const exp = expenses
        .filter((e) => e.date >= start && e.date < end)
        .reduce((a, e) => a + e.amount, 0);
      return { profit, expenses: exp, net: profit - exp };
    },
    [sales, expenses]
  );

  const getExpensesRange = useCallback(
    (start: number, end: number): Expense[] =>
      expenses.filter((e) => e.date >= start && e.date < end).sort((a, b) => b.date - a.date),
    [expenses]
  );

  const value = useMemo(
    () => ({ products, sales, expenses, addProduct, updateProduct, deleteProduct, recordSale, addExpense, deleteExpense, getMetrics, getProductStats, getDailyBreakdown, getMetricsRange, getBreakdownRange, getBalance, getExpenses, getBalanceRange, getExpensesRange }),
    [products, sales, expenses, addProduct, updateProduct, deleteProduct, recordSale, addExpense, deleteExpense, getMetrics, getProductStats, getDailyBreakdown, getMetricsRange, getBreakdownRange, getBalance, getExpenses, getBalanceRange, getExpensesRange]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}
