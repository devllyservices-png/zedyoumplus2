-- Currencies configuration table
create table if not exists public.currencies (
  code text primary key,
  name text not null,
  rate_to_eur numeric not null default 1,
  is_default boolean not null default false,
  is_active boolean not null default true,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure only one default currency at a time
create or replace function public.ensure_single_default_currency()
returns trigger as $$
begin
  if NEW.is_default then
    update public.currencies
    set is_default = false
    where code <> NEW.code
      and is_default = true;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_single_default_currency on public.currencies;
create trigger trg_single_default_currency
before insert or update on public.currencies
for each row
execute procedure public.ensure_single_default_currency();

-- User currency preference table
create table if not exists public.user_currency_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  currency_code text not null references public.currencies(code),
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

