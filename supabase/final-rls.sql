-- ============================================================
-- SL Muslim History — RLS Migration
-- Safe to run multiple times (idempotent)
-- Admin UUID: f0f05784-403f-4a70-a6ad-b904a36d09ba
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS
-- ============================================================

ALTER TABLE articles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE news                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_blocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. DROP EXISTING POLICIES (idempotency)
-- ============================================================

-- articles
DROP POLICY IF EXISTS "articles_public_select"          ON articles;
DROP POLICY IF EXISTS "articles_admin_all"              ON articles;

-- news
DROP POLICY IF EXISTS "news_public_select"              ON news;
DROP POLICY IF EXISTS "news_admin_all"                  ON news;

-- authors
DROP POLICY IF EXISTS "authors_public_select"           ON authors;
DROP POLICY IF EXISTS "authors_admin_all"               ON authors;

-- categories
DROP POLICY IF EXISTS "categories_public_select"        ON categories;
DROP POLICY IF EXISTS "categories_admin_all"            ON categories;

-- advertisements
DROP POLICY IF EXISTS "advertisements_public_select"    ON advertisements;
DROP POLICY IF EXISTS "advertisements_admin_all"        ON advertisements;

-- comments
DROP POLICY IF EXISTS "comments_public_select_approved" ON comments;
DROP POLICY IF EXISTS "comments_anon_insert"            ON comments;
DROP POLICY IF EXISTS "comments_admin_all"              ON comments;

-- comment_blocks
DROP POLICY IF EXISTS "comment_blocks_anon_select"      ON comment_blocks;
DROP POLICY IF EXISTS "comment_blocks_admin_all"        ON comment_blocks;

-- reactions
DROP POLICY IF EXISTS "reactions_anon_select"           ON reactions;
DROP POLICY IF EXISTS "reactions_anon_insert"           ON reactions;
DROP POLICY IF EXISTS "reactions_anon_update"           ON reactions;
DROP POLICY IF EXISTS "reactions_anon_delete"           ON reactions;
DROP POLICY IF EXISTS "reactions_admin_all"             ON reactions;

-- newsletter_subscribers
DROP POLICY IF EXISTS "newsletter_anon_insert"          ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_all"            ON newsletter_subscribers;

-- contact_messages
DROP POLICY IF EXISTS "contact_anon_insert"             ON contact_messages;
DROP POLICY IF EXISTS "contact_admin_all"               ON contact_messages;

-- site_settings
DROP POLICY IF EXISTS "site_settings_public_select"     ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all"         ON site_settings;

-- ============================================================
-- 3. ARTICLES
-- ============================================================

CREATE POLICY "articles_public_select"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "articles_admin_all"
  ON articles FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 4. NEWS
-- ============================================================

CREATE POLICY "news_public_select"
  ON news FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "news_admin_all"
  ON news FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 5. AUTHORS
-- ============================================================

CREATE POLICY "authors_public_select"
  ON authors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authors_admin_all"
  ON authors FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 6. CATEGORIES
-- ============================================================

CREATE POLICY "categories_public_select"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 7. ADVERTISEMENTS
-- ============================================================

-- Public: only active ads (used by getAds / getSidebarAd on public pages)
CREATE POLICY "advertisements_public_select"
  ON advertisements FOR SELECT
  TO anon
  USING (is_active = true);

-- Admin: all ads regardless of is_active (getAllAds uses auth client)
CREATE POLICY "advertisements_admin_all"
  ON advertisements FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 8. COMMENTS
-- ============================================================

-- Public: read only approved comments
CREATE POLICY "comments_public_select_approved"
  ON comments FOR SELECT
  TO anon
  USING (status = 'approved');

-- Anon: insert new comments — status must be 'pending' (enforced here and in app code)
CREATE POLICY "comments_anon_insert"
  ON comments FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');

-- Admin: full access to all comments across all statuses
CREATE POLICY "comments_admin_all"
  ON comments FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 9. COMMENT_BLOCKS
-- ============================================================

-- Anon: SELECT — /api/comments POST reads this to check if visitor is blocked.
-- Cannot be scoped further: RLS USING expressions cannot reference query WHERE
-- clauses, and there is no auth.uid() for anonymous visitors.
CREATE POLICY "comment_blocks_anon_select"
  ON comment_blocks FOR SELECT
  TO anon
  USING (true);

-- Admin: full access (upsert blocks, delete unblocks)
CREATE POLICY "comment_blocks_admin_all"
  ON comment_blocks FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 10. REACTIONS
-- ============================================================

-- All mutations (INSERT/UPDATE/DELETE) are performed by /api/reactions
-- using the service-role client. Anon only needs SELECT and INSERT.
-- UPDATE and DELETE policies for anon are intentionally absent.

CREATE POLICY "reactions_anon_select"
  ON reactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "reactions_anon_insert"
  ON reactions FOR INSERT
  TO anon
  WITH CHECK (true);

-- WARNING: cannot be scoped to row owner — see note above.
-- reactions_anon_update and reactions_anon_delete have been intentionally
-- omitted. All mutation operations (INSERT/UPDATE/DELETE) in /api/reactions
-- now use the service-role client, so no anon mutation policies are required.
-- The two DROP statements below are retained for idempotency in case these
-- policies were previously applied.
DROP POLICY IF EXISTS "reactions_anon_update" ON reactions;
DROP POLICY IF EXISTS "reactions_anon_delete" ON reactions;

-- Admin: full access for the reactions admin page
CREATE POLICY "reactions_admin_all"
  ON reactions FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 11. NEWSLETTER_SUBSCRIBERS
-- ============================================================

-- Anon: INSERT only — NewsletterBox.tsx does a direct browser insert
CREATE POLICY "newsletter_anon_insert"
  ON newsletter_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin: full access (read list, delete subscribers)
CREATE POLICY "newsletter_admin_all"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 12. CONTACT_MESSAGES
-- ============================================================

-- Anon: INSERT only — ContactClient.tsx calls saveMessage() which inserts directly
CREATE POLICY "contact_anon_insert"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin: full access (read, mark read, delete)
CREATE POLICY "contact_admin_all"
  ON contact_messages FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 13. SITE_SETTINGS
-- ============================================================

CREATE POLICY "site_settings_public_select"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "site_settings_admin_all"
  ON site_settings FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- ============================================================
-- 14. RPC — increment_article_views
-- ============================================================

-- Called from article detail page using the anon client.
-- Requires SECURITY DEFINER on the function — verify in Supabase Dashboard
-- before running this migration (Database → Functions → increment_article_views).
-- If the function is SECURITY INVOKER, alter it to SECURITY DEFINER first.
GRANT EXECUTE ON FUNCTION increment_article_views(uuid) TO anon;

-- ============================================================
-- 15. STORAGE — media bucket
-- ============================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies (idempotency)
DROP POLICY IF EXISTS "media_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "media_admin_insert"  ON storage.objects;
DROP POLICY IF EXISTS "media_admin_update"  ON storage.objects;
DROP POLICY IF EXISTS "media_admin_delete"  ON storage.objects;

-- Anyone can read media (images displayed on public pages)
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

-- Admin only: upload new files
CREATE POLICY "media_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
  );

-- Admin only: replace/update existing files
CREATE POLICY "media_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
  );

-- Admin only: delete files
CREATE POLICY "media_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
  );
