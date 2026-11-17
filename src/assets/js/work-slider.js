/* Selected work: sideways slider with previous / next arrows. The track itself scrolls natively (swipe, trackpad, keyboard). */
(function () {
  "use strict";
  document.querySelectorAll("[data-work-slider]").forEach(init);
  function init(root) {
  var track = root.querySelector(".work-track, .gscroll");
  var prev = root.querySelector('[data-work="-1"]');
  var next = root.querySelector('[data-work="1"]');
  if (!track || !prev || !next) return;

  function step() {
    var card = track.querySelector(".wk, .gscroll__item");
    if (!card) return track.clientWidth;
    var gap = parseFloat(window.getComputedStyle(card.parentElement).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }
  function update() {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }
  prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
  next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: step(), behavior: "smooth" }); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -step(), behavior: "smooth" }); }
  });
  var ticking = false;
  track.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
  }
})();
