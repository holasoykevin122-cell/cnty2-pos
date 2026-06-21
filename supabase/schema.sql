-- ============================================================
--  CNTY2 Jeans · Esquema de base de datos (Supabase / Postgres)
--  Cópialo y pégalo en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ---------- PRODUCTOS ----------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name           text not null,
  category       text not null default 'General',
  cost           numeric not null default 0,   -- costo del proveedor
  price          numeric not null default 0,   -- precio de venta sugerido
  price_variable boolean not null default false,
  stock          integer not null default 0,
  sold           integer not null default 0,
  image_url      text,
  created_at     timestamptz not null default now()
);

-- ---------- VENTAS ----------
create table if not exists public.sales (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  total      numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- RENGLONES DE CADA VENTA ----------
create table if not exists public.sale_items (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sale_id    uuid not null references public.sales (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name       text not null,
  qty        integer not null,
  unit_price numeric not null,  -- precio al que se vendió
  unit_cost  numeric not null,  -- costo al momento de la venta (ganancia fiel)
  created_at timestamptz not null default now()
);

create index if not exists sale_items_sale_idx on public.sale_items (sale_id);
create index if not exists sale_items_product_idx on public.sale_items (product_id);
create index if not exists sales_created_idx on public.sales (created_at);

-- ============================================================
--  SEGURIDAD (RLS): cada usuaria solo ve y edita SUS datos
-- ============================================================
alter table public.products  enable row level security;
alter table public.sales      enable row level security;
alter table public.sale_items enable row level security;

create policy "own products"  on public.products
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "own sales"      on public.sales
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "own sale_items" on public.sale_items
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ============================================================
--  FUNCIÓN DE VENTA ATÓMICA
--  Inserta la venta + renglones y descuenta stock en una sola
--  operación. Se llama desde la app con supabase.rpc('record_sale', ...)
-- ============================================================
create or replace function public.record_sale(items jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_sale_id uuid;
  v_total   numeric := 0;
  it        jsonb;
begin
  -- total
  for it in select * from jsonb_array_elements(items) loop
    v_total := v_total + (it->>'qty')::int * (it->>'unit_price')::numeric;
  end loop;

  insert into public.sales (total) values (v_total) returning id into v_sale_id;

  for it in select * from jsonb_array_elements(items) loop
    insert into public.sale_items (sale_id, product_id, name, qty, unit_price, unit_cost)
    values (
      v_sale_id,
      (it->>'product_id')::uuid,
      it->>'name',
      (it->>'qty')::int,
      (it->>'unit_price')::numeric,
      (it->>'unit_cost')::numeric
    );

    update public.products
       set stock = greatest(0, stock - (it->>'qty')::int),
           sold  = sold + (it->>'qty')::int
     where id = (it->>'product_id')::uuid;
  end loop;

  return v_sale_id;
end;
$$;

-- ============================================================
--  ALMACENAMIENTO DE IMÁGENES (fotos de productos)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lectura pública de las imágenes
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- Subida/edición solo para usuarias autenticadas
create policy "auth upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "auth update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');
create policy "auth delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
