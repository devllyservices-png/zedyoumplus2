-- Auth + Profile System Schema
-- Users (auth)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('buyer', 'seller', 'admin')),
  created_at timestamp default now()
);

-- Profiles (extra info)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  display_name text not null,
  bio text,
  avatar_url text,
  location text,
  phone text,
  is_verified boolean default false,
  rating numeric(2,1) default 0.0,
  completed_orders int default 0,
  member_since date default now(),
  response_time text,
  support_rate text,
  languages text[],
  created_at timestamp default now()
);

-- Permissions (role-based access)
create table public.permissions (
  id serial primary key,
  role text not null,
  resource text not null,
  action text not null,
  can_create boolean default false,
  can_read boolean default true,
  can_update boolean default false,
  can_delete boolean default false
);

-- Insert default permissions
-- Sellers can manage services
insert into public.permissions (role, resource, action, can_create, can_read, can_update, can_delete)
values 
('seller', 'service', 'create', true, true, true, true),
('seller', 'service', 'read', true, true, true, true),
('seller', 'service', 'update', true, true, true, true),
('seller', 'service', 'delete', true, true, true, true);

-- Buyers can only read services
insert into public.permissions (role, resource, action, can_create, can_read, can_update, can_delete)
values 
('buyer', 'service', 'create', false, true, false, false),
('buyer', 'service', 'read', false, true, false, false),
('buyer', 'service', 'update', false, true, false, false),
('buyer', 'service', 'delete', false, true, false, false);

-- Admins full access to services + digital products
insert into public.permissions (role, resource, action, can_create, can_read, can_update, can_delete)
values 
('admin', 'service', 'create', true, true, true, true),
('admin', 'service', 'read', true, true, true, true),
('admin', 'service', 'update', true, true, true, true),
('admin', 'service', 'delete', true, true, true, true),
('admin', 'digital_product', 'create', true, true, true, true),
('admin', 'digital_product', 'read', true, true, true, true),
('admin', 'digital_product', 'update', true, true, true, true),
('admin', 'digital_product', 'delete', true, true, true, true);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.permissions enable row level security;

-- RLS Policies
-- Users can only see their own data
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- Profiles are public for reading, but only owners can update
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

-- Permissions are readable by everyone
create policy "Permissions are viewable by everyone" on public.permissions
  for select using (true);
