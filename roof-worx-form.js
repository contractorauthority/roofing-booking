/**
 * Roof Worx — Combined Form Enhancement
 * =======================================
 * Script 1: Contact Status Card
 * Script 2: Google Places Address Autocomplete
 * Script 3: Appointment Details Hint
 *
 * HL Custom JS/HTML — ONE block, ONE line:
 *   <script src="https://contractorauthority.github.io/roofing-booking/roof-worx-form.js"></script>
 */

/* ── Load Google Maps dynamically with callback ── */
(function() {
  if (window.google && window.google.maps && window.google.maps.places) return;
  window.__rwGMReady = function() { window.__rwGMLoaded = true; };
  var s = document.createElement("script");
  s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAM1jRtR068AC7A5zK90RukGayTsGYxhpg&libraries=places&callback=__rwGMReady";
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
})();


/* ═══════════════════════════════════════════════════════
   SCRIPT 1 — CONTACT STATUS CARD
═══════════════════════════════════════════════════════ */
(function () {
  function closestFieldWrap(el) {
    var node = el, i = 0;
    while (node && i < 12) {
      if (node.className && typeof node.className === "string") {
        if (node.className.indexOf("form-group") > -1 ||
            node.className.indexOf("field-container") > -1 ||
            node.className.indexOf("col-") > -1) return node;
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
    css.innerHTML =
      ".rw-contact-status{margin:0 0 12px;padding:14px 16px;border-radius:12px;font-size:14px;line-height:1.55;text-align:left;border:1px solid rgba(0,0,0,0.06);box-shadow:0 10px 24px rgba(0,0,0,0.06);transition:background .25s,border-color .25s;}" +
      ".rw-contact-status.green{background:rgba(0,128,0,0.08);color:#111;border-color:rgba(31,90,42,0.12);}" +
      ".rw-contact-status.red{background:rgba(180,48,23,0.07);color:#7a2717;border-color:rgba(180,48,23,0.12);}" +
      ".rw-contact-title{font-size:27px;line-height:1.25;font-weight:750;margin:0 0 8px;letter-spacing:-.2px;}" +
      ".rw-contact-body{font-size:14px;line-height:1.6;margin:0;}" +
      ".rw-link-btn{background:transparent;border:0;padding:0;color:inherit;cursor:pointer;font-weight:700;border-bottom:1px solid rgba(0,0,0,.22);}" +
      ".rw-link-btn:hover{border-bottom-color:rgba(0,0,0,.45);}" +
      ".rw-contact-helper{opacity:.82;font-size:13px;line-height:1.35;margin-top:2px;}" +
      ".rw-next-step{margin-top:12px;padding-top:12px;border-top:1px solid rgba(0,0,0,.06);font-size:13px;font-weight:500;opacity:.92;}" +
      ".rw-contact-status.green .rw-next-step{color:#1f5a2a;}" +
      ".rw-saved{margin-top:10px;font-size:13px;font-weight:600;opacity:.95;}" +
      ".rw-continue-under{margin-top:10px;text-align:left;}" +
      ".rw-continue-under .rw-continue-btn{background:transparent;border:0;padding:0;cursor:pointer;font-size:13px;font-weight:750;color:#111;border-bottom:1px solid rgba(0,0,0,.22);}" +
      ".rw-contact-collapsed{display:none !important;}" +
      /* ── ADDITION: Next/Back button styles ── */
      ".rw-nav-row{margin-top:14px;display:flex;gap:10px;align-items:center;}" +
      ".rw-btn-next{flex:1;padding:15px 18px;border-radius:12px;border:none;font-size:15px;font-weight:800;cursor:pointer;transition:background .2s,transform .1s;}" +
      ".rw-btn-next.on{background:#b43017;color:#fff;box-shadow:0 6px 16px rgba(180,48,23,.3);}" +
      ".rw-btn-next.on:hover{background:#9a2912;transform:translateY(-1px);}" +
      ".rw-btn-next.on:active{transform:translateY(0);}" +
      ".rw-btn-next.off{background:#e8e8e8;color:#aaa;cursor:not-allowed;}" +
      ".rw-btn-back{padding:15px 18px;border-radius:12px;border:2px solid rgba(0,0,0,.12);background:#fff;font-size:15px;font-weight:700;color:#555;cursor:pointer;transition:border-color .2s,color .2s;}" +
      ".rw-btn-back:hover{border-color:rgba(0,0,0,.3);color:#111;}";
    document.head.appendChild(css);
  }

  function byQ(q) {
    return document.querySelector('[data-q="' + q + '"]') || document.querySelector('input[name="' + q + '"]');
  }
  function val(el) { return el && el.value ? el.value.replace(/^\s+|\s+$/g,"") : ""; }
  function hasVal(el) { return val(el).length > 0; }
  function digits(s) { return (s||"").replace(/\D+/g,""); }
  function fmtPhone(raw) {
    var d = digits(raw);
    if (d.length===11 && d[0]==="1") d=d.substring(1);
    if (d.length<10) return raw||"";
    return "("+d.substring(0,3)+") "+d.substring(3,6)+"-"+d.substring(6,10);
  }

  function initContactStatus() {
    var first = byQ("first_name"), last = byQ("last_name"), phone = byQ("phone");
    if (!first||!last||!phone) return false;
    addStylesOnce();

    var firstWrap = closestFieldWrap(first);
    var lastWrap  = closestFieldWrap(last);
    var phoneWrap = closestFieldWrap(phone);

    if (!document.getElementById("rw-contact-continue-under") && phoneWrap) {
      var cw = document.createElement("div");
      cw.id = "rw-contact-continue-under";
      cw.className = "rw-continue-under";
      cw.style.display = "none";
      cw.innerHTML = '<button type="button" class="rw-continue-btn" id="rw-contact-continue-btn">Update the contact info <span style="white-space:nowrap;">\u2192 Then (click here) continue to next step\uD83D\uDC4D</span></button>';
      if (phoneWrap.nextSibling) phoneWrap.parentNode.insertBefore(cw, phoneWrap.nextSibling);
      else phoneWrap.parentNode.appendChild(cw);
    }

    var bar = document.getElementById("rw-contact-status");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "rw-contact-status";
      bar.className = "rw-contact-status red";
      if (!(firstWrap||first).parentNode) return false;
      (firstWrap||first).parentNode.insertBefore(bar, firstWrap||first);
    }

    var expandedByUser = false, lastSnap = "", savedTimer = null;

    function collapse() { [firstWrap,lastWrap,phoneWrap].forEach(function(w){if(w)w.classList.add("rw-contact-collapsed");}); }
    function expand()   { [firstWrap,lastWrap,phoneWrap].forEach(function(w){if(w)w.classList.remove("rw-contact-collapsed");}); }
    function showCont(v) { var el=document.getElementById("rw-contact-continue-under"); if(el)el.style.display=v?"block":"none"; }
    function phoneOk() { var d=digits(val(phone)); if(d.length===11&&d[0]==="1")d=d.substring(1); return d.length>=10; }
    function allOk() { return hasVal(first)&&hasVal(last)&&phoneOk(); }
    function snap() { return val(first)+"|"+val(last)+"|"+digits(val(phone)); }
    function missing() {
      var m=[];
      if(!hasVal(first))m.push("first name");
      if(!hasVal(last))m.push("last name");
      if(!phoneOk())m.push("phone number");
      return m.length===1?m[0]:m.length===2?m[0]+" and "+m[1]:m[0]+", "+m[1]+", and "+m[2];
    }

    function wireContinue() {
      var btn = document.getElementById("rw-contact-continue-btn");
      if (!btn) return;
      btn.onclick = function() {
        if (!allOk()) return;
        if (savedTimer) clearTimeout(savedTimer);
        expandedByUser = false;
        showCont(false);
        collapse();
        renderGreen(false, false);
      };
    }

    function renderGreen(saved, editing) {
      bar.className = "rw-contact-status green";
      bar.innerHTML =
        '<div class="rw-contact-title">\uD83D\uDC4B Nice to meet you' + (val(first)?", "+val(first):"") + "!</div>" +
        '<div class="rw-contact-body">Your assigned Roof Worx professional will call or text you the morning of your appointment at <b>' + fmtPhone(val(phone)) + '</b> to confirm their anticipated arrival time within your selected 2-hour window.<br><br>' +
        '<span style="opacity:.9">Being available allows us to walk the property with you, provide a professional evaluation, answer your questions, and make sure our guidance is tailored to your property.</span><br><br></div>' +
        '<div style="margin-top:10px;"><button type="button" class="rw-link-btn" id="rw-change-best-contact">\u2192 Change best contact</button>' +
        '<div class="rw-contact-helper">(person that will be at property)</div></div>' +
        (saved ? '<div class="rw-saved">\u2705 Contact details updated.</div>' : "") +
        (editing ? "" : "");
      var btn = document.getElementById("rw-change-best-contact");
      if (btn) btn.onclick = function() {
        if (savedTimer) clearTimeout(savedTimer);
        expandedByUser = true;
        expand();
        showCont(true);
        wireContinue();
        lastSnap = snap();
        try{first.focus();}catch(e){}
      };
    }

    function renderRed() {
      bar.className = "rw-contact-status red";
      showCont(false);
      bar.innerHTML = "\uD83D\uDCDE <b>So your rep can reach you:</b> Please add your " + missing() +
        '.';
    }

    function update() {
      var ok = allOk(), s = snap(), changed = s!==lastSnap;
      if (!ok) {
        if(savedTimer)clearTimeout(savedTimer);
        expandedByUser=false; expand(); renderRed(); lastSnap=s; return;
      }
      if (expandedByUser) {
        showCont(true); wireContinue();
        if (changed) {
          renderGreen(true,true);
          if(savedTimer)clearTimeout(savedTimer);
          savedTimer=setTimeout(function(){if(expandedByUser){renderGreen(false,true);showCont(true);wireContinue();}},1400);
          lastSnap=s;
        } else renderGreen(false,true);
        return;
      }
      showCont(false); collapse(); renderGreen(false,false); lastSnap=s;
    }

    update();
    first.addEventListener("input",update);
    last.addEventListener("input",update);
    phone.addEventListener("input",update);
    return true;
  }

  (function boot() {
    var t=0;
    (function retry(){ t++; if(initContactStatus())return; if(t<80)setTimeout(retry,100); })();
  })();
})();


/* ═══════════════════════════════════════════════════════
   SCRIPT 2 — GOOGLE PLACES ADDRESS AUTOCOMPLETE
═══════════════════════════════════════════════════════ */
(function () {
  function byQ(q) {
    return document.querySelector('[data-q="' + q + '"]') ||
           document.querySelector('input[name="' + q + '"]');
  }
  function closestFieldWrap(el) {
    var node = el, i = 0;
    while (node && i < 12) {
      if (node.className && typeof node.className === "string") {
        if (node.className.indexOf("form-group") > -1 ||
            node.className.indexOf("field-container") > -1 ||
            node.className.indexOf("col-") > -1) return node;
      }
      node = node.parentElement;
      i++;
    }
    return el && el.parentElement ? el.parentElement : el;
  }
  function findInsertWrap(el) {
    var node = el, i = 0;
    while (node && i < 14) {
      if (node.className && typeof node.className === "string") {
        if (node.className.indexOf("form-field-wrapper") > -1) return node;
      }
      node = node.parentElement;
      i++;
    }
    return closestFieldWrap(el);
  }

  function hideAddressParts() {
    ["city","state","postal_code"].forEach(function(q) {
      var el = byQ(q);
      if (!el) return;
      var wrap = closestFieldWrap(el);
      if (wrap) wrap.style.display = "none";
    });
  }

  function addStylesOnce() {
    if (document.getElementById("rw-address-styles")) return;
    var css = document.createElement("style");
    css.id = "rw-address-styles";
    css.innerHTML =
      ".rw-confirm-card{margin:0 0 12px;padding:14px 16px;border-radius:12px;font-size:14px;line-height:1.5;text-align:left;border:1px solid rgba(0,0,0,.06);box-shadow:0 10px 24px rgba(0,0,0,.06);transition:background .25s,border-color .25s;}" +
      ".rw-confirm-card.red{background:rgba(180,48,23,.07);color:#111;border-color:rgba(180,48,23,.14);}" +
      ".rw-confirm-card.green{background:rgba(0,128,0,.08);color:#111;border-color:rgba(31,90,42,.12);}" +
      ".rw-confirm-title{font-weight:750;margin:0 0 6px;font-size:15px;}" +
      ".rw-confirm-sub{opacity:.92;margin:0;font-size:13px;line-height:1.45;}" +
      ".rw-confirm-addr{margin:12px 0 0;padding:10px 12px;border-radius:10px;background:#fff;color:#111;border:1px solid rgba(0,0,0,.10);font-weight:650;}" +
      ".rw-confirm-actions{margin:10px 0 0;display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:13px;opacity:.95;}" +
      ".rw-confirm-btn{display:block;width:100%;margin:12px 0 0;padding:12px 14px;border-radius:12px;border:1px solid rgba(180,48,23,.26);background:rgba(180,48,23,.12);color:#111;font-size:14px;font-weight:900;cursor:pointer;text-align:center;box-shadow:0 12px 26px rgba(0,0,0,.10);transition:background .2s,box-shadow .2s,transform .06s;}" +
      ".rw-confirm-btn:hover{background:rgba(180,48,23,.16);box-shadow:0 16px 34px rgba(0,0,0,.14);transform:translateY(-1px);}" +
      ".rw-confirm-btn:active{transform:scale(.99);}" +
      "[data-q='address']{background:#fff !important;color:#111 !important;}" +
      ".rw-address-empty{border:3px solid rgba(0,128,0,.38) !important;border-radius:12px !important;}" +
      ".rw-address-pulse{animation:rwPulse 1.25s ease-in-out infinite;border:2px solid rgba(180,48,23,.45) !important;}" +
      "@keyframes rwPulse{0%{box-shadow:0 0 0 0 rgba(180,48,23,.22);}70%{box-shadow:0 0 0 10px rgba(180,48,23,0);}100%{box-shadow:0 0 0 0 rgba(180,48,23,0);}}" +
      ".rw-address-collapsed [data-q='address']{display:none !important;}" +
      ".rw-address-collapsed label{display:none !important;}";
    document.head.appendChild(css);
  }

  function tryEnable(el) {
    try{el.removeAttribute("readonly");}catch(e){}
    try{el.removeAttribute("disabled");}catch(e){}
  }

  function ensureCard(wrap) {
    if (document.getElementById("rw-confirm-card")) return document.getElementById("rw-confirm-card");
    var card = document.createElement("div");
    card.id = "rw-confirm-card";
    card.className = "rw-confirm-card red";
    card.innerHTML =
      '<div class="rw-confirm-title" id="rw-confirm-title"></div>' +
      '<div class="rw-confirm-sub" id="rw-confirm-sub"></div>' +
      '<button type="button" id="rw-confirm-btn" class="rw-confirm-btn" style="display:none"></button>' +
      '<div id="rw-confirm-addr" class="rw-confirm-addr" style="display:none"></div>' +
      '<div id="rw-confirm-actions" class="rw-confirm-actions" style="display:none">' +
        '<button type="button" class="rw-link-btn" id="rw-change-address">Change address</button>' +
        '<span>or add notes below, then press <b>Book Your Pro Consultation</b>.</span>' +
      '</div>';
    if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(card, wrap);
    return card;
  }

  function setCard(state, title, sub, btnLabel, showBtn) {
    var card=document.getElementById("rw-confirm-card"); if(!card)return;
    card.classList.remove("red","green"); card.classList.add(state);
    var t=document.getElementById("rw-confirm-title");
    var s=document.getElementById("rw-confirm-sub");
    var b=document.getElementById("rw-confirm-btn");
    var a=document.getElementById("rw-confirm-addr");
    var ac=document.getElementById("rw-confirm-actions");
    if(t)t.innerHTML=title||"";
    if(s)s.innerHTML=sub||"";
    if(b){if(btnLabel)b.innerHTML=btnLabel;b.style.display=showBtn?"block":"none";}
    if(a)a.style.display="none";
    if(ac)ac.style.display="none";
  }

  function initAutocomplete() {
    var input = byQ("address");
    if (!input) return;
    addStylesOnce();
    hideAddressParts();
    tryEnable(input);
    var addrWrap = closestFieldWrap(input);
    if (!addrWrap) return;
    var cardWrap = findInsertWrap(input);

    /* ── ADDITION: wrap address section in a hidden div ── */
    if (!document.getElementById("rw-addr-section")) {
      var section = document.createElement("div");
      section.id = "rw-addr-section";
      section.style.display = "block";
      section.style.marginBottom = "0";
      // Insert section before cardWrap in the DOM
      cardWrap.parentNode.insertBefore(section, cardWrap);
      // Move cardWrap into section
      section.appendChild(cardWrap);


    }

    ensureCard(cardWrap);

    var confirmed = false;

    function fullAddr() {
      var street=(input.value||"").trim();
      var c=byQ("city"),st=byQ("state"),z=byQ("postal_code");
      var parts=[street];
      if(c&&c.value.trim())parts.push(c.value.trim());
      if(st&&st.value.trim())parts.push(st.value.trim());
      if(z&&z.value.trim())parts.push(z.value.trim());
      return parts.filter(Boolean).join(", ");
    }

    function showEmpty() {
      confirmed=false;
      addrWrap.classList.remove("rw-address-collapsed");
      input.classList.remove("rw-address-pulse");
      input.classList.add("rw-address-empty");
      setCard("red","Enter your street address","Start typing and select the correct property from the dropdown list.","",false);
    }
    function showNeedsConfirm(prefill) {
      confirmed=false;
      addrWrap.classList.remove("rw-address-collapsed");
      input.classList.remove("rw-address-empty");
      input.classList.add("rw-address-pulse");
      if(prefill) setCard("red","Confirm your property address for your <b>Pro Consultation</b>","Your address was pre-filled. Click below to open the Google Maps dropdown and select the correct property to confirm. \uD83D\uDC47","\uD83D\uDCCD Open Google Maps dropdown",true);
      else setCard("red","Confirm your property address for your <b>Pro Consultation</b>","Select the correct property from the dropdown list to confirm.","",false);
    }
    function showConfirmed() {
      confirmed=true;
      input.classList.remove("rw-address-pulse","rw-address-empty");
      addrWrap.classList.add("rw-address-collapsed");
      setCard("green","\uD83D\uDC4D Address confirmed","Perfect. Add any helpful notes below, then press <b>Book Your Pro Consultation</b>.","",false);
      var a=document.getElementById("rw-confirm-addr");
      var ac=document.getElementById("rw-confirm-actions");
      if(a){a.textContent=fullAddr()||input.value||"";a.style.display="block";}
      if(ac)ac.style.display="flex";
      var notes=document.querySelector('[data-q="appointment_details"]')||document.querySelector("textarea");
      if(notes)setTimeout(function(){try{notes.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}},250);
    }

    setTimeout(function() {
      var chg=document.getElementById("rw-change-address");
      if(chg) chg.addEventListener("click",function(){
        confirmed=false;
        addrWrap.classList.remove("rw-address-collapsed");
        setTimeout(function(){try{input.focus();}catch(e){}showNeedsConfirm(false);},150);
      });
      var btn=document.getElementById("rw-confirm-btn");
      if(btn) btn.addEventListener("click",function(){
        tryEnable(input);
        setTimeout(function(){
          try{input.focus();}catch(e){}
          try{
            var v=input.value||"";
            input.value=v+" ";
            input.dispatchEvent(new Event("input",{bubbles:true}));
            input.value=v;
            input.dispatchEvent(new Event("input",{bubbles:true}));
          }catch(e2){}
        },120);
      });
    }, 100);

    var gmTries=0;
    (function waitGM(){
      gmTries++;
      if(window.__rwGMLoaded||(window.google&&google.maps&&google.maps.places)){
        var ac=new google.maps.places.Autocomplete(input,{types:["address"]});
        if(ac.setFields)ac.setFields(["address_component"]);
        ac.addListener("place_changed",function(){
          var place=ac.getPlace();
          if(!place||!place.address_components)return;
          var c=byQ("city"),st=byQ("state"),z=byQ("postal_code"),street="";
          place.address_components.forEach(function(comp){
            var type=comp.types&&comp.types[0];
            if(type==="street_number")street=comp.short_name;
            else if(type==="route")street=(street?street+" ":"")+comp.long_name;
            else if(type==="locality"&&c)c.value=comp.long_name;
            else if(type==="administrative_area_level_1"&&st)st.value=comp.short_name;
            else if(type==="postal_code"&&z)z.value=comp.short_name;
          });
          if(street)input.value=street;
          var ev=new Event("input",{bubbles:true});
          input.dispatchEvent(ev);
          if(c)c.dispatchEvent(ev);
          if(st)st.dispatchEvent(ev);
          if(z)z.dispatchEvent(ev);
          showConfirmed();
          setTimeout(function(){var p=document.querySelector(".pac-container");if(p)p.style.display="none";},300);
        });
        if(!input.value.trim())showEmpty();
        else showNeedsConfirm(true);
        return;
      }
      if(gmTries<80)setTimeout(waitGM,150);
    })();

    input.addEventListener("focus",function(){tryEnable(input);if(!input.value.trim())showEmpty();else if(!confirmed)showNeedsConfirm(false);});
    input.addEventListener("input",function(){tryEnable(input);if(!input.value.trim())showEmpty();else if(!confirmed)showNeedsConfirm(false);});
  }

  (function boot(){
    hideAddressParts();
    var t=0;
    (function retry(){t++;if(byQ("address")){initAutocomplete();return;}if(t<80)setTimeout(retry,100);})();
  })();
})();


/* ═══════════════════════════════════════════════════════
   SCRIPT 3 — APPOINTMENT DETAILS HINT
═══════════════════════════════════════════════════════ */
(function () {
  function addStylesOnce() {
    if (document.getElementById("rw-details-hint-styles")) return;
    var css = document.createElement("style");
    css.id = "rw-details-hint-styles";
    css.innerHTML =
      ".rw-details-hint{margin:0 0 12px;padding:12px 14px;border-radius:12px;font-size:14px;line-height:1.5;text-align:left;border:1px solid rgba(0,0,0,.06);box-shadow:0 10px 24px rgba(0,0,0,.06);transition:background .25s,border-color .25s;}" +
      ".rw-details-hint.neutral{background:rgba(59,130,246,.08);color:#111;border-color:rgba(30,58,138,.10);}" +
      ".rw-details-hint.green{background:rgba(0,128,0,.08);color:#111;border-color:rgba(31,90,42,.12);}" +
      ".rw-details-hint b{font-weight:650;}";
    document.head.appendChild(css);
  }

  function initDetailsHint() {
    addStylesOnce();
    var details = document.querySelector('[data-q="appointment_details"]') || document.querySelector("textarea");
    if (!details) return false;

    if (!document.getElementById("rw-details-hint")) {
      var hint = document.createElement("div");
      hint.id = "rw-details-hint";
      hint.className = "rw-details-hint neutral";
      hint.innerHTML = "\uD83D\uDCAC <b>Optional:</b> Add notes about your roof or gutter project to help your assigned rep arrive prepared for your appointment.";
      details.parentElement.insertBefore(hint, details);
    }

    var hint = document.getElementById("rw-details-hint");

    function wordCount(v) {
      var t=(v||"").replace(/^\s+|\s+$/g,"");
      return t?t.split(/\s+/).filter(Boolean).length:0;
    }
    function sync() {
      if(!hint)return;
      if(wordCount(details.value)>=2){
        hint.className="rw-details-hint green";
        hint.innerHTML="\u2705 <b>Thank you!</b> This helps your assigned rep arrive prepared and makes your <b>Pro Consultation</b> more efficient.";
      } else {
        hint.className="rw-details-hint neutral";
        hint.innerHTML="\uD83D\uDCAC <b>Optional:</b> Add notes about your roof or gutter project to help your assigned rep arrive prepared for your appointment.";
      }
    }

    sync();
    details.addEventListener("input", sync);
    var p=0; (function poll(){p++;sync();if(p<80)setTimeout(poll,150);})();
    return true;
  }

  (function boot(){
    var t=0;
    (function retry(){t++;if(initDetailsHint())return;if(t<60)setTimeout(retry,100);})();
  })();
})();
