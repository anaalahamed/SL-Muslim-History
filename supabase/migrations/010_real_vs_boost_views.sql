-- Lets the admin add a "boost" starting view count when publishing an
-- article/news post, while still tracking the real (organic, visitor-driven)
-- count separately — so editing the boost later never overwrites real traffic
-- data, and the admin panel can show both side by side.
--
-- `views` keeps its existing meaning everywhere already using it (public
-- display, most-read sorting, dashboard totals): the TOTAL shown to visitors.
-- It stays in sync as real_views + boost_views, recomputed by the admin form
-- on every save. Real visits increment both `views` and `real_views` together.

alter table articles add column if not exists real_views integer not null default 0;
alter table articles add column if not exists boost_views integer not null default 0;

alter table news add column if not exists real_views integer not null default 0;
alter table news add column if not exists boost_views integer not null default 0;

-- One-time backfill: treat all existing view counts as organic, since boost
-- didn't exist before this migration (only runs where it hasn't already).
update articles set real_views = views where real_views = 0 and views > 0;
update news set real_views = views where real_views = 0 and views > 0;

create or replace function increment_article_views(article_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update articles set views = views + 1, real_views = real_views + 1 where id = article_id;
end;
$$;

create or replace function increment_news_views(news_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update news set views = views + 1, real_views = real_views + 1 where id = news_id;
end;
$$;

grant execute on function increment_article_views(uuid) to anon;
grant execute on function increment_news_views(uuid) to anon;
