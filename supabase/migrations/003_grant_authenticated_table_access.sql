-- The admin panel reads/writes comments, comment_blocks, and reactions
-- using the logged-in admin's session, which runs as the `authenticated`
-- Postgres role — a separate role from `anon`, needing its own grants.
-- Without this, admin queries return empty results (not an error) because
-- RLS policies never even get evaluated when the base grant is missing.

grant select, insert, update, delete on comments to authenticated;
grant select, insert, update, delete on comment_blocks to authenticated;
grant select, insert, update, delete on reactions to authenticated;
