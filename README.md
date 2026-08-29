# IG Story Media Inspector — GitHub Pages Ready

A static, mobile-friendly system for inspecting **Instagram Story / Highlight media that Instagram has already delivered to your own authorized browser session**.

It is designed for two cases:

- **Public accounts** — open the public Story/Highlight and inspect its delivered media.
- **Private accounts you are already allowed to view** — sign in on the official `instagram.com` site with your own account, open the Story/Highlight, and run the inspector in that same Instagram page.

> This project does not bypass Instagram privacy, guess passwords, steal cookies, or reconstruct image pixels that Instagram never sent.

## What the system checks

The inspector looks for:

- DOM images, `srcset`, video/source elements and video posters
- Instagram/CDN media resources already present in browser Performance entries
- media URLs embedded in scripts, JSON and HTML
- escaped Instagram CDN URLs such as `https:\/\/...` and `\u0026`
- **future Fetch/XHR JSON responses while the inspector stays open**
- Story/Highlight target media IDs when they are available in the URL
- image/video dimensions and a ranking score that prioritizes large portrait images and likely original/background candidates

For each candidate it offers **Preview, Open, Copy URL, Download**, and JSON export.

## Why private accounts work differently

A GitHub Pages site is hosted on a different origin from Instagram. Browser security rules prevent it from directly reading Instagram's private authenticated responses/cookies.

So this project intentionally does **not** put an Instagram password box on the GitHub site. Instead:

1. You log in only at `https://www.instagram.com/`.
2. You open a Story/Highlight that your account is already permitted to view.
3. A bookmarklet runs the inspector **inside that Instagram page**.
4. It scans only media/resources available to that logged-in page.

This is the safest practical static-GitHub architecture for private content.

## Deploy to GitHub Pages

See [DEPLOY.md](DEPLOY.md). The short version:

1. Create an empty GitHub repository.
2. Upload **all files and folders from this ZIP to the repository root**.
3. Push/commit to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions**.
6. The included workflow `.github/workflows/pages.yml` publishes the site automatically.

You can also choose **Deploy from a branch → main → /(root)**. `.nojekyll` is included.

## Android user flow

See [USER_GUIDE.md](USER_GUIDE.md) for detailed steps. A Tamil guide is also included: [README_TA.md](README_TA.md).

Basic flow:

1. Open your hosted site.
2. Tap **Instagram Login** and sign in on the official Instagram page if needed.
3. Return to the tool and paste a Story/Highlight link.
4. Tap **Open Story on Instagram**.
5. Run the bookmark named **IG Media Inspector**.
6. Check **LIKELY ORIGINAL / BACKGROUND** and **HIGH-VALUE CANDIDATE** results first.
7. If the target image does not appear, keep the inspector open, go one Story backward/forward, then return to the target so live API capture sees fresh data.

## Important limitation

There are two possible Instagram delivery patterns:

### A. Separate clean photo + overlay/music metadata

If Instagram delivers the original/static photo separately, the inspector may find a JPG/WEBP/AVIF candidate without the sticker/reaction overlay.

### B. Only one already-composited media file

If Instagram only delivers a rendered MP4/image with overlays already baked into it, the underlying hidden pixels do not exist in the browser response. No legitimate source-inspection tool can recover exact pixels that were never delivered.

The inspector does **not** use generative AI to fabricate a hidden face.

## Security

Read [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md).

- No backend is required.
- No Instagram username/password is collected by this project.
- No cookies/session tokens are uploaded to this project.
- All inspection happens locally in the browser tab where Instagram is already open.

## Files

- `index.html` — user interface
- `styles.css` — responsive styles
- `app.js` — main site logic
- `inspector-src.js` — readable inspector source
- `bookmarklet.txt` — ready-to-copy minified bookmarklet
- `manifest.webmanifest`, `sw.js` — PWA support
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow
- `USER_GUIDE.md` — normal-user Android instructions
- `README_TA.md` — Tamil quick guide
- `TEST_CHECKLIST.md` — post-deployment verification
- `DEPLOY.md` — GitHub deployment instructions
- `SECURITY.md`, `PRIVACY.md` — security/privacy boundaries

## Compatibility

Bookmarklet support differs between Android browsers. If a browser refuses to run JavaScript bookmarks, use another browser that supports bookmarklets. The site itself works as a normal static/PWA website.

## License

MIT. See [LICENSE](LICENSE).
