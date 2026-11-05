-- Cho phép client dùng publishable key đọc/ghi station qua RLS.
grant select, insert, update, delete on table public.stations to anon, authenticated;

-- Thay các policy cũ nếu bảng đã được tạo bởi migration trước.
drop policy if exists "Đọc trạm trong phòng" on public.stations;
drop policy if exists "Thêm trạm có chủ sở hữu" on public.stations;
drop policy if exists "Sửa trạm của mình" on public.stations;
drop policy if exists "Xóa trạm của mình" on public.stations;
drop policy if exists "Chèn trạm công khai trong phòng" on public.stations;
drop policy if exists "Cập nhật trạm công khai trong phòng" on public.stations;
drop policy if exists "Xóa trạm công khai trong phòng" on public.stations;

create policy "Đọc trạm công khai" on public.stations
  for select to anon, authenticated using (true);
create policy "Thêm trạm công khai" on public.stations
  for insert to anon, authenticated with check (true);
create policy "Sửa trạm công khai" on public.stations
  for update to anon, authenticated using (true) with check (true);
create policy "Xóa trạm công khai" on public.stations
  for delete to anon, authenticated using (true);

alter table public.stations replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'stations'
  ) then
    alter publication supabase_realtime add table public.stations;
  end if;
end $$;
