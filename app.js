(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var root = document.documentElement;

  /* ---------- Site map ----------
     Single source of truth for cross-page search results.
     The visible cross-page nav (".site-strip") is hard-coded in each page's
     markup on purpose: primary navigation must work without JavaScript.
     ponytail: adding a page means editing this array + 6 site strips. Move to
     a partial/include only if the site grows past ~8 pages. */
  var SITE_PAGES = [
    { url: "index.html", title: "Home — DBA Research Methods", blurb: "Hub · start here" },
    { url: "research-desk.html", title: "Executive Reference Desk", blurb: "Problem solver, bookshelf, tools, jargon, vault" },
    { url: "rq-lab.html", title: "RQ Lab — Problem Mining Workbook", blurb: "Walmart's supply chain, research edition" },
    { url: "smart-critique.html", title: "SMART Objectives — framework & critique", blurb: "The dogma problem" },
    { url: "ml-fundamentals.html", title: "Machine Learning Fundamentals", blurb: "Adjacent skills · paradigms, algorithms, metrics" },
    { url: "audio-orientation.html", title: "Audio Orientation", blurb: "Spoken walkthrough with synchronised scenes" }
  ];

  function currentPage() {
    var path = window.location.pathname;
    var file = path.slice(path.lastIndexOf("/") + 1);
    return file === "" ? "index.html" : file;
  }

  /* ---------- Theme ---------- */
  var themeColor = $('meta[name="theme-color"]');
  function syncThemeColor() {
    if (themeColor) themeColor.content = root.classList.contains("dark") ? "#0A0D14" : "#F5F4EF";
  }
  var themeBtn = $("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var dark = root.classList.toggle("dark");
      try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
      syncThemeColor();
      document.dispatchEvent(new CustomEvent("themechange", { detail: { dark: dark } }));
    });
  }
  syncThemeColor();

  /* ---------- Mobile nav dialog ---------- */
  var navDialog = $("[data-nav-dialog]");
  var navTrigger = $("[data-navigation-trigger]");
  var navClose = $("[data-nav-close]");
  var navBackdrop = $("[data-nav-backdrop]");

  var lastFocused = null;
  function openNav() {
    if (!navDialog) return;
    lastFocused = document.activeElement;
    navDialog.hidden = false;
    requestAnimationFrame(function () {
      navDialog.classList.add("open");
      var first = navDialog.querySelector("a[href], button, [tabindex]");
      if (first) first.focus();
    });
    if (navTrigger) navTrigger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeNav() {
    if (!navDialog) return;
    navDialog.classList.remove("open");
    if (navTrigger) navTrigger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      navDialog.hidden = true;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }, 220);
  }
  if (navTrigger) navTrigger.addEventListener("click", openNav);
  if (navClose) navClose.addEventListener("click", closeNav);
  if (navBackdrop) navBackdrop.addEventListener("click", closeNav);
  if (navDialog) {
    navDialog.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || navDialog.hidden) return;
      var focusables = navDialog.querySelectorAll("a[href], button, [tabindex]:not([tabindex='-1'])");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    navDialog.addEventListener("click", function (e) {
      if (e.target.closest("a[href]")) closeNav();
    });
  }

  /* ---------- Search: inject the UI where a page doesn't ship it ----------
     Search is a JS-only feature, so the dialog is built here instead of being
     duplicated into every page's markup. */
  var SEARCH_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

  /* ⌘ is wrong on Windows/Linux, where the shortcut app.js listens for is Ctrl.
     Normalises the hardcoded hints in page markup as well as the injected one. */
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var SHORTCUT = isMac ? "\u2318K" : "Ctrl K";
  if (!isMac) {
    $$("kbd").forEach(function (kbd) {
      if (kbd.textContent.indexOf("\u2318") === -1) return;
      if (kbd.textContent.trim() === "\u2318") kbd.textContent = "Ctrl";
      else kbd.textContent = kbd.textContent.replace("\u2318", "Ctrl ");
    });
  }

  if (!$("[data-search-trigger]") && themeBtn && themeBtn.parentElement) {
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.setAttribute("data-search-trigger", "true");
    trigger.setAttribute("aria-label", "Search this site");
    trigger.className = "icon-btn";
    trigger.innerHTML = SEARCH_ICON + '<kbd class="font-mono text-[10px] font-medium text-ink-dim max-720:hidden"></kbd>';
    trigger.querySelector("kbd").textContent = SHORTCUT;
    themeBtn.parentElement.insertBefore(trigger, themeBtn);
  }

  if (!$("[data-search-dialog]")) {
    var dlg = document.createElement("div");
    dlg.setAttribute("data-search-dialog", "true");
    dlg.className = "search-dialog";
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-modal", "true");
    dlg.setAttribute("aria-label", "Search this site");
    dlg.hidden = true;
    dlg.innerHTML =
      '<div data-search-backdrop="true" class="nav-backdrop"></div>' +
      '<div class="search-panel">' +
        '<div class="flex items-center gap-3 border-b border-hairline px-4 py-3">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-ink-dim" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<input data-search-input="true" type="text" placeholder="Search this page and the rest of the site…" aria-label="Search" class="h-10 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim" />' +
          '<kbd class="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink-dim">esc</kbd>' +
        '</div>' +
        '<div data-search-results="true" class="max-h-[min(60vh,24rem)] overflow-y-auto p-2"></div>' +
      '</div>';
    document.body.appendChild(dlg);
  }

  var searchDialog = $("[data-search-dialog]");
  var searchTrigger = $("[data-search-trigger]");
  var searchInput = $("[data-search-input]");
  var searchResults = $("[data-search-results]");
  var searchBackdrop = $("[data-search-backdrop]");
  var resultsCache = [];

  function openSearch() {
    if (!searchDialog) return;
    searchDialog.hidden = false;
    requestAnimationFrame(function () { searchDialog.classList.add("open"); });
    document.body.style.overflow = "hidden";
    window.setTimeout(function () { if (searchInput) searchInput.focus(); }, 50);
  }
  function closeSearch() {
    if (!searchDialog) return;
    searchDialog.classList.remove("open");
    document.body.style.overflow = "";
    window.setTimeout(function () { searchDialog.hidden = true; }, 160);
  }
  if (searchTrigger) searchTrigger.addEventListener("click", openSearch);
  if (searchBackdrop) searchBackdrop.addEventListener("click", closeSearch);

  /* Nearest labelled section, so a hit scrolls somewhere real.
     Works on any page whose content is grouped in <section id="…">. */
  function closestSection(el) {
    var sec = el && el.closest ? el.closest("section[id]") : null;
    return sec ? sec.id : null;
  }

  function sectionLabel(id) {
    if (!id) return "This page";
    var sec = document.getElementById(id);
    var heading = sec ? sec.querySelector("h2, h3") : null;
    var label = heading ? heading.textContent.trim() : id.replace(/-/g, " ");
    return label.length > 48 ? label.slice(0, 45) + "…" : label;
  }

  /* Live index of the current page + static entries for every other page.
     ponytail: cross-page results are page-level only. Generate a
     site-index.json at edit time if section-level cross-page search is needed. */
  function buildIndex() {
    var items = [];
    var seen = {};
    var scope = $("main") || document.body;

    $$("h2, h3, summary strong, th[scope='col'], [data-search-term]", scope).forEach(function (el) {
      var text = (el.textContent || "").trim().replace(/\s+/g, " ");
      if (!text || text.length < 3 || text.length > 120) return;
      var key = text.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      var section = closestSection(el);
      var label = sectionLabel(section);
      items.push({
        text: text,
        section: label === text ? "This page" : label,
        target: section ? "#" + section : "#top"
      });
    });

    var here = currentPage();
    SITE_PAGES.forEach(function (page) {
      if (page.url === here) return;
      items.push({ text: page.title, section: page.blurb, target: page.url, external: true });
    });

    return items;
  }

  function renderResults(query) {
    if (!searchResults) return;
    var q = query.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '<p class="px-3 py-6 text-center text-xs text-ink-dim">Type to search this page — other pages of the site are matched too.</p>';
      return;
    }
    var matches = resultsCache.filter(function (item) {
      return item.text.toLowerCase().indexOf(q) !== -1 || (item.section || "").toLowerCase().indexOf(q) !== -1;
    }).slice(0, 24);
    if (!matches.length) {
      searchResults.innerHTML = '<p class="px-3 py-6 text-center text-xs text-ink-dim">No matches for "' + escapeHtml(query.trim()) + '".</p>';
      return;
    }
    var html = '<div class="flex items-center justify-between px-3 pt-2 pb-1"><span class="text-[10px] text-ink-dim">' + matches.length + ' result' + (matches.length === 1 ? "" : "s") + '</span></div>';
    matches.forEach(function (item) {
      html += '<a class="search-result-link" href="' + escapeHtml(item.target) + '"><strong>' + escapeHtml(item.text) + '</strong><span class="block">' +
        (item.external ? "→ " : "") + escapeHtml(item.section || "") + '</span></a>';
    });
    searchResults.innerHTML = html;
    $$(".search-result-link", searchResults).forEach(function (link) {
      link.addEventListener("click", function () {
        window.setTimeout(closeSearch, 80);
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  resultsCache = buildIndex();
  renderResults("");

  var debounce;
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(function () { renderResults(searchInput.value); }, 60);
    });
  }

  /* ---------- Keyboard shortcuts ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (searchDialog && !searchDialog.hidden) closeSearch();
      else if (navDialog && !navDialog.hidden) closeNav();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
    if (searchDialog && !searchDialog.hidden && e.key === "Enter") {
      var active = $(".search-result-link.active", searchDialog) || $(".search-result-link", searchDialog);
      if (active) active.click();
    }
  });

  /* Arrow-key navigation in results */
  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      var links = $$(".search-result-link", searchDialog);
      if (!links.length) return;
      var idx = links.indexOf($(".search-result-link.active", searchDialog));
      if (e.key === "ArrowDown") idx = Math.min(idx + 1, links.length - 1);
      else idx = Math.max(idx - 1, 0);
      links.forEach(function (l, i) { l.classList.toggle("active", i === idx); });
      links[idx].scrollIntoView({ block: "nearest" });
    });
  }

  /* ---------- Scroll spy for in-page nav ---------- */
  var navLinks = $$(".nav-link").filter(function (link) {
    var href = link.getAttribute("href");
    return href && href.charAt(0) === "#";
  });
  var sections = navLinks.map(function (link) { return $(link.getAttribute("href")); }).filter(Boolean);

  function onScroll() {
    var y = window.scrollY + 120;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.offsetParent === null) return; /* hidden panes have no meaningful offsetTop */
      if (sec.offsetTop <= y && (!current || sec.offsetTop > current.offsetTop)) current = sec;
    });
    if (!current) {
      navLinks.forEach(function (l) { l.classList.remove("active"); l.removeAttribute("aria-current"); });
      return;
    }
    navLinks.forEach(function (link) {
      var on = link.getAttribute("href") === "#" + current.id;
      link.classList.toggle("active", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }
  if (navLinks.length) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
