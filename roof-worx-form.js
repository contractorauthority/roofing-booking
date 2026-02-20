/**
 * Roof Worx — 3-Step Form Enhancement
 * =====================================
 * Host: https://contractorauthority.github.io/roofing-booking/roof-worx-form.js
 *
 * PASTE INTO HIGHLEVEL FORM — Two Custom JS/HTML blocks:
 *
 * Block 1 (Step 1 section):
 *   <script src="https://contractorauthority.github.io/roofing-booking/roof-worx-form.js"></script>
 *
 * Block 2 (Step 2 section):
 *   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAM1jRtR068AC7A5zK90RukGayTsGYxhpg&libraries=places"></script>
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────── */
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function fieldVal(name) {
    var el = qs('input[name="' + name + '"]') || qs('textarea[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function digitsOnly(s) { return (s || "").replace(/\D/g, ""); }

  function formatPhone(raw) {
    var d = digitsOnly(raw);
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    if (d.length < 10) return raw || "";
    return "(" + d.slice(0,3) + ") " + d.slice(3,6) + "-" + d.slice(6,10);
  }

  function fireEvent(el) {
    if (!el) return;
    try { el.dispatchEvent(new Event("input", { bubbles: true })); } catch(e) {}
    try { el.dispatchEvent(new Event("change", { bubbles: true })); } catch(e) {}
  }

  function smoothScroll(el) {
    if (!el) return;
    setTimeout(function() {
      try { el.scrollIntoView({ behavior: "smooth", block: "start" }); }
      catch(e) { el.scrollIntoView(true); }
    }, 80);
  }

  function closestWrap(el) {
    var node = el, depth = 0;
    while (node && depth < 12) {
      var cls = typeof node.className === "string" ? node.className : "";
      if (cls.indexOf("form-group") > -1 ||
          cls.indexOf("field-container") > -1 ||
          cls.indexOf("col-") > -1) return node;
      node = node.parentElement;
      depth++;
    }
    return el ? el.parentElement : null;
  }

  /* ─────────────────────────────────────────
     STYLES
  ───────────────────────────────────────── */
  function injectStyles() {
    if (qs("#rw-styles")) return;
    var s = document.createElement("style");
    s.id = "rw-styles";
    s.innerHTML = [

      "#rw-form-outer{overflow:hidden;position:relative;width:100%;}",

      "#rw-steps-track{",
        "display:flex;flex-direction:row;",
        "transition:transform 0.42s cubic-bezier(0.4,0,0.2,1);",
        "will-change:transform;",
      "}",

      ".rw-step{",
        "min-width:100%;width:100%;box-sizing:border-box;padding:0 2px;",
      "}",

      /* Progress bar */
      "#rw-progress{",
        "display:flex;align-items:center;justify-content:center;",
        "padding:18px 16px 22px;gap:0;",
      "}",
      ".rw-prog-step{",
        "display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;",
      "}",
      ".rw-prog-dot{",
        "width:36px;height:36px;border-radius:50%;",
        "display:flex;align-items:center;justify-content:center;",
        "font-size:13px;font-weight:700;",
        "background:#e5e7eb;color:#9ca3af;",
        "transition:background 0.35s,color 0.35s,box-shadow 0.35s,transform 0.25s;",
      "}",
      ".rw-prog-dot.active{",
        "background:linear-gradient(135deg,#1e40af,#2563eb);",
        "color:#fff;",
        "box-shadow:0 4px 16px rgba(37,99,235,0.40);",
        "transform:scale(1.12);",
        "animation:rwDotPulse 1.8s ease-in-out infinite;",
      "}",
      ".rw-prog-dot.done{",
        "background:linear-gradient(135deg,#15803d,#16a34a);",
        "color:#fff;",
        "box-shadow:0 4px 12px rgba(22,163,74,0.30);",
      "}",
      "@keyframes rwDotPulse{",
        "0%,100%{box-shadow:0 4px 16px rgba(37,99,235,0.40);}",
        "50%{box-shadow:0 4px 22px rgba(37,99,235,0.65);}",
      "}",
      ".rw-prog-label{",
        "font-size:11px;font-weight:600;color:#9ca3af;",
        "transition:color 0.3s;white-space:nowrap;",
      "}",
      ".rw-prog-step.active .rw-prog-label{color:#2563eb;}",
      ".rw-prog-step.done .rw-prog-label{color:#16a34a;}",
      ".rw-prog-line{",
        "flex:1;height:3px;background:#e5e7eb;",
        "transition:background 0.5s;",
        "margin-bottom:20px;max-width:44px;",
      "}",
      ".rw-prog-line.done{background:linear-gradient(90deg,#15803d,#22c55e);}",

      /* Cards */
      ".rw-card{",
        "margin:0 0 14px;padding:14px 16px;border-radius:14px;",
        "font-size:14px;line-height:1.55;",
        "border:1px solid rgba(0,0,0,0.07);",
        "box-shadow:0 6px 20px rgba(0,0,0,0.07);",
        "transition:background 0.28s,border-color 0.28s;",
      "}",
      ".rw-card.red{background:rgba(239,68,68,0.07);border-color:rgba(239,68,68,0.15);}",
      ".rw-card.green{background:rgba(22,163,74,0.08);border-color:rgba(22,163,74,0.15);}",
      ".rw-card-title{font-size:17px;font-weight:800;margin:0 0 7px;letter-spacing:-0.2px;}",
      ".rw-card-body{font-size:14px;line-height:1.6;margin:0;}",

      /* Step 3 card */
      ".rw-step3-card{",
        "margin:0 0 14px;padding:16px;border-radius:14px;",
        "background:linear-gradient(135deg,rgba(37,99,235,0.06),rgba(22,163,74,0.06));",
        "border:1px solid rgba(37,99,235,0.12);",
        "font-size:14px;line-height:1.65;",
      "}",

      /* Next button */
      ".rw-next-btn{",
        "display:block;width:100%;margin:16px 0 4px;",
        "padding:14px 16px;border-radius:12px;border:0;",
        "background:linear-gradient(135deg,#1e40af,#2563eb);",
        "color:#fff;font-size:16px;font-weight:800;",
        "cursor:pointer;text-align:center;",
        "box-shadow:0 8px 24px rgba(37,99,235,0.35);",
        "transition:box-shadow 0.2s,transform 0.1s,opacity 0.2s;",
        "letter-spacing:-0.1px;",
      "}",
      ".rw-next-btn:hover{box-shadow:0 12px 30px rgba(37,99,235,0.45);transform:translateY(-1px);}",
      ".rw-next-btn:active{transform:translateY(0) scale(0.99);}",
      ".rw-next-btn:disabled{opacity:0.45;box-shadow:none;cursor:not-allowed;transform:none;}",

      /* Back button */
      ".rw-back-btn{",
        "background:transparent;border:0;padding:0;",
        "font-size:13px;font-weight:600;color:#6b7280;",
        "cursor:pointer;margin:12px 0 4px;",
        "display:inline-flex;align-items:center;gap:4px;",
        "transition:color 0.15s;",
      "}",
      ".rw-back-btn:hover{color:#374151;}",

      /* Link button */
      ".rw-link-btn{",
        "background:transparent;border:0;padding:0;",
        "color:inherit;cursor:pointer;font-weight:700;",
        "border-bottom:1px solid rgba(0,0,0,0.22);",
        "transition:border-color 0.15s;font-size:13px;",
      "}",
      ".rw-link-btn:hover{border-bottom-color:rgba(0,0,0,0.5);}",

      /* Address pill */
      ".rw-addr-pill{",
        "margin:10px 0 0;padding:10px 12px;border-radius:10px;",
        "background:#fff;color:#111;",
        "border:1px solid rgba(0,0,0,0.10);font-weight:600;font-size:14px;",
      "}",

      /* Address input */
      "input[name='address']{background:#fff !important;color:#111 !important;}",

      ".rw-addr-pulse{",
        "animation:rwPulse 1.3s ease-in-out infinite;",
        "border:2px solid rgba(180,48,23,0.45) !important;",
      "}",
      "@keyframes rwPulse{",
        "0%{box-shadow:0 0 0 0 rgba(180,48,23,0.22);}",
        "70%{box-shadow:0 0 0 10px rgba(180,48,23,0);}",
        "100%{box-shadow:0 0 0 0 rgba(180,48,23,0);}",
      "}",
      ".rw-addr-empty{",
        "border:2px solid rgba(22,163,74,0.45) !important;",
        "border-radius:8px !important;",
      "}",

      /* Hidden helper */
      ".rw-field-hidden{display:none !important;}",

      /* Shake */
      "@keyframes rwShake{",
        "0%,100%{transform:translateX(0);}",
        "20%,60%{transform:translateX(-5px);}",
        "40%,80%{transform:translateX(5px);}",
      "}",
      ".rw-shake{animation:rwShake 0.4s ease;}",

    ].join("");
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────
     GET FIELD WRAPPER
  ───────────────────────────────────────── */
  function getFieldWrap(name) {
    var el = qs('input[name="' + name + '"]') ||
             qs('textarea[name="' + name + '"]');
    return el ? closestWrap(el) : null;
  }

  /* ─────────────────────────────────────────
     FIND SUBMIT WRAPPER
  ───────────────────────────────────────── */
  function findSubmitWrap() {
    var btn = qs('button[type="submit"]');
    if (!btn) {
      var allBtns = qsa("button");
      for (var i = 0; i < allBtns.length; i++) {
        var txt = allBtns[i].textContent.toLowerCase();
        if (txt.indexOf("book") > -1 || txt.indexOf("submit") > -1 || txt.indexOf("consultation") > -1) {
          btn = allBtns[i]; break;
        }
      }
    }
    if (!btn) return null;
    var node = btn;
    for (var j = 0; j < 5; j++) {
      if (node.parentNode && node.parentNode.tagName !== "FORM") node = node.parentNode;
      else break;
    }
    return node;
  }

  /* ─────────────────────────────────────────
     BUILD DOM STRUCTURE
  ───────────────────────────────────────── */
  function buildStructure(s1fields, s2fields, s3fields, submitWrap) {
    var firstWrap = s1fields[0];
    if (!firstWrap || !firstWrap.parentNode) return false;
    var parent = firstWrap.parentNode;

    var outer = document.createElement("div");
    outer.id = "rw-form-outer";

    // Progress bar
    var progress = document.createElement("div");
    progress.id = "rw-progress";
    progress.innerHTML =
      '<div class="rw-prog-step active" id="rw-prog-1">' +
        '<div class="rw-prog-dot active" id="rw-dot-1">1</div>' +
        '<div class="rw-prog-label">Your Info</div>' +
      '</div>' +
      '<div class="rw-prog-line" id="rw-line-1"></div>' +
      '<div class="rw-prog-step" id="rw-prog-2">' +
        '<div class="rw-prog-dot" id="rw-dot-2">2</div>' +
        '<div class="rw-prog-label">Your Property</div>' +
      '</div>' +
      '<div class="rw-prog-line" id="rw-line-2"></div>' +
      '<div class="rw-prog-step" id="rw-prog-3">' +
        '<div class="rw-prog-dot" id="rw-dot-3">3</div>' +
        '<div class="rw-prog-label">Book It</div>' +
      '</div>';

    // Track
    var track = document.createElement("div");
    track.id = "rw-steps-track";

    var step1 = document.createElement("div");
    step1.className = "rw-step"; step1.id = "rw-step-1";

    var step2 = document.createElement("div");
    step2.className = "rw-step"; step2.id = "rw-step-2";

    var step3 = document.createElement("div");
    step3.className = "rw-step"; step3.id = "rw-step-3";

    s1fields.forEach(function(w) { step1.appendChild(w); });
    s2fields.forEach(function(w) { step2.appendChild(w); });
    s3fields.forEach(function(w) { step3.appendChild(w); });
    if (submitWrap) step3.appendChild(submitWrap);

    track.appendChild(step1);
    track.appendChild(step2);
    track.appendChild(step3);

    outer.appendChild(progress);
    outer.appendChild(track);

    parent.appendChild(outer);
    return true;
  }

  /* ─────────────────────────────────────────
     PROGRESS BAR
  ───────────────────────────────────────── */
  function updateProgress(step) {
    for (var i = 1; i <= 3; i++) {
      var dot  = qs("#rw-dot-" + i);
      var prog = qs("#rw-prog-" + i);
      if (!dot || !prog) continue;
      dot.classList.remove("active", "done");
      prog.classList.remove("active", "done");
      if (i < step)      { dot.classList.add("done");   prog.classList.add("done");   dot.innerHTML = "✓"; }
      else if (i === step) { dot.classList.add("active"); prog.classList.add("active"); dot.innerHTML = String(i); }
      else                 { dot.innerHTML = String(i); }
    }
    var l1 = qs("#rw-line-1"), l2 = qs("#rw-line-2");
    if (l1) l1.classList.toggle("done", step > 1);
    if (l2) l2.classList.toggle("done", step > 2);
  }

  /* ─────────────────────────────────────────
     SLIDE
  ───────────────────────────────────────── */
  var currentStep = 1;

  function goToStep(n) {
    var track = qs("#rw-steps-track");
    if (!track) return;
    currentStep = n;
    track.style.transform = "translateX(-" + ((n - 1) * 100) + "%)";
    updateProgress(n);
    smoothScroll(qs("#rw-form-outer"));
  }

  /* ─────────────────────────────────────────
     STEP 1
  ───────────────────────────────────────── */
  function initStep1() {
    var s1 = qs("#rw-step-1");
    if (!s1) return;

    var first = qs('input[name="first_name"]');
    var last  = qs('input[name="last_name"]');
    var phone = qs('input[name="phone"]');
    if (!first || !last || !phone) return;

    var card = document.createElement("div");
    card.id = "rw-contact-card";
    card.className = "rw-card red";
    s1.insertBefore(card, s1.firstChild);

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "rw-next-btn";
    nextBtn.id = "rw-step1-next";
    nextBtn.innerHTML = "Next: Your Property Address →";
    nextBtn.disabled = true;
    s1.appendChild(nextBtn);

    nextBtn.onclick = function() {
      if (!validateStep1()) {
        nextBtn.classList.add("rw-shake");
        setTimeout(function() { nextBtn.classList.remove("rw-shake"); }, 400);
        return;
      }
      goToStep(2);
      initStep2();
    };

    function phoneOk() {
      var d = digitsOnly(fieldVal("phone"));
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      return d.length >= 10;
    }

    function validateStep1() {
      return fieldVal("first_name").length > 0 &&
             fieldVal("last_name").length > 0 &&
             phoneOk();
    }

    function missingFields() {
      var m = [];
      if (!fieldVal("first_name")) m.push("first name");
      if (!fieldVal("last_name"))  m.push("last name");
      if (!phoneOk()) m.push("phone number");
      if (m.length === 1) return m[0];
      if (m.length === 2) return m[0] + " and " + m[1];
      return m[0] + ", " + m[1] + ", and " + m[2];
    }

    function renderCard() {
      if (validateStep1()) {
        card.className = "rw-card green";
        card.innerHTML =
          '<div class="rw-card-title">👋 Hi ' + fieldVal("first_name") + ', great to meet you!</div>' +
          '<div class="rw-card-body">' +
            'Your Roof Worx pro will call or text <b>' + formatPhone(fieldVal("phone")) + '</b> ' +
            'the morning of your appointment to confirm their arrival time.' +
            '<br><br>' +
            '<span style="opacity:.85;">Being available lets us walk the property together, ' +
            'answer your questions, and make sure our guidance fits your exact situation.</span>' +
          '</div>';
        nextBtn.disabled = false;
      } else {
        card.className = "rw-card red";
        card.innerHTML =
          '<div class="rw-card-body">' +
            '📞 <b>So your rep can reach you:</b> Please add your ' + missingFields() + '.' +
          '</div>';
        nextBtn.disabled = true;
      }
    }

    renderCard();
    first.addEventListener("input", renderCard);
    last.addEventListener("input", renderCard);
    phone.addEventListener("input", renderCard);
  }

  /* ─────────────────────────────────────────
     STEP 2
  ───────────────────────────────────────── */
  var step2Inited = false;

  function initStep2() {
    if (step2Inited) return;
    step2Inited = true;

    var s2     = qs("#rw-step-2");
    var input  = qs('input[name="address"]');
    var cityEl = qs('input[name="city"]');
    var stEl   = qs('input[name="state"]');
    var zipEl  = qs('input[name="postal_code"]');
    if (!s2 || !input) return;

    // Hide city/state/zip wrappers visually
    [cityEl, stEl, zipEl].forEach(function(el) {
      if (!el) return;
      var w = closestWrap(el);
      if (w) w.classList.add("rw-field-hidden");
    });

    try { input.removeAttribute("readonly"); input.removeAttribute("disabled"); } catch(e) {}

    var addrWrap = closestWrap(input);

    // Confirm card before address wrap
    var card = document.createElement("div");
    card.id = "rw-addr-card";
    card.className = "rw-card red";
    if (addrWrap && addrWrap.parentNode) {
      addrWrap.parentNode.insertBefore(card, addrWrap);
    }

    // Next button (hidden until confirmed)
    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "rw-next-btn";
    nextBtn.innerHTML = "Next: Book It →";
    nextBtn.style.display = "none";
    s2.appendChild(nextBtn);

    nextBtn.onclick = function() {
      goToStep(3);
      initStep3();
    };

    // Back button
    var backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "rw-back-btn";
    backBtn.innerHTML = "← Back to Your Info";
    s2.appendChild(backBtn);
    backBtn.onclick = function() { goToStep(1); };

    var confirmed = false;

    function fullAddr() {
      var parts = [input.value.trim()];
      if (cityEl && cityEl.value.trim()) parts.push(cityEl.value.trim());
      if (stEl && stEl.value.trim())     parts.push(stEl.value.trim());
      if (zipEl && zipEl.value.trim())   parts.push(zipEl.value.trim());
      return parts.filter(Boolean).join(", ");
    }

    function showEmpty() {
      confirmed = false;
      nextBtn.style.display = "none";
      input.classList.remove("rw-addr-pulse");
      input.classList.add("rw-addr-empty");
      card.className = "rw-card red";
      card.innerHTML =
        '<div class="rw-card-title">Enter your property address</div>' +
        '<div class="rw-card-body">Start typing and select your property from the dropdown to confirm.</div>';
    }

    function showNeedsConfirm() {
      confirmed = false;
      nextBtn.style.display = "none";
      input.classList.remove("rw-addr-empty");
      input.classList.add("rw-addr-pulse");
      card.className = "rw-card red";
      card.innerHTML =
        '<div class="rw-card-title">Select your property to confirm</div>' +
        '<div class="rw-card-body">Choose the correct address from the Google Maps dropdown. 👇</div>';
    }

    function showConfirmed() {
      confirmed = true;
      input.classList.remove("rw-addr-pulse", "rw-addr-empty");
      nextBtn.style.display = "block";
      card.className = "rw-card green";
      card.innerHTML =
        '<div class="rw-card-title">📍 Address confirmed</div>' +
        '<div class="rw-card-body">Perfect — your Roof Worx pro will know exactly where to go.</div>' +
        '<div class="rw-addr-pill">' + fullAddr() + '</div>' +
        '<div style="margin-top:10px;">' +
          '<button type="button" class="rw-link-btn" id="rw-change-addr">Change address</button>' +
        '</div>';
      var chg = qs("#rw-change-addr");
      if (chg) {
        chg.onclick = function() {
          confirmed = false;
          nextBtn.style.display = "none";
          try { input.focus(); } catch(e) {}
          showNeedsConfirm();
        };
      }
    }

    function setupAutocomplete() {
      var ac = new window.google.maps.places.Autocomplete(input, { types: ["address"] });
      if (ac.setFields) ac.setFields(["address_component"]);

      ac.addListener("place_changed", function() {
        var place = ac.getPlace();
        if (!place || !place.address_components) return;
        var street = "";
        place.address_components.forEach(function(comp) {
          var type = comp.types && comp.types[0];
          if (type === "street_number") {
            street = comp.short_name;
          } else if (type === "route") {
            street = (street ? street + " " : "") + comp.long_name;
          } else if (type === "locality" && cityEl) {
            cityEl.value = comp.long_name; fireEvent(cityEl);
          } else if (type === "administrative_area_level_1" && stEl) {
            stEl.value = comp.short_name; fireEvent(stEl);
          } else if (type === "postal_code" && zipEl) {
            zipEl.value = comp.short_name; fireEvent(zipEl);
          }
        });
        if (street) { input.value = street; fireEvent(input); }
        showConfirmed();
        setTimeout(function() {
          var pac = qs(".pac-container");
          if (pac) pac.style.display = "none";
        }, 300);
      });
    }

    // Wait for Google Maps if not loaded yet
    if (window.google && window.google.maps && window.google.maps.places) {
      setupAutocomplete();
    } else {
      var gmTries = 0;
      var gmWait = setInterval(function() {
        gmTries++;
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(gmWait);
          setupAutocomplete();
        }
        if (gmTries > 80) clearInterval(gmWait);
      }, 150);
    }

    // Initial state
    if (input.value.trim()) showNeedsConfirm();
    else showEmpty();

    input.addEventListener("focus", function() {
      try { input.removeAttribute("readonly"); input.removeAttribute("disabled"); } catch(e) {}
      if (!input.value.trim()) showEmpty();
      else if (!confirmed) showNeedsConfirm();
    });

    input.addEventListener("input", function() {
      try { input.removeAttribute("readonly"); input.removeAttribute("disabled"); } catch(e) {}
      if (!input.value.trim()) showEmpty();
      else if (!confirmed) showNeedsConfirm();
    });
  }

  /* ─────────────────────────────────────────
     STEP 3
  ───────────────────────────────────────── */
  var step3Inited = false;

  function initStep3() {
    if (step3Inited) return;
    step3Inited = true;

    var s3 = qs("#rw-step-3");
    if (!s3) return;

    var card = document.createElement("div");
    card.className = "rw-step3-card";
    card.innerHTML =
      '<div style="font-size:17px;font-weight:800;margin:0 0 8px;color:#1a1a1a;">Almost there! 🎉</div>' +
      '<div style="font-size:14px;line-height:1.65;color:#374151;">' +
        '<b>This step is optional</b> — but a quick note about what you\'ve noticed, your concerns, ' +
        'or any questions you already have helps your Roof Worx pro show up fully prepared.' +
        '<br><br>' +
        '<span style="opacity:.82;">Prefer to skip it? Just press <b>Book My Pro Consultation</b> below ' +
        'and your rep will call you ahead of the appointment to discuss your project.</span>' +
      '</div>';
    s3.insertBefore(card, s3.firstChild);

    var backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "rw-back-btn";
    backBtn.innerHTML = "← Back to Your Property";
    s3.appendChild(backBtn);
    backBtn.onclick = function() { goToStep(2); };
  }

  /* ─────────────────────────────────────────
     BOOT
  ───────────────────────────────────────── */
  function init() {
    injectStyles();

    var tries = 0;
    (function retry() {
      tries++;

      var f1 = getFieldWrap("first_name");
      var f2 = getFieldWrap("last_name");
      var f3 = getFieldWrap("phone");
      var f4 = getFieldWrap("address");
      var f5 = getFieldWrap("city");
      var f6 = getFieldWrap("state");
      var f7 = getFieldWrap("postal_code");
      var f8 = getFieldWrap("appointment_details");

      if (!f1 || !f2 || !f3 || !f4 || !f8) {
        if (tries < 80) setTimeout(retry, 100);
        return;
      }

      var submitWrap = findSubmitWrap();

      var ok = buildStructure(
        [f1, f2, f3],
        [f4, f5, f6, f7].filter(Boolean),
        [f8],
        submitWrap
      );

      if (!ok) {
        if (tries < 80) setTimeout(retry, 100);
        return;
      }

      goToStep(1);
      initStep1();
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
