-- A live security test (2026-07-31) — actually trying each operation as a
-- logged-out visitor against the real database, not just reading the SQL
-- files — found that anon could still insert/update/delete on several
-- tables and the media storage bucket, despite final-rls.sql declaring
-- tighter policies. This means older, more permissive policies from an
-- earlier iteration of this project were still active underneath (the
-- same class of problem migration 008 fixed for articles/news, just never
-- checked for these other tables/the storage bucket).
--
-- Since the exact old policy names aren't known, this drops *every*
-- existing policy on each affected table/bucket and recreates only the
-- intended ones from scratch — safe to run more than once.

alter table categories              enable row level security;
alter table authors                 enable row level security;
alter table reactions               enable row level security;
alter table newsletter_subscribers  enable row level security;
alter table contact_messages        enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('categories', 'authors', 'reactions', 'newsletter_subscribers', 'contact_messages')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;

  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- ── categories: public read-only, admin full access ──
create policy "categories_public_select"
  on categories for select
  to anon, authenticated
  using (true);

create policy "categories_admin_all"
  on categories for all
  to authenticated
  using     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  with check (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ── authors: public read-only, admin full access ──
create policy "authors_public_select"
  on authors for select
  to anon, authenticated
  using (true);

create policy "authors_admin_all"
  on authors for all
  to authenticated
  using     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  with check (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ── reactions: anon can read + insert only; every mutation after the first
--    reaction runs through the service-role client in /api/reactions ──
create policy "reactions_anon_select"
  on reactions for select
  to anon
  using (true);

create policy "reactions_anon_insert"
  on reactions for insert
  to anon
  with check (true);

create policy "reactions_admin_all"
  on reactions for all
  to authenticated
  using     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  with check (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ── newsletter_subscribers: anon can sign up (insert) only — cannot read
--    the subscriber list (their emails are private) ──
create policy "newsletter_anon_insert"
  on newsletter_subscribers for insert
  to anon
  with check (true);

create policy "newsletter_admin_all"
  on newsletter_subscribers for all
  to authenticated
  using     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  with check (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ── contact_messages: anon can submit (insert) only — cannot read other
--    people's messages ──
create policy "contact_anon_insert"
  on contact_messages for insert
  to anon
  with check (true);

create policy "contact_admin_all"
  on contact_messages for all
  to authenticated
  using     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  with check (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ── storage/media bucket: public read, admin-only write ──
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
  );

create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
  );

create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
  );
