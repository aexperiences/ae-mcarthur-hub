/* ============================================================================
   MCA NOVA LAYER (Jul 29 2026) — voice, deep answers, AI field fill, live bus.
   Additive: rides on top of truss.js + the aecoo panel. Removes nothing.
   - Talk to Nova (mic), Nova talks back (ElevenLabs via companion API when the
     key is in; best browser voice otherwise, iOS-unlocked properly).
   - Deep answers: unrouted questions go to /api/ai with a live spine snapshot
     (env-gated; honest when the key is not in yet).
   - "Nova fill" on any form page: drafts the fields, highlights them amber,
     saves nothing — the human reviews and saves. Every fill lands on the bus.
   - Bus ticker on every page: the org's last move + approvals count, one tap
     from anywhere. The hierarchy at the fingertips.
   ========================================================================== */
(function(){
  "use strict";
  if (window.__mcaNova) return; window.__mcaNova = true;
  var T = window.Truss; if(!T) return;
  var API = (window.MCA_AI_API || "https://ae-mcarthur-connect.vercel.app/api/ai");

  var EASE = "cubic-bezier(.22,.9,.24,1)";
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function hapt(){ try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){} }

  /* ------------------------------------------------------------ TTS ------ */
  var audioEl = null, unlocked = false, speakOn = (localStorage.getItem("mca_nova_speak")||"on")==="on";
  function unlock(){ // must run INSIDE a user gesture (iOS Safari rule)
    if (unlocked) return;
    try{
      audioEl = audioEl || new Audio();
      audioEl.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCgAAAAAAAAAGGmZBEcQAAAAAAAAAAAAAAAAAAAAD/+xBkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
      audioEl.play().catch(function(){});
      unlocked = true;
    }catch(e){}
  }
  var bestVoice = null;
  function pickVoice(){
    try{
      var vs = speechSynthesis.getVoices();
      var pref = ["Samantha","Google US English","Microsoft Aria","Karen","Moira","Victoria"];
      for (var i=0;i<pref.length;i++){
        var v = vs.filter(function(x){ return x.name.indexOf(pref[i])>=0; })[0];
        if (v){ bestVoice=v; return; }
      }
      bestVoice = vs.filter(function(x){ return /en[-_]US/.test(x.lang); })[0] || vs[0] || null;
    }catch(e){}
  }
  if (window.speechSynthesis){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function stripHtml(s){ var d=document.createElement("div"); d.innerHTML=s; return (d.textContent||"").replace(/\s+/g," ").trim(); }
  /* Nova speaks as ROZ — clips cut on the AE Voice Machine (sandbox engine, $0).
     No browser TTS, no cloud voice. A wav IS a clone; Roz lives on the voices/ shelf. */
  var ROZ = { greet:"roz-greet.mp3", fill:"roz-fill.mp3", nokey:"roz-nokey.mp3", ack:"roz-ack.mp3",
              lead:["roz-lead1.mp3","roz-lead2.mp3","roz-lead3.mp3"] };
  function rozPlay(src){ if(!speakOn||!src) return; audioEl = audioEl || new Audio(); audioEl.src = src; audioEl.play().catch(function(){}); }
  /* Full Roz answers — pre-rendered on the voice machine for the sample spine.
     Matched by answer text; unshipped clips fall back to a Roz lead-in. */
  var ROZ_ANS = [
    ["Morning Scott", "roz-ans-open.mp3"],
    ["Licensure and PDH are current", "roz-ans-hr.mp3"],
    ["Put the effort behind the", "roz-ans-pursuits.mp3"],
    ["Protect the Prairie Ave 90% set", "roz-ans-design.mp3"],
    ["Clear the 3 items", "roz-ans-field.mp3"],
    ["Nova: Holding this for you — Money", "roz-ans-money.mp3"],
    ["Finish the independent check", "roz-ans-standards.mp3"],
    ["Close the 5 open agency", "roz-ans-permits.mp3"],
    ["WATCH:", "roz-ans-it.mp3"],
    ["Nova: Holding this for you — Law", "roz-ans-law.mp3"],
    ["The bottleneck is the seal gate", "roz-ans-ops.mp3"]
  ];
  function speak(text, kind){
    if (!speakOn) return;
    var t = String(text||"").replace(/\s+/g," ").trim();
    for (var i=0;i<ROZ_ANS.length;i++){
      if (t.indexOf(ROZ_ANS[i][0]) === 0){
        audioEl = audioEl || new Audio();
        audioEl.onerror = function(){ this.onerror=null; rozPlay(ROZ.lead[Math.floor(Math.random()*ROZ.lead.length)]); };
        audioEl.src = ROZ_ANS[i][1];
        audioEl.play().catch(function(){});
        return;
      }
    }
    if (kind && ROZ[kind] && !Array.isArray(ROZ[kind])) return rozPlay(ROZ[kind]);
    rozPlay(ROZ.lead[Math.floor(Math.random()*ROZ.lead.length)]);
  }

  /* ------------------------------------------------- spine snapshot ------ */
  function spine(){
    try{
      var d = T.db(), k = T.kpis ? T.kpis() : {};
      return {
        firm:"McArthur Engineering Company LLC, Rathdrum Idaho — civil engineering",
        module:(T.activeModule&&T.activeModule().name)||"Civil / AEC",
        kpis:k,
        projects:(d.projects||[]).slice(0,12).map(function(p){
          return {name:p.name, pct:p.pctComplete, phase:p.phase, fee:p.fee, client:p.client};
        }),
        approvals_waiting:(d.approvals||[]).filter(function(a){return a.status==="waiting";}).length,
        open_invoices:(d.invoices||[]).filter(function(i){return i.status==="Open";}).length,
        team:(d.team||[]).map(function(t){return t.name+" ("+t.role+")";}).slice(0,12),
        sample:d.sample!==false
      };
    }catch(e){ return {}; }
  }
  function busLog(topic, body){
    try{ T.save(function(x){
      x.bus.push({ id:"e"+(x.seq++), dept:"coo", topic:topic, kind:"nova",
        from:"Nova (COO)", to:"Scott's desk", body:body,
        at:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) });
      if (x.bus.length>60) x.bus=x.bus.slice(-60);
    }); }catch(e){}
  }

  /* ------------------------------------------------------ deep ask ------- */
  var aiKeyIn = null, lastQ = "";
  function deepAsk(q, bubbleFn){
    if (aiKeyIn === false){
      bubbleFn("Deep answers are one key away — the AI line to my full brain isn't switched on yet. Anthony flips it with one paste. Meanwhile I can answer anything computed from the spine: money, projects, the team, the desk.");
      return;
    }
    bubbleFn("<i>thinking…</i>");
    fetch(API,{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({do:"ask",q:q,spine:spine()})})
    .then(function(r){return r.json();})
    .then(function(r){
      if (r && r.ok && r.answer){
        aiKeyIn = true;
        bubbleFn(String(r.answer).replace(/</g,"&lt;").replace(/\n/g,"<br>"), true);
        speak(r.answer);
        busLog("nova.deep","Nova answered from the full brain: \""+q.slice(0,70)+"\"");
      } else {
        aiKeyIn = false;
        bubbleFn("Deep answers are one key away — the AI line isn't switched on yet (one paste for Anthony). Everything computed from the spine still works: try \"how is The Arc doing\" or \"where is the money\".");
      }
    })
    .catch(function(){ bubbleFn("The AI line didn't answer just now — the spine answers still work."); });
  }

  /* --------------------------------------------- hook the aecoo panel ---- */
  function hookPanel(){
    var panel = document.getElementById("aeCooPanel");
    if (!panel) { setTimeout(hookPanel, 600); return; }
    var input = panel.querySelector("input, textarea");
    var send  = panel.querySelector("button.aecoo-send, .aecoo-send");
    if (!input || !send){ setTimeout(hookPanel, 800); return; }

    /* mic */
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var row = send.parentElement;
    if (SR && row && !row.querySelector(".mca-mic")){
      var mic = document.createElement("button");
      mic.className = "mca-mic"; mic.type="button"; mic.title = "Talk to Nova";
      mic.textContent = "🎙";
      mic.style.cssText = "border:none;border-radius:9px;padding:0 12px;cursor:pointer;background:#22364a;color:#fff;font-size:15px;transition:transform .25s "+EASE;
      row.insertBefore(mic, send);
      var rec=null, listening=false;
      mic.onclick = function(){
        unlock(); hapt();
        if (listening){ try{rec.stop();}catch(e){} return; }
        rec = new SR(); rec.lang="en-US"; rec.interimResults=false; rec.maxAlternatives=1;
        listening = true; mic.textContent="⏺"; mic.style.background="#b23b3b";
        if(!REDUCED) mic.style.transform="scale(1.12)";
        rec.onresult = function(ev){
          var t = ev.results[0][0].transcript;
          input.value = t; lastQ = t;
          send.click();
        };
        rec.onend = function(){ listening=false; mic.textContent="🎙"; mic.style.background="#22364a"; mic.style.transform=""; };
        rec.onerror = rec.onend;
        try{ rec.start(); }catch(e){ rec.onend(); }
      };
    }

    /* speaker toggle */
    var head = panel.querySelector(".aecoo-head");
    if (head && !head.querySelector(".mca-spk")){
      var spk = document.createElement("button");
      spk.className="mca-spk"; spk.type="button";
      spk.title = "Nova speaks her answers";
      spk.style.cssText = "margin-left:auto;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;border-radius:8px;padding:2px 9px;cursor:pointer;font-size:12px";
      function paint(){ spk.textContent = speakOn ? "🔊 voice on" : "🔇 voice off"; }
      paint();
      spk.onclick = function(){ unlock(); speakOn=!speakOn; localStorage.setItem("mca_nova_speak", speakOn?"on":"off"); paint(); if(speakOn){ rozPlay(ROZ.greet); } else { try{ if(audioEl) audioEl.pause(); }catch(e){} } };
      head.appendChild(spk);
    }

    /* capture user question + speak coo replies + deep-answer fallback */
    input.addEventListener("keydown", function(){ setTimeout(function(){ lastQ = input.value || lastQ; }, 0); });
    send.addEventListener("mousedown", function(){ unlock(); lastQ = input.value || lastQ; });

    var body = panel.querySelector(".aecoo-body") || panel;
    var mo = new MutationObserver(function(muts){
      muts.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes, function(n){
          if (!(n && n.nodeType===1)) return;
          var isCoo = /coo/.test(n.className||"") && !/you/.test(n.className||"");
          if (!isCoo) return;
          var txt = n.textContent || "";
          if (/couldn.t route that one/i.test(txt) && lastQ){
            deepAsk(lastQ, function(html, replace){
              if (replace && body.__mcaThink){ body.__mcaThink.innerHTML = html; body.__mcaThink=null; return; }
              var b=document.createElement("div"); b.className=n.className; b.innerHTML=html;
              body.appendChild(b); body.scrollTop=body.scrollHeight;
              if (/thinking/.test(html)) body.__mcaThink=b;
            });
          } else if (!/thinking/i.test(txt)){
            speak(txt);
          }
        });
      });
    });
    mo.observe(body, {childList:true, subtree:true});
  }
  hookPanel();

  /* ------------------------------------------------------ Nova fill ------ */
  function fields(){
    var root = document.querySelector(".content, main, body");
    var els = Array.prototype.slice.call(root.querySelectorAll("input, select, textarea"))
      .filter(function(e){
        if (e.type==="hidden"||e.type==="file"||e.type==="checkbox"||e.type==="radio"||e.type==="range") return false;
        if (e.closest("#aeCooPanel")||e.closest(".mca-bus")) return false;
        var r=e.getBoundingClientRect(); return r.width>40 && r.height>10;
      });
    return els.map(function(e,i){
      var label = "";
      if (e.id){ var l=document.querySelector('label[for="'+e.id+'"]'); if(l) label=l.textContent.trim(); }
      if (!label && e.closest("label")) label=e.closest("label").textContent.trim();
      if (!label) label = e.placeholder || e.name || e.id || ("field "+i);
      var opts = e.tagName==="SELECT" ? Array.prototype.map.call(e.options,function(o){return o.textContent.trim();}).slice(0,12) : undefined;
      return {i:i, el:e, label:label.slice(0,60), type:(e.tagName==="SELECT"?"select":(e.type||"text")), options:opts};
    });
  }
  function localDraft(fs){
    var today=new Date().toISOString().slice(0,10), n=0;
    fs.forEach(function(f){
      if (f.el.value) return;
      if (f.type==="date"){ f.el.value=today; mark(f.el); n++; }
      else if (/date/i.test(f.label)){ f.el.value=today; mark(f.el); n++; }
      else if (f.type==="select" && f.el.selectedIndex<=0 && f.el.options.length>1){ f.el.selectedIndex=1; mark(f.el); n++; }
    });
    return n;
  }
  function mark(el){
    el.style.transition="background .5s "+EASE;
    el.style.background="rgba(232,163,61,.22)";
    el.setAttribute("data-nova-draft","1");
  }
  function novaFill(){
    unlock(); hapt();
    var fs = fields(); if(!fs.length) return;
    var desc = fs.map(function(f){ return {i:f.i,label:f.label,type:f.type,options:f.options}; });
    var crumb = (document.querySelector(".crumb, h1") || {}).textContent || document.title;
    T.toast && T.toast("Nova is drafting the page…");
    fetch(API,{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({do:"fill", page:crumb.trim().slice(0,80), fields:desc, spine:spine()})})
    .then(function(r){return r.json();})
    .then(function(r){
      var n=0;
      if (r && r.ok && r.values){
        r.values.forEach(function(v){
          var f=fs.filter(function(x){return x.i===v.i;})[0];
          if(!f || f.el.value) return;
          if (f.type==="select"){
            var ix=Array.prototype.findIndex.call(f.el.options,function(o){return o.textContent.trim()===String(v.value).trim();});
            if(ix>=0){ f.el.selectedIndex=ix; mark(f.el); n++; }
          } else { f.el.value=String(v.value); mark(f.el); n++; }
          f.el.dispatchEvent(new Event("input",{bubbles:true}));
          f.el.dispatchEvent(new Event("change",{bubbles:true}));
        });
        T.toast && T.toast("Nova drafted "+n+" fields — amber means draft. Review, then save.");
        busLog("nova.fill","Nova drafted "+n+" fields on "+crumb.trim().slice(0,40)+" — waiting on a human save (Ghost Mode).");
      } else {
        n = localDraft(fs);
        T.toast && T.toast(n? ("Nova pre-filled "+n+" obvious fields — full AI drafting is one key away (Anthony's paste).")
                            : "Full AI drafting is one key away — Anthony flips it with one paste.");
      }
    })
    .catch(function(){ var n=localDraft(fs); T.toast && T.toast(n?("Pre-filled "+n+" obvious fields (offline)"):"The AI line didn't answer just now."); });
  }
  function fillChip(){
    var fs = fields();
    if (fs.length < 3) return;
    if (document.querySelector(".mca-fill")) return;
    var b=document.createElement("button");
    b.className="mca-fill"; b.type="button"; b.textContent="✎ Nova fill";
    b.title="Nova drafts every field on this page — you review and save";
    b.style.cssText="position:fixed;right:86px;bottom:24px;z-index:9998;border:none;border-radius:999px;padding:11px 16px;font-weight:700;cursor:pointer;background:#22364a;color:#fff;box-shadow:0 10px 30px -8px rgba(0,0,0,.5);font-size:13.5px;transition:transform .25s "+EASE;
    if(!REDUCED){ b.onmouseenter=function(){b.style.transform="translateY(-2px)";}; b.onmouseleave=function(){b.style.transform="";}; }
    b.onclick=novaFill;
    document.body.appendChild(b);
  }
  setTimeout(fillChip, 1200);

  /* ---------------------------------------------------- bus ticker ------- */
  function busTicker(){
    if (document.querySelector(".mca-bus")) return;
    var w=document.createElement("a");
    w.className="mca-bus"; w.href="org.html";
    w.style.cssText="position:fixed;left:18px;bottom:18px;z-index:9997;max-width:min(46vw,430px);display:flex;align-items:center;gap:9px;background:rgba(20,32,44,.94);backdrop-filter:blur(8px);color:#e7eef4;border:1px solid rgba(232,163,61,.35);border-radius:12px;padding:9px 13px;text-decoration:none;font-size:12px;box-shadow:0 14px 40px -12px rgba(0,0,0,.55);transition:transform .3s "+EASE+",opacity .3s "+EASE;
    document.body.appendChild(w);
    var lastId="";
    function paint(){
      try{
        var d=T.db(), bus=d.bus||[], last=bus[bus.length-1];
        var wait=(d.approvals||[]).filter(function(a){return a.status==="waiting";}).length;
        var line = last ? ('<b style="color:#e8a33d">'+ (last.from||"org") +'</b> → '+ (last.to||"") +': '+ String(last.body||"").slice(0,90)+(String(last.body||"").length>90?"…":""))
                        : 'The org is idle — ask Nova anything and watch it move.';
        w.innerHTML = '<span style="font-size:15px">❖</span><span style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.45">'+line+'</span>'+
          '<span style="margin-left:auto;flex:0 0 auto;background:'+(wait?'#e8a33d':'rgba(255,255,255,.14)')+';color:'+(wait?'#241a08':'#e7eef4')+';border-radius:999px;padding:2px 9px;font-weight:700">'+wait+' on desk</span>';
        if (last && last.id!==lastId && lastId && !REDUCED){
          w.style.transform="translateY(-4px)"; setTimeout(function(){w.style.transform="";},250);
        }
        lastId = last ? last.id : "";
      }catch(e){}
    }
    paint(); setInterval(paint, 5000);
  }
  busTicker();

  /* On phones keep the ticker above the thumb zone */
  if (matchMedia("(max-width:720px)").matches){
    var t=document.querySelector(".mca-bus"); if(t){ t.style.bottom="86px"; t.style.left="12px"; t.style.maxWidth="82vw"; }
    var f=document.querySelector(".mca-fill"); if(f){ f.style.bottom="86px"; }
  }
})();

/* ============================================================================
   MCA SEAT DOORS (Aug 14 2026) — per-position entry, no password.
   Each seat sees only its own rooms; the chrome shows who's signed in.
   Seat comes from ?seat= on any page (set by signin.html), then localStorage.
   Built for McArthur Engineering by Accelerated Experiences LLC.
============================================================================ */
(function(){
  var SHARED = ["contacts","calendar","connect","org"];
  var SEATS = {
    scott:     { av:"SM", name:"Scott McArthur, PE", title:"Principal · Engineer of Record", home:"dashboard.html", all:true,
                 does:"Scott sees everything — money, projects, the seal." },
    christian: { av:"CN", name:"Christian Nead", title:"Project & Construction Manager", home:"projects.html",
                 pages:["projects","workflow","field","drawings","billing","permits","records","meet","modules"].concat(SHARED),
                 does:"Christian runs the work — projects, the field, drawings, billing. The books, the seal and pricing stay with Scott." },
    cameron:   { av:"CS", name:"Cameron Sayers", title:"Project Drafter", home:"drawings.html",
                 pages:["drawings","projects","records"].concat(SHARED),
                 does:"Cameron keeps the sheets honest — the drawing register, projects and records." },
    foster:    { av:"FK", name:"Foster Kirsch, EIT", title:"Engineer in Training", home:"calcs.html",
                 pages:["calcs","hr","projects","records"].concat(SHARED),
                 does:"Foster works his assignments — calcs staged for review and his PDH ladder. Staging is not sealing." },
    angela:    { av:"AO", name:"Angela Owens", title:"Administrative Assistant", home:"contacts.html",
                 pages:["contacts","calendar","connect","records","billing","meet","org"],
                 does:"Angela runs the front office — contacts, the calendar, Connect, records and billing paperwork." }
  };
  function pageId(){ var p=(location.pathname.split("/").pop()||"dashboard.html").replace(".html",""); return p||"dashboard"; }
  var qs = new URLSearchParams(location.search);
  if (qs.get("seat") && SEATS[qs.get("seat")]) { try{ localStorage.setItem("mca_seat", qs.get("seat")); }catch(e){} }
  var seatId = "scott";
  try { seatId = localStorage.getItem("mca_seat") || "scott"; } catch(e){}
  if (!SEATS[seatId]) seatId = "scott";
  var seat = SEATS[seatId];
  function allowed(pg){ return seat.all || seat.pages.indexOf(pg)>=0; }

  function apply(){
    var bar = document.querySelector(".topbar");
    if (!bar) { return false; }
    /* identity chip */
    var who = document.querySelector(".topbar .who");
    if (who){
      who.innerHTML = '<div class="av">'+seat.av+'</div><div>'+seat.name+'<br><span class="muted small">'+seat.title+'</span></div>';
      who.style.cursor = "pointer"; who.title = "Switch seat";
      who.addEventListener("click", function(){ location.href = "signin.html"; });
    }
    /* nav filtering */
    if (!seat.all){
      document.querySelectorAll(".nav .navlink").forEach(function(a){
        var href = (a.getAttribute("href")||"").replace(".html","");
        if (href==="javascript:void(0)") { a.style.display="none"; return; } /* locked upsell rooms: hide off Scott's seat */
        if (href && !allowed(href) && !a.hasAttribute("data-mca-keep")) a.style.display = "none";
      });
      document.querySelectorAll(".nav .nav-group").forEach(function(g){
        var n = g.nextElementSibling, any = false;
        while (n && !n.classList.contains("nav-group")) { if (n.style.display!=="none") any = true; n = n.nextElementSibling; }
        if (!any) g.style.display = "none";
      });
      /* pricing/tier chrome is the owner's business */
      var pill=document.querySelector(".tierpill"); if(pill) pill.style.display="none";
      var menu=document.getElementById("tierMenu"); if(menu) menu.style.display="none";
    }
    /* page gate */
    var pg = pageId();
    if (!seat.all && !allowed(pg) && pg!=="signin" && pg!=="index"){
      var content = document.getElementById("content");
      if (content){
        content.innerHTML =
          '<div style="max-width:560px;margin:60px auto;text-align:center;background:#fff;border:1px solid #e4e0d7;border-radius:16px;padding:38px 34px;box-shadow:0 18px 50px rgba(26,43,58,.08)">'+
          '<div style="width:54px;height:54px;margin:0 auto 14px;border-radius:14px;background:#1a2b3a;display:flex;align-items:center;justify-content:center;color:#e8a33d;font-weight:700;font-size:20px">'+seat.av+'</div>'+
          '<h2 style="font-family:Fraunces,serif;color:#1a2b3a;margin:0 0 8px">This room isn’t part of '+seat.name.split(",")[0].split(" ")[0]+'’s seat</h2>'+
          '<p style="color:#5f6b76;line-height:1.6;margin:0 0 22px">'+seat.does+'</p>'+
          '<a href="'+seat.home+'" style="display:inline-block;background:#e8a33d;color:#241a08;font-weight:700;border-radius:10px;padding:12px 22px;text-decoration:none;margin-right:8px">Back to my desk →</a>'+
          '<a href="signin.html" style="display:inline-block;background:#fff;border:1.5px solid #1a2b3a;color:#1a2b3a;font-weight:700;border-radius:10px;padding:12px 22px;text-decoration:none">Switch seat</a>'+
          '</div>';
      }
    }
    return true;
  }
  var tries = 0;
  (function wait(){ if (apply() || ++tries > 40) return; setTimeout(wait, 150); })();
})();

/* ============================================================================
   MCA APP LAYER (Aug 14 2026) — installable PWA + the Paper machine.
   Manifest + icons + service worker (network-first), and mca-paper.js
   (proposal/invoice PDFs, client portal link). $0 stack.
============================================================================ */
(function(){
  function addLink(rel, href, extra){
    if (document.querySelector('link[rel="'+rel+'"]')) return;
    var l=document.createElement("link"); l.rel=rel; l.href=href;
    if (extra) Object.keys(extra).forEach(function(k){ l.setAttribute(k, extra[k]); });
    document.head.appendChild(l);
  }
  addLink("manifest","manifest.json");
  addLink("apple-touch-icon","apple-touch-icon.png",{sizes:"180x180"});
  if (!document.querySelector('meta[name="theme-color"]')){
    var m=document.createElement("meta"); m.name="theme-color"; m.content="#1a2b3a"; document.head.appendChild(m);
  }
  if ("serviceWorker" in navigator) {
    try { navigator.serviceWorker.register("sw.js"); } catch(e){}
  }
  if (!document.getElementById("mcaPaperLd")) {
    var s=document.createElement("script"); s.id="mcaPaperLd"; s.src="mca-paper.js"; s.defer=true;
    document.head.appendChild(s);
  }
})();

/* WELCOME LINK (Aug 14 2026) — the gift page, pinned to the bottom of the nav for EVERY seat. */
(function(){
  var tries=0;
  (function wait(){
    var nav=document.querySelector(".nav");
    if (!nav){ if(++tries>40) return; return setTimeout(wait,200); }
    if (document.getElementById("mcaWelcomeLink")) return;
    var a=document.createElement("a");
    a.id="mcaWelcomeLink"; a.href="welcome.html"; a.className="navlink"; a.setAttribute("data-mca-keep","1");
    a.style.cssText="margin-top:14px;border-top:1px solid rgba(255,255,255,.12);padding-top:14px";
    a.innerHTML='<span class="ic">🎁</span><span class="lb">Your Welcome · In the Box</span>';
    nav.appendChild(a);
  })();
})();
