# IG Story Media Inspector — தமிழ் வழிகாட்டி

இந்த ZIP-ஐ GitHub-ல் host செய்த பிறகு, Instagram Story / Highlight link-ஐ paste செய்து, உங்கள் browser-ல் Instagram-ஐ open செய்து, அந்த page-க்கு Instagram ஏற்கனவே வழங்கிய image/video resources-ஐ scan செய்யலாம்.

## இது எதற்கு வேலை செய்யும்?

- **Public account** Story / Highlight
- **Private account** — ஆனால் உங்கள் Instagram account அந்த private account-ஐ ஏற்கனவே follow செய்து, அந்த Story/Highlight-ஐ சாதாரணமாக பார்க்க permission இருக்க வேண்டும்.

இந்த system private account security-ஐ bypass செய்யாது.

## Private account எப்படி வேலை செய்கிறது?

GitHub Pages website-க்குள் Instagram password போட வேண்டியதில்லை.

1. Hosted website-ல் **Instagram Login** அழுத்தவும்.
2. Official `instagram.com` page-ல் உங்கள் account-க்கு login செய்யவும்.
3. Website-க்கு திரும்பி Story / Highlight link paste செய்யவும்.
4. **Open Story on Instagram** அழுத்தவும்.
5. Story open ஆனதும் browser bookmark-ல் இருக்கும் **IG Media Inspector**-ஐ run செய்யவும்.
6. Instagram page மேல் scanner panel வரும்.
7. முதலில் `LIKELY ORIGINAL / BACKGROUND` results பார்க்கவும்.
8. தேவைப்பட்டால் `Open`, `Copy URL`, `Download` பயன்படுத்தவும்.

## Bookmark ஒருமுறை எப்படி create செய்வது?

1. Hosted site-ல் **Copy Inspector Bookmark** அழுத்தவும்.
2. Browser-ல் ஏதாவது ஒரு normal page-ஐ bookmark செய்யவும்.
3. அந்த bookmark-ஐ Edit செய்யவும்.
4. Name: `IG Media Inspector`
5. URL field-ல் copied `javascript:...` code paste செய்யவும்.
6. Save செய்யவும்.

Android browser paste செய்யும்போது `javascript:` remove செய்தால், URL field-ல் `java` என்று முதலில் type செய்து பிறகு மீதியை paste செய்யவும்.

## Clean background photo உடனே கிடைக்கவில்லை என்றால்

Inspector panel-ஐ close செய்ய வேண்டாம்.

1. `Likely only: ON` செய்யவும்.
2. `Rescan` செய்யவும்.
3. Previous அல்லது Next Story-க்கு ஒரு முறை செல்லவும்.
4. மீண்டும் target Story-க்கு திரும்பவும்.
5. 2–5 seconds wait செய்யவும்.
6. `Rescan` மீண்டும் அழுத்தவும்.

இதனால் புதிய Instagram Fetch/XHR response-களுக்குள் இருக்கும் image/video URL-களையும் scanner பார்க்க முயலும்.

## முக்கிய limitation

Instagram clean uploaded photo-ஐ browser-க்கு தனியாக அனுப்பினால் இந்த tool அதை கண்டுபிடிக்க வாய்ப்பு உள்ளது.

ஆனால் Instagram sticker / music / reaction எல்லாம் சேர்த்து ஒரே MP4 அல்லது image-ஆக render செய்து மட்டும் browser-க்கு அனுப்பினால், அதன் கீழே இருந்த exact original pixels browser-ல் இல்லை. அப்போது source scan மூலம் exact hidden image-ஐ recover செய்ய முடியாது.

இந்த system AI வைத்து மறைந்த முகத்தை கற்பனை செய்து உருவாக்காது.

## GitHub host செய்வது

முழு instructions: `DEPLOY.md`

சுருக்கமாக:

1. GitHub புதிய repository create செய்யவும்.
2. ZIP extract செய்யவும்.
3. ZIP-க்குள் இருக்கும் **எல்லா files/folders-ஐ repository root-க்கு upload** செய்யவும்.
4. `main` branch-க்கு commit செய்யவும்.
5. **Settings → Pages → Source → GitHub Actions** select செய்யவும்.
6. Included `.github/workflows/pages.yml` site-ஐ deploy செய்யும்.

Security details: `SECURITY.md`  
Privacy details: `PRIVACY.md`
