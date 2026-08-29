# Deploy to GitHub Pages

## Option A — GitHub Actions (recommended)

1. Create a new GitHub repository, for example `ig-story-media-inspector`.
2. Extract the ZIP on your device/computer.
3. Upload **everything inside the ZIP** to the repository root. Keep the `.github/workflows/pages.yml` folder structure.
4. Commit to the `main` branch.
5. In GitHub open **Settings → Pages**.
6. Under **Build and deployment → Source**, choose **GitHub Actions**.
7. Open the repository **Actions** tab and wait for `Deploy static site to Pages` to finish.
8. Your site URL appears under **Settings → Pages**.

## Option B — Deploy from branch

1. Upload all files to the root of `main`.
2. Go to **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Branch: `main`
5. Folder: `/ (root)`
6. Save.

`.nojekyll` is included so GitHub Pages serves the static files directly.

## Updating later

Replace changed files and commit/push again. The service worker cache version is in `sw.js`; increment it after major updates so installed PWAs refresh cleanly.

## Custom domain

Optional. Add your domain in **Settings → Pages → Custom domain**. GitHub will tell you which DNS records are required.
