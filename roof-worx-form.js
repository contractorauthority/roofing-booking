/**
 * Roof Worx — 3-Step Form Wizard
 * ================================
 * Step 1: Contact Info → Next
 * Step 2: Property Address (Google Maps) → Back | Next
 * Step 3: Notes (optional) → Back | Book
 *
 * HL Custom JS/HTML — ONE block, ONE line:
 *   <script src="https://contractorauthority.github.io/roofing-booking/roof-worx-form.js"></script>
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     GOOGLE MAPS LOADER
  ───────────────────────────────────────── */
  if (!window.google || !window.google.maps) {
    window.__rwGMReady = function () { window.__rwGMLoaded = true; };
    var gms = document.createElement("script");
    gms.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAM1jRtR068AC7A5zK90RukGayTsGYxhpg&libraries=places&callback=__rwGMReady";
    gms.async = true;
    gms.defer = true;
    document.head.appendChild(gms);
  }

  /* ─────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────── */
  function byQ(q) {
    return document.querySelector('[data-q="' + q + '"]') ||
           document.querySelector('input[name="' + q + '"]') ||
           document.querySelector('textarea[name="' + q + '"]');
  }
  function val(el) { return el && el.value ? el.value.replace(/^\s+|\s+$/g, "") : ""; }
  function hasVal(el) { return val(el).length > 0; }
  function digits(s) { return (s || "").replace(/\D+/g, ""); }
  function fmtPhone(raw) {
    var d = digits(raw);
    if (d.length === 11 && d[0] === "1") d = d.substring(1);
    if (d.length < 10) return raw || "";
    return "(" + d.substring(0, 3) + ") " + d.substring(3, 6) + "-" + d.substring(6, 10);
  }
  function phoneOk(el) {
    var d = digits(val(el));
    if (d.length === 11 && d[0] === "1") d = d.substring(1);
    return d.length >= 10;
  }
  function fireInput(el) {
    try { el.dispatchEvent(new Event("input", { bubbles: true })); } catch(e) {}
  }
  function tryEnable(el) {
    try { el.removeAttribute("readonly"); } catch(e) {}
    try { el.removeAttribute("disabled"); } catch(e) {}
  }
  function closestWrap(el) {
    var node = el, i = 0;
    while (node && i < 12) {
      var cls = typeof node.className === "string" ? node.className : "";
      if (cls.indexOf("form-group") > -1 ||
          cls.indexOf("field-container") > -1 ||
          cls.indexOf("col-") > -1) return node;
      node = node.parentElement;
      i++;
    }
    return el && el.parentElement ? el.parentElement : el;
  }
  function closestFfw(el) {
    var node = el, i = 0;
    while (node && i < 14) {
      var cls = typeof node.className === "string" ? node.className : "";
      if (cls.indexOf("form-field-wrapper") > -1) return node;
      node = node.parentElement;
      i++;
    }
    return closestWrap(el);
  }

  /* ─────────────────────────────────────────
     STYLES
  ───────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById("rw-wizard-styles")) return;
    var css = document.createElement("style");
    css.id = "rw-wizard-styles";
    css.innerHTML = [
      /* Wizard shell */
      "#rw-wizard{font-family:inherit;max-width:100%;}",

      /* Step bar */
      ".rw-steps{display:flex;align-items:center;margin:0 0 22px;padding:0;}",
      ".rw-step-item{display:flex;align-items:center;flex:1;}",
      ".rw-step-item:last-child{flex:0 0 auto;}",
      ".rw-step-dot{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;transition:all .3s;}",
      ".rw-step-dot.inactive{background:#f0f0f0;color:#bbb;border:2px solid #e0e0e0;}",
      ".rw-step-dot.active{background:#b43017;color:#fff;border:2px solid #b43017;box-shadow:0 4px 12px rgba(180,48,23,.3);}",
      ".rw-step-dot.done{background:rgba(0,128,0,.12);color:#1a6b2a;border:2px solid rgba(31,90,42,.25);}",
      ".rw-step-label{font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;margin-left:6px;transition:color .3s;white-space:nowrap;}",
      ".rw-step-label.inactive{color:#c0c0c0;}",
      ".rw-step-label.active{color:#b43017;}",
      ".rw-step-label.done{color:#1a6b2a;}",
      ".rw-step-line{flex:1;height:2px;margin:0 8px;border-radius:2px;transition:background .3s;}",
      ".rw-step-line.inactive{background:#e8e8e8;}",
      ".rw-step-line.done{background:rgba(31,90,42,.2);}",

      /* Panels */
      ".rw-panel{display:none;}",
      ".rw-panel.active{display:block;}",

      /* Cards */
      ".rw-card{margin:0 0 16px;padding:16px 18px;border-radius:14px;font-size:14px;line-height:1.55;border:1px solid rgba(0,0,0,.06);box-shadow:0 6px 18px rgba(0,0,0,.07);transition:background .25s,border-color .25s;}",
      ".rw-card.red{background:rgba(180,48,23,.06);border-color:rgba(180,48,23,.14);color:#111;}",
      ".rw-card.green{background:rgba(0,128,0,.07);border-color:rgba(31,90,42,.15);color:#111;}",
      ".rw-card.blue{background:rgba(59,130,246,.07);border-color:rgba(30,58,138,.10);color:#111;}",
      ".rw-card-title{font-size:17px;font-weight:800;margin:0 0 5px;line-height:1.25;color:#111;}",
      ".rw-card-sub{font-size:13px;line-height:1.5;opacity:.8;margin:0;}",

      /* Address pill */
      ".rw-addr-pill{margin:10px 0 0;padding:10px 14px;border-radius:10px;background:#fff;border:1px solid rgba(0,0,0,.10);font-weight:650;font-size:14px;color:#111;}",
      ".rw-addr-change{display:inline-flex;align-items:center;margin-top:10px;font-size:13px;font-weight:700;color:#555;background:none;border:none;border-bottom:1px solid rgba(0,0,0,.2);padding:0;cursor:pointer;transition:color .2s,border-color .2s;}",
      ".rw-addr-change:hover{color:#111;border-bottom-color:rgba(0,0,0,.45);}",

      /* Address input states */
      "[data-q='address']{background:#fff !important;color:#111 !important;}",
      ".rw-addr-empty{border:2px solid rgba(0,128,0,.4) !important;border-radius:10px !important;}",
      ".rw-addr-pulse{animation:rwPulse 1.3s ease-in-out infinite;border:2px solid rgba(180,48,23,.5) !important;border-radius:10px !important;}",
      "@keyframes rwPulse{0%{box-shadow:0 0 0 0 rgba(180,48,23,.25);}70%{box-shadow:0 0 0 8px rgba(180,48,23,0);}100%{box-shadow:0 0 0 0 rgba(180,48,23,0);}}",

      /* Notes hint */
      ".rw-hint{margin:0 0 14px;padding:13px 16px;border-radius:12px;font-size:14px;line-height:1.5;border:1px solid rgba(0,0,0,.06);transition:background .25s,border-color .25s;}",
      ".rw-hint.blue{background:rgba(59,130,246,.07);border-color:rgba(30,58,138,.10);color:#111;}",
      ".rw-hint.green{background:rgba(0,128,0,.08);border-color:rgba(31,90,42,.12);color:#111;}",

      /* Nav buttons */
      ".rw-nav{display:flex;gap:10px;margin-top:20px;align-items:stretch;}",
      ".rw-btn-next{flex:1;padding:16px 20px;border-radius:14px;border:none;font-size:15px;font-weight:800;cursor:pointer;transition:background .2s,opacity .15s,transform .1s,box-shadow .2s;letter-spacing:.1px;line-height:1;}",
      ".rw-btn-next.enabled{background:#b43017;color:#fff;box-shadow:0 6px 18px rgba(180,48,23,.28);}",
      ".rw-btn-next.enabled:hover{background:#9a2912;box-shadow:0 8px 22px rgba(180,48,23,.36);transform:translateY(-1px);}",
      ".rw-btn-next.enabled:active{transform:translateY(0);}",
      ".rw-btn-next.disabled{background:#ebebeb;color:#b0b0b0;cursor:not-allowed;box-shadow:none;}",
      ".rw-btn-back{flex:0 0 auto;padding:16px 20px;border-radius:14px;border:2px solid rgba(0,0,0,.12);background:#fff;font-size:15px;font-weight:700;color:#666;cursor:pointer;transition:border-color .2s,color .2s,background .2s;line-height:1;}",
      ".rw-btn-back:hover{border-color:rgba(0,0,0,.28);color:#111;background:#fafafa;}",
    ].join("");
    document.head.appendChild(css);
  }

  /* ─────────────────────────────────────────
     STEP BAR UPDATER
  ───────────────────────────────────────── */
  function setStepBar(current) {
    for (var i = 1; i <= 3; i++) {
      var dot  = document.getElementById("rw-dot-" + i);
      var lbl  = document.getElementById("rw-lbl-" + i);
      var line = document.getElementById("rw-line-" + i);
      if (!dot) continue;
      if (i < current) {
        dot.className = "rw-step-dot done"; dot.innerHTML = "&#10003;";
        if (lbl) lbl.className = "rw-step-label done";
        if (line) line.className = "rw-step-line done";
      } else if (i === current) {
        dot.className = "rw-step-dot active"; dot.textContent = String(i);
        if (lbl) lbl.className = "rw-step-label active";
        if (line) line.className = "rw-step-line inactive";
      } else {
        dot.className = "rw-step-dot inactive"; dot.textContent = String(i);
        if (lbl) lbl.className = "rw-step-label inactive";
        if (line) line.className = "rw-step-line inactive";
      }
    }
  }

  /* ─────────────────────────────────────────
     MAIN INIT
  ───────────────────────────────────────── */
  function init() {
    var fFirst = byQ("first_name");
    var fLast  = byQ("last_name");
    var fPhone = byQ("phone");
    var fAddr  = byQ("address");
    var fCity  = byQ("city");
    var fState = byQ("state");
    var fZip   = byQ("postal_code");
    var fNotes = byQ("appointment_details") || document.querySelector("textarea");

    if (!fFirst || !fLast || !fPhone || !fAddr) return false;

    injectStyles();

    /* ── Find field wrappers ── */
    var wFirst = closestWrap(fFirst);
    var wLast  = closestWrap(fLast);
    var wPhone = closestWrap(fPhone);
    var wAddr  = closestFfw(fAddr);
    var wNotes = fNotes ? closestWrap(fNotes) : null;

    /* ── Hide city/state/zip ── */
    [fCity, fState, fZip].forEach(function(f) {
      if (!f) return;
      var w = closestWrap(f);
      if (w) w.style.display = "none";
    });

    /* ── Find HL submit button wrapper ── */
    var hlSubmitWrap = null;
    var hlSubmit = document.querySelector('button[type="submit"]');
    if (hlSubmit) {
      hlSubmitWrap = closestWrap(hlSubmit);
    }

    /* ── Build wizard container ── */
    var wizard = document.createElement("div");
    wizard.id = "rw-wizard";

    /* Step bar */
    var stepBar = document.createElement("div");
    stepBar.className = "rw-steps";
    stepBar.innerHTML =
      '<div class="rw-step-item">' +
        '<div class="rw-step-dot active" id="rw-dot-1">1</div>' +
        '<span class="rw-step-label active" id="rw-lbl-1">Contact</span>' +
        '<div class="rw-step-line inactive" id="rw-line-1"></div>' +
      '</div>' +
      '<div class="rw-step-item">' +
        '<div class="rw-step-dot inactive" id="rw-dot-2">2</div>' +
        '<span class="rw-step-label inactive" id="rw-lbl-2">Address</span>' +
        '<div class="rw-step-line inactive" id="rw-line-2"></div>' +
      '</div>' +
      '<div class="rw-step-item">' +
        '<div class="rw-step-dot inactive" id="rw-dot-3">3</div>' +
        '<span class="rw-step-label inactive" id="rw-lbl-3">Notes</span>' +
      '</div>';
    wizard.appendChild(stepBar);

    /* Panels */
    var p1 = document.createElement("div"); p1.id = "rw-panel-1"; p1.className = "rw-panel active";
    var p2 = document.createElement("div"); p2.id = "rw-panel-2"; p2.className = "rw-panel";
    var p3 = document.createElement("div"); p3.id = "rw-panel-3"; p3.className = "rw-panel";
    wizard.appendChild(p1);
    wizard.appendChild(p2);
    wizard.appendChild(p3);

    /* Insert wizard before first field wrapper */
    var anchor = closestFfw(fFirst) || wFirst;
    anchor.parentNode.insertBefore(wizard, anchor);

    /* Move HL fields into panels */
    p1.appendChild(wFirst || fFirst);
    p1.appendChild(wLast  || fLast);
    p1.appendChild(wPhone || fPhone);
    p2.appendChild(wAddr  || fAddr);
    if (wNotes)      p3.appendChild(wNotes);
    if (hlSubmitWrap) p3.appendChild(hlSubmitWrap);

    /* ── Step 1: card + next ── */
    var s1Card = document.createElement("div");
    s1Card.id = "rw-s1-card";
    s1Card.className = "rw-card red";
    p1.insertBefore(s1Card, p1.firstChild);

    var s1Nav = document.createElement("div");
    s1Nav.className = "rw-nav";
    s1Nav.innerHTML = '<button type="button" id="rw-next-1" class="rw-btn-next disabled">Next: Confirm Address &nbsp;\u2192</button>';
    p1.appendChild(s1Nav);

    /* ── Step 2: card + back/next ── */
    var s2Card = document.createElement("div");
    s2Card.id = "rw-s2-card";
    s2Card.className = "rw-card red";
    p2.insertBefore(s2Card, p2.firstChild);

    var s2Nav = document.createElement("div");
    s2Nav.className = "rw-nav";
    s2Nav.innerHTML =
      '<button type="button" id="rw-back-2" class="rw-btn-back">\u2190 Back</button>' +
      '<button type="button" id="rw-next-2" class="rw-btn-next disabled">Next: Add Notes &nbsp;\u2192</button>';
    p2.appendChild(s2Nav);

    /* ── Step 3: addr summary + hint + back ── */
    var s3Addr = document.createElement("div");
    s3Addr.id = "rw-s3-addr";
    s3Addr.className = "rw-card green";
    s3Addr.style.display = "none";

    var s3Hint = document.createElement("div");
    s3Hint.id = "rw-s3-hint";
    s3Hint.className = "rw-hint blue";
    s3Hint.innerHTML = "\uD83D\uDCAC <b>Optional:</b> Add notes about your roof or project to help your rep arrive prepared.";

    var s3Nav = document.createElement("div");
    s3Nav.className = "rw-nav";
    s3Nav.innerHTML = '<button type="button" id="rw-back-3" class="rw-btn-back">\u2190 Back</button>';

    // Insert at top of p3 (before notes and submit)
    p3.insertBefore(s3Hint, p3.firstChild);
    p3.insertBefore(s3Addr, p3.firstChild);
    // Insert back button before submit wrap
    if (hlSubmitWrap) p3.insertBefore(s3Nav, hlSubmitWrap);
    else p3.appendChild(s3Nav);

    /* ─────────────────────────────────────────
       NAVIGATION LOGIC
    ───────────────────────────────────────── */
    var addrConfirmed = false;
    var addrFullText  = "";

    function showPanel(n) {
      p1.className = "rw-panel" + (n === 1 ? " active" : "");
      p2.className = "rw-panel" + (n === 2 ? " active" : "");
      p3.className = "rw-panel" + (n === 3 ? " active" : "");
      setStepBar(n);
      setTimeout(function() {
        try { wizard.scrollIntoView({ behavior: "smooth", block: "start" }); } catch(e) {}
      }, 60);
    }

    /* Next 1 */
    function refreshNext1() {
      var ok = hasVal(fFirst) && hasVal(fLast) && phoneOk(fPhone);
      document.getElementById("rw-next-1").className = "rw-btn-next " + (ok ? "enabled" : "disabled");
    }
    document.getElementById("rw-next-1").onclick = function() {
      if (!hasVal(fFirst) || !hasVal(fLast) || !phoneOk(fPhone)) return;
      renderS1Green();
      showPanel(2);
    };

    /* Back 2 */
    document.getElementById("rw-back-2").onclick = function() {
      showPanel(1);
    };

    /* Next 2 */
    function refreshNext2() {
      document.getElementById("rw-next-2").className = "rw-btn-next " + (addrConfirmed ? "enabled" : "disabled");
    }
    document.getElementById("rw-next-2").onclick = function() {
      if (!addrConfirmed) return;
      renderS3Addr();
      showPanel(3);
    };

    /* Back 3 */
    document.getElementById("rw-back-3").onclick = function() {
      showPanel(2);
    };

    /* ─────────────────────────────────────────
       STEP 1 — CONTACT CARD
    ───────────────────────────────────────── */
    function renderS1Red() {
      var m = [];
      if (!hasVal(fFirst))  m.push("first name");
      if (!hasVal(fLast))   m.push("last name");
      if (!phoneOk(fPhone)) m.push("phone number");
      var txt = m.length === 1 ? m[0] : m.length === 2 ? m[0] + " and " + m[1] : m[0] + ", " + m[1] + ", and " + m[2];
      s1Card.className = "rw-card red";
      s1Card.innerHTML =
        '<div class="rw-card-title">\uD83D\uDCDE Your contact info</div>' +
        '<div class="rw-card-sub">Please add your ' + txt + ' so your rep can reach you on the day of your appointment.</div>';
    }

    function renderS1Green() {
      s1Card.className = "rw-card green";
      s1Card.innerHTML =
        '<div class="rw-card-title">\uD83D\uDC4B Hi, ' + val(fFirst) + '!</div>' +
        '<div class="rw-card-sub">Your Roof Worx rep will call or text <b>' + fmtPhone(val(fPhone)) + '</b> the morning of your appointment to confirm their arrival window.</div>';
    }

    function updateS1() {
      var ok = hasVal(fFirst) && hasVal(fLast) && phoneOk(fPhone);
      if (ok) renderS1Green(); else renderS1Red();
      refreshNext1();
    }

    fFirst.addEventListener("input", updateS1);
    fLast.addEventListener("input",  updateS1);
    fPhone.addEventListener("input", updateS1);
    updateS1();

    /* ─────────────────────────────────────────
       STEP 2 — ADDRESS + GOOGLE MAPS
    ───────────────────────────────────────── */
    function renderS2Empty() {
      addrConfirmed = false;
      fAddr.classList.remove("rw-addr-pulse");
      fAddr.classList.add("rw-addr-empty");
      s2Card.className = "rw-card red";
      s2Card.innerHTML =
        '<div class="rw-card-title">\uD83C\uDFE0 Property address</div>' +
        '<div class="rw-card-sub">Start typing your address and select the correct property from the Google Maps dropdown.</div>';
      refreshNext2();
    }

    function renderS2NeedsConfirm() {
      addrConfirmed = false;
      fAddr.classList.remove("rw-addr-empty");
      fAddr.classList.add("rw-addr-pulse");
      s2Card.className = "rw-card red";
      s2Card.innerHTML =
        '<div class="rw-card-title">\uD83D\uDCCD Select your property</div>' +
        '<div class="rw-card-sub">Choose the correct address from the Google Maps dropdown to confirm it.</div>';
      refreshNext2();
    }

    function renderS2Confirmed() {
      addrConfirmed = true;
      fAddr.classList.remove("rw-addr-pulse", "rw-addr-empty");
      var street = fAddr.value.trim();
      var parts = [street];
      if (fCity  && fCity.value.trim())  parts.push(fCity.value.trim());
      if (fState && fState.value.trim()) parts.push(fState.value.trim());
      if (fZip   && fZip.value.trim())   parts.push(fZip.value.trim());
      addrFullText = parts.filter(Boolean).join(", ");
      s2Card.className = "rw-card green";
      s2Card.innerHTML =
        '<div class="rw-card-title">\uD83D\uDC4D Address confirmed</div>' +
        '<div class="rw-addr-pill">' + addrFullText + '</div>';
      refreshNext2();
    }

    function renderS3Addr() {
      s3Addr.style.display = "block";
      s3Addr.innerHTML =
        '<div class="rw-card-title">\uD83D\uDCCD ' + addrFullText + '</div>' +
        '<div class="rw-card-sub" style="margin-top:4px;">Your Roof Worx pro will know exactly where to go.</div>' +
        '<button type="button" class="rw-addr-change" id="rw-s3-change">\u2190&nbsp; Change address</button>';
      var btn = document.getElementById("rw-s3-change");
      if (btn) btn.onclick = function() {
        s3Addr.style.display = "none";
        showPanel(2);
      };
    }

    tryEnable(fAddr);

    /* Wait for Google Maps */
    var gmTries = 0;
    (function waitGM() {
      gmTries++;
      if (window.__rwGMLoaded || (window.google && window.google.maps && window.google.maps.places)) {
        var ac = new window.google.maps.places.Autocomplete(fAddr, { types: ["address"] });
        if (ac.setFields) ac.setFields(["address_component"]);
        ac.addListener("place_changed", function() {
          var place = ac.getPlace();
          if (!place || !place.address_components) return;
          var street = "";
          place.address_components.forEach(function(comp) {
            var type = comp.types && comp.types[0];
            if      (type === "street_number") street = comp.short_name;
            else if (type === "route")         street = (street ? street + " " : "") + comp.long_name;
            else if (type === "locality"                    && fCity)  fCity.value  = comp.long_name;
            else if (type === "administrative_area_level_1" && fState) fState.value = comp.short_name;
            else if (type === "postal_code"                 && fZip)   fZip.value   = comp.short_name;
          });
          if (street) fAddr.value = street;
          [fAddr, fCity, fState, fZip].forEach(function(f) { if (f) fireInput(f); });
          renderS2Confirmed();
          setTimeout(function() {
            var pac = document.querySelector(".pac-container");
            if (pac) pac.style.display = "none";
          }, 300);
        });
        renderS2Empty();
        return;
      }
      if (gmTries < 80) setTimeout(waitGM, 150);
    })();

    fAddr.addEventListener("focus", function() {
      tryEnable(fAddr);
      if (!fAddr.value.trim()) renderS2Empty();
      else if (!addrConfirmed) renderS2NeedsConfirm();
    });
    fAddr.addEventListener("input", function() {
      tryEnable(fAddr);
      if (!fAddr.value.trim()) renderS2Empty();
      else if (!addrConfirmed) renderS2NeedsConfirm();
    });

    /* ─────────────────────────────────────────
       STEP 3 — NOTES HINT
    ───────────────────────────────────────── */
    if (fNotes) {
      function syncNotes() {
        var t = (fNotes.value || "").replace(/^\s+|\s+$/g, "");
        var words = t ? t.split(/\s+/).filter(Boolean).length : 0;
        if (words >= 2) {
          s3Hint.className = "rw-hint green";
          s3Hint.innerHTML = "\u2705 <b>Thank you!</b> This helps your rep arrive prepared and makes your <b>Pro Consultation</b> more efficient.";
        } else {
          s3Hint.className = "rw-hint blue";
          s3Hint.innerHTML = "\uD83D\uDCAC <b>Optional:</b> Add notes about your roof or project to help your rep arrive prepared.";
        }
      }
      fNotes.addEventListener("input", syncNotes);
      syncNotes();
    }

    return true;
  }

  /* ─────────────────────────────────────────
     BOOT
  ───────────────────────────────────────── */
  var tries = 0;
  (function boot() {
    tries++;
    if (init()) return;
    if (tries < 80) setTimeout(boot, 100);
  })();

})();
