/* Rainbow Painters — site behaviour (vanilla JS, no dependencies) */
(function () {
  "use strict";
  var CFG = window.RP_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  document.documentElement.classList.add("js");

  /* Header shadow on scroll */
  var header = $(".site-header");
  var onScroll = function () { if (header) header.classList.toggle("scrolled", window.scrollY > 10); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  var btn = $(".menu-btn"), panel = $(".mobile-panel");
  if (btn && panel) {
    var setMenu = function (open) {
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1180) setMenu(false); });
  }

  /* Reveal on scroll */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) { el.style.setProperty("--d", ((i % 3) * 0.08) + "s"); io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* Counters */
  var counters = $$("[data-count]");
  var runCounter = function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10), suffix = el.getAttribute("data-suffix") || "";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1600;
    (function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  };
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: .5});
    counters.forEach(function (c) { co.observe(c); });
  } else { counters.forEach(runCounter); }

  /* Project filters */
  var filters = $$(".filter");
  if (filters.length) {
    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        var cat = f.getAttribute("data-filter");
        filters.forEach(function (x) { x.classList.toggle("active", x === f); x.setAttribute("aria-pressed", x === f); });
        $$(".project[data-cats]").forEach(function (p) {
          var show = cat === "all" || p.getAttribute("data-cats").split(" ").indexOf(cat) > -1;
          p.classList.toggle("hide", !show);
        });
      });
    });
  }

  /* Before / After sliders */
  $$(".ba").forEach(function (ba) {
    var input = $("input", ba);
    var set = function () { ba.style.setProperty("--pos", input.value + "%"); };
    input.addEventListener("input", set); set();
  });

  /* Footer year */
  $$("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* Pre-select service from ?service= and set min date */
  try {
    var sp = new URLSearchParams(window.location.search).get("service");
    if (sp) $$("select[name='service']").forEach(function (sel) {
      $$("option", sel).forEach(function (o) { if (o.value.toLowerCase() === sp.toLowerCase()) sel.value = o.value; });
    });
  } catch (e) {}
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  $$("input[type=date]").forEach(function (d) { d.min = today.toISOString().slice(0, 10); });

  /* ---------- Forms ---------- */
  var LABELS = {
    name: "Name", phone: "Mobile", whatsapp: "WhatsApp", email: "Email", location: "Location",
    property: "Property type", service: "Service", scope: "Interior/Exterior", area: "Approx. area",
    floors: "Floors", start: "Preferred start", budget: "Budget", date: "Preferred date", time: "Preferred time",
    message: "Notes"
  };
  function collect(form) {
    var data = {};
    $$("input,select,textarea", form).forEach(function (el) {
      if (!el.name || el.type === "file" || el.name === "company_site") return;
      if (el.type === "radio" && !el.checked) return;
      if (el.value) data[el.name] = el.value;
    });
    return data;
  }
  function waText(kind, data) {
    var lines = ["Hello Rainbow Painters, I would like to " + kind + "."];
    Object.keys(data).forEach(function (k) { if (LABELS[k]) lines.push(LABELS[k] + ": " + data[k]); });
    return lines.join("\n");
  }
  function waUrl(text) { return "https://wa.me/" + CFG.PHONE_E164 + "?text=" + encodeURIComponent(text); }
  function saveLocal(type, data) {
    try {
      var all = JSON.parse(localStorage.getItem("rp_leads") || "[]");
      all.unshift({ id: Date.now(), type: type, status: "new", amount: 0, date: new Date().toISOString(), data: data });
      localStorage.setItem("rp_leads", JSON.stringify(all.slice(0, 500)));
    } catch (e) {}
  }

  $$("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var hp = $("[name=company_site]", form);
      if (hp && hp.value) return; // bot
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var type = form.getAttribute("data-form");
      var kind = form.getAttribute("data-wa-kind") || "send an enquiry";
      var data = collect(form);
      var submit = $("button[type=submit]", form), original = submit ? submit.innerHTML : "";
      if (submit) { submit.disabled = true; submit.textContent = "Sending…"; }
      var text = waText(kind, data);

      var done = function (sent) {
        saveLocal(type, data);
        var box = $(".form-success", form.parentNode);
        var wa = $(".js-wa-details", box);
        if (wa) wa.href = waUrl(text);
        var note = $(".js-delivery-note", box);
        if (note) note.textContent = sent ? "Your details have been sent to our team."
          : "For the fastest response, tap “Send Details on WhatsApp” so your details reach us instantly. You can also attach property photos in the chat.";
        form.style.display = "none"; box.classList.add("show");
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        if (!sent) { window.open(waUrl(text), "_blank", "noopener"); }
        if (submit) { submit.disabled = false; submit.innerHTML = original; }
      };

      if (CFG.FORM_ENDPOINT) {
        var fd = new FormData(form); fd.append("form_type", type);
        fetch(CFG.FORM_ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error("bad"); done(true); })
          .catch(function () { done(false); });
      } else { done(false); }
    });
  });
})();
