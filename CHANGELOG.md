# Public website changelog

## 2026-10-26: Interactive upgrade (pull request, not yet deployed)
- Tactile buttons with hover lift, pressed state, visible focus rings and disabled state. Optional tiny vibration on touch, never in calm mode.
- Optional sound effects and original ambient music, both synthesised in the browser with the Web Audio API. No audio files. Off until a visitor taps, with separate toggles, a master volume, mute and a Sound and motion panel. Choices use sessionStorage only.
- New sections: About us, The future, an interactive memory lifecycle explorer, expandable architecture details.
- New page: acknowledgements.html (Acknowledgements and Accreditations).
- Progress bar, back to top button, Jump to menu, keyboard shortcuts, scroll reveals, calm mode for reduced motion and data saver.
- Sitemap now lists the gallery and acknowledgements pages. No analytics, cookies, accounts, payments or external requests were added.

## 2026-10-20 — Public HTTPS verification
- Kept GitHub Pages as the primary site host. Cloudflare DNS for the four apex Pages A records and the `www` GitHub Pages CNAME was switched from DNS-only to Cloudflare proxy, with all seven unrelated DNS records preserved.
- Cloudflare universal certificate is active for `cowlsly.website` and its wildcard. External GitHub-hosted smoke run [39272881120, attempt 2](https://github.com/Cowlsly/everloom-universal/actions/runs/39272881120) completed successfully, including strict certificate validation on apex and `www`, expected page content, canonical `www` redirect, JavaScript syntax and static DOM checks.
- Site is verified from GitHub-hosted runners over valid client-facing HTTPS. Cloudflare origin TLS mode remains `Full` (not `Full (strict)`); origin-certificate validation and real mobile-device accessibility checks remain separate follow-ups. No production memory-service release is claimed.

## 2026-10-19
- Initial accessible, mobile-first static informational website with synthetic browser-only demonstration.
- Truthfully labeled prototype capability matrix, architectural boundary, roadmap, FAQ, developer concepts and privacy notes.
- Added robots, sitemap, 404 page, vector icons, no-framework build and GitHub Pages custom-domain file.
- DNS / HTTPS / mobile real-device delivery **not yet verified at commit time**.
