import { Expense, Product, Sale, SizeSystem } from './types';

const DAY = 24 * 60 * 60 * 1000;

const baseProducts: Omit<Product, 'sizeSystem' | 'sizes'>[] = [
  {
    id: 'p1',
    name: 'Jean Skinny Tiro Alto',
    category: 'Mujer',
    cost: 48000,
    price: 89000,
    priceVariable: true,
    stock: 14,
    sold: 42,
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
    createdAt: Date.now() - 40 * DAY,
  },
  {
    id: 'p2',
    name: 'Jean Recto Clásico',
    category: 'Hombre',
    cost: 52000,
    price: 95000,
    priceVariable: true,
    stock: 9,
    sold: 31,
    image:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    createdAt: Date.now() - 38 * DAY,
  },
  {
    id: 'p3',
    name: 'Jean Mom Vintage',
    category: 'Mujer',
    cost: 55000,
    price: 99000,
    priceVariable: true,
    stock: 6,
    sold: 27,
    image:
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80',
    createdAt: Date.now() - 30 * DAY,
  },
  {
    id: 'p4',
    name: 'Short de Mezclilla',
    category: 'Mujer',
    cost: 32000,
    price: 59000,
    priceVariable: false,
    stock: 18,
    sold: 19,
    image:
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
    createdAt: Date.now() - 25 * DAY,
  },
  {
    id: 'p5',
    name: 'Jean Cargo Wide Leg',
    category: 'Unisex',
    cost: 60000,
    price: 110000,
    priceVariable: true,
    stock: 4,
    sold: 23,
    image:
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80',
    createdAt: Date.now() - 20 * DAY,
  },
  {
    id: 'p6',
    name: 'Chaqueta de Mezclilla',
    category: 'Unisex',
    cost: 70000,
    price: 129000,
    priceVariable: false,
    stock: 7,
    sold: 12,
    image:
      'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80',
    createdAt: Date.now() - 15 * DAY,
  },
  {
    id: 'p7',
    name: 'Jean Negro Slim',
    category: 'Hombre',
    cost: 50000,
    price: 95000,
    priceVariable: true,
    stock: 11,
    sold: 16,
    image:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    createdAt: Date.now() - 10 * DAY,
  },
  {
    id: 'p8',
    name: 'Overol de Mezclilla',
    category: 'Mujer',
    cost: 78000,
    price: 145000,
    priceVariable: true,
    stock: 3,
    sold: 8,
    image:
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
    createdAt: Date.now() - 6 * DAY,
  },
];

// Asigna tallas de ejemplo a cada producto (variando entre letras y números).
export const initialProducts: Product[] = baseProducts.map((p, i) => {
  const useNumbers = i % 3 === 2; // algunos con números
  const sizeSystem: SizeSystem = useNumbers ? 'numeros' : 'letras';
  const sizes = useNumbers ? ['8', '10', '12', '14'] : ['S', 'M', 'L', 'XL'];
  return { ...p, sizeSystem, sizes };
});

/** Gastos de ejemplo (modo demo). */
export function generateInitialExpenses(): Expense[] {
  const now = Date.now();
  return [
    { id: 'e1', date: now - 1 * DAY, concept: 'Renta del local', amount: 850000 },
    { id: 'e2', date: now - 2 * DAY, concept: 'Compra de mercancía', amount: 1200000 },
    { id: 'e3', date: now - 3 * DAY, concept: 'Servicios (luz, agua)', amount: 180000 },
    { id: 'e4', date: now - 5 * DAY, concept: 'Bolsas y empaque', amount: 95000 },
    { id: 'e5', date: now - 9 * DAY, concept: 'Publicidad redes', amount: 120000 },
  ];
}

/**
 * Genera ventas de ejemplo de los últimos 30 días.
 * Determinista (no usa Math.random global puro) para que el dashboard
 * se vea consistente entre recargas durante la demo.
 */
export function generateInitialSales(products: Product[]): Sale[] {
  const sales: Sale[] = [];
  const now = Date.now();
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let d = 29; d >= 0; d--) {
    // más ventas en fines de semana, tendencia creciente reciente
    const dayDate = new Date(now - d * DAY);
    const weekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    const base = weekend ? 4 : 2;
    const recencyBoost = d < 7 ? 1 : 0;
    const count = base + recencyBoost + Math.floor(rnd() * 3);

    for (let i = 0; i < count; i++) {
      const nItems = 1 + Math.floor(rnd() * 2);
      const items = [];
      let total = 0;
      for (let k = 0; k < nItems; k++) {
        const p = products[Math.floor(rnd() * products.length)];
        const qty = 1 + Math.floor(rnd() * 2);
        const unitPrice = p.priceVariable
          ? Math.round((p.price * (0.9 + rnd() * 0.15)) / 1000) * 1000
          : p.price;
        items.push({ productId: p.id, name: p.name, qty, unitPrice, unitCost: p.cost });
        total += qty * unitPrice;
      }
      const ts =
        now - d * DAY + Math.floor(9 * 60 * 60 * 1000 + rnd() * 9 * 60 * 60 * 1000);
      sales.push({ id: `s${d}-${i}`, date: ts, items, total });
    }
  }
  return sales.sort((a, b) => b.date - a.date);
}
