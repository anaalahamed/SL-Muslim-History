-- Adds support for limiting how many times a visitor can change their
-- reaction on a single post (max 4 changes, enforced in src/app/api/reactions/route.ts).
--
-- change_count: how many times this visitor has changed their reaction so far.
-- emoji is made nullable: when a visitor removes their reaction, the row is
-- kept (emoji set to NULL) instead of deleted, so change_count is preserved.

alter table reactions
  alter column emoji drop not null;

alter table reactions
  add column if not exists change_count integer not null default 0;
