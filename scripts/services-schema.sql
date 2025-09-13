-- Services System Schema for ZedyoumPlus
-- Services table
create table public.services (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text,
  tags text[],
  rating numeric(2,1) default 0.0,
  total_orders int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Service images table
create table public.service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  created_at timestamp default now()
);

-- Service packages table
create table public.service_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  delivery_time text,
  revisions text,
  features text[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Service FAQ table
create table public.service_faq (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Service reviews table
create table public.service_reviews (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table public.services enable row level security;
alter table public.service_images enable row level security;
alter table public.service_packages enable row level security;
alter table public.service_faq enable row level security;
alter table public.service_reviews enable row level security;

-- RLS Policies for Services
create policy "Services are viewable by everyone" on public.services
  for select using (true);

create policy "Sellers can create services" on public.services
  for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own services" on public.services
  for update using (auth.uid() = seller_id);

create policy "Sellers can delete their own services" on public.services
  for delete using (auth.uid() = seller_id);

-- RLS Policies for Service Images
create policy "Service images are viewable by everyone" on public.service_images
  for select using (true);

create policy "Sellers can manage service images" on public.service_images
  for all using (
    exists (
      select 1 from public.services 
      where services.id = service_images.service_id 
      and services.seller_id = auth.uid()
    )
  );

-- RLS Policies for Service Packages
create policy "Service packages are viewable by everyone" on public.service_packages
  for select using (true);

create policy "Sellers can manage service packages" on public.service_packages
  for all using (
    exists (
      select 1 from public.services 
      where services.id = service_packages.service_id 
      and services.seller_id = auth.uid()
    )
  );

-- RLS Policies for Service FAQ
create policy "Service FAQ is viewable by everyone" on public.service_faq
  for select using (true);

create policy "Sellers can manage service FAQ" on public.service_faq
  for all using (
    exists (
      select 1 from public.services 
      where services.id = service_faq.service_id 
      and services.seller_id = auth.uid()
    )
  );

-- RLS Policies for Service Reviews
create policy "Service reviews are viewable by everyone" on public.service_reviews
  for select using (true);

create policy "Buyers can create reviews" on public.service_reviews
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'buyer'
    ) and
    not exists (
      select 1 from public.services 
      where services.id = service_reviews.service_id 
      and services.seller_id = auth.uid()
    )
  );

create policy "Users can update their own reviews" on public.service_reviews
  for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews" on public.service_reviews
  for delete using (auth.uid() = user_id);

-- Indexes for better performance
create index idx_services_seller_id on public.services(seller_id);
create index idx_services_category on public.services(category);
create index idx_services_rating on public.services(rating);
create index idx_service_images_service_id on public.service_images(service_id);
create index idx_service_packages_service_id on public.service_packages(service_id);
create index idx_service_faq_service_id on public.service_faq(service_id);
create index idx_service_reviews_service_id on public.service_reviews(service_id);
create index idx_service_reviews_user_id on public.service_reviews(user_id);
