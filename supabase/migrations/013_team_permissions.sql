-- Adds support for additional admin-panel users with per-section
-- permissions (e.g. a spouse or writer who can post Articles/News but
-- never sees Contact messages, subscriber emails, or Settings/Backup),
-- instead of sharing the single owner login.
--
-- Every existing "_admin_all" policy currently only recognizes ONE
-- hardcoded account (the owner). This migration keeps the owner's full
-- access exactly as-is, and additionally grants access to anyone with a
-- matching "can_x" flag set to true in the new admin_permissions table.
--
-- Safe to run more than once.

create table if not exists admin_permissions (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  name             text not null default '',
  email            text not null default '', -- denormalized: auth.users isn't queryable from the client, only via service role
  can_articles     boolean not null default false,
  can_news_special boolean not null default false,
  can_news_janaza  boolean not null default false,
  can_categories   boolean not null default false,
  can_authors      boolean not null default false,
  can_comments     boolean not null default false,
  can_reactions    boolean not null default false,
  can_ads          boolean not null default false,
  can_newsletter   boolean not null default false,
  can_messages     boolean not null default false,
  can_settings     boolean not null default false,
  can_backup       boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table admin_permissions add column if not exists email text not null default '';
alter table admin_permissions enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'admin_permissions'
  loop
    execute format('drop policy if exists %I on public.admin_permissions', pol.policyname);
  end loop;
end $$;

-- Only the owner manages the permissions list
create policy "admin_permissions_owner_all"
  on admin_permissions for all
  to authenticated
  using     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  with check (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- Each granted user can read their OWN row, so the admin UI knows which
-- sections to show them
create policy "admin_permissions_self_select"
  on admin_permissions for select
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Rebuild every affected table's admin policy to also accept a matching
-- permission grant. Public-facing read policies are untouched (dropped
-- and immediately recreated identically below, alongside the admin one).
-- ============================================================

do $$
declare
  pol record;
  tbl text;
begin
  foreach tbl in array array['articles','news','categories','authors','comments','comment_blocks','reactions','advertisements','newsletter_subscribers','contact_messages','site_settings']
  loop
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = tbl loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, tbl);
    end loop;
  end loop;

  for pol in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- ── articles ──
create policy "articles_public_select" on articles for select to anon, authenticated using (status = 'published');
create policy "articles_admin_all" on articles for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_articles)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_articles)
  );

-- ── news (special vs janaza gated separately via news_type) ──
create policy "news_public_select" on news for select to anon, authenticated using (status = 'published');
create policy "news_admin_all" on news for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or (news_type = 'special' and exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_news_special))
    or (news_type = 'janaza'  and exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_news_janaza))
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or (news_type = 'special' and exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_news_special))
    or (news_type = 'janaza'  and exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_news_janaza))
  );

-- ── categories ──
create policy "categories_public_select" on categories for select to anon, authenticated using (true);
create policy "categories_admin_all" on categories for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_categories)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_categories)
  );

-- ── authors ──
create policy "authors_public_select" on authors for select to anon, authenticated using (true);
create policy "authors_admin_all" on authors for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_authors)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_authors)
  );

-- ── comments ──
create policy "comments_public_select_approved" on comments for select to anon using (status = 'approved');
create policy "comments_anon_insert" on comments for insert to anon with check (status = 'pending');
create policy "comments_admin_all" on comments for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_comments)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_comments)
  );

-- ── comment_blocks (part of comment moderation) ──
create policy "comment_blocks_anon_select" on comment_blocks for select to anon using (true);
create policy "comment_blocks_admin_all" on comment_blocks for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_comments)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_comments)
  );

-- ── reactions ──
create policy "reactions_anon_select" on reactions for select to anon using (true);
create policy "reactions_anon_insert" on reactions for insert to anon with check (true);
create policy "reactions_admin_all" on reactions for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_reactions)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_reactions)
  );

-- ── advertisements ──
create policy "advertisements_public_select" on advertisements for select to anon using (is_active = true);
create policy "advertisements_admin_all" on advertisements for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_ads)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_ads)
  );

-- ── newsletter_subscribers ──
create policy "newsletter_anon_insert" on newsletter_subscribers for insert to anon with check (true);
create policy "newsletter_admin_all" on newsletter_subscribers for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_newsletter)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_newsletter)
  );

-- ── contact_messages ──
create policy "contact_anon_insert" on contact_messages for insert to anon with check (true);
create policy "contact_admin_all" on contact_messages for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_messages)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_messages)
  );

-- ── site_settings ──
create policy "site_settings_public_select" on site_settings for select to anon, authenticated using (true);
create policy "site_settings_admin_all" on site_settings for all to authenticated
  using (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_settings)
  )
  with check (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    or exists (select 1 from admin_permissions p where p.user_id = auth.uid() and p.can_settings)
  );

-- ── storage/media bucket: anyone with ANY granted permission can upload
--    images for their own section (write access isn't split per-section
--    here, since e.g. an article writer and an ad manager both just need
--    to upload photos) ──
create policy "media_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media_admin_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media' and (
      auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
      or exists (select 1 from admin_permissions p where p.user_id = auth.uid())
    )
  );
create policy "media_admin_update" on storage.objects for update to authenticated
  using (
    bucket_id = 'media' and (
      auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
      or exists (select 1 from admin_permissions p where p.user_id = auth.uid())
    )
  );
create policy "media_admin_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'media' and (
      auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
      or exists (select 1 from admin_permissions p where p.user_id = auth.uid())
    )
  );
