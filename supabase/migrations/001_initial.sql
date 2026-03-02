-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  org_id uuid,
  stripe_customer_id text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Organizations
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references auth.users on delete cascade not null,
  plan text default 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trialing',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

create policy "Org members can view org" on public.organizations
  for select using (
    id in (
      select org_id from public.profiles where id = auth.uid()
    ) or owner_id = auth.uid()
  );

create policy "Owner can update org" on public.organizations
  for update using (owner_id = auth.uid());

-- Subscriptions
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations on delete cascade not null,
  name text not null,
  vendor text not null,
  description text,
  category text default 'Other',
  cost numeric(10,2) not null default 0,
  currency text default 'USD',
  billing_cycle text default 'monthly',
  renewal_date date not null,
  auto_renews boolean default true,
  status text default 'active',
  owner_id uuid references auth.users,
  owner_name text,
  website_url text,
  notes text,
  tags text[],
  alert_30 boolean default true,
  alert_7 boolean default true,
  alert_1 boolean default true,
  last_alert_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Org members can view subscriptions" on public.subscriptions
  for select using (
    org_id in (
      select org_id from public.profiles where id = auth.uid()
    )
  );

create policy "Org members can insert subscriptions" on public.subscriptions
  for insert with check (
    org_id in (
      select org_id from public.profiles where id = auth.uid()
    )
  );

create policy "Org members can update subscriptions" on public.subscriptions
  for update using (
    org_id in (
      select org_id from public.profiles where id = auth.uid()
    )
  );

create policy "Org members can delete subscriptions" on public.subscriptions
  for delete using (
    org_id in (
      select org_id from public.profiles where id = auth.uid()
    )
  );

-- Alert logs
create table public.alert_logs (
  id uuid default gen_random_uuid() primary key,
  subscription_id uuid references public.subscriptions on delete cascade,
  org_id uuid references public.organizations on delete cascade,
  alert_type text not null, -- '30day', '7day', '1day'
  sent_to text[],
  sent_at timestamptz default now()
);

alter table public.alert_logs enable row level security;

create policy "Org members can view alert logs" on public.alert_logs
  for select using (
    org_id in (
      select org_id from public.profiles where id = auth.uid()
    )
  );

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index idx_subscriptions_org_id on public.subscriptions(org_id);
create index idx_subscriptions_renewal_date on public.subscriptions(renewal_date);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_profiles_org_id on public.profiles(org_id);
