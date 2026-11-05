create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Khách' check (char_length(display_name) between 1 and 24),
  avatar_color text not null default '#06b6d4' check (avatar_color ~* '^#[0-9a-f]{6}$'),
  last_seen timestamptz not null default now()
);

create table public.stations (
  id uuid primary key default gen_random_uuid(),
  room_id text not null check (room_id ~ '^[a-z0-9_-]{1,32}$'),
  gx numeric(4,1) not null check (gx between -30 and 30 and mod(abs(gx), 2.5) = 0),
  gz numeric(4,1) not null check (gz between -30 and 30 and mod(abs(gz), 2.5) = 0),
  rot smallint not null default 0 check (rot between 0 and 3),
  has_desk boolean not null default false,
  has_chair boolean not null default false,
  has_pc boolean not null default false,
  has_partition boolean not null default false,
  has_plant boolean not null default false,
  owner_id uuid references auth.users(id) on delete set null,
  owner_name text not null check (char_length(owner_name) between 1 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, gx, gz),
  check (has_desk or has_chair or has_pc or has_partition or has_plant)
);

create index idx_stations_room_id on public.stations (room_id);
create index idx_stations_owner_id on public.stations (owner_id);

alter table public.profiles enable row level security;
alter table public.stations enable row level security;
create policy "Hồ sơ công khai để hiển thị" on public.profiles for select to anon, authenticated using (true);
create policy "Người dùng sửa hồ sơ của mình" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Người dùng cập nhật hồ sơ của mình" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Đọc trạm trong phòng" on public.stations for select to anon, authenticated using (true);
create policy "Chèn trạm công khai trong phòng" on public.stations for insert to anon, authenticated with check (true);
create policy "Cập nhật trạm công khai trong phòng" on public.stations for update to anon, authenticated using (true) with check (true);
create policy "Xóa trạm công khai trong phòng" on public.stations for delete to anon, authenticated using (true);

alter table public.stations replica identity full;
alter publication supabase_realtime add table public.stations;

create or replace function public.update_station_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger stations_updated_at before update on public.stations
for each row execute function public.update_station_timestamp();
