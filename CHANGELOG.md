# Public website changelog

## 2026-10-24 — Fly-through intro, structure explorer, tactile controls (Claude, PR)
- New opening fly-through: on first load the camera zooms into a concept model of the Everloom structure, drawn from the PMCF schematics (owner core, vault kept local, Capture, Verify, Remember, Retrieve, Continue, Agents), with captions. Skippable by button, click, scroll or keyboard. Skipped for reduced motion and for deep links (for example `#demo`). It also fades itself out after 11 s if the script fails, and can be replayed from the hero.
- New "Structure" section: an interactive version of the same model. Stage buttons fly the camera to each node and show plain, honestly qualified status text. The static workflow diagram remains the no-JavaScript fallback.
- Every button, link and summary has a tactile press state (spring press, inset shadow, ripple, keyboard press state too). Locally synthesised Web Audio click sounds are on by default and only ever play in response to a click, with distinct tones for primary, secondary, links, toggles, allow, deny and conflict. A "Button sounds" toggle mutes them. Ambient music remains opt-in.
- Sticky glass header with scroll progress, scroll-spy underline and an animated mobile menu (Escape and outside-click close it). Compact 44px icon audio buttons on phones. Back-to-top button, scroll reveals, pointer-lit cards, hero shimmer and aurora drift.
- Accessibility: image links use their alt text as the accessible name, the status table is a focusable region, arrows marked aria-hidden (↓ in-page, → internal, ↗ external), fixed toggle labels with aria-pressed, Enter submits the demo, noscript note. All new text pairs measured at 6.9:1 or better.
- Still a static site: no network calls, storage, cookies, analytics or external fonts.

## 2026-10-20 — Public HTTPS verification
- Kept GitHub Pages as the primary site host. Cloudflare DNS for the four apex Pages A records and the `www` GitHub Pages CNAME was switched from DNS-only to Cloudflare proxy, with all seven unrelated DNS records preserved.
- Cloudflare universal certificate is active for `cowlsly.website` and its wildcard. External GitHub-hosted smoke run [39272881120, attempt 2](https://github.com/Cowlsly/everloom-universal/actions/runs/39272881120) completed successfully, including strict certificate validation on apex and `www`, expected page content, canonical `www` redirect, JavaScript syntax and static DOM checks.
- Site is verified from GitHub-hosted runners over valid client-facing HTTPS. Cloudflare origin TLS mode remains `Full` (not `Full (strict)`); origin-certificate validation and real mobile-device accessibility checks remain separate follow-ups. No production memory-service release is claimed.

## 2026-10-19
- Initial accessible, mobile-first static informational website with synthetic browser-only demonstration.
- Truthfully labeled prototype capability matrix, architectural boundary, roadmap, FAQ, developer concepts and privacy notes.
- Added robots, sitemap, 404 page, vector icons, no-framework build and GitHub Pages custom-domain file.
- DNS / HTTPS / mobile real-device delivery **not yet verified at commit time**.
