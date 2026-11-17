/* Lightweight consent: gates optional analytics (GA4) and the embedded map. No third-party code loads without a choice. */
(function () {
  "use strict";
  var KEY = "pb_consent";
  var banner = document.getElementById("consent");
  var gaId = document.body.getAttribute("data-ga") || "";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
  }

  function loadAnalytics() {
    if (!gaId || window.__pbGaLoaded) return;
    window.__pbGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
    document.head.appendChild(s);
  }

  function show(focus) { if (banner) { banner.hidden = false; if (focus === true) { var b = banner.querySelector("button"); if (b) b.focus(); } } }
  function hide() { if (banner) banner.hidden = true; }

  var saved = read();
  if (saved && saved.analytics) loadAnalytics();
  if (!saved) show();

  if (banner) {
    banner.addEventListener("click", function (e) {
      var t = e.target.closest("[data-consent]");
      if (!t) return;
      var accepted = t.getAttribute("data-consent") === "accept";
      write({ analytics: accepted, ts: Date.now() });
      if (accepted) loadAnalytics();
      hide();
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-consent-open]"), function (b) {
    b.addEventListener("click", function () { show(true); });
  });

  /* Map embeds load only after an explicit click on the placeholder button. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-map]"), function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest(".map__box");
      var q = btn.getAttribute("data-map");
      var f = document.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed";
      f.title = "Map showing " + q;
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      box.textContent = "";
      box.appendChild(f);
    });
  });
})();
