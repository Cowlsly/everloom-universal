# Everloom Memory Nexus | Public Website

**Static GitHub Pages branch** maintained separately from the private application repository. The public files contain **only** deliberate, synthetic website content. No database keys, migration SQL, real memory, customer records, user identifiers or private application configuration.

## Serving

- Intended canonical address: https://cowlsly.website/
- Canonical source: `gh-pages` branch of `Cowlsly/everloom-universal` (temporary public-safe branch until a dedicated website repository can be created).
- GitHub Pages source requires the hosting repository's **Settings > Pages** configuration (branch `gh-pages` / folder `/(root)`) and custom-domain confirmation.
- Configure Cloudflare apex and `www` **only after GitHub Pages is confirmed live and custom domain is claimed**. Preserve every unrelated MX, SPF, DKIM, DMARC and verification record. Do not cut over from the previous hosting just because a commit exists.
- If moving to a dedicated public website repository, copy **only files from this site branch's current tree** and set the custom domain on the new repository before switching DNS.
- `CNAME` contains `cowlsly.website`. The custom domain is not proven active by this file alone.

## Content

Plain HTML + CSS + zero-dependency JavaScript. The demonstration uses two imaginary seed records and volatile browser memory. There are no forms, cookies, localStorage, fetch() calls, service workers, analytics, passwords or external font CDNs. Search, owner-denial, conflict and restore are explicitly **simulated**.
A mock restore is **not** evidence of a production recovery drill.

## Local verification

Run `python3 -m http.server 8000` in this directory, open `http://localhost:8000`, and check keyboard navigation, the mobile menu, demo buttons, resizing, reduced-motion mode and the browser network panel. Automated smoke checks can validate relative file references and the absence of secret-like strings. A real mobile/browser and accessibility audit remains required.

## Publication & accuracy

This website is an explanatory research prototype, not an authenticated service, an approved vault, a production API, or verified market traction. The status table represents a dated evidence snapshot, and should be updated when release gates pass. The social preview is SVG; compatibility varies across social platforms. Use a reviewed PNG rendition later if needed.

No ongoing subscription or JS package installation is required for these files. Pages eligibility and actual domain delivery must be independently verified.


## Expansion update · 19 October 2026

The public website adds a pre-release shop section, opt-in Web Audio effects and ambient notes, Cowslide identity/wallet integration plan (not a functioning login or payment service), Causelight companion link awaiting destination verification, an unlinked Git Gears coming-soon reference, and an illustrated three-diagram gallery at /gallery.html. No payment processing, accounts, secrets, telemetry or unsafe cloud access was enabled. No scripts or audio load from third parties. HTTPS/certificate launch gate remains open until independently verified.
