import { supabase } from '../lib/supabase';
import { Product, Sale } from '../data/types';

type ProductValues = Omit<Product, 'id' | 'sold' | 'createdAt'>;
type CartLine = { product: Product; qty: number; unitPrice: number };

function mapProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    cost: Number(r.cost),
    price: Number(r.price),
    priceVariable: !!r.price_variable,
    stock: r.stock ?? 0,
    sold: r.sold ?? 0,
    image: r.image_url ?? null,
    createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
  };
}

function mapSale(r: any): Sale {
  return {
    id: r.id,
    date: r.created_at ? Date.parse(r.created_at) : Date.now(),
    total: Number(r.total),
    items: (r.sale_items ?? []).map((it: any) => ({
      productId: it.product_id,
      name: it.name,
      qty: it.qty,
      unitPrice: Number(it.unit_price),
      unitCost: Number(it.unit_cost),
    })),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase!
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchSales(): Promise<Sale[]> {
  const { data, error } = await supabase!
    .from('sales')
    .select('id, total, created_at, sale_items ( product_id, name, qty, unit_price, unit_cost )')
    .order('created_at', { ascending: false })
    .limit(3000);
  if (error) throw error;
  return (data ?? []).map(mapSale);
}

/** Sube una imagen local al bucket y devuelve su URL pública. */
async function uploadImage(uri: string | null, userId: string): Promise<string | null> {
  if (!uri) return null;
  if (/^https?:\/\//.test(uri)) return uri; // ya es una URL remota
  try {
    const res = await fetch(uri);
    const buffer = await res.arrayBuffer();
    const path = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase!.storage
      .from('product-images')
      .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    const { data } = supabase!.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.warn('No se pudo subir la imagen, se guarda la referencia local:', e);
    return uri;
  }
}

export async function insertProduct(values: ProductValues, userId: string): Promise<Product> {
  const image = await uploadImage(values.image, userId);
  const { data, error } = await supabase!
    .from('products')
    .insert({
      name: values.name,
      category: values.category,
      cost: values.cost,
      price: values.price,
      price_variable: values.priceVariable,
      stock: values.stock,
      image_url: image,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProductDb(
  id: string,
  patch: Partial<ProductValues>,
  userId: string
): Promise<Product> {
  const body: Record<string, any> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.category !== undefined) body.category = patch.category;
  if (patch.cost !== undefined) body.cost = patch.cost;
  if (patch.price !== undefined) body.price = patch.price;
  if (patch.priceVariable !== undefined) body.price_variable = patch.priceVariable;
  if (patch.stock !== undefined) body.stock = patch.stock;
  if (patch.image !== undefined) body.image_url = await uploadImage(patch.image, userId);

  const { data, error } = await supabase!
    .from('products')
    .update(body)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProductDb(id: string): Promise<void> {
  const { error } = await supabase!.from('products').delete().eq('id', id);
  if (error) throw error;
}

/** Registra una venta de forma atómica (inserta + descuenta stock) vía RPC. */
export async function recordSaleRpc(items: CartLine[]): Promise<void> {
  const payload = items.map((it) => ({
    product_id: it.product.id,
    name: it.product.name,
    qty: it.qty,
    unit_price: it.unitPrice,
    unit_cost: it.product.cost,
  }));
  const { error } = await supabase!.rpc('record_sale', { items: payload });
  if (error) throw error;
}
