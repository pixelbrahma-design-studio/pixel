/* Services slider: fade/slide, dots, arrows, swipe, keyboard, autoplay with pause. Respects prefers-reduced-motion. */
(function () {
  "use strict";
  var root = document.querySelector(".banner");
  if (!root) return;
  var track = root.querySelector(".banner__slides");
  var bgs = Array.prototype.slice.call(root.querySelectorAll(".banner__bg"));
  var slides = Array.prototype.slice.call(root.querySelectorAll(".slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".slider__dot"));
  var pauseBtn = root.querySelector("[data-pause]");
  if (slides.length < 2) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DELAY = 6500;
  var index = 0, timer = null, userPaused = reduce, hoverPaused = false;

  /* hidden slides ship with data-srcset/data-src so they do not compete with the first image; load them once the page is idle */
  function loadBg(b) {
    if (!b || b.getAttribute("data-loaded")) return;
    b.setAttribute("data-loaded", "1");
    Array.prototype.forEach.call(b.querySelectorAll("source[data-srcset]"), function (s) { s.srcset = s.getAttribute("data-srcset"); });
    var img = b.querySelector("img[data-src]");
    if (img) img.src = img.getAttribute("data-src");
  }
  function loadAllBgs() { bgs.forEach(loadBg); }
  if (document.readyState === "complete") window.setTimeout(loadAllBgs, 800);
  else window.addEventListener("load", function () { window.setTimeout(loadAllBgs, 800); });

  function show(n, byUser) {
    index = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      var on = k === index;
      s.classList.toggle("is-active", on);
      if (on) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
      s.inert = !on;
    });
    loadBg(bgs[index]);
    loadBg(bgs[(index + 1) % bgs.length]);
    /* show the new photo only once it has loaded, so a slow connection never shows an empty banner */
    var want = index, img = bgs[want].querySelector("img");
    function activate() { if (want !== index) return; bgs.forEach(function (b, k) { b.classList.toggle("is-active", k === want); }); }
    if (!img || (img.complete && img.naturalWidth > 0 && !img.getAttribute("data-src")) || (img.complete && img.naturalWidth > 1)) activate();

    if (!(img && img.complete)) window.setTimeout(activate, 2500);
    /* tell the header whether the photo behind it is dark (white logo) or light (original logo) */
    if (slides[index].getAttribute("data-header") === "dark") root.setAttribute("data-tone", "dark"); else root.removeAttribute("data-tone");
    root.setAttribute("data-tone-m", slides[index].getAttribute("data-header-m") || "light");
    window.dispatchEvent(new Event("pb:tone"));
    dots.forEach(function (d, k) {
      var on = k === index;
      d.classList.toggle("is-active", on);
      if (on) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
    });
    track.setAttribute("aria-live", byUser ? "polite" : "off");
  }

  function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
  function start() {
    stop();
    if (userPaused || hoverPaused || document.hidden) return;
    timer = window.setInterval(function () { show(index + 1, false); }, DELAY);
  }
  function setPaused(p) {
    userPaused = p;
    if (pauseBtn) {
      pauseBtn.setAttribute("aria-pressed", String(p));
      pauseBtn.setAttribute("aria-label", p ? "Start automatic slide show" : "Pause automatic slide show");
    }
    start();
  }

  Array.prototype.forEach.call(root.querySelectorAll("[data-dir]"), function (b) {
    b.addEventListener("click", function () { show(index + Number(b.getAttribute("data-dir")), true); start(); });
  });
  dots.forEach(function (d) {
    d.addEventListener("click", function () { show(Number(d.getAttribute("data-slide")), true); start(); });
  });
  if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(!userPaused); });

  root.addEventListener("mouseenter", function () { hoverPaused = true; stop(); });
  root.addEventListener("mouseleave", function () { hoverPaused = false; start(); });
  root.addEventListener("focusin", function () { hoverPaused = true; stop(); });
  root.addEventListener("focusout", function () { hoverPaused = false; start(); });
  document.addEventListener("visibilitychange", start);

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { show(index - 1, true); start(); }
    else if (e.key === "ArrowRight") { show(index + 1, true); start(); }
  });

  /* swipe */
  var x0 = null;
  track.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
  track.addEventListener("pointerup", function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1), true); start(); }
  });
  track.addEventListener("pointercancel", function () { x0 = null; });

  root.classList.add("is-ready");
  show(0, false);
  setPaused(userPaused);
})();
