-- One-time correction: real_views was backfilled from the old `views`
-- column when the real/boost split was introduced (migration 010), but
-- that old number could already include admin-entered fake/boost counts
-- from before this split existed — falsely making old articles rank as
-- "top performing" by real views.
--
-- Fold the old (unverifiable) real_views into boost_views instead of just
-- discarding it, so the public-facing `views` total (real_views +
-- boost_views) never changes — not now, and not if the article is edited
-- and re-saved later. real_views then restarts at 0 and only grows from
-- genuine visits tracked from this point forward.

update articles
set boost_views = boost_views + real_views,
    real_views = 0;
