-- ============================================================
-- Homepage data consolidation RPC
--
-- The homepage previously made ~10 separate round-trips to Supabase on
-- every single page load (recent articles, featured articles, paginated
-- articles + count, special news, janaza news, most-read articles,
-- sidebar ad, homepage-bottom ads, categories + article counts, site
-- settings). Each one is a separate HTTP request from the Next.js server
-- to Supabase; under slow/throttled mobile network conditions the total
-- time for all of them to resolve was a meaningful contributor to slow
-- page loads. This bundles all of it into one function call = one
-- round-trip.
--
-- SECURITY INVOKER (the default — not redeclared here) means this runs
-- with the calling role's own permissions, so the existing RLS policies
-- (articles_public_select: status='published', news_public_select:
-- status='published', advertisements_public_select: is_active=true,
-- categories/site_settings: public) apply automatically, exactly as they
-- already do for the individual queries this replaces. No filtering
-- logic needed here beyond what each query already expresses.
-- ============================================================

CREATE OR REPLACE FUNCTION get_homepage_data()
RETURNS json
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    -- getRecentArticles(5) — used by HeroSlider
    'heroArticles', (
      SELECT COALESCE(json_agg(a), '[]'::json) FROM (
        SELECT * FROM articles ORDER BY published_at DESC LIMIT 5
      ) a
    ),

    -- getFeaturedArticles()
    'featuredArticles', (
      SELECT COALESCE(json_agg(a), '[]'::json) FROM (
        SELECT * FROM articles WHERE is_featured = true ORDER BY published_at DESC
      ) a
    ),

    -- getArticlesPaginated(1, 10) — non-featured articles, page 1 + total count
    'articlesPage', (
      SELECT json_build_object(
        'articles', COALESCE((
          SELECT json_agg(p) FROM (
            SELECT * FROM articles
            WHERE (is_featured IS NULL OR is_featured = false)
            ORDER BY published_at DESC
            LIMIT 10 OFFSET 0
          ) p
        ), '[]'::json),
        'total', (
          SELECT count(*) FROM articles
          WHERE (is_featured IS NULL OR is_featured = false)
        )
      )
    ),

    -- getSpecialNews(6)
    'specialNews', (
      SELECT COALESCE(json_agg(n), '[]'::json) FROM (
        SELECT * FROM news WHERE news_type = 'special' ORDER BY published_at DESC LIMIT 6
      ) n
    ),

    -- getJanazaNews(5)
    'janazaNews', (
      SELECT COALESCE(json_agg(n), '[]'::json) FROM (
        SELECT * FROM news WHERE news_type = 'janaza' ORDER BY published_at DESC LIMIT 5
      ) n
    ),

    -- getMostReadArticles(5) — ordered by the same "views" column the
    -- existing query uses (not real_views/boost_views specifically)
    'mostReadArticles', (
      SELECT COALESCE(json_agg(a), '[]'::json) FROM (
        SELECT * FROM articles ORDER BY views DESC LIMIT 5
      ) a
    ),

    -- getSidebarAd() -> getAds('between-news')[0]
    'sidebarAd', (
      SELECT row_to_json(ad) FROM (
        SELECT * FROM advertisements
        WHERE is_active = true AND position = 'between-news'
        ORDER BY created_at DESC
        LIMIT 1
      ) ad
    ),

    -- getAds('homepage-bottom')
    'bottomAds', (
      SELECT COALESCE(json_agg(ad), '[]'::json) FROM (
        SELECT * FROM advertisements
        WHERE is_active = true AND position = 'homepage-bottom'
        ORDER BY created_at DESC
      ) ad
    ),

    -- getCategories() — categories joined with a LIVE per-category article
    -- count, matching the current JS implementation exactly. The
    -- categories table has its own stored article_count column, but the
    -- JS code deliberately ignores it and always computes a fresh count
    -- from the articles table instead (verified: the stored column can go
    -- stale, e.g. if articles are re-categorized without updating it) — so
    -- this selects explicit columns rather than "cat.*", to both match
    -- that behavior and avoid a duplicate "article_count" field colliding
    -- with the computed one below.
    'categories', (
      SELECT COALESCE(json_agg(c), '[]'::json) FROM (
        SELECT
          cat.id, cat.name_en, cat.name_ta, cat.slug, cat.icon, cat.parent_id,
          COALESCE(cnt.article_count, 0) AS article_count
        FROM categories cat
        LEFT JOIN (
          SELECT category_slug, count(*) AS article_count
          FROM articles
          WHERE category_slug IS NOT NULL
          GROUP BY category_slug
        ) cnt ON cnt.category_slug = cat.slug
        ORDER BY cat.name_en ASC
      ) c
    ),

    -- getSiteSettings() — the config jsonb blob from the single settings row
    'siteSettings', (
      SELECT config FROM site_settings WHERE id = 1 LIMIT 1
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_homepage_data() TO anon;
