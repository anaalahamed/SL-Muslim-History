-- Row-Level Security policies only restrict access that the role already
-- has at the table level — they don't grant it. If these tables were
-- created directly via SQL (not the Supabase Table Editor), the `anon`
-- role never received base SELECT/INSERT privileges, which surfaces as
-- "permission denied for table X" even though the RLS policies look correct.

grant select, insert on comments to anon;
grant select on comment_blocks to anon;
grant select, insert on reactions to anon;
