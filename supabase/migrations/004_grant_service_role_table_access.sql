-- Reaction INSERT/UPDATE/DELETE run through the service-role client
-- (src/app/api/reactions/route.ts), which is a separate Postgres role
-- from anon/authenticated and needs its own explicit grant — RLS is
-- bypassed for service_role, but the base table grant is still required.

grant select, insert, update, delete on reactions to service_role;
grant select, insert, update, delete on comments to service_role;
grant select, insert, update, delete on comment_blocks to service_role;
