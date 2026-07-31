-- Same correction as migration 011, but for news — the new "Top Special
-- News" / "Top Janaza News" dashboard boxes rank by real_views, so old
-- news posts' backfilled (possibly fake-inflated) real_views need the
-- same reset: fold into boost_views (public-facing `views` total never
-- changes), then zero real_views so ranking only reflects genuine
-- visits tracked from now on.

update news
set boost_views = boost_views + real_views,
    real_views = 0;
