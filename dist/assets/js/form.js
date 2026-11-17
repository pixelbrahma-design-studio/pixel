/* Accessible client-side validation and submission for forms marked with data-form. */
(function () {
  "use strict";

  var MESSAGES = {
    valueMissing: function (label) { return "Please enter your " + label + "."; },
    typeMismatch: function (label) { return "Please enter a valid " + label + "."; },
    patternMismatch: function (label) { return "Please check your " + label + "."; }
  };

  function labelFor(field) {
    var l = field.id && document.querySelector('label[for="' + field.id + '"]');
    return l ? l.textContent.replace(/\*|\(optional\)/gi, "").trim().toLowerCase() : "value";
  }

  function errorEl(field) {
    return document.getElementById(field.id + "-error");
  }

  function validateField(field) {
    var err = errorEl(field);
    var msg = "";
    if (!field.checkValidity()) {
      var v = field.validity;
      var label = labelFor(field);
      if (field.type === "checkbox") msg = "Please tick the box to continue.";
      else if (field.tagName === "SELECT") msg = "Please choose an option.";
      else if (v.valueMissing) msg = MESSAGES.valueMissing(label);
      else if (v.typeMismatch) msg = MESSAGES.typeMismatch(label);
      else if (v.patternMismatch) msg = MESSAGES.patternMismatch(label);
      else if (v.tooShort) msg = "Please add a little more detail (at least " + field.minLength + " characters).";
      else msg = field.validationMessage;
    }
    if (err) err.textContent = msg;
    if (msg) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
    return !msg;
  }

  function init(form) {
    var status = form.querySelector(".form__status");
    var submit = form.querySelector('[type="submit"]');
    form.setAttribute("novalidate", "");
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea")).filter(function (f) {
      return f.type !== "hidden" && !f.closest(".hp");
    });

    fields.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value || f.getAttribute("aria-invalid")) validateField(f); });
      f.addEventListener("input", function () { if (f.getAttribute("aria-invalid")) validateField(f); });
    });

    function setStatus(text, kind) {
      if (!status) return;
      status.textContent = text;
      status.className = "form__status" + (kind ? " form__status--" + kind : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) { if (!validateField(f) && !firstBad) firstBad = f; });
      if (firstBad) {
        setStatus("Please fix the highlighted fields and try again.", "err");
        firstBad.focus();
        return;
      }
      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value) { setStatus("Thank you. We will be in touch soon.", "ok"); form.reset(); return; }

      var endpoint = form.getAttribute("action");
      if (!endpoint || /TODO/.test(endpoint)) {
        setStatus("This form is not connected yet. Please email us or call using the details on this page.", "err");
        return;
      }
      if (submit) submit.disabled = true;
      setStatus("Sending...", "");
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          setStatus("Thank you. We have your message and will reply within one business day.", "ok");
          form.reset();
        })
        .catch(function () {
          setStatus("Sorry, something went wrong. Please try again or contact us by phone or email.", "err");
        })
        .then(function () { if (submit) submit.disabled = false; });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("form[data-form]"), init);
})();
