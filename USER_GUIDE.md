# User Guide — Android (No Developer Knowledge Needed)

## One-time setup

### 1. Host the website

Follow `DEPLOY.md`, then open your GitHub Pages URL on your Android phone.

### 2. Create the Inspector bookmark

1. On the website, tap **Copy Inspector Bookmark**.
2. In your browser, bookmark any normal page.
3. Edit that bookmark.
4. Name it: `IG Media Inspector`
5. Replace its URL with the copied `javascript:...` code.
6. Save.

If Android removes the `javascript:` beginning while pasting, type `java` manually first and then paste the remainder.

You only need to create this bookmark once.

---

# Public Story / Highlight

1. Copy the Instagram Story/Highlight link.
2. Open your hosted IG Story Media Inspector site.
3. Paste the link.
4. Tap **Open Story on Instagram**.
5. When the target Story is visible, tap the browser address bar.
6. Type `IG Media Inspector`.
7. Select the bookmark result.
8. A floating inspector panel appears over Instagram.
9. Check results labelled:
   - `LIKELY ORIGINAL / BACKGROUND`
   - `HIGH-VALUE CANDIDATE`
10. Use **Open**, **Copy URL**, or **Download**.

---

# Private Story / Highlight

This works only if your own Instagram account is already allowed to view the private account's content.

1. On the tool website, tap **Instagram Login**.
2. Sign in on the official `instagram.com` page.
3. Confirm that you can normally view the target private Story/Highlight.
4. Return to the tool and paste the Story/Highlight link.
5. Tap **Open Story on Instagram**.
6. Run the `IG Media Inspector` bookmark.

The tool never receives your Instagram password.

---

# If the clean image is not immediately listed

Do this while the floating inspector is still open:

1. Tap **Likely only: ON** to reduce noise.
2. Tap **Rescan**.
3. Go to the previous Story or next Story once.
4. Return to the exact target Story.
5. Wait 2–5 seconds.
6. Tap **Rescan** again.

Why this helps: the inspector patches future browser Fetch/XHR calls while open, so new Instagram API responses can be scanned for image/video URLs.

---

# How to recognize the useful image

Prefer candidates that are:

- portrait / Story-shaped (often close to 9:16)
- 540×960, 720×1280, 1080×1920 or other large dimensions
- labelled `TARGET`, `Fetch response`, `XHR response`, `Video poster`, or `visible story`
- hosted on `scontent...`, `cdninstagram...` or Facebook/Instagram CDN hosts

Tiny 40×40 / 100×100 images are normally profile pictures, icons or thumbnails.

---

# What “Download” does

The inspector first tries to fetch the media in the Instagram page and save it. Some CDN URLs block direct blob downloads. If that happens, the tool opens the media URL in a new tab; you can then use the browser's normal Save/Download action.

---

# What the tool cannot do

If Instagram delivered only a single MP4/image where the sticker or overlay is already burned into the media, there is no separate clean photo to extract from that browser session.

The tool intentionally does not fabricate hidden pixels with AI.
