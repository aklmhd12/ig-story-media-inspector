# Security

## Credential policy

This project does not contain an Instagram login form and must not be modified to collect Instagram passwords, session cookies or authentication tokens.

Use the official `https://www.instagram.com/accounts/login/` page for authentication.

## Private content boundary

The inspector can examine media only when the currently logged-in Instagram browser tab already has legitimate access to that content. It is not designed to bypass private-account access controls.

## Local inspection

The bookmarklet executes in the active Instagram page and scans media URLs/resources available to that page. The GitHub Pages site has no backend and receives no scan results automatically.

## Export files

If you use **Export JSON**, the result is downloaded locally. It can contain signed CDN media URLs. Treat those files as private and do not post them publicly.

## Third-party sites

Do not paste your Instagram password, cookies or session tokens into random downloader websites.
