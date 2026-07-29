-- News posts never had view tracking (unlike articles, which use
-- increment_article_views). Adds the same thing for news: a views
-- column plus a matching increment RPC called from the public news
-- detail page.

alter table news add column if not exists views integer not null default 0;

create or replace function increment_news_views(news_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update news set views = views + 1 where id = news_id;
end;
$$;

grant execute on function increment_news_views(uuid) to anon;
