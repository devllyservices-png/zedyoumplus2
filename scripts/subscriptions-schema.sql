-- Seller subscription plans and links

create table if not exists public.seller_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_eur numeric(10,2) not null,
  duration_months int not null check (duration_months > 0),
  is_active boolean not null default true,
  is_default boolean not null default false,
  paypal_product_id text,
  paypal_plan_id text,
  sort_order int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Link invoices to plans (best-effort; assumes table already exists in Supabase)
alter table if exists public.seller_subscription_invoices
  add column if not exists plan_id uuid references public.seller_subscription_plans(id),
  add column if not exists paypal_subscription_id text;

-- Optionally link subscription periods to plans
alter table if exists public.seller_subscriptions
  add column if not exists plan_id uuid references public.seller_subscription_plans(id);

