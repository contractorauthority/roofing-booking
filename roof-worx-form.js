/**
 * Roof Worx — Combined Form Enhancement
 * =======================================
 * Combines: Contact Status + Google Places Address + Appointment Details Hint
 * Host: https://contractorauthority.github.io/roofing-booking/roof-worx-form.js
 *
 * HL Custom JS/HTML block (single block):
 *   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAM1jRtR068AC7A5zK90RukGayTsGYxhpg&libraries=places"></script>
 *   <script src="https://contractorauthority.github.io/roofing-booking/roof-worx-form.js"></script>
 */

(function () {

  /* ─────────────────────────────────────────
     SHARED UTILITIES
  ───────────────────────────────────────── */
  function val(input) {
    return input && input.value ? input.value.replace(/^\s+|\s+$/g, "") : "";
  }
  function hasValue(input) { return val(input).length > 0; }
  function digitsOnly(s) { return (s || "").replace(/\D+/g, ""); }
  function formatPhone(raw) {
    var d = digitsOnly(raw);
    if (d.length === 11 && d.charAt(0) === "1") d = d.substring(1);
    if (d.length < 10) return raw || "";
    return "(" + d.substring(0,3) + ") " + d.substring(3,6) + "-" + d.substring(6,10);
  }
  function fireInput(el) {
    if (!el) return;
    try { el.dispatchEvent(new Event("input", { bubbles: true })); } catch(e) {}
    try { el.dispatchEvent(new Event("change", { bubbles: true })); } catch(e) {}
  }
  function smoothScroll(el) {
    if (!el) return;
    setTimeout(function() {
      try { el.scrollIntoView({ behavior: "smooth", block: "center" }); }
      catch(e) { el.scrollIntoView(true); }
    }, 200);
  }
  function tryEnable(input) {
    try { input.removeAttribute("readonly"); } catch(e) {}
    try { input.removeAttribute("disabled"); } catch(e) {}
  }

  // HL uses random name attrs; find by data-q attribute
  function fieldByQ(q) {
    return document.querySelector('[data-q="' + q + '"]') ||
           document.querySelector('input[name="' + q + '"]') ||
           document.querySelector('textarea[name="' + q + '"]');
  }

  function closestWrap(el) {
    var node = el, depth = 0;
    while (node && depth < 12) {
      var cls = typeof node.className === "string" ? node.className : "";
      if (cls.indexOf("form-field-wrapper") > -1 ||
          cls.indexOf("form-group") > -1 ||
          cls.indexOf("col-") > -1) return node;
      node = node.parentElement;
      depth++;
    }
    return el ? el.parentElement : null;
  }

  function insertBefore(target, node) {
    if (!target || !target.parentNode) return false;
    target.parentNode.insertBefore(node, target);
    return true;
  }
  function insertAfter(target, node) {
    if (!target || !target.parentNode) return;
    if (target.nextSibling) target.parentNode.insertBefore(node, target.nextSibling);
    else target.parentNode.appendChild(node);
  }

  /* ─────────────────────────────────────────
     STYLES
  ───────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById("rw-styles")) return;
    var css = document.createElement("style");
    css.id = "rw-styles";
    css.innerHTML =
      /* ── Shared card ── */
      ".rw-card{" +
        "margin:0 0 12px;" +
        "padding:14px 16px;" +
        "border-radius:12px;" +
        "font-size:14px;" +
        "line-height:1.55;" +
        "border:1px solid rgba(0,0,0,0.06);" +
        "box-shadow:0 10px 24px rgba(0,0,0,0.06);" +
        "transition:background .25s,border-color .25s;" +
      "}" +
      ".rw-card.green{background:rgba(0,128,0,0.08);border-color:rgba(31,90,42,0.12);color:#111;}" +
      ".rw-card.red{background:rgba(180,48,23,0.07);border-color:rgba(180,48,23,0.12);color:#111;}" +
      ".rw-card.blue{background:rgba(59,130,246,0.08);border-color:rgba(30,58,138,0.10);color:#111;}" +
      ".rw-card-title{font-size:17px;font-weight:800;margin:0 0 7px;letter-spacing:-.2px;}" +
      ".rw-card-body{font-size:14px;line-height:1.6;margin:0;}" +

      /* ── Link button ── */
      ".rw-link-btn{background:transparent;border:0;padding:0;color:inherit;" +
        "cursor:pointer;font-weight:700;border-bottom:1px solid rgba(0,0,0,.22);font-size:13px;}" +
      ".rw-link-btn:hover{border-bottom-color:rgba(0,0,0,.5);}" +

      /* ── Contact collapse ── */
      ".rw-collapsed{display:none !important;}" +

      /* ── Continue under fields ── */
      ".rw-continue-under{margin-top:10px;}" +
      ".rw-continue-btn{background:transparent;border:0;padding:0;cursor:pointer;" +
        "font-size:13px;font-weight:750;color:#111;border-bottom:1px solid rgba(0,0,0,.22);}" +
      ".rw-continue-btn:hover{border-bottom-color:rgba(0,0,0,.5);}" +

      /* ── Address card ── */
      ".rw-addr-pill{margin:10px 0 0;padding:10px 12px;border-radius:10px;" +
        "background:#fff;color:#111;border:1px solid rgba(0,0,0,.10);font-weight:650;}" +
      ".rw-addr-actions{margin:10px 0 0;font-size:13px;}" +
      "input[name='address']{background:#fff !important;color:#111 !important;}" +
      ".rw-addr-pulse{" +
        "animation:rwPulse 1.25s ease-in-out infinite;" +
        "border:2px solid rgba(180,48,23,.45) !important;" +
      "}" +
      "@keyframes rwPulse{" +
        "0%{box-shadow:0 0 0 0 rgba(180,48,23,.22);}" +
        "70%{box-shadow:0 0 0 10px rgba(180,48,23,0);}" +
        "100%{box-shadow:0 0 0 0 rgba(180,48,23,0);}" +
      "}" +
      ".rw-addr-empty{border:3px solid rgba(0,128,0,.38) !important;border-radius:12px !important;}" +
      ".rw-addr-collapsed input[name='address']{display:none !important;}" +
      ".rw-addr-collapsed label{display:none !important;}" +

      /* ── Details hint ── */
      ".rw-details-cta{display:none;margin:12px 0 0;" +
        "padding:12px 14px;border-radius:12px;" +
        "border:1px solid rgba(0,0,0,.06);" +
        "background:rgba(0,128,0,.08);color:#111;" +
      "}" +
      ".rw-details-cta-title{font-size:14px;font-weight:750;margin:0;}" +
      ".rw-details-cta-sub{margin-top:6px;font-size:13px;opacity:.92;}" +
      ".rw-details-cta-next{margin-top:10px;padding-top:10px;" +
        "border-top:1px solid rgba(0,0,0,.06);" +
        "font-size:19px;font-weight:333;color:#1f5a2a;" +
      "}";
    document.head.appendChild(css);
  }

  /* ═══════════════════════════════════════════
     SCRIPT 1 — CONTACT STATUS CARD
  ═══════════════════════════════════════════ */
  function initContact() {
    var first = fieldByQ("first_name");
    var last  = fieldByQ("last_name");
    var phone = fieldByQ("phone");
    if (!first || !last || !phone) return false;

    var firstWrap = closestWrap(first);
    var lastWrap  = closestWrap(last);
    var phoneWrap = closestWrap(phone);

    // Status bar
    var bar = document.getElementById("rw-contact-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "rw-contact-bar";
      bar.className = "rw-card red";
      if (!insertBefore(firstWrap || first, bar)) return false;
    }

    // Continue link under phone
    var continueWrap = document.getElementById("rw-contact-continue");
    if (!continueWrap && phoneWrap) {
      continueWrap = document.createElement("div");
      continueWrap.id = "rw-contact-continue";
      continueWrap.className = "rw-continue-under";
      continueWrap.style.display = "none";
      continueWrap.innerHTML =
        '<button type="button" class="rw-continue-btn" id="rw-contact-continue-btn">' +
        'Update the contact info <span style="white-space:nowrap;">→ Then (click here) continue to next step 👍</span>' +
        '</button>';
      if (phoneWrap.nextSibling) phoneWrap.parentNode.insertBefore(continueWrap, phoneWrap.nextSibling);
      else phoneWrap.parentNode.appendChild(continueWrap);
    }

    var expandedByUser = false;
    var lastSnap = "";

    function collapseFields() {
      if (firstWrap) firstWrap.classList.add("rw-collapsed");
      if (lastWrap)  lastWrap.classList.add("rw-collapsed");
      if (phoneWrap) phoneWrap.classList.add("rw-collapsed");
    }
    function expandFields() {
      if (firstWrap) firstWrap.classList.remove("rw-collapsed");
      if (lastWrap)  lastWrap.classList.remove("rw-collapsed");
      if (phoneWrap) phoneWrap.classList.remove("rw-collapsed");
    }
    function showContinue(show) {
      var cw = document.getElementById("rw-contact-continue");
      if (cw) cw.style.display = show ? "block" : "none";
    }
    function wireContinueBtn() {
      var btn = document.getElementById("rw-contact-continue-btn");
      if (!btn) return;
      btn.onclick = function() {
        if (!allOk()) return;
        expandedByUser = false;
        showContinue(false);
        collapseFields();
        renderGreen(false, false);
        smoothScroll(fieldByQ("address"));
      };
    }

    function phoneOk() {
      var d = digitsOnly(val(phone));
      if (d.length === 11 && d.charAt(0) === "1") d = d.substring(1);
      return d.length >= 10;
    }
    function allOk() {
      return hasValue(first) && hasValue(last) && phoneOk();
    }
    function missing() {
      var m = [];
      if (!hasValue(first)) m.push("first name");
      if (!hasValue(last))  m.push("last name");
      if (!phoneOk()) m.push("phone number");
      if (m.length === 1) return m[0];
      if (m.length === 2) return m[0] + " and " + m[1];
      return m[0] + ", " + m[1] + ", and " + m[2];
    }
    function snap() { return val(first) + "|" + val(last) + "|" + digitsOnly(val(phone)); }

    function renderGreen(saved, editMode) {
      bar.className = "rw-card green";
      var nextLine = editMode ? "" :
        '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,.06);font-size:13px;font-weight:500;">' +
        'Next: confirm your property address below. 👇</div>';
      bar.innerHTML =
        '<div class="rw-card-title">👋 Nice to meet you' + (val(first) ? ", " + val(first) : "") + "!</div>" +
        '<div class="rw-card-body">' +
          "Your Roof Worx pro will call or text <b>" + formatPhone(val(phone)) + "</b> the morning of your appointment to confirm their arrival time." +
          "<br><br>" +
          '<span style="opacity:.85;">Being available lets us walk the property together, answer your questions, and tailor our guidance to your situation.</span>' +
        "</div>" +
        '<div style="margin-top:10px;">' +
          '<button type="button" class="rw-link-btn" id="rw-change-contact">→ Change best contact</button>' +
          '<div style="font-size:12px;opacity:.7;margin-top:3px;">(person that will be at the property)</div>' +
        "</div>" +
        (saved ? '<div style="margin-top:8px;font-size:13px;font-weight:600;">✅ Contact details updated.</div>' : "") +
        nextLine;
      var btn = document.getElementById("rw-change-contact");
      if (btn) {
        btn.onclick = function() {
          expandedByUser = true;
          expandFields();
          showContinue(true);
          wireContinueBtn();
          lastSnap = snap();
          try { first.focus(); } catch(e) {}
        };
      }
    }

    function renderRed() {
      bar.className = "rw-card red";
      showContinue(false);
      bar.innerHTML =
        "📞 <b>So your rep can reach you:</b> Please add your " + missing() + "." +
        '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,.06);font-size:13px;">Next: confirm your property address below. 👇</div>';
    }

    var savedTimer = null;

    function update() {
      var ok = allOk();
      var s = snap();
      var changed = (s !== lastSnap);

      if (!ok) {
        if (savedTimer) { clearTimeout(savedTimer); savedTimer = null; }
        expandedByUser = false;
        expandFields();
        renderRed();
        lastSnap = s;
        return;
      }

      if (expandedByUser) {
        showContinue(true);
        wireContinueBtn();
        if (changed) {
          renderGreen(true, true);
          if (savedTimer) clearTimeout(savedTimer);
          savedTimer = setTimeout(function() {
            if (expandedByUser) renderGreen(false, true);
          }, 1400);
          lastSnap = s;
        } else {
          renderGreen(false, true);
        }
        return;
      }

      showContinue(false);
      collapseFields();
      renderGreen(false, false);
      lastSnap = s;
    }

    update();
    first.addEventListener("input", update);
    last.addEventListener("input", update);
    phone.addEventListener("input", update);
    return true;
  }

  /* ═══════════════════════════════════════════
     SCRIPT 2 — GOOGLE PLACES ADDRESS
  ═══════════════════════════════════════════ */
  function hideAddrParts() {
    ["city","state","postal_code"].forEach(function(q) {
      var el = fieldByQ(q);
      if (!el) return;
      var w = closestWrap(el);
      if (w) w.style.display = "none";
    });
  }

  function initAddress() {
    var input = fieldByQ("address");
    if (!input) return false;

    hideAddrParts();
    tryEnable(input);

    var addrWrap = closestWrap(input);
    if (!addrWrap) return false;

    // Confirm card
    var card = document.getElementById("rw-addr-card");
    if (!card) {
      card = document.createElement("div");
      card.id = "rw-addr-card";
      card.className = "rw-card red";
      insertBefore(addrWrap, card);
    }

    var confirmed = false;

    function fullAddr() {
      var street = (input.value || "").trim();
      var city = fieldByQ("city");
      var st   = fieldByQ("state");
      var zip  = fieldByQ("postal_code");
      var parts = [street];
      if (city && city.value.trim()) parts.push(city.value.trim());
      if (st   && st.value.trim())   parts.push(st.value.trim());
      if (zip  && zip.value.trim())  parts.push(zip.value.trim());
      return parts.filter(Boolean).join(", ");
    }

    function showEmpty() {
      confirmed = false;
      addrWrap.classList.remove("rw-addr-collapsed");
      input.classList.remove("rw-addr-pulse");
      input.classList.add("rw-addr-empty");
      card.className = "rw-card red";
      card.innerHTML =
        '<div class="rw-card-title">Enter your property address</div>' +
        '<div class="rw-card-body">Start typing and select your property from the dropdown to confirm.</div>';
    }

    function showNeedsConfirm() {
      confirmed = false;
      addrWrap.classList.remove("rw-addr-collapsed");
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
      addrWrap.classList.add("rw-addr-collapsed");
      card.className = "rw-card green";
      card.innerHTML =
        '<div class="rw-card-title">📍 Address confirmed</div>' +
        '<div class="rw-card-body">Perfect — your Roof Worx pro will know exactly where to go.</div>' +
        '<div class="rw-addr-pill">' + fullAddr() + '</div>' +
        '<div class="rw-addr-actions">' +
          '<button type="button" class="rw-link-btn" id="rw-change-addr">Change address</button>' +
          ' <span style="opacity:.7;">· then add notes below and press <b>Book My Pro Consultation</b></span>' +
        '</div>';
      var chg = document.getElementById("rw-change-addr");
      if (chg) {
        chg.onclick = function() {
          confirmed = false;
          addrWrap.classList.remove("rw-addr-collapsed");
          try { input.focus(); } catch(e) {}
          showNeedsConfirm();
        };
      }
      smoothScroll(fieldByQ("appointment_details") || document.querySelector("textarea"));
    }

    function setupAutocomplete() {
      var ac = new window.google.maps.places.Autocomplete(input, { types: ["address"] });
      if (ac.setFields) ac.setFields(["address_component"]);

      ac.addListener("place_changed", function() {
        var place = ac.getPlace();
        if (!place || !place.address_components) return;
        var street = "";
        var city   = fieldByQ("city");
        var state  = fieldByQ("state");
        var zip    = fieldByQ("postal_code");

        place.address_components.forEach(function(comp) {
          var type = comp.types && comp.types[0];
          if (type === "street_number") { street = comp.short_name; }
          else if (type === "route") { street = (street ? street + " " : "") + comp.long_name; }
          else if (type === "locality" && city) { city.value = comp.long_name; fireInput(city); }
          else if (type === "administrative_area_level_1" && state) { state.value = comp.short_name; fireInput(state); }
          else if (type === "postal_code" && zip) { zip.value = comp.short_name; fireInput(zip); }
        });

        if (street) { input.value = street; fireInput(input); }
        showConfirmed();
        setTimeout(function() {
          var pac = document.querySelector(".pac-container");
          if (pac) pac.style.display = "none";
        }, 300);
      });
    }

    if (window.google && window.google.maps && window.google.maps.places) {
      setupAutocomplete();
    } else {
      var gmTries = 0;
      var gmWait = setInterval(function() {
        gmTries++;
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(gmWait); setupAutocomplete();
        }
        if (gmTries > 80) clearInterval(gmWait);
      }, 150);
    }

    if (!input.value.trim()) showEmpty();
    else showNeedsConfirm();

    input.addEventListener("focus", function() {
      tryEnable(input);
      if (!input.value.trim()) showEmpty();
      else if (!confirmed) showNeedsConfirm();
    });
    input.addEventListener("input", function() {
      tryEnable(input);
      if (!input.value.trim()) showEmpty();
      else if (!confirmed) showNeedsConfirm();
    });

    return true;
  }

  /* ═══════════════════════════════════════════
     SCRIPT 3 — APPOINTMENT DETAILS HINT
  ═══════════════════════════════════════════ */
  function initDetails() {
    var details = fieldByQ("appointment_details") || document.querySelector("textarea");
    if (!details) return false;

    var hint = document.getElementById("rw-details-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.id = "rw-details-hint";
      hint.className = "rw-card blue";
      hint.innerHTML =
        '💬 <b>Optional:</b> Add notes about your roof or project to help your rep arrive prepared for your appointment.';
      insertBefore(details, hint);
    }

    var cta = document.getElementById("rw-details-cta");
    if (!cta) {
      cta = document.createElement("div");
      cta.id = "rw-details-cta";
      cta.className = "rw-details-cta";
      cta.innerHTML =
        '<div class="rw-details-cta-title">✅ Address confirmed. You\'re ready to book.</div>' +
        '<div class="rw-details-cta-sub">Click <b>Book My Pro Consultation</b> below to lock in your time. Your rep will reach out to confirm details ahead of your appointment.</div>' +
        '<div class="rw-details-cta-next">Next Step: Click <b>Book My Pro Consultation</b> below 👇</div>';
      insertAfter(details, cta);
    }

    function isAddrConfirmed() {
      var card = document.getElementById("rw-addr-card");
      return card && card.className.indexOf("green") > -1;
    }

    function wordCount(v) {
      var t = (v || "").replace(/^\s+|\s+$/g, "");
      return t ? t.split(/\s+/).filter(Boolean).length : 0;
    }

    function sync() {
      cta.style.display = isAddrConfirmed() ? "block" : "none";
      if (wordCount(details.value) >= 2) {
        hint.className = "rw-card green";
        hint.innerHTML = '✅ <b>Thank you!</b> This helps your rep arrive prepared and makes your <b>Pro Consultation</b> more valuable.';
      } else {
        hint.className = "rw-card blue";
        hint.innerHTML = '💬 <b>Optional:</b> Add notes about your roof or project to help your rep arrive prepared for your appointment.';
      }
    }

    sync();
    details.addEventListener("input", sync);

    var pollTries = 0;
    (function poll() {
      pollTries++;
      sync();
      if (pollTries < 80) setTimeout(poll, 150);
    })();

    return true;
  }

  /* ═══════════════════════════════════════════
     BOOT — init all three
  ═══════════════════════════════════════════ */
  function boot() {
    injectStyles();
    hideAddrParts();

    var contactDone  = false;
    var addressDone  = false;
    var detailsDone  = false;
    var tries = 0;

    (function retry() {
      tries++;
      if (!contactDone) contactDone = initContact();
      if (!addressDone) addressDone = initAddress();
      if (!detailsDone) detailsDone = initDetails();
      if ((!contactDone || !addressDone || !detailsDone) && tries < 80) {
        setTimeout(retry, 100);
      }
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
