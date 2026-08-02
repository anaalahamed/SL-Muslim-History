-- admin_permissions was created via raw SQL (migration 013), which means
-- Postgres never auto-granted base table privileges to the authenticated
-- or service_role roles -- RLS policies only restrict access a role
-- already has at the grant level, they don't grant it. Without this, both
-- the Team Access page and its API route fail with "permission denied for
-- table admin_permissions" even though the RLS policies are correct.

grant select, insert, update, delete on admin_permissions to authenticated;
grant select, insert, update, delete on admin_permissions to service_role;
