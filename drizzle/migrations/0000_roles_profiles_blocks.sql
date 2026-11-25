create type public.app_role as enum ('admin','user');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text, created_at timestamptz not null default now());
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own roles or admin" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin add roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin remove roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin') and user_id <> auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email) values (new.id, new.email);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  position int not null default 0,
  kind text not null default 'text',
  content text not null default '',
  src text,
  pos text not null default '50% 50%',
  zoom int not null default 100,
  align text not null default 'left',
  bold boolean not null default false,
  italic boolean not null default false,
  size text not null default 'md',
  updated_at timestamptz not null default now()
);
create index on public.content_blocks(page, position);
grant select on public.content_blocks to anon, authenticated;
grant insert, update, delete on public.content_blocks to authenticated;
grant all on public.content_blocks to service_role;
alter table public.content_blocks enable row level security;
create policy "public read" on public.content_blocks for select to anon, authenticated using (true);
create policy "admin insert" on public.content_blocks for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.content_blocks for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.content_blocks for delete to authenticated using (public.has_role(auth.uid(),'admin'));