-- Reaction changes (switching/removing an emoji) only UPDATE the existing
-- row — created_at never moves, so the admin "new reaction" notification
-- badge and the reactions list's recency sort both missed every change
-- after the visitor's first-ever reaction. This column tracks the most
-- recent write (insert OR update) instead.

alter table reactions
  add column if not exists updated_at timestamptz not null default now();
