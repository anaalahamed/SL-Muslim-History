-- ============================================================
-- SL Muslim History — RLS Migration
-- Safe to run multiple times (idempotent)
-- Admin UUID: f0f05784-403f-4a70-a6ad-b904a36d09ba
--
-- NOTE: this file is a full from-scratch reference snapshot, kept in sync
-- with the live database as of supabase/migrations/001-014 (draft/published
-- gating, legacy-policy cleanup, per-section Team Access permissions).
-- If this file and the migrations/ folder ever diverge again, the
-- migrations/ folder is the source of truth — update this file to match,
-- don't run it blindly.
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
-- 2. BASE TABLE GRANTS
-- ============================================================
-- RLS policies only RESTRICT access a role already has at the grant
-- level — they don't grant it. Tables created via raw SQL (not the
-- Supabase Table Editor) never receive default grants, which surfaces as
-- "permission denied for table X" even when the RLS policies look correct.

GRANT SELECT, INSERT ON comments TO anon;
GRANT SELECT ON comment_blocks TO anon;
GRANT SELECT, INSERT ON reactions TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON comments        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON comment_blocks   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reactions        TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON reactions        TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON comments         TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON comment_blocks   TO service_role;

-- ============================================================
-- 3. ADMIN_PERMISSIONS — per-section Team Access
-- ============================================================
-- Lets the owner grant someone else (a spouse, a writer) their own login
-- with only specific sections, instead of sharing the owner's password.
-- Every "_admin_all" policy below accepts EITHER the owner's uid
-- (unchanged, full access) OR a matching "can_x" flag here.

CREATE TABLE IF NOT EXISTS admin_permissions (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text NOT NULL DEFAULT '',
  email            text NOT NULL DEFAULT '', -- denormalized: auth.users isn't queryable from the client
  can_articles     boolean NOT NULL DEFAULT false,
  can_news_special boolean NOT NULL DEFAULT false,
  can_news_janaza  boolean NOT NULL DEFAULT false,
  can_categories   boolean NOT NULL DEFAULT false,
  can_authors      boolean NOT NULL DEFAULT false,
  can_comments     boolean NOT NULL DEFAULT false,
  can_reactions    boolean NOT NULL DEFAULT false,
  can_ads          boolean NOT NULL DEFAULT false,
  can_newsletter   boolean NOT NULL DEFAULT false,
  can_messages     boolean NOT NULL DEFAULT false,
  can_settings     boolean NOT NULL DEFAULT false,
  can_backup       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_permissions TO service_role;

DROP POLICY IF EXISTS "admin_permissions_owner_all" ON admin_permissions;
DROP POLICY IF EXISTS "admin_permissions_self_select" ON admin_permissions;

-- Only the owner manages the permissions list
CREATE POLICY "admin_permissions_owner_all"
  ON admin_permissions FOR ALL
  TO authenticated
  USING     (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba')
  WITH CHECK (auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba');

-- Each granted user can read their OWN row, so the admin UI knows which
-- sections to show them
CREATE POLICY "admin_permissions_self_select"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. DROP EXISTING CONTENT-TABLE POLICIES (idempotency)
-- ============================================================
-- Also removes any leftover legacy policies from an earlier iteration of
-- this project's RLS setup — all USING(true), and being OR'd with every
-- other policy they granted unrestricted read/write access regardless of
-- the specific policies below (see migrations 008/011/012).

DROP POLICY IF EXISTS "articles_public_select"          ON articles;
DROP POLICY IF EXISTS "articles_admin_all"              ON articles;
DROP POLICY IF EXISTS "Allow all articles"              ON articles;
DROP POLICY IF EXISTS "Public read articles"            ON articles;
DROP POLICY IF EXISTS "admin write"                     ON articles;
DROP POLICY IF EXISTS "public read"                     ON articles;

DROP POLICY IF EXISTS "news_public_select"              ON news;
DROP POLICY IF EXISTS "news_admin_all"                  ON news;
DROP POLICY IF EXISTS "Allow all news"                  ON news;
DROP POLICY IF EXISTS "Public read news"                ON news;
DROP POLICY IF EXISTS "admin write"                     ON news;
DROP POLICY IF EXISTS "public read"                     ON news;

DROP POLICY IF EXISTS "authors_public_select"           ON authors;
DROP POLICY IF EXISTS "authors_admin_all"               ON authors;

DROP POLICY IF EXISTS "categories_public_select"        ON categories;
DROP POLICY IF EXISTS "categories_admin_all"            ON categories;

DROP POLICY IF EXISTS "advertisements_public_select"    ON advertisements;
DROP POLICY IF EXISTS "advertisements_admin_all"        ON advertisements;
DROP POLICY IF EXISTS "admin write"                     ON advertisements;
DROP POLICY IF EXISTS "Allow all ads"                   ON advertisements;
DROP POLICY IF EXISTS "public read"                     ON advertisements;
DROP POLICY IF EXISTS "Public read ads"                 ON advertisements;

DROP POLICY IF EXISTS "comments_public_select_approved" ON comments;
DROP POLICY IF EXISTS "comments_anon_insert"            ON comments;
DROP POLICY IF EXISTS "comments_admin_all"              ON comments;

DROP POLICY IF EXISTS "comment_blocks_anon_select"      ON comment_blocks;
DROP POLICY IF EXISTS "comment_blocks_admin_all"        ON comment_blocks;

DROP POLICY IF EXISTS "reactions_anon_select"           ON reactions;
DROP POLICY IF EXISTS "reactions_anon_insert"           ON reactions;
DROP POLICY IF EXISTS "reactions_anon_update"           ON reactions;
DROP POLICY IF EXISTS "reactions_anon_delete"           ON reactions;
DROP POLICY IF EXISTS "reactions_admin_all"             ON reactions;

DROP POLICY IF EXISTS "newsletter_anon_insert"          ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_all"            ON newsletter_subscribers;

DROP POLICY IF EXISTS "contact_anon_insert"             ON contact_messages;
DROP POLICY IF EXISTS "contact_admin_all"               ON contact_messages;

DROP POLICY IF EXISTS "site_settings_public_select"     ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all"         ON site_settings;

-- ============================================================
-- 5. ARTICLES
-- ============================================================

-- draft/published status gate (see migrations/007_article_news_status.sql)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published'));

-- Public: only published rows. Owner and anyone granted can_articles still
-- see drafts via articles_admin_all below — RLS policies are OR'd together.
CREATE POLICY "articles_public_select"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "articles_admin_all"
  ON articles FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_articles)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_articles)
  );

-- ============================================================
-- 6. NEWS (special vs janaza gated separately via news_type)
-- ============================================================

ALTER TABLE news ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_status_check;
ALTER TABLE news ADD CONSTRAINT news_status_check CHECK (status IN ('draft', 'published'));

CREATE POLICY "news_public_select"
  ON news FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "news_admin_all"
  ON news FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR (news_type = 'special' AND EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_news_special))
    OR (news_type = 'janaza'  AND EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_news_janaza))
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR (news_type = 'special' AND EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_news_special))
    OR (news_type = 'janaza'  AND EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_news_janaza))
  );

-- ============================================================
-- 7. AUTHORS
-- ============================================================

CREATE POLICY "authors_public_select"
  ON authors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authors_admin_all"
  ON authors FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_authors)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_authors)
  );

-- ============================================================
-- 8. CATEGORIES
-- ============================================================

CREATE POLICY "categories_public_select"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_categories)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_categories)
  );

-- ============================================================
-- 9. ADVERTISEMENTS
-- ============================================================

-- Public: only active ads (used by getAds / getSidebarAd on public pages)
CREATE POLICY "advertisements_public_select"
  ON advertisements FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "advertisements_admin_all"
  ON advertisements FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_ads)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_ads)
  );

-- ============================================================
-- 10. COMMENTS
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

CREATE POLICY "comments_admin_all"
  ON comments FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_comments)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_comments)
  );

-- ============================================================
-- 11. COMMENT_BLOCKS (part of comment moderation)
-- ============================================================

-- Anon: SELECT — /api/comments POST reads this to check if visitor is blocked.
-- Cannot be scoped further: RLS USING expressions cannot reference query WHERE
-- clauses, and there is no auth.uid() for anonymous visitors.
CREATE POLICY "comment_blocks_anon_select"
  ON comment_blocks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "comment_blocks_admin_all"
  ON comment_blocks FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_comments)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_comments)
  );

-- ============================================================
-- 12. REACTIONS
-- ============================================================

-- All mutations after the first reaction (UPDATE/DELETE) go through
-- /api/reactions using the service-role client. Anon only needs SELECT
-- and INSERT — UPDATE/DELETE policies for anon are intentionally absent.

CREATE POLICY "reactions_anon_select"
  ON reactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "reactions_anon_insert"
  ON reactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "reactions_admin_all"
  ON reactions FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_reactions)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_reactions)
  );

-- ============================================================
-- 13. NEWSLETTER_SUBSCRIBERS
-- ============================================================

-- Anon: INSERT only — NewsletterBox.tsx / Footer.tsx do a direct browser
-- insert. No anon SELECT: subscriber emails are private.
CREATE POLICY "newsletter_anon_insert"
  ON newsletter_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "newsletter_admin_all"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_newsletter)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_newsletter)
  );

-- ============================================================
-- 14. CONTACT_MESSAGES
-- ============================================================

-- Anon: INSERT only — ContactClient.tsx's saveMessage() inserts directly and
-- must NOT chain .select()/.single(): Postgres rejects (rolls back) an
-- INSERT...RETURNING when the inserting role can't also SELECT the new
-- row, and anon has no SELECT policy here (visitors can't read others'
-- messages) — a plain insert with no RETURNING isn't subject to that check.
CREATE POLICY "contact_anon_insert"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "contact_admin_all"
  ON contact_messages FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_messages)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_messages)
  );

-- ============================================================
-- 15. SITE_SETTINGS
-- ============================================================

CREATE POLICY "site_settings_public_select"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "site_settings_admin_all"
  ON site_settings FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_settings)
  )
  WITH CHECK (
    auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
    OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid() AND p.can_settings)
  );

-- ============================================================
-- 16. RPC — increment_article_views / increment_news_views
-- ============================================================

-- Called from article/news detail pages using the anon client.
-- Requires SECURITY DEFINER on the function — verify in Supabase Dashboard
-- before running this migration (Database → Functions).
-- If a function is SECURITY INVOKER, alter it to SECURITY DEFINER first.
GRANT EXECUTE ON FUNCTION increment_article_views(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_news_views(uuid) TO anon;

-- ============================================================
-- 17. STORAGE — media bucket
-- ============================================================

-- NOTE: ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY is intentionally
-- omitted. Supabase manages RLS on storage.objects internally; running that
-- statement as a non-owner raises ERROR 42501 and is not required.
-- RLS on storage.objects is already enabled by Supabase on all projects.

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

-- Owner, or anyone with ANY granted section (an article writer and an ad
-- manager both just need to upload photos — write access here isn't
-- split per-section like the tables above are).
CREATE POLICY "media_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND (
      auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
      OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid())
    )
  );

CREATE POLICY "media_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media' AND (
      auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
      OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid())
    )
  );

CREATE POLICY "media_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media' AND (
      auth.uid() = 'f0f05784-403f-4a70-a6ad-b904a36d09ba'
      OR EXISTS (SELECT 1 FROM admin_permissions p WHERE p.user_id = auth.uid())
    )
  );
