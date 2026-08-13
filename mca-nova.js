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
  var voiceKeyIn = null; // null=unknown, true/false learned from first call
  function speak(text){
    if (!speakOn) return;
    text = stripHtml(text); if(!text) return;
    if (text.length > 420) text = text.slice(0, 400).replace(/[^.!?]*$/,"");
    if (voiceKeyIn !== false){
      fetch(API,{method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({do:"speak",text:text})})
      .then(function(r){return r.json();})
      .then(function(r){
        if (r && r.ok && r.audio){ voiceKeyIn = true;
          audioEl = audioEl || new Audio();
          audioEl.src = "data:audio/mpeg;base64," + r.audio;
          audioEl.play().catch(function(){ synth(text); });
        } else { voiceKeyIn = false; synth(text); }
      }).catch(function(){ synth(text); });
    } else synth(text);
  }
  function synth(text){
    try{
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      if (bestVoice) u.voice = bestVoice;
      u.rate = 1.02; u.pitch = 1.0;
      speechSynthesis.speak(u);
    }catch(e){}
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
      spk.onclick = function(){ unlock(); speakOn=!speakOn; localStorage.setItem("mca_nova_speak", speakOn?"on":"off"); paint(); if(!speakOn){ try{speechSynthesis.cancel(); if(audioEl) audioEl.pause();}catch(e){} } };
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
