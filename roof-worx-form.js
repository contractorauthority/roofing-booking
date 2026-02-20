/**
 * Roof Worx — Combined Form Enhancement
 * =======================================
 * Script 1: Contact Status Card
 * Script 2: Google Places Address Autocomplete
 * Script 3: Appointment Details Hint
 *
 * Host: https://contractorauthority.github.io/roofing-booking/roof-worx-form.js
 *
 * HL Custom JS/HTML (one block):
 *   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAM1jRtR068AC7A5zK90RukGayTsGYxhpg&libraries=places"></script>
 *   <script src="https://contractorauthority.github.io/roofing-booking/roof-worx-form.js"></script>
 */

/* ═══════════════════════════════════════════════════════
   SCRIPT 1 — CONTACT STATUS CARD
═══════════════════════════════════════════════════════ */
(function () {
  function closestFieldWrap(el) {
    var node = el;
    var i = 0;
    while (node && i < 12) {
      if (node.className && typeof node.className === "string") {
        if (
          node.className.indexOf("form-group") > -1 ||
          node.className.indexOf("field-container") > -1 ||
          node.className.indexOf("col-") > -1
        ) return node;
      }
      node = node.parentElement;
      i++;
    }
    return el && el.parentElement ? el.parentElement : el;
  }

  function addStylesOnce() {
    if (document.getElementById("rw-contact-status-styles")) return;

    var css = document.createElement("style");
    css.id = "rw-contact-status-styles";
    css.type = "text/css";
    css.innerHTML =
      ".rw-contact-status{" +
        "margin:0 0 12px 0;" +
        "padding:14px 16px;" +
        "border-radius:12px;" +
        "font-size:14px;" +
        "line-height:1.55;" +
        "text-align:left;" +
        "border:1px solid rgba(0,0,0,0.06);" +
        "box-shadow:0 10px 24px rgba(0,0,0,0.06);" +
        "transition:background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;" +
      "}" +
      ".rw-contact-status.green{" +
        "background:rgba(0,128,0,0.08);" +
        "color:#111111;" +
        "border-color:rgba(31,90,42,0.12);" +
      "}" +
      ".rw-contact-status.red{" +
        "background:rgba(180,48,23,0.07);" +
        "color:#7a2717;" +
        "border-color:rgba(180,48,23,0.12);" +
      "}" +
      ".rw-contact-title{" +
        "font-size:27px;" +
        "line-height:1.25;" +
        "font-weight:750;" +
        "margin:0 0 8px 0;" +
        "letter-spacing:-0.2px;" +
      "}" +
      ".rw-contact-body{" +
        "font-size:14px;" +
        "line-height:1.6;" +
        "margin:0;" +
      "}" +
      ".rw-contact-sub{" +
        "margin-top:8px;" +
        "opacity:0.92;" +
      "}" +
      ".rw-link-btn{" +
        "background:transparent;" +
        "border:0;" +
        "padding:0;" +
        "color:inherit;" +
        "cursor:pointer;" +
        "font-weight:700;" +
        "border-bottom:1px solid rgba(0,0,0,0.22);" +
      "}" +
      ".rw-link-btn:hover{" +
        "border-bottom-color:rgba(0,0,0,0.45);" +
      "}" +
      ".rw-link-btn:active{" +
        "transform:translateY(1px);" +
      "}" +
      ".rw-contact-helper{" +
        "opacity:0.82;" +
        "font-size:13px;" +
        "line-height:1.35;" +
        "margin-top:2px;" +
      "}" +
      ".rw-next-step{" +
        "margin-top:12px;" +
        "padding-top:12px;" +
        "border-top:1px solid rgba(0,0,0,0.06);" +
        "font-size:13px;" +
        "font-weight:500;" +
        "opacity:0.92;" +
      "}" +
      ".rw-contact-status.green .rw-next-step{" +
        "color:#1f5a2a;" +
      "}" +
      ".rw-saved{" +
        "margin-top:10px;" +
        "font-size:13px;" +
        "font-weight:600;" +
        "opacity:0.95;" +
      "}" +
      ".rw-continue-under{" +
        "margin-top:10px;" +
        "text-align:left;" +
      "}" +
      ".rw-continue-under .rw-continue-btn{" +
        "background:transparent;" +
        "border:0;" +
        "padding:0;" +
        "cursor:pointer;" +
        "font-size:13px;" +
        "font-weight:750;" +
        "color:#111111;" +
        "border-bottom:1px solid rgba(0,0,0,0.22);" +
      "}" +
      ".rw-continue-under .rw-continue-btn:hover{" +
        "border-bottom-color:rgba(0,0,0,0.45);" +
      "}" +
      ".rw-contact-collapsed{ display:none !important; }";

    document.head.appendChild(css);
  }

  function val(input) {
    return input && input.value ? input.value.replace(/^\s+|\s+$/g, "") : "";
  }
  function hasValue(input) {
    return val(input).length > 0;
  }
  function digitsOnly(s) {
    return (s || "").replace(/\D+/g, "");
  }
  function formatPhone(raw) {
    var d = digitsOnly(raw);
    if (d.length === 11 && d.charAt(0) === "1") d = d.substring(1);
    if (d.length < 10) return raw || "";
    return "(" + d.substring(0,3) + ") " + d.substring(3,6) + "-" + d.substring(6,10);
  }
  function insertBeforeNode(targetNode, node) {
    if (!targetNode || !targetNode.parentNode) return false;
    targetNode.parentNode.insertBefore(node, targetNode);
    return true;
  }

  function scrollToAddress() {
    var addr = document.querySelector('[data-q="address"]') || document.querySelector('input[name="address"]');
    if (!addr) return;
    setTimeout(function () {
      try { addr.scrollIntoView({ behavior: "smooth", block: "center" }); }
      catch (e) { addr.scrollIntoView(true); }
    }, 180);
  }

  function ensureContinueUnder(phoneWrap) {
    if (!phoneWrap) return null;
    var existing = document.getElementById("rw-contact-continue-under");
    if (existing) return existing;

    var wrap = document.createElement("div");
    wrap.id = "rw-contact-continue-under";
    wrap.className = "rw-continue-under";
    wrap.style.display = "none";
    wrap.innerHTML =
      '<button type="button" class="rw-continue-btn" id="rw-contact-continue-btn">' +
        "Update the contact info <span style='white-space:nowrap;'>→ Then (click here) continue to next step👍</span>" +
      "</button>";

    if (phoneWrap.parentNode) {
      if (phoneWrap.nextSibling) phoneWrap.parentNode.insertBefore(wrap, phoneWrap.nextSibling);
      else phoneWrap.parentNode.appendChild(wrap);
    }
    return wrap;
  }

  function showContinueUnder(show) {
    var wrap = document.getElementById("rw-contact-continue-under");
    if (!wrap) return;
    wrap.style.display = show ? "block" : "none";
  }

  function initContactStatus() {
    var first = document.querySelector('[data-q="first_name"]') || document.querySelector('input[name="first_name"]');
    var last  = document.querySelector('[data-q="last_name"]')  || document.querySelector('input[name="last_name"]');
    var phone = document.querySelector('[data-q="phone"]')      || document.querySelector('input[name="phone"]');
    if (!first || !last || !phone) return false;

    addStylesOnce();

    var firstWrap = closestFieldWrap(first);
    var lastWrap  = closestFieldWrap(last);
    var phoneWrap = closestFieldWrap(phone);

    ensureContinueUnder(phoneWrap);

    var bar = document.getElementById("rw-contact-status");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "rw-contact-status";
      bar.className = "rw-contact-status red";
      if (!insertBeforeNode(firstWrap || first, bar)) return false;
    }

    var expandedByUser = false;
    var lastSnapshot = "";
    var savedTimer = null;

    function collapseFields() {
      if (firstWrap) firstWrap.classList.add("rw-contact-collapsed");
      if (lastWrap)  lastWrap.classList.add("rw-contact-collapsed");
      if (phoneWrap) phoneWrap.classList.add("rw-contact-collapsed");
    }

    function expandFields() {
      if (firstWrap) firstWrap.classList.remove("rw-contact-collapsed");
      if (lastWrap)  lastWrap.classList.remove("rw-contact-collapsed");
      if (phoneWrap) phoneWrap.classList.remove("rw-contact-collapsed");
    }

    function missingText(firstOk, lastOk, phoneOk) {
      var m = [];
      if (!firstOk) m.push("first name");
      if (!lastOk)  m.push("last name");
      if (!phoneOk) m.push("phone number");
      if (m.length === 1) return m[0];
      if (m.length === 2) return m[0] + " and " + m[1];
      return m[0] + ", " + m[1] + ", and " + m[2];
    }

    function currentSnapshot() {
      return (val(first) + "|" + val(last) + "|" + digitsOnly(val(phone)));
    }

    function clearTimers() {
      if (savedTimer) { clearTimeout(savedTimer); savedTimer = null; }
    }

    function allOkNow() {
      var firstOk = hasValue(first);
      var lastOk  = hasValue(last);
      var d = digitsOnly(val(phone));
      if (d.length === 11 && d.charAt(0) === "1") d = d.substring(1);
      var phoneOk = d.length >= 10;
      return firstOk && lastOk && phoneOk;
    }

    function wireContinue() {
      var cont = document.getElementById("rw-contact-continue-btn");
      if (!cont) return;
      cont.onclick = function () {
        if (!allOkNow()) return;
        clearTimers();
        expandedByUser = false;
        showContinueUnder(false);
        collapseFields();
        renderGreen(val(first), formatPhone(val(phone)), false, false);
        scrollToAddress();
      };
    }

    function renderGreen(firstName, phonePretty, showSaved, showEditingMode) {
      bar.classList.remove("red");
      bar.classList.add("green");

      var nextHtml = showEditingMode
        ? ""
        : '<div class="rw-next-step">Next: confirm your property address below. 👇</div>';

      bar.innerHTML =
        '<div class="rw-contact-title">👋 Nice to meet you' + (firstName ? ", " + firstName : "") + "!</div>" +
        '<div class="rw-contact-body">' +
          "Your assigned Roof Worx professional will call or text you the morning of your appointment at <b>" + phonePretty + "</b> to confirm their anticipated arrival time within your selected 2-hour window." +
          "<br><br>" +
          "<span style=\"opacity:.9\">Being available allows us to walk the property with you, provide a professional evaluation, answer your questions, and make sure our guidance is tailored to your property.</span>" +
          "<br><br>" +
        "</div>" +
        '<div style="margin-top:10px;">' +
          '<button type="button" class="rw-link-btn" id="rw-change-best-contact">→ Change best contact</button>' +
          '<div class="rw-contact-helper">(person that will be at property)</div>' +
        "</div>" +
        (showSaved ? '<div class="rw-saved">✅ Contact details updated.</div>' : "") +
        nextHtml;

      var btn = document.getElementById("rw-change-best-contact");
      if (btn) {
        btn.onclick = function () {
          clearTimers();
          expandedByUser = true;
          expandFields();
          showContinueUnder(true);
          wireContinue();
          lastSnapshot = currentSnapshot();
          try { first.focus(); } catch (e) {}
        };
      }
    }

    function renderRed(missing) {
      bar.classList.remove("green");
      bar.classList.add("red");
      showContinueUnder(false);
      bar.innerHTML =
        "\uD83D\uDCDE <b>So your rep can reach you:</b> Please add your " + missing + "." +
        '<div class="rw-next-step">Next: confirm your property address below. 👇</div>';
    }

    function update() {
      var firstOk = hasValue(first);
      var lastOk  = hasValue(last);
      var d = digitsOnly(val(phone));
      if (d.length === 11 && d.charAt(0) === "1") d = d.substring(1);
      var phoneOk = d.length >= 10;
      var allOk = firstOk && lastOk && phoneOk;
      var snap = currentSnapshot();
      var changed = (snap !== lastSnapshot);

      if (!allOk) {
        clearTimers();
        expandedByUser = false;
        expandFields();
        renderRed(missingText(firstOk, lastOk, phoneOk));
        lastSnapshot = snap;
        return;
      }

      if (expandedByUser) {
        showContinueUnder(true);
        wireContinue();
        if (changed) {
          renderGreen(val(first), formatPhone(val(phone)), true, true);
          clearTimers();
          savedTimer = setTimeout(function () {
            if (expandedByUser) {
              renderGreen(val(first), formatPhone(val(phone)), false, true);
              showContinueUnder(true);
              wireContinue();
            }
          }, 1400);
          lastSnapshot = snap;
        } else {
          renderGreen(val(first), formatPhone(val(phone)), false, true);
        }
        return;
      }

      showContinueUnder(false);
      collapseFields();
      renderGreen(val(first), formatPhone(val(phone)), false, false);
      lastSnapshot = snap;
    }

    update();
    first.addEventListener("input", update);
    last.addEventListener("input", update);
    phone.addEventListener("input", update);
    return true;
  }

  function boot() {
    var tries = 0;
    (function retry() {
      tries++;
      if (initContactStatus()) return;
      if (tries < 80) setTimeout(retry, 100);
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();


/* ═══════════════════════════════════════════════════════
   SCRIPT 2 — GOOGLE PLACES ADDRESS AUTOCOMPLETE
═══════════════════════════════════════════════════════ */
(function () {
  function closestFieldWrap(el) {
    var node = el;
    var i = 0;
    while (node && i < 12) {
      if (node.className && typeof node.className === "string") {
        if (
          node.className.indexOf("form-group") > -1 ||
          node.className.indexOf("field-container") > -1 ||
          node.className.indexOf("col-") > -1
        ) return node;
      }
      node = node.parentElement;
      i++;
    }
    return el && el.parentElement ? el.parentElement : el;
  }

  function fieldByQ(q) {
    return document.querySelector('[data-q="' + q + '"]') ||
           document.querySelector('input[name="' + q + '"]') ||
           document.querySelector('textarea[name="' + q + '"]');
  }

  function hideFieldByQ(q) {
    var el = fieldByQ(q);
    if (!el) return;
    var wrap = closestFieldWrap(el);
    if (wrap && wrap.style) wrap.style.display = "none";
  }

  function hideAddressParts() {
    hideFieldByQ("city");
    hideFieldByQ("state");
    hideFieldByQ("postal_code");
  }

  function addStylesOnce() {
    if (document.getElementById("rw-address-styles")) return;

    var css = document.createElement("style");
    css.id = "rw-address-styles";
    css.type = "text/css";
    css.innerHTML =
      ".rw-confirm-card{" +
        "margin:0 0 12px 0;" +
        "padding:14px 16px;" +
        "border-radius:12px;" +
        "font-size:14px;" +
        "line-height:1.5;" +
        "text-align:left;" +
        "border:1px solid rgba(0,0,0,0.06);" +
        "box-shadow:0 10px 24px rgba(0,0,0,0.06);" +
        "transition:background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;" +
      "}" +
      ".rw-confirm-card.red{" +
        "background:rgba(180,48,23,0.07);" +
        "color:#111111;" +
        "border-color:rgba(180,48,23,0.14);" +
      "}" +
      ".rw-confirm-card.green{" +
        "background:rgba(0,128,0,0.08);" +
        "color:#111111;" +
        "border-color:rgba(31,90,42,0.12);" +
      "}" +
      ".rw-confirm-title{" +
        "font-weight:750;" +
        "margin:0 0 6px 0;" +
        "font-size:15px;" +
      "}" +
      ".rw-confirm-sub{" +
        "opacity:0.92;" +
        "margin:0;" +
        "font-size:13px;" +
        "line-height:1.45;" +
      "}" +
      ".rw-confirm-addr{" +
        "margin:12px 0 0 0;" +
        "padding:10px 12px;" +
        "border-radius:10px;" +
        "background:#ffffff;" +
        "color:#111111;" +
        "border:1px solid rgba(0,0,0,0.10);" +
        "font-weight:650;" +
      "}" +
      ".rw-confirm-actions{" +
        "margin:10px 0 0 0;" +
        "display:flex;" +
        "gap:10px;" +
        "flex-wrap:wrap;" +
        "align-items:center;" +
        "font-size:13px;" +
        "opacity:0.95;" +
      "}" +
      ".rw-confirm-btn{" +
        "display:block;" +
        "width:100%;" +
        "margin:12px 0 0 0;" +
        "padding:12px 14px;" +
        "border-radius:12px;" +
        "border:1px solid rgba(180,48,23,0.26);" +
        "background:rgba(180,48,23,0.12);" +
        "color:#111111;" +
        "font-size:14px;" +
        "font-weight:900;" +
        "cursor:pointer;" +
        "text-align:center;" +
        "box-shadow:0 12px 26px rgba(0,0,0,0.10);" +
        "transition:background 0.2s ease, box-shadow 0.2s ease, transform 0.06s ease;" +
      "}" +
      ".rw-confirm-btn:hover{" +
        "background:rgba(180,48,23,0.16);" +
        "box-shadow:0 16px 34px rgba(0,0,0,0.14);" +
        "transform:translateY(-1px);" +
      "}" +
      ".rw-confirm-btn:active{" +
        "transform:translateY(0px) scale(0.99);" +
      "}" +
      "[data-q='address']{" +
        "background:#ffffff !important;" +
        "color:#111111 !important;" +
      "}" +
      ".rw-address-empty{" +
        "border:3px solid rgba(0,128,0,0.38) !important;" +
        "border-radius:12px !important;" +
        "box-shadow:0 0 0 6px rgba(0,128,0,0.10) !important;" +
      "}" +
      ".rw-address-pulse{" +
        "animation: rwPulse 1.25s ease-in-out infinite;" +
        "border:2px solid rgba(180,48,23,0.45) !important;" +
        "box-shadow: 0 0 0 6px rgba(180,48,23,0.10) !important;" +
      "}" +
      "@keyframes rwPulse{" +
        "0%{ box-shadow: 0 0 0 0 rgba(180,48,23,0.22); }" +
        "70%{ box-shadow: 0 0 0 10px rgba(180,48,23,0.00); }" +
        "100%{ box-shadow: 0 0 0 0 rgba(180,48,23,0.00); }" +
      "}" +
      ".rw-address-collapsed [data-q='address']{" +
        "display:none !important;" +
      "}" +
      ".rw-address-collapsed label{" +
        "display:none !important;" +
      "}";
    document.head.appendChild(css);
  }

  function tryEnableInput(input) {
    try { input.removeAttribute("readonly"); } catch (e) {}
    try { input.removeAttribute("disabled"); } catch (e) {}
  }

  function ensureCard(addressWrap) {
    var existing = document.getElementById("rw-confirm-card");
    if (existing) return existing;

    var card = document.createElement("div");
    card.id = "rw-confirm-card";
    card.className = "rw-confirm-card red";

    var title = document.createElement("div");
    title.className = "rw-confirm-title";
    title.id = "rw-confirm-title";

    var sub = document.createElement("div");
    sub.className = "rw-confirm-sub";
    sub.id = "rw-confirm-sub";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "rw-confirm-btn";
    btn.className = "rw-confirm-btn";

    var addr = document.createElement("div");
    addr.id = "rw-confirm-addr";
    addr.className = "rw-confirm-addr";
    addr.style.display = "none";

    var actions = document.createElement("div");
    actions.id = "rw-confirm-actions";
    actions.className = "rw-confirm-actions";
    actions.style.display = "none";
    actions.innerHTML =
      '<button type="button" class="rw-link-btn" id="rw-change-address">Change address</button>' +
      '<span>or add notes below, then press <b>Book Your Pro Consultation</b>.</span>';

    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(btn);
    card.appendChild(addr);
    card.appendChild(actions);

    if (addressWrap && addressWrap.parentNode) {
      addressWrap.parentNode.insertBefore(card, addressWrap);
    }

    return card;
  }

  function setCardState(state, titleHtml, subHtml, btnLabel, showBtn) {
    var card = document.getElementById("rw-confirm-card");
    if (!card) return;
    card.classList.remove("red");
    card.classList.remove("green");
    card.classList.add(state);
    var t = document.getElementById("rw-confirm-title");
    var s = document.getElementById("rw-confirm-sub");
    var b = document.getElementById("rw-confirm-btn");
    var addr = document.getElementById("rw-confirm-addr");
    var actions = document.getElementById("rw-confirm-actions");
    if (t) t.innerHTML = titleHtml || "";
    if (s) s.innerHTML = subHtml || "";
    if (b) {
      if (btnLabel) b.innerHTML = btnLabel;
      b.style.display = showBtn ? "block" : "none";
    }
    if (addr) addr.style.display = "none";
    if (actions) actions.style.display = "none";
  }

  function scrollToNotes() {
    var notes = document.querySelector('[data-q="appointment_details"]') || document.querySelector("textarea");
    if (!notes) return;
    setTimeout(function () {
      try { notes.scrollIntoView({ behavior: "smooth", block: "center" }); }
      catch (err) { notes.scrollIntoView(true); }
    }, 250);
  }

  function initAutocomplete() {
    var input = fieldByQ("address");
    if (!input) return;

    addStylesOnce();
    hideAddressParts();
    tryEnableInput(input);

    var addressWrap = closestFieldWrap(input);
    if (!addressWrap) return;

    ensureCard(addressWrap);

    function collapseAddress() {
      if (addressWrap) addressWrap.classList.add("rw-address-collapsed");
    }

    function expandAddress() {
      if (addressWrap) addressWrap.classList.remove("rw-address-collapsed");
    }

    function hasValueNow() {
      return !!(input.value && input.value.replace(/\s+/g, "").length > 0);
    }

    function setEmptyHighlight(on) {
      if (!input) return;
      if (on) input.classList.add("rw-address-empty");
      else input.classList.remove("rw-address-empty");
    }

    function fullAddressString() {
      var street = (input.value || "").replace(/\s+/g, " ").trim();
      var cityEl   = fieldByQ("city");
      var stateEl  = fieldByQ("state");
      var zipEl    = fieldByQ("postal_code");
      var city  = cityEl  && cityEl.value  ? cityEl.value.trim()  : "";
      var st    = stateEl && stateEl.value ? stateEl.value.trim() : "";
      var zip   = zipEl   && zipEl.value   ? zipEl.value.trim()   : "";
      var line2 = "";
      if (city) line2 += city;
      if (st)   line2 += (line2 ? ", " : "") + st;
      if (zip)  line2 += (line2 ? " " : "") + zip;
      return street + (line2 ? " - " + line2 : "");
    }

    var confirmed = false;

    function showEmpty() {
      confirmed = false;
      expandAddress();
      input.classList.remove("rw-address-pulse");
      setEmptyHighlight(true);
      setCardState("red", "Enter your street address", "Start typing and select the correct property from the dropdown list.", "", false);
    }

    function showNeedsConfirm(isInitialPrefill) {
      confirmed = false;
      expandAddress();
      input.classList.add("rw-address-pulse");
      setEmptyHighlight(false);
      if (isInitialPrefill) {
        setCardState("red", "Confirm your property address for your <b>Pro Consultation</b>", "Your address was pre-filled. Click below to open the Google Maps dropdown and select the correct property to confirm. \uD83D\uDC47", "\uD83D\uDCCD Open Google Maps dropdown", true);
      } else {
        setCardState("red", "Confirm your property address for your <b>Pro Consultation</b>", "Select the correct property from the dropdown list to confirm.", "", false);
      }
    }

    function showConfirmed() {
      confirmed = true;
      input.classList.remove("rw-address-pulse");
      setEmptyHighlight(false);
      collapseAddress();
      setCardState("green", "\uD83D\uDC4D Address confirmed", "Perfect. Add any helpful notes below, then press <b>Book Your Pro Consultation</b>.", "", false);
      var addr = document.getElementById("rw-confirm-addr");
      var actions = document.getElementById("rw-confirm-actions");
      if (addr) {
        addr.textContent = fullAddressString() || (input.value || "");
        addr.style.display = "block";
      }
      if (actions) actions.style.display = "flex";
      scrollToNotes();
    }

    var changeBtn = document.getElementById("rw-change-address");
    if (changeBtn) {
      changeBtn.addEventListener("click", function () {
        confirmed = false;
        expandAddress();
        try { input.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { input.scrollIntoView(true); }
        setTimeout(function () {
          try { input.focus(); } catch (err) {}
          showNeedsConfirm(false);
        }, 150);
      });
    }

    var btn = document.getElementById("rw-confirm-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        tryEnableInput(input);
        try { input.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (err) { input.scrollIntoView(true); }
        setTimeout(function () {
          try { input.focus(); } catch (e) {}
          // Trigger dropdown by dispatching a keyboard event
          try {
            var v = input.value || "";
            input.value = v + " ";
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.value = v;
            input.dispatchEvent(new Event("input", { bubbles: true }));
          } catch (e2) {}
        }, 120);
      });
    }

    var componentForm = {
      street_number: "short_name",
      route: "long_name",
      locality: "long_name",
      administrative_area_level_1: "short_name",
      country: "long_name",
      postal_code: "short_name"
    };

    var autocomplete = new google.maps.places.Autocomplete(input, { types: ["address"] });
    if (autocomplete.setFields) autocomplete.setFields(["address_component"]);

    autocomplete.addListener("place_changed", function () {
      var place = autocomplete.getPlace();
      if (!place || !place.address_components) return;

      var cityEl   = fieldByQ("city");
      var stateEl  = fieldByQ("state");
      var zipEl    = fieldByQ("postal_code");
      var street = "";

      for (var i = 0; i < place.address_components.length; i++) {
        var comp = place.address_components[i];
        var type = comp.types && comp.types[0];
        var key  = componentForm[type];
        if (!key) continue;
        var v = comp[key];
        if (type === "street_number") street = v;
        else if (type === "route") street = (street ? street + " " : "") + v;
        else if (type === "locality"                    && cityEl)  cityEl.value  = v;
        else if (type === "administrative_area_level_1" && stateEl) stateEl.value = v;
        else if (type === "postal_code"                 && zipEl)   zipEl.value   = v;
      }

      if (street) input.value = street;

      // Fire change events using modern API (no createEvent/initEvent)
      var ev = new Event("input", { bubbles: true });
      input.dispatchEvent(ev);
      if (cityEl)  cityEl.dispatchEvent(ev);
      if (stateEl) stateEl.dispatchEvent(ev);
      if (zipEl)   zipEl.dispatchEvent(ev);

      showConfirmed();

      setTimeout(function () {
        var pac = document.querySelector(".pac-container");
        if (pac) pac.style.display = "none";
      }, 300);
    });

    if (!hasValueNow()) showEmpty();
    else showNeedsConfirm(true);

    if (hasValueNow()) {
      setTimeout(function () {
        try { input.scrollIntoView({ behavior: "smooth", block: "center" }); }
        catch (err) { input.scrollIntoView(true); }
      }, 250);
    }

    input.addEventListener("focus", function () {
      tryEnableInput(input);
      if (!hasValueNow()) showEmpty();
      else if (!confirmed) showNeedsConfirm(false);
    });

    input.addEventListener("input", function () {
      tryEnableInput(input);
      if (!hasValueNow()) showEmpty();
      else { confirmed = false; showNeedsConfirm(false); }
    });
  }

  function boot() {
    hideAddressParts();
    var tries = 0;
    function waitForGoogle() {
      tries++;
      if (window.google && google.maps && google.maps.places) {
        initAutocomplete();
        return;
      }
      if (tries < 60) setTimeout(waitForGoogle, 100);
    }
    waitForGoogle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();


/* ═══════════════════════════════════════════════════════
   SCRIPT 3 — APPOINTMENT DETAILS HINT
═══════════════════════════════════════════════════════ */
(function () {
  function addStylesOnce() {
    if (document.getElementById("rw-details-hint-styles")) return;
    var css = document.createElement("style");
    css.id = "rw-details-hint-styles";
    css.type = "text/css";
    css.innerHTML =
      ".rw-details-hint{" +
        "margin:0 0 12px 0;" +
        "padding:12px 14px;" +
        "border-radius:12px;" +
        "font-size:14px;" +
        "line-height:1.5;" +
        "text-align:left;" +
        "border:1px solid rgba(0,0,0,0.06);" +
        "box-shadow:0 10px 24px rgba(0,0,0,0.06);" +
        "transition:background 0.25s ease, color 0.25s ease, border-color 0.25s ease;" +
      "}" +
      ".rw-details-hint.neutral{" +
        "background:rgba(59,130,246,0.08);" +
        "color:#111111;" +
        "border-color:rgba(30,58,138,0.10);" +
      "}" +
      ".rw-details-hint.green{" +
        "background:rgba(0,128,0,0.08);" +
        "color:#111111;" +
        "border-color:rgba(31,90,42,0.12);" +
      "}" +
      ".rw-details-hint b{ font-weight:650; }" +
      ".rw-notes-cta{" +
        "display:none;" +
        "margin:12px 0 0 0;" +
        "padding:12px 14px;" +
        "border-radius:12px;" +
        "border:1px solid rgba(0,0,0,0.06);" +
        "box-shadow:0 10px 24px rgba(0,0,0,0.06);" +
        "background:rgba(0,128,0,0.08);" +
        "color:#111111;" +
        "text-align:left;" +
      "}" +
      ".rw-notes-cta .rw-cta-title{font-size:14px;font-weight:750;line-height:1.35;margin:0;}" +
      ".rw-notes-cta .rw-cta-sub{margin-top:6px;font-size:13px;line-height:1.45;opacity:0.92;}" +
      ".rw-notes-cta .rw-cta-divider{" +
        "margin-top:10px;" +
        "padding-top:10px;" +
        "border-top:1px solid rgba(0,0,0,0.06);" +
        "font-size:19px;" +
        "font-weight:333;" +
        "color:#1f5a2a;" +
      "}";
    document.head.appendChild(css);
  }

  function insertAbove(el, node) {
    if (!el || !el.parentElement) return;
    el.parentElement.insertBefore(node, el);
  }

  function insertAfter(el, node) {
    if (!el || !el.parentElement) return;
    if (el.nextSibling) el.parentElement.insertBefore(node, el.nextSibling);
    else el.parentElement.appendChild(node);
  }

  function wordCount(v) {
    var t = (v || "").replace(/^\s+|\s+$/g, "");
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
  }

  function isAddressConfirmed() {
    var collapsed = document.querySelector(".rw-address-collapsed");
    if (collapsed) return true;
    var card = document.getElementById("rw-confirm-card");
    if (card && card.className && card.className.indexOf("green") > -1) return true;
    return false;
  }

  function initDetailsHint() {
    addStylesOnce();

    // Use data-q to find the textarea regardless of random name attr
    var details = document.querySelector('[data-q="appointment_details"]') || document.querySelector("textarea");
    if (!details) return false;

    var hint = document.getElementById("rw-details-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.id = "rw-details-hint";
      hint.className = "rw-details-hint neutral";
      hint.innerHTML = "\uD83D\uDCAC <b>Optional:</b> Add notes about your roof or gutter project to help your assigned rep arrive prepared for your appointment.";
      insertAbove(details, hint);
    }

    var cta = document.getElementById("rw-notes-cta");
    if (!cta) {
      cta = document.createElement("div");
      cta.id = "rw-notes-cta";
      cta.className = "rw-notes-cta";
      cta.innerHTML =
        '<div class="rw-cta-title">\u2705 Address confirmed. You\'re ready to book.</div>' +
        '<div class="rw-cta-sub">Click <b>Book Your Pro Consultation</b> below to lock in your time. We\'ll reach out to confirm details and your anticipated arrival time within your selected 2-hour window.</div>' +
        '<div class="rw-cta-divider">Next Step: Click the <b>Book Your Pro Consultation</b> button below \uD83D\uDC47</div>';
      insertAfter(details, cta);
    }

    function syncUI() {
      cta.style.display = isAddressConfirmed() ? "block" : "none";
      if (wordCount(details.value) >= 2) {
        hint.className = "rw-details-hint green";
        hint.innerHTML = "\u2705 <b>Thank you!</b> This helps your assigned rep arrive prepared and makes your <b>Pro Consultation</b> more efficient.";
      } else {
        hint.className = "rw-details-hint neutral";
        hint.innerHTML = "\uD83D\uDCAC <b>Optional:</b> Add notes about your roof or gutter project to help your assigned rep arrive prepared for your appointment.";
      }
    }

    syncUI();
    details.addEventListener("input", syncUI);

    var tries = 0;
    (function poll() {
      tries++;
      syncUI();
      if (tries < 80) setTimeout(poll, 150);
    })();

    return true;
  }

  function boot() {
    var tries = 0;
    (function retry() {
      tries++;
      if (initDetailsHint()) return;
      if (tries < 60) setTimeout(retry, 100);
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
