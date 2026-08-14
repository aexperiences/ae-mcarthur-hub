/* ============================================================================
   MCA PAPER (Aug 14 2026) — one-click branded PDFs + client portal links.
   Proposals -> proposal letter PDF · Billing -> invoice PDF (browser print-to-PDF,
   zero dependencies, $0). Projects -> client portal links.
   Built for McArthur Engineering by Accelerated Experiences LLC.
============================================================================ */
(function(){
  var T = window.Truss; if (!T) return;
  var FIRM = { name:"McArthur Engineering Company LLC", addr:"14841 Idaho 41, Rathdrum, ID 83858",
               phone:"(208) 446-3307", email:"admin@mcarthur-eng.com" };
  function pageIs(n){ return (location.pathname.split("/").pop()||"") === n; }
  function today(){ return new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}); }
  function money(n){ return "$"+(Math.round(Number(n)||0)).toLocaleString(); }
  function esc(s){ return T.esc(s); }

  var CSS = '<style>@page{margin:0.8in}body{font-family:Georgia,serif;color:#1a2b3a;margin:0;font-size:13px;line-height:1.55}'+
    '.lh{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e8a33d;padding-bottom:14px;margin-bottom:22px}'+
    '.fn{font-size:19px;font-weight:700;letter-spacing:.4px}.fs{font-size:11px;color:#5f6b76;margin-top:3px}'+
    '.mk{width:52px;height:52px}h1{font-size:16px;margin:18px 0 6px}h2{font-size:13px;margin:16px 0 6px;text-transform:uppercase;letter-spacing:.8px;color:#3f6d92}'+
    'table{width:100%;border-collapse:collapse;margin:8px 0}th{font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;text-align:left;color:#5f6b76;border-bottom:1.5px solid #1a2b3a;padding:5px 8px}'+
    'td{border-bottom:1px solid #e4e0d7;padding:6px 8px}.num{text-align:right;font-variant-numeric:tabular-nums}'+
    '.tot td{border-top:2px solid #1a2b3a;border-bottom:none;font-weight:700}'+
    '.sig{margin-top:44px;display:flex;gap:60px}.sl{border-top:1px solid #1a2b3a;padding-top:5px;width:230px;font-size:11.5px;color:#5f6b76}'+
    '.ft{margin-top:34px;padding-top:10px;border-top:1px solid #e4e0d7;font-size:10px;color:#8a94a0;text-align:center}'+
    '.meta td{border:none;padding:2px 8px 2px 0;font-size:12.5px}.meta .k{color:#5f6b76;width:120px}</style>';

  function letterhead(docType){
    return '<div class="lh"><div><div class="fn">'+FIRM.name+'</div><div class="fs">'+FIRM.addr+' · '+FIRM.phone+' · '+FIRM.email+'</div></div>'+
      '<div style="text-align:right"><img class="mk" src="mca-mark.svg"><div style="font-size:10px;color:#5f6b76;margin-top:2px">'+docType+'</div></div></div>';
  }
  function footer(){ return '<div class="ft">'+FIRM.name+' · '+FIRM.addr+' · '+FIRM.phone+'<br>Prepared with the McArthur Engineering OS — built by Accelerated Experiences LLC</div>'; }
  function printDoc(html, title){
    var f=document.createElement("iframe"); f.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(f);
    f.contentDocument.write('<!DOCTYPE html><html><head><title>'+esc(title)+'</title>'+CSS+'</head><body>'+html+'</body></html>');
    f.contentDocument.close();
    setTimeout(function(){ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){} setTimeout(function(){ f.remove(); }, 4000); }, 350);
  }

  function proposalDoc(p){
    var split=T.feeByPhase(p.fee||0);
    var rows=split.map(function(s){return '<tr><td>'+esc(s.name)+'</td><td class="num">'+s.pct+'%</td><td class="num">'+money(s.amount)+'</td></tr>';}).join("");
    var html=letterhead("FEE PROPOSAL")+
      '<table class="meta"><tr><td class="k">Date</td><td>'+today()+'</td></tr>'+
      '<tr><td class="k">Client</td><td>'+esc(p.client||"—")+'</td></tr>'+
      '<tr><td class="k">Project</td><td>'+esc(p.name)+' (No. '+esc(p.number||"—")+')</td></tr>'+
      '<tr><td class="k">Type</td><td>'+esc(p.type||"Civil engineering services")+'</td></tr></table>'+
      '<h1>Proposal for Professional Engineering Services</h1>'+
      '<p>'+FIRM.name+' is pleased to submit this fee proposal for professional engineering services for the above-referenced project. '+
      (p.note?esc(String(p.note).replace(/^\[Sample\]\s*/,"")):"")+'</p>'+
      '<h2>Fee</h2>'+
      '<p>Basis: <b>'+esc(p.feeBasis||"—")+'</b>'+(p.construction?' on an estimated construction cost of <b>'+money(p.construction)+'</b>':'')+'.</p>'+
      '<table><thead><tr><th>Milestone</th><th class="num">% of fee</th><th class="num">Amount</th></tr></thead><tbody>'+rows+
      '<tr class="tot"><td>Total professional fee</td><td></td><td class="num">'+money(p.fee)+'</td></tr></tbody></table>'+
      '<h2>Standards of practice</h2><p>Work will be performed in accordance with '+esc((p.standards||[]).join(", ")||"applicable state and local standards")+
      ' and the standard of care ordinarily exercised by professional engineers practicing in northern Idaho. Reimbursable expenses are billed at cost plus '+T.REIMB_MARKUP+'%.</p>'+
      '<h2>Acceptance</h2><p>This proposal is valid for 60 days. Signature below constitutes authorization to proceed.</p>'+
      '<div class="sig"><div class="sl">Scott McArthur, PE — Principal · Engineer of Record</div><div class="sl">Client — '+esc(p.client||"")+'</div></div>'+footer();
    printDoc(html, "Proposal — "+p.name);
  }

  function invoiceDoc(inv){
    var reimb=T.reimbursable(inv.reimb||0), sub=inv.sub||0, total=(inv.amount||0)+reimb+sub;
    var html=letterhead("INVOICE")+
      '<table class="meta"><tr><td class="k">Invoice No.</td><td><b>'+esc(inv.num)+'</b></td></tr>'+
      '<tr><td class="k">Date</td><td>'+(inv.issued?esc(inv.issued):today())+'</td></tr>'+
      '<tr><td class="k">Project</td><td>'+esc(inv.project)+'</td></tr>'+
      '<tr><td class="k">Phase</td><td>'+esc(inv.phase||"—")+'</td></tr></table>'+
      '<h1>Invoice for Professional Services</h1>'+
      '<table><thead><tr><th>Description</th><th class="num">Amount</th></tr></thead><tbody>'+
      '<tr><td>Professional engineering services — percent-complete through '+esc(inv.phase||"current phase")+'</td><td class="num">'+money(inv.amount)+'</td></tr>'+
      (inv.reimb?'<tr><td>Reimbursable expenses (cost + '+T.REIMB_MARKUP+'%)</td><td class="num">'+money(reimb)+'</td></tr>':'')+
      (sub?'<tr><td>Sub-consultant pass-through</td><td class="num">'+money(sub)+'</td></tr>':'')+
      '<tr class="tot"><td>Total due</td><td class="num">'+money(total)+'</td></tr></tbody></table>'+
      '<p>Terms: net 30 days. Please remit to '+FIRM.name+', '+FIRM.addr+'.</p>'+footer();
    printDoc(html, "Invoice "+inv.num);
  }

  function addAction(html){ var a=document.querySelector(".pagehead-actions"); if(a){ a.insertAdjacentHTML("beforeend", html); return a; } return null; }
  var BTN='style="background:#e8a33d;color:#241a08;border:none;border-radius:9px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit"';
  var BTN2='style="background:#fff;border:1.5px solid #1a2b3a;color:#1a2b3a;border-radius:8px;padding:4px 10px;font-weight:700;font-size:11.5px;cursor:pointer;font-family:inherit"';

  function wire(){
    var d=T.db();
    if (pageIs("proposals.html")){
      var sel='<select id="mcaPropSel" style="padding:9px;border-radius:9px;border:1.5px solid #c9d2da;font-family:inherit;font-size:13px;max-width:260px">'+
        d.projects.filter(function(p){return p.fee>0;}).map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>';}).join("")+'</select>';
      var a=addAction(sel+' <button id="mcaPropBtn" '+BTN+'>📄 Proposal PDF</button>');
      if(a){ document.getElementById("mcaPropBtn").addEventListener("click",function(){
        var id=document.getElementById("mcaPropSel").value;
        var p=d.projects.filter(function(x){return x.id===id;})[0]; if(p) proposalDoc(p);
      }); }
    }
    if (pageIs("billing.html")){
      // per-invoice PDF buttons: the open-invoices table rows map 1:1 to d.invoices
      var tables=document.querySelectorAll(".card table");
      var invTable=null;
      tables.forEach(function(t){ var h=t.querySelector("thead"); if(h && /#/.test(h.textContent) && /Status/.test(h.textContent)) invTable=t; });
      if (invTable){
        var rows=invTable.querySelectorAll("tbody tr");
        if (rows.length===d.invoices.length){
          invTable.querySelector("thead tr").insertAdjacentHTML("beforeend","<th></th>");
          rows.forEach(function(r,i){
            var td=document.createElement("td");
            td.innerHTML='<button '+BTN2+'>PDF</button>';
            td.firstChild.addEventListener("click",function(){ invoiceDoc(d.invoices[i]); });
            r.appendChild(td);
          });
        }
      }
    }
    if (pageIs("projects.html")){
      var a2=addAction('<a href="portal.html" target="_blank" '+BTN.replace('style=','style=')+' role="button" onclick="void(0)"><span style="text-decoration:none">🔗 Client portal</span></a>');
      if(a2){ var link=a2.lastChild; link.style.textDecoration="none"; link.style.display="inline-block"; }
    }
  }
  var tries=0;
  (function wait(){ if (document.querySelector(".pagehead-actions")||document.querySelector(".card")) { wire(); return; } if (++tries>40) return; setTimeout(wait,150); })();
})();
