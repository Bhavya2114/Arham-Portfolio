# Browser checks

Headless-Chrome checks of the built site (Our Work map, panel and sheet, contrast). They drive Chrome
through `cdp.mjs` (Chrome at the Windows default path) against the preview server on port 4173.

```
npm run build
npm run preview          # http://localhost:4173, leave running
cd scratch/browser
node tall_check.mjs      # any script below
```

| Script | Checks |
|---|---|
| `tall_check.mjs` | Desktop project detail at 1920×800, 1440×900, 1366×768, 1280×720: full-height panel, no scrollbar, photo ≥ 180 px, area · Map · status on one line, status chip icon + label, WhatsApp at the bottom |
| `summary_check.mjs` | Detail summary sentence and status chip at 1440, 1366 and 390 px (sheet fits, WhatsApp visible) |
| `detail_check.mjs` | Compact detail (Bikaner, Kota → Sankalp) at 1440, 1366 and 390 px |
| `sheet_check.mjs` | Phone sheet at 390×844 and 375×667: 65 % cap, drag up to 85 %, back, close, per-city reset |
| `fit_check.mjs` | Panel / sheet fit to content, one-project cities, back-button history |
| `contrast_audit_v2.mjs` | WCAG contrast of every visible text node on every page, phone + desktop |
| `audit_sheet.mjs` | The same contrast audit on each Our Work sheet level |
| `measure_all.mjs` | Width of every row's detail area line at 1440 px; lists the ones that wrap |

Screenshots go to `shots_*/` and Chrome's profile to `chrome-prof/` in this folder; both are ignored by git.
