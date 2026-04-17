-- ============================================================
-- Auto-create a public.users profile whenever a new auth user
-- is created. This fires for email/password AND Apple Sign-In.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1), 'Golfer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop if exists then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Also backfill any existing auth users who don't have a profile yet
insert into public.users (id, email, display_name)
select
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data->>'display_name', split_part(coalesce(email, ''), '@', 1), 'Golfer')
from auth.users
on conflict (id) do nothing;
