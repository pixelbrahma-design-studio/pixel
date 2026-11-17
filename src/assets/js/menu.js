/* Mega menu: accessible dialog with focus trap, Esc, arrow keys, scroll lock, and compact sticky header. */
(function () {
  "use strict";
  var header = document.getElementById("header");
  var burger = document.getElementById("menu-button");
  var mega = document.getElementById("mega");
  if (!header || !burger || !mega) return;

  var FOCUSABLE = "a[href], button:not([disabled])";
  var isOpen = false;
  mega.inert = true;

  function items() {
    return Array.prototype.filter.call(mega.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null;
    });
  }

  function open() {
    isOpen = true;
    mega.inert = false;
    mega.classList.add("is-open");
    header.classList.add("is-menu-open");
    document.body.classList.add("is-locked");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    var list = items();
    if (list.length) list[0].focus();
  }

  function close(returnFocus) {
    isOpen = false;
    mega.classList.remove("is-open");
    header.classList.remove("is-menu-open");
    document.body.classList.remove("is-locked");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    mega.inert = true;
    if (returnFocus !== false) burger.focus();
  }

  burger.addEventListener("click", function () {
    if (isOpen) close(); else open();
  });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }

    var list = items();
    if (!list.length) return;
    var cycle = [burger].concat(list);
    var idx = cycle.indexOf(document.activeElement);

    if (e.key === "Tab") {
      if (e.shiftKey && (idx <= 0)) { e.preventDefault(); cycle[cycle.length - 1].focus(); }
      else if (!e.shiftKey && idx === cycle.length - 1) { e.preventDefault(); cycle[0].focus(); }
      return;
    }
    var li = list.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); list[(li + 1) % list.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); list[(li - 1 + list.length) % list.length].focus(); }
    else if (e.key === "Home") { e.preventDefault(); list[0].focus(); }
    else if (e.key === "End") { e.preventDefault(); list[list.length - 1].focus(); }
  });

  /* Mobile accordions */
  Array.prototype.forEach.call(mega.querySelectorAll(".mega__toggle"), function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.closest(".mega__group");
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      group.classList.toggle("is-open", !expanded);
    });
  });

  /* Close the menu if the viewport is resized across the breakpoint with focus lost */
  window.addEventListener("pagehide", function () { if (isOpen) close(false); });

  /* Header tone: white logo and burger while the header sits over a section marked data-tone="dark";
     original-colour logo everywhere else. An IntersectionObserver watches a thin line at the header's centre,
     so nothing is measured while scrolling. */
  var overlapping = [];
  var io = null;
  function tone() {
    var dark = overlapping.some(function (el) { return el.getAttribute("data-tone") === "dark"; });
    header.classList.toggle("header--on-dark", dark);
  }
  function watch() {
    if (!("IntersectionObserver" in window)) return;
    if (io) io.disconnect();
    overlapping = [];
    var half = Math.round(header.offsetHeight / 2);
    var bottom = Math.max(0, Math.round(window.innerHeight - half - 1));
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = overlapping.indexOf(e.target);
        if (e.isIntersecting && i < 0) overlapping.push(e.target);
        else if (!e.isIntersecting && i > -1) overlapping.splice(i, 1);
      });
      tone();
    }, { rootMargin: "-" + half + "px 0px -" + bottom + "px 0px", threshold: 0 });
    Array.prototype.forEach.call(document.querySelectorAll("main > section, .banner, .footer"), function (el) { io.observe(el); });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      header.classList.toggle("is-compact", window.scrollY > 24);
      ticking = false;
    });
  }
  var resizeTimer = null;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(watch, 150); });
  window.addEventListener("pb:tone", tone);
  watch();
  onScroll();
})();
