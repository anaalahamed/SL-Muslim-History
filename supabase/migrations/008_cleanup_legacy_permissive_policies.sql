-- Removes leftover permissive policies from an earlier iteration of this
-- project's RLS setup ("Allow all articles", "Public read articles",
-- "admin write", "public read", and their news equivalents — all
-- `USING (true)` for the `public` role). These were never dropped by
-- final-rls.sql (which only targeted its own differently-named policies),
-- so they stayed active and, being OR'd with every other policy, granted
-- unrestricted read/write access to anyone regardless of the more specific
-- policies added later (including the draft/published gate in migration 007).

drop policy if exists "Allow all articles" on articles;
drop policy if exists "Public read articles" on articles;
drop policy if exists "admin write" on articles;
drop policy if exists "public read" on articles;

drop policy if exists "Allow all news" on news;
drop policy if exists "Public read news" on news;
drop policy if exists "admin write" on news;
drop policy if exists "public read" on news;
