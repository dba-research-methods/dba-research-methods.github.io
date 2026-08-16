# DBA Research Methods

> A working desk for practice-led doctoral inquiry — find the problem, sharpen the objective, choose the method, cite the source.
>
> **Live:** [dba-research-methods.github.io](https://dba-research-methods.github.io)

Built for senior leaders pursuing a **Doctor of Business Administration**: people with two decades of practice who need the academic apparatus, not a second career in epistemology.

---

## The site

| Page | What it is |
|---|---|
| `index.html` | Hub. Where to start, by stage of inquiry. |
| `rq-lab.html` | **RQ Lab** — problem-mining workbook. Reads Walmart's supply chain as evidence rather than a success story, separates implementation challenges from research gaps, and produces three researchable problems with the designs that would answer them. 15 sections, 17 figures, 36 sources. |
| `smart-critique.html` | **SMART objectives — framework & critique.** First-order critiques of the five criteria, then the second-order effects when SMART becomes dogma: goal displacement, risk aversion in topic choice, epistemic closure. 16 sources. |
| `research-desk.html` | **Executive reference desk.** Seven business situations mapped to research designs, each with its seminal text, open-source software and executive watch-out — plus a bookshelf (9), a tools matrix (8), jargon translated (10) and a research vault (6). |
| `audio-orientation.html` | 51-second spoken orientation with synchronised slides, chapter jumps, live captions and a full text transcript. |
| `ml-fundamentals.html` | Adjacent reading — machine learning fundamentals. Quantitative literacy that keeps turning up in DBA work. Not part of the methods track. |

Every page carries its own sources. Nothing is behind a login, and nothing tracks you.

---

## How it is built

Zero build step. Static HTML, deployed by GitHub Pages.

```
styles.css     shared design tokens + components (warm paper, deep teal, real dark mode)
app.js         theme toggle, mobile Browse dialog, ⌘K search, scroll-spy
desk.css/js    reference-desk components: tablist, diagnostic, filter, citations
check.py       regression check — dead anchors, dead links, duplicate ids, theme residue
TEST-CASES.md  manual/automated test matrix
```

Tailwind v4 runs from the browser CDN, configured by an `@theme` block in each page head; Mermaid renders diagrams on RQ Lab and the SMART critique. Cross-page navigation (the `.site-strip`) is hard-coded in each page rather than injected by JavaScript — navigating the site never depends on JS.

### Run locally

```bash
git clone https://github.com/dba-research-methods/dba-research-methods.github.io.git
cd dba-research-methods.github.io
python3 -m http.server 8080     # then open http://localhost:8080
python3 check.py                # static regression check
```

### Adding a page

1. Copy the shell (head, site strip, header, footer, nav dialog) from any existing page.
2. Add it to the `.site-strip` link list on **every** page and to the mobile dialog's *Pages* group.
3. Add it to `SITE_PAGES` in `app.js` so it appears in cross-page search.
4. Run `python3 check.py`.

---

## License

Open access under the MIT License. Copy, correct, remix.
