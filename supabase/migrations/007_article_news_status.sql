-- Adds a draft/published status to articles and news, and restricts the
-- public (anon) read policy to published rows only. Existing rows default
-- to 'published' so nothing currently live changes visibility.

alter table articles add column if not exists status text not null default 'published';
alter table articles add constraint articles_status_check check (status in ('draft', 'published'));

alter table news add column if not exists status text not null default 'published';
alter table news add constraint news_status_check check (status in ('draft', 'published'));

drop policy if exists "articles_public_select" on articles;
create policy "articles_public_select"
  on articles for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "news_public_select" on news;
create policy "news_public_select"
  on news for select
  to anon, authenticated
  using (status = 'published');
