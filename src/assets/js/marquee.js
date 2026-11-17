/* Brands strip: clone the logos once per row for a seamless loop (keeps the initial HTML small).
   Without JavaScript, or with reduced motion, the logos simply wrap as a grid. */
(function () {
  "use strict";
  var rows = document.querySelectorAll("[data-marquee]");
  if (!rows.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  Array.prototype.forEach.call(rows, function (m) {
    Array.prototype.slice.call(m.children).forEach(function (item) {
      var c = item.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      var img = c.querySelector("img");
      if (img) img.alt = "";
      m.appendChild(c);
    });
    m.classList.add("is-running");
    if (m.parentNode) m.parentNode.classList.add("is-running");
  });
})();
