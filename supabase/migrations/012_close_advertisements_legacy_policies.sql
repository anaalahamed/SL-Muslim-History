-- A live policy check (2026-07-31) found `advertisements` still had leftover
-- legacy policies from the same earlier iteration of this project's RLS
-- setup that migration 008 already cleaned up for articles/news — "admin
-- write" and "Allow all ads" were FOR ALL TO public (i.e. anyone, no login
-- required, full insert/update/delete), and "public read"/"Public read ads"
-- duplicated the already-correct advertisements_public_select. Nobody had
-- checked advertisements specifically until now.
--
-- Drops every existing policy on the table (regardless of name) and
-- recreates only the intended two — safe to run more than once.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'advertisements'
  loop
    execute format('drop policy if exists %I on public.advertisements', pol.policyname);
  end loop;
end $$;

create policy "advertisements_public_select"
  on advertisements for select
  to anon
  using (is_active = true);

create policy "advertisements_admin_all"
  on advertisements for all
  to authenticated
  using     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  with check (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');
