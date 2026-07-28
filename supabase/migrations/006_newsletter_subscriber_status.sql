-- Lets the admin accept or decline each newsletter signup. Existing
-- subscribers are grandfathered in as 'accepted' (unaffected by this
-- change); newly submitted signups default to 'pending' until reviewed.

alter table newsletter_subscribers
  add column if not exists status text not null default 'accepted'
  check (status in ('pending', 'accepted', 'declined'));

alter table newsletter_subscribers
  alter column status set default 'pending';

-- Same base-grant issue hit earlier with comments/reactions: RLS policies
-- only restrict access a role already has — they don't grant it.
grant select, insert, update, delete on newsletter_subscribers to authenticated;
