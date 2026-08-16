/* Executive reference desk — tab switching, methodology diagnostic, filter, citations.
   Shared header/theme/search behaviour lives in app.js. */
(function () {
  "use strict";

  var TABS = ["solver", "books", "tools", "jargon", "vault"];

  function switchDeskTab(tabId) {
    if (TABS.indexOf(tabId) === -1) return;

    TABS.forEach(function (id) {
      var pane = document.getElementById("pane-" + id);
      if (pane) pane.hidden = id !== tabId;
      var tab = document.getElementById("tab-" + id);
      if (tab) tab.setAttribute("aria-selected", String(id === tabId));
    });

    if (history.replaceState) history.replaceState(null, "", "#pane-" + tabId);

    /* Any [data-tab] control inside the mobile dialog should close it. */
    var dialog = document.querySelector("[data-nav-dialog]");
    if (dialog && !dialog.hidden) {
      var close = document.querySelector("[data-nav-close]");
      if (close) close.click();
    }
  }

  /* Every tab control — tab bar, hero CTA, footer, mobile dialog — is a [data-tab]. */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-tab]");
    if (!el) return;
    e.preventDefault();
    switchDeskTab(el.getAttribute("data-tab"));
    var pane = document.getElementById("pane-" + el.getAttribute("data-tab"));
    if (pane && !el.closest(".desk-tabbar")) pane.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* Keyboard support for the tablist (left/right/home/end). */
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    tablist.addEventListener("keydown", function (e) {
      var keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (!(e.key in keys) && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      var idx = TABS.indexOf(document.querySelector('.desk-tab[aria-selected="true"]').dataset.tab);
      if (e.key === "Home") idx = 0;
      else if (e.key === "End") idx = TABS.length - 1;
      else idx = (idx + keys[e.key] + TABS.length) % TABS.length;
      switchDeskTab(TABS[idx]);
      document.getElementById("tab-" + TABS[idx]).focus();
    });
  }

  /* ---------- Methodology diagnostic ---------- */
  var diagnosticMatrix = {
    internal_action: { name: "Insider Action Research", cardId: "method-action-research" },
    internal_compare: { name: "Insider Action Research / Case Study", cardId: "method-action-research" },
    internal_kpi: { name: "Survey Path Modeling (PLS-SEM)", cardId: "method-pls-sem" },
    internal_design: { name: "Design Science Research", cardId: "method-design-science" },

    comparative_compare: { name: "Comparative Multi-Case & fsQCA", cardId: "method-multicase-qca" },
    comparative_action: { name: "Comparative Multi-Case Study", cardId: "method-multicase-qca" },
    comparative_kpi: { name: "Multi-Group PLS-SEM", cardId: "method-pls-sem" },
    comparative_design: { name: "Cross-Firm Design Science", cardId: "method-design-science" },

    survey_kpi: { name: "PLS-SEM Path Modeling", cardId: "method-pls-sem" },
    survey_action: { name: "Action Research with Survey Pulse", cardId: "method-action-research" },
    survey_compare: { name: "Quasi-Experimental Evaluation", cardId: "method-quasi-experiment" },
    survey_design: { name: "Design Science Evaluation", cardId: "method-design-science" },

    artifact_design: { name: "Design Science Research (DSR)", cardId: "method-design-science" },
    artifact_action: { name: "Action Design Research", cardId: "method-design-science" },
    artifact_compare: { name: "Comparative Artifact Benchmark", cardId: "method-multicase-qca" },
    artifact_kpi: { name: "PLS-SEM Usability Evaluation", cardId: "method-pls-sem" },

    qualitative_grounded: { name: "Gioia Thematic Analysis", cardId: "method-grounded-theory" },
    qualitative_action: { name: "Insider Action Research", cardId: "method-action-research" },
    policy_causal: { name: "Quasi-Experimental Evaluation", cardId: "method-quasi-experiment" },
    litreview_systematic: { name: "PRISMA Evidence Synthesis", cardId: "method-systematic-review" }
  };

  var currentMatchedCardId = "method-action-research";

  function runMethodologyDiagnostic() {
    var setting = document.getElementById("wiz-setting").value;
    var objective = document.getElementById("wiz-objective").value;
    var match = diagnosticMatrix[setting + "_" + objective] ||
      { name: "Insider Action Research", cardId: "method-action-research" };
    document.getElementById("wiz-result-name").textContent = match.name;
    currentMatchedCardId = match.cardId;
  }

  function jumpToMatchedMethod() {
    switchDeskTab("solver");
    document.querySelectorAll(".ref-card").forEach(function (c) { c.classList.remove("highlight-match"); });
    var target = document.getElementById(currentMatchedCardId);
    if (!target) return;
    target.classList.add("highlight-match");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    var title = target.querySelector(".card-title");
    if (title) showToast("Highlighted: " + title.textContent.trim());
  }

  /* ---------- Filter ---------- */
  function filterDeskContent(query) {
    var q = query.toLowerCase().trim();
    var visible = 0;
    document.querySelectorAll(".ref-card").forEach(function (card) {
      var text = ((card.getAttribute("data-search") || "") + " " + card.innerText).toLowerCase();
      var show = !q || text.indexOf(q) !== -1;
      card.hidden = !show;
      if (show) visible++;
    });
    var countEl = document.getElementById("search-match-count");
    if (countEl) {
      countEl.textContent = q
        ? visible + " matching reference" + (visible === 1 ? "" : "s") + " across all tabs"
        : "Showing all references";
    }
  }

  /* ---------- Citations + toast ---------- */
  function copyCitation(text) {
    if (!navigator.clipboard) { showToast("Clipboard unavailable in this browser"); return; }
    navigator.clipboard.writeText(text)
      .then(function () { showToast("Copied: " + text.slice(0, 60) + (text.length > 60 ? "…" : "")); })
      .catch(function () { showToast("Copy failed — select the text manually"); });
  }

  var toastTimer;
  function showToast(message) {
    var toast = document.getElementById("toast");
    var toastText = document.getElementById("toast-text");
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 3000);
  }

  /* Pane markup uses inline handlers, so these stay global. */
  window.switchDeskTab = switchDeskTab;
  window.runMethodologyDiagnostic = runMethodologyDiagnostic;
  window.jumpToMatchedMethod = jumpToMatchedMethod;
  window.filterDeskContent = filterDeskContent;
  window.copyCitation = copyCitation;
  window.showToast = showToast;

  /* Deep link: research-desk.html#pane-tools opens that tab. */
  var hash = (window.location.hash || "").replace("#pane-", "");
  if (TABS.indexOf(hash) !== -1) switchDeskTab(hash);
})();
