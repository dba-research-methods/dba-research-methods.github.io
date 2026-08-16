# DBA Research Methods — test cases

Two passes:

- `python3 check.py` — static. Dead anchors, dead cross-page links, duplicate ids, missing assets, Edubem-theme residue. Zero dependencies.
- `node verify.mjs` — browser. Console errors, cross-page nav, ⌘K search, dark mode, mobile dialog on all six pages, plus desk and audio behaviour. Needs playwright-core + a chromium build; see the header of the file.

Section A below is the site-level matrix added when the pages were unified.
Section B is the original per-page matrix from when RQ Lab, the SMART critique
and the ML explainer were three standalone pages; it remains the regression
baseline. Filenames there predate the rename
(`walmart-research.html` → `rq-lab.html`, LearnML `index.html` → `ml-fundamentals.html`).

---

## Section A — site-level (automated)

| ID | Area | Test | Result |
|----|------|------|--------|
| TC-A1 | Structure | All six pages exist; no duplicate/empty ids | PASS |
| TC-A2 | Links | Every `href="#…"` resolves to an id on that page | PASS |
| TC-A3 | Links | Every cross-page `href="*.html"` resolves to a file | PASS |
| TC-A4 | Assets | Every referenced css/js/mp3/svg exists | PASS |
| TC-A5 | Theme | No `#673DE6`, `backdrop-filter`, `bg-glass` or "meteorite" anywhere | PASS |
| TC-A6 | Nav | `.site-strip` present on all six pages with 5 cross-page links | PASS |
| TC-A7 | Nav | Current page marked `aria-current="page"` in strip *and* mobile dialog | PASS |
| TC-A8 | Nav | Mobile dialog (390 px) opens with a 6-link "Pages" group | PASS |
| TC-A9 | Search | Ctrl/⌘+K opens on **every** page and returns a non-zero result count | PASS |
| TC-A10 | Search | Results include other pages of the site, not just the current one | PASS |
| TC-A11 | Theme | Toggle flips `html.dark`, persists, `meta[theme-color]` syncs to `#0A0D14` | PASS |
| TC-A12 | JS | No console errors or pageerrors on any page | PASS |
| TC-A13 | Desk | Tab switching leaves exactly one pane visible | PASS |
| TC-A14 | Desk | `research-desk.html#pane-tools` deep-links to that tab | PASS |
| TC-A15 | Desk | Diagnostic (comparative + compare) → "Comparative Multi-Case & fsQCA" | PASS |
| TC-A16 | Desk | Jump-to-match highlights exactly one card and fires the toast | PASS |
| TC-A17 | Desk | Filter updates the live count and hides non-matching cards | PASS |
| TC-A18 | Audio | Full static transcript renders all 8 lines | PASS |
| TC-A19 | Audio | Chapter jump activates the matching scene | PASS |
| TC-A20 | Audio | Waveform canvas paints, reading `--accent` from the theme tokens | PASS |

**Known, accepted:** cross-page search is page-level only — sections of *other*
pages are not indexed. Upgrade path is a generated `site-index.json`; see the
`ponytail:` comment on `buildIndex()` in `app.js`.

---

## Section B — original per-page matrix

Subjects under test:
- `index.html` (733 lines) — LearnML landing page, now `ml-fundamentals.html`
- `walmart-research.html` (2,047 lines) — RQ Lab workbook, now `rq-lab.html`
- `smart-critique.html` (695 lines) — SMART framework critique
- Shared `app.js` (241 lines) and `styles.css`

## Environment
- Chrome/Edge desktop + mobile viewports (720 px, 390 px, 320 px)
- Dark mode: class `dark` on `<html>` + `localStorage.theme` + `meta[name="theme-color"]` sync
- jsdom (Node v24) execution of `app.js` with real event dispatch; timers awaited
- Mermaid: v11; every `pre.mermaid` source parsed with the real `mermaid.parse` (20/20 OK)
- WCAG AA contrast computed numerically (≥ 4.5:1 for small text)
- Counts verified: index 9 sections, 6 nav links; walmart 15 sections, 17 figures, 36 refs, 13 nav links; smart 7 sections, 3 figures, 16 refs, 5 nav links

## Test Case Matrix

| ID | Area | Test | Result | Notes |
|----|------|------|--------|-------|
| TC-01 | Structure | No duplicate `id` / empty `id` on all 3 pages | PASS | — |
| TC-02 | Nav | All internal `href="#..."` resolve | PASS | BUG-13, BUG-14 fixed |
| TC-03 | Content | Figure numbers sequential 1..n on each page | PASS | — |
| TC-04 | Content | Walmart hero stats match content (sources = ref-item count) | PASS | hero now 36 = 36 refs (BUG-15 fixed) |
| TC-05 | Content | RACI matrix: exactly one Accountable (A) per activity row | PASS | 11/11 rows |
| TC-06 | Mermaid | All diagram sources parse (17 + 3) | PASS | — |
| TC-07 | Theme | Toggle flips `dark`, persists, theme-color meta syncs, both icons present | PASS | — |
| TC-08 | Nav | Mobile dialog opens; `aria-expanded=true`; body scroll locked | PASS | — |
| TC-09 | Nav | Escape closes dialog; focus restored | PASS | — |
| TC-10 | Nav | `.mobile-nav-link` tap closes dialog on all 3 pages | PASS | — |
| TC-11 | Nav | Special CTA links in dialog ("Start" / "Mine" / "Ledger") close dialog | PASS | delegated anchor-close handler (BUG-16 fixed) |
| TC-12 | Search | Ctrl+K opens search; typing returns results; no-match handled cleanly | PASS | index only; Ctrl+K inert on other pages (known, low) |
| TC-13 | Scroll-spy | Active nav item matches visible section | PASS | max-offset selection (BUG-17 fixed) |
| TC-14 | Scroll-spy | walmart + smart active state follows scroll | PASS | — |
| TC-15 | A11y | All `<th>` have `scope` | PASS | index table updated (BUG-18 fixed) |
| TC-16 | A11y | `aria-controls` on nav trigger resolves | PASS | dialog id added on all 3 pages (BUG-19 fixed) |
| TC-17 | A11y | Skip link target, dialog accessible name, buttons labelled | PASS | — |
| TC-18 | JS | `app.js` executes on each page without console/window errors | PASS | — |
| TC-19 | JS | Keyboard: Escape, Ctrl+K, result Enter/arrow behaviour | PASS | — |
| TC-20 | A11y | Dark-mode small-text contrast ≥ 4.5:1 (8 sampled pairs) | PASS | ink-dim now #8A94A4 ≈ 6.1:1 |
| TC-21 | A11y | Theme icon swap in dark (CSS rules present) | PASS | previous BUG-02 fixed |
| TC-22 | Mermaid | Label line breaks survive the page's render pipeline (child-node extraction → `textContent` write-back → `mermaid.run`) | PASS | fixed (BUG-23): no `innerHTML`/`esc()` round-trip; `<br/>` preserved as literal source text |

## Bugs Found (by severity)

### High (P1)
1. **BUG-13 — Dead "Concepts" navigation on the landing page.** `index.html` nav (line 96), footer (line 659) and mobile menu (line 707) all link `href="#concepts"` but no element with `id="concepts"` exists. Clicking does nothing. The desktop "Concepts" item is also a primary nav entry.
2. **BUG-14 — Hero "Top risks" panel on smart-critique.html has 3 dead / 2 colliding links.** Aside links: "Epistemic closure" → `#epistemic` (no such id), "Temporal disciplining" → `#temporal` (no id), "Insider-research paradox" → `#temporal` (no id). Only the S1 card carries `id="reactivity"`, so "Reactivity & goal displacement" and "Risk aversion in topic choice" both point at the S1 card. 3 of 5 risk links navigate nowhere; the labels do not match their targets.

### Medium (P2)
3. **BUG-15 — Walmart hero "Sources 35" vs 36 reference items.** The companion-ledger reference was appended as item 36 (`walmart-research.html` line 1871) but the hero stat still says 35.
4. **BUG-16 — "Start" (index) and "Ledger" (smart) dialog links don't close the mobile nav.** `app.js` only wires `.mobile-nav-link` and the walmart `#problems` "Mine" link (special case). The two extra CTA links sit in the dialog without the class, so tapping them leaves the dialog open with `body { overflow: hidden }` locked — the tap appears dead on mobile. Same class of bug as the previously-fixed BUG-01.
5. **BUG-17 — Scroll-spy mis-highlights on index.html.** Nav order is Fundamentals, Paradigms, Concepts, Algorithms, Evaluation, Resources but the DOM order is Paradigms before Fundamentals. Because `onScroll()` keeps the last matching section and `offsetTop` grows with DOM position, reading the Fundamentals section highlights "Paradigms" (`app.js:220-235`). Also, while reading Learning path / Glossary / Methodology (no nav items), "Evaluation" stays highlighted.

### Low (P3)
6. **BUG-18 — index algorithm table `<th>` cells lack `scope`.** 5 headers (Algorithm, Paradigm, Best for, Complexity, Maturity) have no `scope` attribute (walmart tables were refactored to `scope="col"`; index was not).
7. **BUG-19 — `aria-controls="site-navigation-dialog"` dangles on all 3 pages.** The nav dialog element has only `data-nav-dialog` — no `id` — so the trigger's `aria-controls` references a non-existent id.
8. **BUG-20 — Hard-coded `active` / `aria-current="page"` on index nav.** `index.html:94` hard-codes the active state on "Fundamentals"; `onScroll()` clears it at load, so initial state is a flash then no active item (walmart variant was fixed for Context, index still has it).
9. **BUG-21 — "Resources" nav link advertises a popup it doesn't have.** `index.html:103` sets `aria-haspopup="true"` (with a chevron) but no popup/menu exists — the link is a plain section anchor.

### Known / accepted (not regressions)
- Ctrl+K is a silent no-op on walmart and smart pages (no search UI there); `buildIndex()` still runs and produces harmless junk entries from `.table-row` targets (`#algorithms`). Not user-visible.
- If the mermaid CDN is blocked, raw `pre` source shows with no error UI (previous BUG-11, unchanged).

## Previously reported bugs — current status
- BUG-01 (dialog not closing on menu taps) — **fixed** in `app.js`; residual gaps now BUG-16.
- BUG-02 (both theme icons visible) — **fixed** (`html.dark [data-icon-moon] { display:none !important }`).
- BUG-03 (figure 08 out of order) — **fixed**; numbering now sequential on all pages.
- BUG-04 (dark small-text contrast) — **fixed** (`--ink-dim: #8A94A4`, ≈6.1:1).
- BUG-05 (no dialog focus management) — **fixed** (focus in, Tab trap, restore on close).
- BUG-06 (24 `<th>` without scope) — **fixed** on walmart; index still affected (BUG-18).
- BUG-07/BUG-09 (hard-coded aria-current / initial flash) — walmart fixed; index still affected (BUG-20).
- BUG-08 (dead search) — **fixed**; index search fully functional (TC-12).
- BUG-10 (theme-color meta) — **fixed** (syncThemeColor).
- BUG-12 (prefers-reduced-motion) — **fixed** in `styles.css`.

## Fixed during this session
- **BUG-23 (P1, fixed) — All Mermaid diagrams show "Syntax error in text" instead of rendering.** The previous BUG-22 fix read `pre.innerHTML` and re-injected via `esc()` → `innerHTML`. But the `innerHTML` *getter* returns HTML-serialized markup (per the spec, `>` in a text node serializes to `&gt;`), so `esc()` double-encoded it: `-->` became `--&gt;`, `&` became `&amp;`. The write-back `innerHTML` setter decoded only once, leaving literal `--&gt;` / `&amp;` text, which Mermaid 11.16.1 rejects on every diagram ("Syntax error in text"). Root cause proven by reproducing the exact DOM round-trip in jsdom: `pre.textContent` reads back `-->` but `pre.innerHTML` reads `--&gt;`. Fix (both pages, inline render script): extract the source by walking `pre.childNodes` — text nodes verbatim, `<br>` elements emitted as literal `<br/>` — then write back with the `textContent` setter (no HTML parsing, no escaping). `mermaid.run` reads `element.textContent`, so the raw source with literal `<br/>` and `-->` reaches the parser. Verified end-to-end: all 20 diagrams (walmart 17 + smart 3) parse through the exact new pipeline in jsdom; label line breaks intact (`inventory<br/>and`), arrows/`&` unbroken.
- **BUG-22 (P1, fixed) — Mermaid labels rendered with words glued together.** Original root cause stands: `pre.textContent` strips `<br/>` elements (e.g. `inventory<br/>and` → `inventoryand`). That fix's *mechanism* (innerHTML/esc round-trip) was wrong and is superseded by BUG-23; the current child-node extraction preserves both `<br/>` and raw syntax.
- **BUG-13 (P1, fixed) — Dead "Concepts" navigation on index.** The core-concepts content lives in `#fundamentals` (aria-label "Core concepts"); there is no `#concepts` section. Retargeted all three `href="#concepts"` links (header nav, footer, mobile menu) to `#fundamentals`. The scroll-spy fix (BUG-17) ensures "Fundamentals" still highlights while reading that section despite the shared target. Also gave the "Gradient Descent" concept card an `id="gradient-descent"` (matching sibling cards) so the hero "Concept leaderboard" link resolves, and pointed its card-title link at `#glossary` to match the other nine cards. The three paradigm category tiles with no target (`#unsupervised`, `#reinforcement`, `#deep-learning`) now land on the core-concepts map (`#fundamentals`); the `#supervised` tile keeps its direct card target.
- **BUG-14 (P1, fixed) — smart-critique "Top risks" panel.** The five aside links were 3 dead (`#epistemic`, `#temporal`, `#temporal`) and 2 colliding (`#reactivity` × 2), and their S-labels (S2/S4/S6/S1/S5) did not match the cards. Added card ids `#goal-displacement` (S2), `#epistemic` (S4), `#temporal` (S5), `#insider-paradox` (S6) and re-pointed the aside: "Reactivity & goal displacement" → S2, "Epistemic closure" → S4, "Temporal disciplining" → S5, "Risk aversion in topic choice" → S1 `#reactivity`, "Insider-research paradox" → S6. Corrected the two mismatched S-labels (S6↔S5 swapped).
- **BUG-15 (P2, fixed) — Walmart hero "Sources 35" → 36** (`walmart-research.html:308`), matching the 36 numbered reference items.
- **BUG-16 (P2, fixed) — Dialog CTA links.** Replaced the two ad-hoc close handlers in `app.js` with a single delegated listener on the nav dialog: any click on an `a[href]` inside closes it (`closeNav()`). This covers "Start" (index), "Ledger" (smart), "Mine" (walmart), all `.mobile-nav-link`s, and any future in-dialog links. Tab-trap and focus-restore behaviour unchanged.
- **BUG-17 (P2, fixed) — Scroll-spy order bug.** `onScroll()` kept the *last* matching section, which is wrong when nav order differs from DOM order (Fundamentals before Paradigms in nav, but Paradigms renders first). Now keeps the matching section with the *greatest* `offsetTop`, independent of array order. Reading Fundamentals now highlights "Fundamentals"; deeper-priority sections (Learning path/Glossary/Methodology) still highlight "Evaluation".
- **BUG-18 (P3, fixed) — `scope="col"` added** to all 5 `<th>` in the index algorithm table (`index.html:340-344`).
- **BUG-19 (P3, fixed) — `id="site-navigation-dialog"`** added to the nav dialog on all 3 pages so the trigger's `aria-controls` resolves.
- **BUG-20 (P3, fixed) — Removed hard-coded `active`/`aria-current="page"`** from the Fundamentals nav link (`index.html:94`); the scroll-spy manages active state at load (no active item until a section scrolls into view, which is correct at the hero).
- **BUG-21 (P3, fixed) — Removed `aria-haspopup="true"`** from the Resources nav link (`index.html:103`); it's a plain section anchor, not a popup trigger.
