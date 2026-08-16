#!/usr/bin/env python3
"""Static checks for the DBA Research Methods site. Run: python3 check.py

Fails on the things that actually break a multi-page static site:
dead in-page anchors, dead cross-page links, duplicate ids, and any
Edubem-theme residue left behind by the restyle.
"""
import os
import re
import sys

HTML = sorted(f for f in os.listdir(".") if f.endswith(".html"))
SITE_PAGES = [
    "index.html", "research-desk.html", "rq-lab.html",
    "smart-critique.html", "ml-fundamentals.html", "audio-orientation.html",
]
BANNED = ["673DE6", "5025D1", "backdrop-filter", "bg-glass", "meteorite"]

ID_RE = re.compile(r'\sid="([^"]+)"')
HREF_RE = re.compile(r'href="([^"]+)"')

failures = []


def fail(msg):
    failures.append(msg)
    print("FAIL " + msg)


for page in SITE_PAGES:
    if not os.path.exists(page):
        fail("missing page: " + page)

for page in HTML:
    src = open(page, encoding="utf-8").read()
    ids = ID_RE.findall(src)

    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        fail("%s: duplicate id(s) %s" % (page, ", ".join(sorted(dupes))))

    idset = set(ids)
    for href in HREF_RE.findall(src):
        if href.startswith("#") and len(href) > 1:
            if href[1:] not in idset:
                fail("%s: dead anchor %s" % (page, href))
        elif href.endswith(".html") and "://" not in href:
            if not os.path.exists(href.split("#")[0]):
                fail("%s: dead page link %s" % (page, href))

    # every page must carry the cross-page nav and mark itself current
    if 'class="site-strip"' not in src:
        fail("%s: no site strip (cross-page nav missing)" % page)
    elif src.count('aria-current="page"') < 2:
        fail("%s: site strip / mobile dialog does not mark the current page" % page)

    for token in BANNED:
        if token.lower() in src.lower():
            fail("%s: Edubem residue %r" % (page, token))

    for asset in re.findall(r'(?:src|href)="((?:assets/|\./)?[\w./-]+\.(?:mp3|css|js|png|svg|wav))"', src):
        if "://" not in asset and not os.path.exists(asset):
            fail("%s: missing asset %s" % (page, asset))

print("\n%d file(s) checked, %d failure(s)" % (len(HTML), len(failures)))
sys.exit(1 if failures else 0)
