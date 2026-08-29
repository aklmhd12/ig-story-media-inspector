# Post-Deployment Test Checklist

After GitHub Pages publishes the site:

- [ ] Site opens over HTTPS.
- [ ] `Copy Inspector Bookmark` copies a value beginning with `javascript:`.
- [ ] `Instagram Login` opens the official `instagram.com/accounts/login/` page.
- [ ] A valid Story/Highlight URL opens using `Open Story on Instagram`.
- [ ] The saved `IG Media Inspector` bookmark displays a floating panel on Instagram Web.
- [ ] `Rescan`, `Likely only`, `Hide tiny`, and `Export JSON` buttons work.
- [ ] Image/video candidates show dimensions after a short delay.
- [ ] Opening the previous/next Story while the panel stays open increases `Captured responses` when Instagram issues new API calls.
- [ ] `Open` and `Copy URL` work for a candidate.
- [ ] `Download` either downloads directly or opens the CDN media in a new tab as fallback.

If the bookmark never runs, the current Android browser probably blocks JavaScript bookmarks. Use another browser with bookmarklet support; no website code can override that browser restriction.
