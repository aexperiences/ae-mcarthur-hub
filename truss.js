/* ============================================================================
   TRUSS OS — SHOWROOM ENGINE
   Engineering Operating System · Powered by Accelerated Experiences LLC

   BROWSER-ONLY SHOWROOM. No backend, no network. sessionStorage, resets on idle.
   Faithful to AEHub canon: Founder -> COO -> DH -> AE -> Event Bus -> Pacemaker
   -> Triad (2 opposing lenses), confidence-gated release, LIVE/ESTIMATE/ASSUMPTION
   tags, the Fences (drafts only, nothing sent).

   THE THESIS: you do NOT build a separate OS per engineering discipline. You
   build ONE engine on the universal core every firm shares — time, budget,
   scope, the multiplier — and switch a MODULE (Civil / Mechanical / Software)
   for the discipline-specific workflow. That toggle is the headline.
   ============================================================================ */
(function (global) {
  "use strict";

  var KEY = "truss_showroom_v1";
  var IDLE_MS = 20 * 60 * 1000;
  var STORE = sessionStorage;

  function now() { return Date.now(); }
  function read() { try { return JSON.parse(STORE.getItem(KEY)) || null; } catch (e) { return null; } }
  function write(d) { d._t = now(); try { STORE.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

  function fresh() {
    return {
      _t: now(), started: now(), tier: "grandsuite", module: "civil", adds: [], offs: [],
      projects: clone(SEED.projects), workflow: clone(SEED.workflow), calcs: clone(SEED.calcs),
      permits: clone(SEED.permits), pursuits: clone(SEED.pursuits), labor: clone(SEED.labor),
      invoices: clone(SEED.invoices), team: clone(SEED.team), systems: clone(SEED.systems),
      matters: clone(SEED.matters), approvals: clone(SEED.approvals), bus: [], seq: 1
    };
  }
  function clone(a){ return JSON.parse(JSON.stringify(a)); }
  function db() { var d = read(); if (!d) { d = fresh(); write(d); return d; } if (now()-(d._t||0) > IDLE_MS) { d = fresh(); write(d); } return d; }
  function save(mut) { var d = db(); mut(d); write(d); return d; }
  function resetFloor() { var d = fresh(); write(d); return d; }

  /* ---------------------------------------------------------------- MODULES */
  var MODULES = {
    civil: { key:"civil", name:"Civil / AEC", disc:"Civil / Structural / Environmental", ic:"◺",
      tagline:"Physical sites, subcontractors, and the asset life cycle.",
      milestones:["30% (Preliminary)","60% (Detailed)","90% (Final Review)","100% (Issued for Construction)"],
      workflowLabel:"Field · RFIs & Submittals", workflowBlurb:"The construction-administration log — RFIs, submittals, ASIs and field reports, ball-in-court and aging.",
      releaseVerb:"Issued for Construction", sealNoun:"PE stamp", sealWho:"a licensed Professional Engineer",
      tools:["BIM / Revit & Bentley links","RFI & submittal logs","Field inspection forms","AASHTO / ACI / ASCE 7 code refs"] },
    mechanical: { key:"mechanical", name:"Mechanical / Hardware", disc:"Mechanical / Aerospace / Hardware", ic:"⚙",
      tagline:"Physical parts, prototypes, and the supply chain.",
      milestones:["Concept","Design (DVT)","Prototype (EVT)","Production (PVT)"],
      workflowLabel:"BOM · Parts & Revisions", workflowBlurb:"The bill of materials and part-revision log — track COGS alongside engineering hours.",
      releaseVerb:"Released to Production", sealNoun:"design release", sealWho:"the responsible mechanical PE / chief engineer",
      tools:["PLM handshakes","BOM & COGS tracking","Deep part revision control","GD&T / ASME Y14.5 refs"] },
    software: { key:"software", name:"Software / DevOps", disc:"Software / Systems / DevOps", ic:"⌘",
      tagline:"Virtual deploys, micro-releases, continuous agile loops.",
      milestones:["Backlog","In Sprint","In Review","Shipped"],
      workflowLabel:"Repos · Sprints & Releases", workflowBlurb:"Two-way sync with GitHub/GitLab/Jira — commits and sprint points become time and milestone progress.",
      releaseVerb:"Deployed to Production", sealNoun:"release approval", sealWho:"the release owner",
      tools:["GitHub / GitLab / Jira sync","Sprint burn → % complete","CI/CD deploy triggers","Commit-to-timesheet"] }
  };
  function moduleList(){ return [MODULES.civil, MODULES.mechanical, MODULES.software]; }
  function activeModule() { return MODULES[db().module] || MODULES.civil; }
  function setModule(k) { if (MODULES[k]) save(function (d){ d.module = k; }); }

  /* -------------------------------------------------------------- canon */
  var PHASES = [
    { k:"P30",  name:"30% — Preliminary",  pct:20, note:"Concept + basis of design. Typical 15–25% of fee." },
    { k:"P60",  name:"60% — Detailed",     pct:30, note:"The heaviest production phase. Typical 25–35%." },
    { k:"P90",  name:"90% — Final Review", pct:35, note:"Coordination + QA/QC. Typical 30–40%." },
    { k:"P100", name:"100% — IFC",         pct:15, note:"Issue for Construction + bid support. Typical 10–20%." }
  ];
  var CA_TYPES = [
    { k:"RFI", label:"RFI", desc:"Request for Information from the contractor." },
    { k:"SUBMITTAL", label:"Submittal", desc:"Shop drawing / product data review." },
    { k:"ASI", label:"ASI", desc:"Supplemental Instructions. No cost or time change." },
    { k:"FIELD", label:"Field Report", desc:"Site observation report." },
    { k:"NCR", label:"Nonconformance", desc:"Work that doesn't conform to the contract documents." }
  ];
  var BALL = ["Engineer", "Owner", "Contractor", "Sub-consultant", "AHJ"];
  var STANDARDS = [
    { code:"AASHTO LRFD", disc:"Bridge / highway structural", src:"AASHTO LRFD Bridge Design Specifications, 9th Ed." },
    { code:"ACI 318", disc:"Structural concrete", src:"ACI 318 Building Code Requirements for Structural Concrete" },
    { code:"ASCE 7", disc:"Loads (wind/seismic/snow)", src:"ASCE/SEI 7 Minimum Design Loads" },
    { code:"IBC", disc:"Building code", src:"International Building Code (adopted locally)" },
    { code:"AISC 360", disc:"Structural steel", src:"AISC 360 Specification for Structural Steel Buildings" },
    { code:"MUTCD", disc:"Traffic control", src:"FHWA Manual on Uniform Traffic Control Devices" }
  ];
  var BENCH = {
    utilization:{ target:[60,68], median:63, unit:"%", src:"Deltek Clarity (A/E, 2024 median); Zweig band" },
    netMultiplier:{ target:[2.9,3.4], median:3.1, unit:"x", src:"Zweig Group A/E benchmark (avg ~3.1)" },
    realization:{ target:[92,100], median:88, unit:"%", src:"Deltek Clarity (high performers ≥92%)" },
    backlog:{ target:[9,15], median:11.2, unit:" mo", src:"Deltek Clarity (A/E, 2024)" },
    collection:{ target:[45,60], median:72, unit:" days", src:"Deltek Clarity A/E DSO ~72 days" }
  };
  var REPLACES = [
    { tool:"Deltek Vantagepoint / Ajera", job:"Project accounting, time, WIP, multipliers", cost:"$30–50+/user/mo + implementation" },
    { tool:"Newforma / Procore CA", job:"RFI / submittal logs, field reports", cost:"$$$ per-seat, quote-only" },
    { tool:"Unanet / Cosential CRM", job:"Pursuit pipeline, SF330, go/no-go", cost:"Quote-only" },
    { tool:"A spreadsheet + Outlook", job:"The milestone tracker, the seal log, the fee-vs-earned check", cost:"Free — and it's costing you the realization blind spot" }
  ];

  /* -------------------------------------------------------------- seed */
  var SEED = {
    projects: [
      { id:"j1", name:"The Arc — Post Falls Community Development", number:"25-041", client:"The Arc Development", type:"Land Development / Site Civil", phase:"P60", pctComplete:58, fee:520000, billed:246000, lead:"Scott McArthur", construction:14800000, feeBasis:"3.5% of site cost", target:"2026-09-30", laborCost:112000, writeOff:2600, sealed:false, sealBy:"", standards:["ASCE 7","IBC","MUTCD"], note:"McArthur’s flagship — streets, utilities, grading, drainage and platting for a new Post Falls community on the Rathdrum Prairie. Design into construction." },
      { id:"j2", name:"Rathdrum Prairie Subdivision — Phase 2", number:"25-022", client:"North Idaho Homes", type:"Land Development", phase:"P30", pctComplete:24, fee:186000, billed:38000, lead:"Cameron Sayers", construction:2600000, feeBasis:"Hourly, NTE $186,000", target:"2027-05-20", laborCost:22000, writeOff:1400, sealed:false, sealBy:"", standards:["MUTCD","IBC"], note:"[Sample] Grading, storm and roadway for 48 lots. Stormwater variance likely." },
      { id:"j3", name:"Highway 41 Frontage — Grading & Utilities", number:"25-030", client:"NW Development", type:"Site / Civil", phase:"P30", pctComplete:12, fee:0, billed:0, lead:"Christian Nead", construction:6900000, feeBasis:"TBD — proposal out", target:"2027-08-01", laborCost:5200, writeOff:300, sealed:false, sealBy:"", standards:["ASCE 7","IBC"], note:"[Sample] Mass grading + wet/dry utilities. Fee letter with the owner." },
      { id:"j4", name:"City Utilities — Water Main Extension", number:"25-014", client:"City of Rathdrum", type:"Water / Civil", phase:"P60", pctComplete:52, fee:295000, billed:150000, lead:"Christian Nead", construction:3400000, feeBasis:"Lump sum", target:"2027-02-01", laborCost:64000, writeOff:2100, sealed:false, sealBy:"", standards:["ASCE 7","IBC"], note:"[Sample] 14,000 LF of main. Pressure-zone modeling underway." },
      { id:"j5", name:"Prairie Ave Culvert Rehab", number:"24-070", client:"County Public Works", type:"Structural / Hydraulic", phase:"P100", pctComplete:100, fee:220000, billed:220000, lead:"Scott McArthur", construction:2400000, feeBasis:"7.5% of construction cost", target:"2026-05-01", laborCost:52000, writeOff:0, sealed:true, sealBy:"Scott McArthur, PE", standards:["AASHTO LRFD","ACI 318"], note:"[Sample] Complete, sealed and constructed. Warranty walk pending." },
      { id:"j6", name:"Depot St Intersection & Signal", number:"24-088", client:"State of Idaho DOT", type:"Transportation", phase:"P100", pctComplete:100, fee:410000, billed:398000, lead:"Cameron Sayers", construction:5100000, feeBasis:"7.9% of construction cost", target:"2026-08-30", laborCost:96000, writeOff:900, sealed:true, sealBy:"Scott McArthur, PE", standards:["MUTCD","AASHTO LRFD"], note:"[Sample] Issued for Construction. Sealed. CA phase in progress." }
    ],
    workflow: [
      { id:"w1", num:"RFI-032", type:"RFI", subject:"Abutment rebar clearance at Grid 2", project:"The Arc — Post Falls Community Development", ball:"Engineer", status:"Open", days:5, due:"2026-08-01", ref:"ACI 318", costImpact:false, note:"Contractor needs the cover dimension at the skew." },
      { id:"w2", num:"SUB-118", type:"SUBMITTAL", subject:"Prestressed girders — shop drawings", project:"The Arc — Post Falls Community Development", ball:"Engineer", status:"In Review", days:9, due:"2026-07-30", ref:"AASHTO LRFD", costImpact:false, note:"Day 9 of a 14-day review window." },
      { id:"w3", num:"RFI-028", type:"RFI", subject:"Storm structure invert conflict with gas main", project:"City Utilities — Water Main Extension", ball:"Sub-consultant", status:"Answered", days:2, due:"2026-07-18", ref:"—", costImpact:true, note:"Utility conflict — potential CO. Survey confirmed depth." },
      { id:"w4", num:"SUB-104", type:"SUBMITTAL", subject:"HDPE pipe & fittings — product data", project:"City Utilities — Water Main Extension", ball:"Engineer", status:"Open", days:12, due:"2026-07-22", ref:"ASCE 7", costImpact:false, note:"Aging past the 10-day window." },
      { id:"w5", num:"ASI-006", type:"ASI", subject:"Signal pole base bolt pattern clarification", project:"Depot St Intersection & Signal", ball:"Contractor", status:"Closed", days:0, due:"2026-06-20", ref:"MUTCD", costImpact:false, note:"Clarification only — no cost or time change." },
      { id:"w6", num:"FR-051", type:"FIELD", subject:"Subgrade proofroll observation — east roadway", project:"Depot St Intersection & Signal", ball:"Engineer", status:"Closed", days:0, due:"2026-07-10", ref:"—", costImpact:false, note:"Soft area flagged; contractor to undercut and recompact." },
      { id:"w7", num:"NCR-003", type:"NCR", subject:"Culvert headwall concrete below spec strength", project:"Mill Creek Culvert Rehab", ball:"Contractor", status:"Answered", days:1, due:"2026-04-28", ref:"ACI 318", costImpact:true, note:"28-day break low. Cores ordered; remediation plan pending." }
    ],
    calcs: [
      { id:"c1", pkg:"Prairie Ave — Superstructure design", project:"The Arc — Post Falls Community Development", standard:"AASHTO LRFD", status:"In QA/QC", by:"D. Whitfield", note:"Girder + deck design. Independent check underway." },
      { id:"c2", pkg:"Prairie Ave — Abutment & foundation", project:"The Arc — Post Falls Community Development", standard:"ACI 318", status:"In QA/QC", by:"I. Okafor", note:"Spread footing on rock. Bearing confirmed by geotech." },
      { id:"c3", pkg:"City Utilities — Hydraulic model", project:"City Utilities — Water Main Extension", standard:"ASCE 7", status:"Draft", by:"M. Lang", note:"Steady-state + fire-flow pressure zones." },
      { id:"c4", pkg:"Rathdrum Prairie — Stormwater detention", project:"Rathdrum Prairie Subdivision — Phase 2", standard:"IBC", status:"Draft", by:"P. Anand", note:"Detention sizing for the 100-yr event." },
      { id:"c5", pkg:"Depot St — Signal structural", project:"Depot St Intersection & Signal", standard:"AASHTO LRFD", status:"Sealed", by:"D. Whitfield", note:"Mast arm + pole foundation. Sealed with the IFC set." }
    ],
    permits: [
      { id:"pm1", project:"The Arc — Post Falls Community Development", ahj:"USACE / State — 404 & Stream", submitted:"2026-05-02", cycle:2, comments:9, resolved:6, status:"In review", due:"2026-08-08", note:"Cycle 2: scour analysis and temporary dewatering plan." },
      { id:"pm2", project:"City Utilities — Water Main Extension", ahj:"State Dept of Environmental Quality", submitted:"2026-06-10", cycle:1, comments:5, resolved:3, status:"In review", due:"2026-08-15", note:"Drinking-water main plan approval." },
      { id:"pm3", project:"Rathdrum Prairie Subdivision — Phase 2", ahj:"County — Grading & Stormwater", submitted:"—", cycle:0, comments:0, resolved:0, status:"Not submitted", due:"2026-09-30", note:"Stormwater variance likely required." },
      { id:"pm4", project:"Depot St Intersection & Signal", ahj:"State DOT — Encroachment", submitted:"2026-01-15", cycle:3, comments:16, resolved:16, status:"Approved", due:"—", note:"Permit issued. Under construction." }
    ],
    pursuits: [
      { id:"g1", name:"Regional Wastewater Plant Upgrade", client:"Regional Sewer District", type:"Water/Environmental", stage:"RFQ submitted", value:520000, construction:14000000, due:"2026-08-12", probability:45, decision:"GO", owner:"Christian Nead", note:"QBS. Shortlist interviews late August." },
      { id:"g2", name:"Elm St Sidewalk & ADA Ramps", client:"City Public Works", type:"Transportation", stage:"Proposal out", value:64000, construction:820000, due:"2026-07-31", probability:70, decision:"GO", owner:"Cameron Sayers", note:"Repeat client. Fast, clean, in our wheelhouse." },
      { id:"g3", name:"Private Dam Rehabilitation", client:"Timberline Ranch", type:"Dams / High-hazard", stage:"Qualifying", value:240000, construction:5200000, due:"2026-08-20", probability:20, decision:"HOLD", owner:"Scott McArthur", note:"High-hazard dam — needs a specialty reference we don't have. Teaming?" },
      { id:"g4", name:"Offshore Wind Cable Landing", client:"Marine Energy Partners", type:"Marine / Coastal", stage:"Lead", value:900000, construction:22000000, due:"2026-09-15", probability:12, decision:"NO-GO", owner:"Christian Nead", note:"Marine/coastal — outside our staffing depth and licensure this year." }
    ],
    labor: [
      { id:"l1", name:"Scott McArthur, PE", role:"Principal / Engineer of Record", rate:225, cost:82, hours:150, billable:82, target:50 },
      { id:"l2", name:"Christian Nead, PE", role:"Project Engineer", rate:175, cost:58, hours:162, billable:118, target:68 },
      { id:"l3", name:"Cameron Sayers, PE", role:"Project Engineer", rate:175, cost:57, hours:158, billable:120, target:68 },
      { id:"l4", name:"Foster Kirsch, EIT", role:"Design Engineer (EIT)", rate:125, cost:40, hours:160, billable:130, target:72 },
      { id:"l5", name:"Angela Owens, EIT", role:"Design Engineer (EIT)", rate:125, cost:41, hours:158, billable:124, target:72 },
      { id:"l6", name:"Ray Mendel", role:"CAD / Designer", rate:110, cost:36, hours:160, billable:128, target:74 },
      { id:"l7", name:"Sam Ortiz", role:"Admin / Controller", rate:0, cost:31, hours:150, billable:0, target:0 }
    ],
    invoices: [
      { id:"i1", num:"25-041-07", project:"The Arc — Post Falls Community Development", phase:"P90", amount:58000, reimb:2400, sub:11000, issued:"2026-06-30", status:"Open", age:27 },
      { id:"i2", num:"25-014-06", project:"City Utilities — Water Main Extension", phase:"P60", amount:34000, reimb:900, sub:0, issued:"2026-05-31", status:"Open", age:57 },
      { id:"i3", num:"24-088-07", project:"Depot St Intersection & Signal", phase:"CA", amount:19000, reimb:520, sub:0, issued:"2026-06-30", status:"Open", age:27 },
      { id:"i4", num:"25-022-06", project:"Rathdrum Prairie Subdivision — Phase 2", phase:"P30", amount:16000, reimb:300, sub:2800, issued:"2026-05-31", status:"Open", age:57 },
      { id:"i5", num:"25-041-06", project:"The Arc — Post Falls Community Development", phase:"P90", amount:61000, reimb:1900, sub:9800, issued:"2026-05-31", status:"Paid", age:0 }
    ],
    team: [
      { id:"h1", name:"Scott McArthur", role:"Principal / Engineer of Record", type:"Human", status:"Active", dept:"Principal", license:"PE · State of Idaho", ce:"—", note:"Founder and principal. Seals the work — the engineer of record on every set that leaves the office." },
      { id:"h2", name:"Christian Nead", role:"Project & Construction Manager", type:"Human", status:"Active", dept:"Construction", license:"—", ce:"—", note:"Runs projects from design into the field — RFIs, submittals, inspections, and the schedule." },
      { id:"h3", name:"Cameron Sayers", role:"Project Drafter", type:"Human", status:"Active", dept:"Design", license:"—", ce:"—", note:"Turns the engineering into the drawing set — plans, profiles, and details." },
      { id:"h4", name:"Foster Kirsch", role:"Engineer Intern (EIT track)", type:"Human", status:"Active", dept:"Design", license:"EIT — logging hours toward the PE", ce:"—", note:"Design support and calcs, building experience toward licensure." },
      { id:"h5", name:"Angela Owens", role:"Administrative Assistant", type:"Human", status:"Active", dept:"Operations", license:"—", ce:"—", note:"Front office — clients, contracts, billing paperwork, and the calendar." },
      { id:"h6", name:"Nova", role:"Chief Operating Officer", type:"AI · DeepSeek", status:"Active", dept:"Command", license:"—", ce:"—", note:"The interface machine to the principal — routes, packages, and keeps the office moving." },
      { id:"h7", name:"Ledger", role:"Head of Standards & QA/QC", type:"AI · DeepSeek", status:"Active", dept:"Standards", license:"—", ce:"—", note:"Owns the calc standards, the code read, and the independent check before a seal." }
    ],
    systems: [
      { id:"sy1", name:"Model & drawing store", state:"CLEAR", metric:"2.4 TB · nightly backup verified 03:58" },
      { id:"sy2", name:"Calc / analysis servers", state:"CLEAR", metric:"license pool healthy · queue empty" },
      { id:"sy3", name:"Sub-consultant file exchange", state:"WATCH", metric:"storage 84% — the geotech dataset is large" },
      { id:"sy4", name:"Auth / sessions", state:"CLEAR", metric:"no failed logins in 30 days" },
      { id:"sy5", name:"Client / owner portal", state:"CLEAR", metric:"99.97% uptime · 190ms" }
    ],
    matters: [
      { id:"mt1", title:"Prairie Ave — owner strikes the limitation-of-liability clause", state:"Open", risk:"High", ref:"EJCDC E-500 §6.10", note:"Owner's redline removes the LoL cap. Needs a real attorney before signature." },
      { id:"mt2", title:"Dam Rehab pursuit — high-hazard standard of care", state:"Open", risk:"High", ref:"Standard of care", note:"High-hazard dam work carries outsized exposure and a licensure question. Route to counsel; confirm E&O." },
      { id:"mt3", title:"Depot St — DOT audit of overhead under FAR Part 31", state:"Open", risk:"Medium", ref:"FAR Part 31", note:"Government work triggers a FAR Part 31 overhead audit. Confirm the indirect-cost schedule is defensible." },
      { id:"mt4", title:"Rathdrum Prairie — stormwater variance opinion", state:"Open", risk:"Medium", ref:"Standard of care", note:"Advising on a variance edges toward land-use counsel. Route the opinion to the owner's attorney." }
    ],
    approvals: [
      { id:"ap1", kind:"pricing", title:"Fee proposal — Regional Wastewater Plant Upgrade", by:"Wren (Pursuits AE)", summary:"Submit at $520,000 (~3.7% of a $14M construction cost), phased 30/60/90/100.", state:"Pending", why:"A fee that goes to a client is the principal's call." },
      { id:"ap2", kind:"seal", title:"Seal & Issue for Construction — The Arc", by:"Ledger (Standards AE)", summary:"90% set has cleared independent QA/QC. Ready for the Engineer of Record to stamp and issue.", state:"Pending", why:"Only a licensed PE stamps. The seal is a personal, legal act — never automated." },
      { id:"ap3", kind:"external", title:"Transmit Cycle-2 permit responses — USACE", by:"Relay (Permits AE)", summary:"Scour analysis + dewatering plan responses to the Corps.", state:"Pending", why:"Leaves the office and goes on the regulatory record." }
    ]
  };

  /* -------------------------------------------------------------- price book */
  var ROOMS = {
    pursuits:  { label:"Pursuits · Go/No-Go", mo:65, build:450, why:"QBS/Brooks-Act pipeline, SF330, and the go/no-go argument — off the spreadsheet." },
    proposals: { label:"Proposals & Fees", mo:65, build:450, why:"Phase-split fees, % of construction, and the multiplier check before the letter goes out." },
    projects:  { label:"Projects · WBS", mo:80, build:550, why:"The phase-native project spine — 30/60/90/100% milestones, percent-complete, phase profitability." },
    workflow:  { label:"Module Workflow", mo:90, build:650, why:"The discipline layer — RFIs/submittals (Civil), BOM (Mechanical) or sprints (Software). Flip the module." },
    calcs:     { label:"Calcs & Standards", mo:75, build:500, why:"Calc packages tied to real codes (AASHTO/ACI/ASCE) with the independent-check trail." },
    seal:      { label:"PE Seal · IFC Gate", mo:85, build:600, why:"Nothing is Issued for Construction until a licensed PE stamps it. The release gate, on the record." },
    permits:   { label:"Permits & AHJ", mo:80, build:550, why:"Agency review cycles and resubmittals — the thing no tool at this size tracks." },
    modules:   { label:"Modules · The Engine", mo:120, build:900, why:"One engine, three disciplines. Civil / Mechanical / Software workflows on the same core." },
    billing:   { label:"Billing", mo:65, build:350, why:"Percent-complete invoices, reimbursables, sub pass-through, AR chase." },
    books:     { label:"Books & Multipliers", mo:95, build:700, why:"Utilization, net multiplier, realization, backlog, WIP — computed, not reconstructed." },
    hr:        { label:"HR · People Ops", mo:70, build:450, why:"Roster and PE/EIT license + PDH tracking. A lapsed stamp is a stop-work event." },
    it:        { label:"IT · System Health", mo:60, build:400, why:"CLEAR / WATCH / INTERVENE on the model store, calc servers, portal and backups." },
    law:       { label:"Law · Contracts", mo:110, build:800, why:"EJCDC read, professional liability, FAR Part 31 — advisory, with a hard fence to a real attorney." },
    org:       { label:"Agent Org · Bus", mo:150, build:1300, why:"The ten AI department chains, the event bus, and the confidence gates. The engine's brain." }
  };
  var TIERS = {
    lite: { key:"lite", name:"Lite", rank:1, mo:600, build:3800, desc:"Core practice. Pursuits, fees, the project spine, the module workflow, calcs and billing.", base:"Single office · up to 6 engineers", includes:["pursuits","proposals","projects","workflow","calcs","billing"] },
    standard: { key:"standard", name:"Standard", rank:2, mo:1400, build:9500, desc:"The working firm. Adds the PE-seal gate, permits, the multiplier board, HR, IT — and the agent org.", base:"Single office · up to 20 engineers", includes:["pursuits","proposals","projects","workflow","calcs","billing","seal","permits","books","hr","it","org"] },
    grandsuite: { key:"grandsuite", name:"Grandsuite", rank:3, mo:2900, build:24000, desc:"The whole firm, nothing held back. Every department, the full agent org, the Modules engine, and contracts.", base:"Multi-office · unlimited seats · dedicated environment · data migration", includes:["pursuits","proposals","projects","workflow","calcs","billing","seal","permits","modules","books","hr","it","law","org"] }
  };
  var DEPTS = [
    { group:"Command", items:[ { href:"dashboard.html", label:"Command Center", ic:"◎" }, { href:"calendar.html", label:"Calendar", ic:"▤" }, { href:"approvals.html", label:"Approval Desk", ic:"✓", accent:"ops" } ]},
    { group:"The Engine", items:[ { href:"modules.html", label:"Modules · The Engine", ic:"❖", room:"modules", accent:"modules" } ]},
    { group:"New Business", items:[ { href:"pursuits.html", label:"Pursuits · Go/No-Go", ic:"◆", room:"pursuits", accent:"pursuits" }, { href:"proposals.html", label:"Proposals & Fees", ic:"∑", room:"proposals", accent:"proposal" } ]},
    { group:"The Work", items:[ { href:"projects.html", label:"Projects · WBS", ic:"▦", room:"projects", accent:"projects" }, { href:"workflow.html", label:"Module Workflow", ic:"⇄", room:"workflow", accent:"field" }, { href:"calcs.html", label:"Calcs & Standards", ic:"§", room:"calcs", accent:"calcs" }, { href:"seal.html", label:"PE Seal · IFC", ic:"⊛", room:"seal", accent:"seal" }, { href:"permits.html", label:"Permits & AHJ", ic:"⇋", room:"permits", accent:"permits" } ]},
    { group:"Money", items:[ { href:"billing.html", label:"Billing", ic:"◧", room:"billing", accent:"money" }, { href:"books.html", label:"Books & Multipliers", ic:"◭", room:"books", accent:"money" } ]},
    { group:"People & Systems", items:[ { href:"hr.html", label:"HR · People Ops", ic:"☷", room:"hr", accent:"hr" }, { href:"it.html", label:"IT · System Health", ic:"♥", room:"it", accent:"it" } ]},
    { group:"Governance", items:[ { href:"law.html", label:"Law · Contracts", ic:"⚖", room:"law", accent:"law" }, { href:"org.html", label:"Agent Org · Bus", ic:"❖", room:"org", accent:"ops" } ]}
  ];

  /* -------------------------------------------------------------- agent org */
  var SEATS = {
    coo: { id:"coo", name:"Nova", role:"Chief Operating Officer", tier:"COO", dept:"Command", gate:null, line:"Apex seat. Makes the ordinary call; defers to the principal only behind a Fence." },
    depts: [
      { key:"pursuits", name:"New Business · Pursuits", accent:"pursuits", gate:80, dh:{name:"Locke",line:"Owns which pursuits are real — the go/no-go verdict and why."}, ae:{name:"Wren",line:"Packages the SF330, the reference sheets, the fee letter."}, pace:{name:"Compass",line:"Only voice out of the triad. GO at ≥80%; below that a HOLD with reasons."}, lensA:{name:"Reach",line:"Opportunity lens — does this win, and build the portfolio we want?"}, lensB:{name:"Filter",line:"Qualification lens — funded, in our wheelhouse, and can we staff and seal it?"} },
      { key:"design", name:"Design Production", accent:"projects", gate:80, dh:{name:"Marek",line:"Owns what goes out the door — the drawings, the phase, the deliverable."}, ae:{name:"Pell",line:"Packages the milestone plan (30/60/90/100) and every hand-off."}, pace:{name:"Trueline",line:"Releases the production plan at ≥80%; below the bar it holds and asks."}, lensA:{name:"Parti",line:"Design lens — the strongest solution that meets the criteria and budget."}, lensB:{name:"Bearing",line:"Constructability lens — can this be built, and does it meet the code?"} },
      { key:"field", name:"Field · Construction Admin", accent:"field", gate:80, dh:{name:"Wescott",line:"Owns the field. Nothing sits in the log unanswered."}, ae:{name:"Quill",line:"Packages RFIs, submittals, ASIs and field reports; keeps ball-in-court honest."}, pace:{name:"Plumb",line:"Releases a CA response at ≥80%. Anything life-safety routes to the Engineer of Record."}, lensA:{name:"Unblock",line:"Field lens — the contractor is waiting; what moves the work today?"}, lensB:{name:"Scope",line:"Exposure lens — does this change cost or time? Then it's not an RFI answer, it's a change."} },
      { key:"money", name:"Money · Accounting", accent:"money", gate:85, dh:{name:"Sterling",line:"Owns the integrity of every number. A wrong figure pollutes everything downstream."}, ae:{name:"Marin",line:"Packages invoices, WIP, AR aging, and the multiplier view."}, pace:{name:"Baseline",line:"High bar (85%). A bluffed number is worse than an honest 'unsure'."}, lensA:{name:"Realized",line:"Collections lens — what actually cleared the bank, tagged LIVE only."}, lensB:{name:"Multiple",line:"Profitability lens — does this phase clear the net multiplier on real labor cost?"} },
      { key:"standards", name:"Standards & QA/QC", accent:"calcs", gate:80, dh:{name:"Ledger",line:"Owns the calc standards, the code read, and the independent check."}, ae:{name:"Section",line:"Packages the calc packages and the standards each one is checked against."}, pace:{name:"Verify",line:"A code position releases at ≥80% AND with a cited source; else 'confirm with the AHJ'."}, lensA:{name:"Precedent",line:"Library lens — have we designed this before, and did it perform?"}, lensB:{name:"Authority",line:"Code lens — what does the adopted standard actually require?"} },
      { key:"permits", name:"Permits & AHJ", accent:"permits", gate:80, dh:{name:"Lattice",line:"Owns the team outside the office — agencies, subs, contractor."}, ae:{name:"Relay",line:"Packages agency comments, resubmittals, and sub deliverable dates."}, pace:{name:"Interlock",line:"Releases a coordination call at ≥80%; a discipline conflict escalates."}, lensA:{name:"Sequence",line:"Schedule lens — who needs what, when, to keep the set moving?"}, lensB:{name:"Clash",line:"Conflict lens — where do the disciplines or the agencies collide?"} },
      { key:"hr", name:"HR · People Ops", accent:"hr", gate:80, dh:{name:"Hale",line:"Owns the team's health — hiring, onboarding, licensure, and the hard talks."}, ae:{name:"Roster",line:"Packages offers, checklists, PE/EIT license + PDH tracking."}, pace:{name:"Balance",line:"Releases people decisions at ≥80%; a termination always routes to a human."}, lensA:{name:"Bench",line:"Talent lens — who do we need to deliver the backlog?"}, lensB:{name:"Record",line:"Compliance lens — is licensure, PDH and paperwork current and defensible?"} },
      { key:"it", name:"IT · System Health", accent:"it", gate:80, dh:{name:"Ward",line:"Owns uptime. CLEAR / WATCH / INTERVENE — and says which, plainly."}, ae:{name:"Cache",line:"Packages incident notes, the watch list, and backup verification."}, pace:{name:"Steady",line:"Calls system health; a real outage or security event escalates immediately."}, lensA:{name:"Access",line:"Availability lens — is the model store, the calc pool and the portal reachable?"}, lensB:{name:"Loss",line:"Risk lens — where's the exposure? Which set isn't backed up?"} },
      { key:"law", name:"Law · Contracts", accent:"law", gate:85, dh:{name:"Barrow",line:"Owns the contract read — EJCDC, professional liability, FAR Part 31. NOT a lawyer; advisory only."}, ae:{name:"File",line:"Packages the matter, the risk, the sources; flags what needs a real attorney."}, pace:{name:"Care",line:"High bar (85%). Anything with real exposure routes to a licensed attorney."}, lensA:{name:"Terms",line:"Enablement lens — how do we get to a signed agreement cleanly?"}, lensB:{name:"Claim",line:"Exposure lens — what claim could arise, and does our E&O respond?"} },
      { key:"ops", name:"Operations", accent:"ops", gate:80, dh:{name:"Keystone",line:"Owns the connective tissue — the desk that keeps the office running."}, ae:{name:"Index",line:"Owns the project filing cabinet and the follow-up calendar for the whole office."}, pace:{name:"Meter",line:"Releases at ≥80%; a cross-department conflict escalates to the COO."}, lensA:{name:"Method",line:"Process lens — what's the cleanest repeatable way to run this?"}, lensB:{name:"Choke",line:"Throughput lens — where's the bottleneck slowing the whole office?"} }
    ]
  };

  /* -------------------------------------------------------------- money spine */
  function feeByPhase(fee) { fee = Number(fee)||0; return PHASES.map(function (p){ return { k:p.k, name:p.name, pct:p.pct, amount:Math.round(fee*p.pct/100), note:p.note }; }); }
  function feeFromConstruction(construction, pct) { return Math.round((Number(construction)||0)*(Number(pct)||0)/100); }
  function earnedToDate(c) { return Math.round((Number(c.fee)||0)*(Number(c.pctComplete)||0)/100); }
  function readyToBill(c) { return Math.max(0, earnedToDate(c) - (Number(c.billed)||0)); }
  var REIMB_MARKUP = 10;
  function reimbursable(cost, markup) { markup = (markup===undefined)?REIMB_MARKUP:Number(markup); return Math.round((Number(cost)||0)*(1+markup/100)); }
  function utilization(rows) { rows = rows||db().labor; var t = rows.reduce(function (s,r){ return s+(Number(r.hours)||0); },0); var b = rows.reduce(function (s,r){ return s+(Number(r.billable)||0); },0); return t?(b/t)*100:0; }
  function netMultiplier(d) { d = d||db(); var rev = d.projects.reduce(function (s,c){ return s+earnedToDate(c); },0); var lab = d.projects.reduce(function (s,c){ return s+(Number(c.laborCost)||0); },0); return lab?rev/lab:0; }
  function billableValue(d) { d = d||db(); return d.labor.reduce(function (s,r){ return s+(Number(r.billable)||0)*(Number(r.rate)||0); },0); }
  function writeOffs(d) { d = d||db(); return d.projects.reduce(function (s,c){ return s+(Number(c.writeOff)||0); },0); }
  function realization(d) { d = d||db(); var w = billableValue(d); if (!w) return 0; return Math.max(0, Math.min(100, ((w-writeOffs(d))/w)*100)); }
  function backlogMonths(d) { d = d||db(); var un = d.projects.reduce(function (s,c){ return s+Math.max(0,(Number(c.fee)||0)-earnedToDate(c)); },0); var earned = d.projects.reduce(function (s,c){ return s+earnedToDate(c); },0); var pm = earned/12; return pm?un/pm:0; }
  function arDays(d) { d = d||db(); var open = d.invoices.filter(function (i){ return i.status==="Open"; }); var amt = open.reduce(function (s,i){ return s+(Number(i.amount)||0); },0); if (!amt) return 0; var w = open.reduce(function (s,i){ return s+(Number(i.amount)||0)*(Number(i.age)||0); },0); return w/amt; }
  function wip(d) { d = d||db(); return d.projects.reduce(function (s,c){ return s+readyToBill(c); },0); }
  function kpis() {
    var d = db(), u = utilization(d.labor), nm = netMultiplier(d), rz = realization(d), bl = backlogMonths(d), ar = arDays(d), w = wip(d);
    function band(v, b, hib) { if (hib===false) return v<=b.target[1]?"good":(v<=b.target[1]*1.4?"watch":"bad"); if (v>=b.target[0]) return "good"; if (v>=b.target[0]*0.9) return "watch"; return "bad"; }
    return [
      { k:"utilization", label:"Utilization", value:u, fmt:"pct", band:band(u,BENCH.utilization), bench:BENCH.utilization, help:"Billable hours ÷ total hours." },
      { k:"netMultiplier", label:"Net multiplier", value:nm, fmt:"x", band:band(nm,BENCH.netMultiplier), bench:BENCH.netMultiplier, help:"Net revenue ÷ direct labor cost. Below 2.9 and overhead is eating the firm." },
      { k:"realization", label:"Realization", value:rz, fmt:"pct", band:band(rz,BENCH.realization), bench:BENCH.realization, help:"Billed ÷ what the billable work was worth." },
      { k:"backlog", label:"Backlog", value:bl, fmt:"mo", band:band(bl,BENCH.backlog), bench:BENCH.backlog, help:"Contracted but unearned fee, in months of work." },
      { k:"collection", label:"AR aging", value:ar, fmt:"days", band:band(ar,BENCH.collection,false), bench:BENCH.collection, help:"Weighted days outstanding on open invoices." },
      { k:"wip", label:"WIP — unbilled", value:w, fmt:"money", band:w>90000?"watch":"good", bench:{ src:"Work performed, not yet invoiced — the number that most often surprises a principal." }, help:"Earned but not billed. Every dollar here is work you've already paid for." }
    ];
  }
  function unsealedReadyForSeal(d) { d = d||db(); return d.projects.filter(function (p){ return !p.sealed && (Number(p.pctComplete)||0) >= 85; }); }
  function sealProject(id, sealer) { return save(function (d){ d.projects.forEach(function (p){ if (p.id===id){ p.sealed=true; p.sealBy=sealer||"Engineer of Record, PE"; } }); }); }

  /* -------------------------------------------------------------- brain */
  var BRAIN = {
    pursuits: { match:["pursuit","rfq","rfp","go","no-go","win","proposal","fee","bid","shortlist","qbs","brooks","backlog","pipeline"], build:function (d){ var go=d.pursuits.filter(function(g){return g.decision==="GO";}); var val=go.reduce(function(s,g){return s+g.value;},0); var weighted=Math.round(d.pursuits.reduce(function(s,g){return s+g.value*g.probability/100;},0)); return { stance: go.length?"Put the effort behind the "+go.length+" GO pursuits ($"+val.toLocaleString()+" of fee) and formally NO-GO the Offshore Wind landing — it's out of our licensure depth and chasing it costs a principal-week.":"Nothing is a clean GO right now. Qualify before spending principal hours.", conf: go.length>=2?84:66, reasons:[{t:"data",s:go.length+" pursuits marked GO worth $"+val.toLocaleString()+"; probability-weighted pipeline is $"+weighted.toLocaleString()+"."},{t:"data",s:"Backlog is "+backlogMonths(d).toFixed(1)+" months against an "+BENCH.backlog.median+"-month A/E median — room to chase, but not a marine reach."},{t:"assumption",s:"Regional Wastewater is QBS — price can't be a selection factor, so the win rides on the SF330 and references, not the fee."}] }; } },
    design: { match:["design","phase","milestone","30","60","90","100","deliverable","production","drawing","set","staff","capacity","project"], build:function (d){ var p90=d.projects.filter(function(c){return c.phase==="P90";}); var u=utilization(d.labor); return { stance:"Protect the Prairie Ave 90% set — it's in QA/QC and the seal is the only thing between it and IFC. Hold Rathdrum Prairie at 30% until the stormwater variance path is clear.", conf:82, reasons:[{t:"data",s:p90.length+" project(s) at the 90% milestone; Prairie Ave is "+(p90[0]?p90[0].pctComplete:0)+"% complete, unsealed."},{t:"data",s:"Firm utilization is "+u.toFixed(0)+"% against a "+BENCH.utilization.target[0]+"–"+BENCH.utilization.target[1]+"% target band."},{t:"assumption",s:"Assumes the independent check on Prairie Ave clears without a redesign — if it doesn't, IFC slips."}] }; } },
    field: { match:["rfi","submittal","asi","field","contractor","site","observation","ball","court","construction","log","ncr","nonconformance"], build:function (d){ var open=d.workflow.filter(function(x){return x.status==="Open"||x.status==="In Review";}); var ours=open.filter(function(x){return x.ball==="Engineer";}); var aged=open.filter(function(x){return x.days>10;}); return { stance: ours.length?"Clear the "+ours.length+" items in our court first — SUB-104 (HDPE product data) is "+(aged[0]?aged[0].days:12)+" days out, past a normal 10-day review window.":"The log is clean on our side; the ball is with the contractor and subs.", conf:86, reasons:[{t:"data",s:open.length+" open item(s); "+ours.length+" have the ball in the Engineer's court right now."},{t:"data",s:aged.length+" item(s) past 10 days. Aging in our court is the one CA metric an owner points at in a claim."},{t:"assumption",s:"RFI-028 (utility conflict) carries cost impact — treat it as a change, not an RFI answer."}] }; } },
    money: { match:["money","fee","invoice","billing","margin","multiplier","overhead","utilization","cash","ar","wip","collect","profit","rate"], build:function (d){ var w=wip(d),ar=arDays(d),nm=netMultiplier(d); return { stance:"Bill the $"+w.toLocaleString()+" of earned-but-unbilled work this week. City Utilities and Rathdrum Prairie are both 57+ days out — the money's already earned, it's just sitting.", conf:79, reasons:[{t:"data",s:"WIP is $"+w.toLocaleString()+" earned and not yet invoiced across "+d.projects.length+" projects."},{t:"data",s:"Net multiplier is "+nm.toFixed(2)+"x against a "+BENCH.netMultiplier.target[0]+"–"+BENCH.netMultiplier.target[1]+"x target ("+BENCH.netMultiplier.src+")."},{t:"assumption",s:"Assumes no fee disputes on the aged invoices — un-audited, so this holds under the 85% Money bar by design."}] }; } },
    standards: { match:["calc","standard","code","aashto","aci","asce","ibc","aisc","spec","check","qa","qc","seal","stamp","ifc"], build:function (d){ var draft=d.calcs.filter(function(s){return s.status==="Draft";}); var ready=unsealedReadyForSeal(d); return { stance:"Finish the independent check on the two Prairie Ave packages so the Engineer of Record can seal — "+ready.length+" project(s) are at ≥90% and waiting on the stamp to reach IFC.", conf:81, reasons:[{t:"data",s:d.calcs.length+" calc package(s), "+draft.length+" still Draft; "+ready.length+" project(s) ready for seal once QA/QC clears."},{t:"data",s:"Every package is tied to a real standard (AASHTO/ACI/ASCE) with an independent-check trail — not a memory of the code."},{t:"assumption",s:"The NCR on Mill Creek (low concrete break) is a construction issue, not a design change — cores will confirm before any redesign."}] }; } },
    permits: { match:["permit","ahj","agency","usace","dot","deq","review","comment","resubmit","coordination","sub","clash"], build:function (d){ var open=d.permits.filter(function(p){return p.status==="In review";}); var un=open.reduce(function(s,p){return s+(p.comments-p.resolved);},0); return { stance:"Close the "+un+" open agency comment(s) — the USACE cycle-2 scour analysis is on the critical path to Prairie Ave's IFC.", conf:83, reasons:[{t:"data",s:open.length+" permit(s) in review with "+un+" comment(s) unresolved."},{t:"data",s:"The Corps 404/stream permit gates the bridge — no permit, no construction, sealed or not."},{t:"assumption",s:"Assumes cycle 2 is the last for USACE; a third round on scour would push the bid date."}] }; } },
    hr: { match:["hire","onboard","license","pe","eit","pdh","ce","staff","team","people","payroll","review","terminate","stamp"], build:function (d){ var lapsing=d.team.filter(function(t){return t.license && t.license.indexOf("2026")>=0;}); var onb=d.team.filter(function(t){return t.status==="Onboarding";}); return { stance: lapsing.length?"Christian Nead's PE renews this year and his PDH is behind pace — book the hours now. A lapsed stamp is a stop-work event, and he's a sealing engineer.":"Licensure and PDH are current across the team.", conf:87, reasons:[{t:"data",s:d.team.filter(function(t){return t.type==="Human";}).length+" human seat(s); "+lapsing.length+" PE license(s) renewing this year; "+onb.length+" onboarding."},{t:"data",s:"Two EITs on track toward the PE — the firm's future sealing capacity."},{t:"assumption",s:"A termination is never auto-run; it always routes to a human."}] }; } },
    it: { match:["system","health","uptime","backup","outage","security","server","model","calc","storage","incident","slow","portal"], build:function (d){ var watch=d.systems.filter(function(s){return s.state!=="CLEAR";}); return { stance: watch.length?"WATCH: "+watch.map(function(s){return s.name;}).join(", ")+". Nothing needs a human INTERVENE, but the sub-consultant exchange is at 84% and a full drive during a 90% push is a bad day.":"System is CLEAR — model store, calc pool and portal reachable, backups verified.", conf: watch.length?84:89, reasons:[{t:"data",s:d.systems.length+" service(s) monitored; "+watch.length+" on WATCH, 0 on INTERVENE."},{t:"data",s:"Nightly backup of the model store verified at 03:58 — verified, not assumed."},{t:"assumption",s:"Assumes the showroom's checks mirror production. A true INTERVENE pages a person immediately."}] }; } },
    law: { match:["contract","legal","law","ejcdc","clause","liability","claim","insurance","e&o","far","part 31","terms","risk","standard of care"], build:function (d){ var open=d.matters.filter(function(m){return m.state==="Open";}); var high=open.filter(function(m){return m.risk==="High";}); return { stance:"Two matters need a licensed attorney before anyone signs: the Prairie Ave redline striking the limitation-of-liability cap, and the high-hazard Dam Rehab standard-of-care exposure.", conf:68, reasons:[{t:"data",s:open.length+" open matter(s); "+high.length+" rated High risk."},{t:"assumption",s:"This is an advisory read, NOT legal advice. A real attorney owns the sign-off — that caps confidence under the 85% bar by design."},{t:"assumption",s:"Striking the EJCDC limitation-of-liability clause exposes the firm beyond the fee. Reads as high exposure; needs counsel."}] }; } },
    ops: { match:["operations","process","filing","calendar","follow","bottleneck","handoff","workflow","running","admin","record"], build:function (d){ var ours=d.workflow.filter(function(x){return x.ball==="Engineer" && x.status!=="Closed";}); return { stance:"The bottleneck is the seal gate, not production — Prairie Ave is done to 90% and sitting on QA/QC and a stamp while the field log carries "+ours.length+" open items.", conf:81, reasons:[{t:"data",s:ours.length+" field item(s) in the Engineer's court; utilization is "+utilization(d.labor).toFixed(0)+"%."},{t:"data",s:"Every released conclusion is filed to the project record with a calendar follow-up — nothing drops silently."},{t:"assumption",s:"Assumes current staffing; winning Regional Wastewater needs a capacity review before it overlaps Prairie Ave CA."}] }; } }
  };

  function consult(deptKey, question) {
    var d = db();
    var dept = SEATS.depts.filter(function (x){ return x.key===deptKey; })[0];
    var brain = BRAIN[deptKey];
    if (!dept || !brain) return null;
    var verdict = brain.build(d, question||"");
    var passed = verdict.conf >= dept.gate;
    var topic = dept.key;
    var stamp = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    var events = [
      { topic:topic+".sot.read", kind:"route", from:dept.dh.name, to:"Filing · SSOT", body:dept.dh.name+" is called to the Source of Truth and reads it before acting. SSOT loaded ✓ — canon, fences, and this project's record in hand.", stamp:stamp },
      { topic:topic+".ae.packaged", kind:"route", from:dept.ae.name, to:dept.pace.name, body:dept.ae.name+" (Administrative Executive) packages the ask, files it, and routes it down the bus to the triad: \""+(question||"(department review)")+"\"", stamp:stamp },
      { topic:topic+".triad.finding", kind:"deliberate", from:dept.lensA.name, to:dept.pace.name, body:"["+dept.lensA.name+"] "+lensTake(verdict,"A"), stamp:stamp },
      { topic:topic+".triad.finding", kind:"deliberate", from:dept.lensB.name, to:dept.pace.name, body:"["+dept.lensB.name+"] "+lensTake(verdict,"B"), stamp:stamp }
    ];
    var COORD = { pursuits:{to:"money",why:"confirm the fee clears the net multiplier before the proposal goes out"}, money:{to:"pursuits",why:"flag which pursuits are actually funded before they're forecast as backlog"}, design:{to:"standards",why:"line up the calc packages and the independent check against the milestone"}, field:{to:"standards",why:"pull the standard behind the submittal before it's actioned"}, standards:{to:"field",why:"hand the checked detail to the field so the log builds itself"}, permits:{to:"design",why:"get the agency comments into the set before the resubmittal"}, hr:{to:"ops",why:"get the new EIT onto the filing and follow-up calendar"}, it:{to:"ops",why:"put the storage watch on the operations follow-up calendar"}, law:{to:"money",why:"check whether the contract change moves the billing terms"}, ops:{to:"hr",why:"raise the seal-gate bottleneck as a capacity question"} };
    var co = COORD[dept.key];
    if (co) { var peer = SEATS.depts.filter(function (x){ return x.key===co.to; })[0]; if (peer) events.push({ topic:topic+".ae.lateral", kind:"route", from:dept.ae.name, to:peer.ae.name+" ("+peer.name+" AE)", body:dept.ae.name+" coordinates laterally with "+peer.ae.name+" to "+co.why+" — AE↔AE, same position, no chain needed.", stamp:stamp }); }
    if (passed) {
      events.push({ topic:topic+".pacemaker.released", kind:"conclude", from:dept.pace.name, to:dept.ae.name, body:verdict.stance, conclusion:true, verdict:verdict, gate:dept.gate, stamp:stamp });
      events.push({ topic:topic+".ae.filed", kind:"route", from:dept.ae.name, to:dept.dh.name, body:dept.ae.name+" files the released conclusion to the project record and sets a follow-up, then hands it to "+dept.dh.name+".", stamp:stamp });
      events.push({ topic:"coo.decision", kind:"route", from:dept.dh.name, to:SEATS.coo.name+" (COO)", body:dept.dh.name+" carries it up to "+SEATS.coo.name+", the interface to the principal: cleared the "+dept.gate+"% bar.", stamp:stamp });
    } else {
      events.push({ topic:"escalation.below_bar", kind:"reject", from:dept.pace.name, to:SEATS.coo.name+" → the Principal", body:"Held below the "+dept.gate+"% bar ("+verdict.conf+"%). Needs a human — not enough live data. "+dept.ae.name+" files the hold; "+SEATS.coo.name+" routes it up with reasons attached.", conclusion:true, verdict:verdict, gate:dept.gate, escalate:true, stamp:stamp });
    }
    save(function (x){ events.forEach(function (e){ e.id="e"+(x.seq++); e.dept=dept.key; x.bus.push(e); }); if (x.bus.length>60) x.bus=x.bus.slice(-60); });
    return { dept:dept, verdict:verdict, passed:passed, events:events };
  }
  function lensTake(v, which) { var pro=v.reasons.filter(function(r){return r.t==="data";})[0]; var con=v.reasons.filter(function(r){return r.t==="assumption";})[0]; if (which==="A") return "Argues FOR: "+(pro?pro.s:"the evidence supports moving."); return "Pushes back: "+(con?con.s:"the evidence isn't fully sourced yet."); }
  function routeDept(question) { var q=String(question||"").toLowerCase(),best=null,bs=0; Object.keys(BRAIN).forEach(function (k){ var sc=BRAIN[k].match.reduce(function(s,w){return s+(q.indexOf(w)>=0?1:0);},0); if (sc>bs){bs=sc;best=k;} }); return best||"design"; }
  function askNova(question) {
    var deptKey = routeDept(question);
    var dept = SEATS.depts.filter(function (x){ return x.key===deptKey; })[0];
    var stamp = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    save(function (x){ x.bus.push({ id:"e"+(x.seq++), dept:"coo", topic:"coo.route", kind:"route", from:SEATS.coo.name+" (COO)", to:dept.dh.name+" ("+dept.name+")", body:SEATS.coo.name+" takes the ask off the principal's desk and routes it to "+dept.name+" — she gates and packages, she doesn't do the work herself.", stamp:stamp }); });
    var r = consult(deptKey, question);
    var packaged = r.passed ? (SEATS.coo.name+": On track. "+dept.name+" cleared its "+dept.gate+"% bar — I'm releasing this to you. "+r.verdict.stance) : (SEATS.coo.name+": Holding this off your desk. "+dept.name+" came in at "+r.verdict.conf+"%, under its "+dept.gate+"% bar — it needs a human. Here's what I have, and I've set a follow-up. "+r.verdict.stance);
    return { deptKey:deptKey, dept:dept, result:r, packaged:packaged, on_track:r.passed };
  }

  function approvals() { return db().approvals || []; }
  function stage(kind, title, summary, why, by) { var item = { id:"ap"+now(), kind:kind||"general", title:title||"Untitled", summary:summary||"", why:why||"Behind a fence — needs the principal.", by:by||"The org", state:"Pending" }; save(function (d){ (d.approvals=d.approvals||[]).push(item); }); return item; }
  function decideApproval(id, decision) { save(function (d){ (d.approvals||[]).forEach(function (a){ if (a.id===id) a.state=decision; }); }); return approvals(); }

  /* -------------------------------------------------------------- configurator */
  function tier() { return db().tier || "grandsuite"; }
  function tierRank() { return TIERS[tier()].rank; }
  function setTier(k) { save(function (d){ d.tier=k; d.adds=[]; d.offs=[]; }); }
  function activeRooms() { var d=db(); var inc=(TIERS[d.tier]||TIERS.grandsuite).includes.slice(); (d.offs||[]).forEach(function(k){var i=inc.indexOf(k);if(i>=0)inc.splice(i,1);}); (d.adds||[]).forEach(function(k){if(inc.indexOf(k)<0&&ROOMS[k])inc.push(k);}); return inc; }
  function hasRoom(k) { return !k || activeRooms().indexOf(k)>=0; }
  function toggleRoom(k) { if (!ROOMS[k]) return; save(function (d){ var inc=(TIERS[d.tier]||TIERS.grandsuite).includes; d.adds=d.adds||[]; d.offs=d.offs||[]; var inP=inc.indexOf(k)>=0,iA=d.adds.indexOf(k),iO=d.offs.indexOf(k); if (inP){ if(iO>=0)d.offs.splice(iO,1); else d.offs.push(k); } else { if(iA>=0)d.adds.splice(iA,1); else d.adds.push(k); } }); }
  function priceNow() {
    var d=db(), t=TIERS[d.tier]||TIERS.grandsuite;
    var adds=(d.adds||[]).filter(function(k){return ROOMS[k];}), offs=(d.offs||[]).filter(function(k){return ROOMS[k];});
    var addMo=adds.reduce(function(s,k){return s+ROOMS[k].mo;},0), addBuild=adds.reduce(function(s,k){return s+ROOMS[k].build;},0);
    var offMo=offs.reduce(function(s,k){return s+ROOMS[k].mo;},0), offBuild=offs.reduce(function(s,k){return s+ROOMS[k].build;},0);
    var rooms=activeRooms();
    var alaMo=rooms.reduce(function(s,k){return s+(ROOMS[k]?ROOMS[k].mo:0);},0), alaBuild=rooms.reduce(function(s,k){return s+(ROOMS[k]?ROOMS[k].build:0);},0);
    var mo=Math.max(0,t.mo+addMo-offMo), build=Math.max(0,t.build+addBuild-offBuild);
    return { tier:t, rooms:rooms, adds:adds, offs:offs, mo:mo, build:build, addMo:addMo, offMo:offMo, addBuild:addBuild, offBuild:offBuild, alaMo:alaMo, alaBuild:alaBuild, platformMo:Math.max(0,mo-alaMo), savingMo:Math.max(0,alaMo-mo), changed:adds.length>0||offs.length>0 };
  }
  function priceLabel() { var t=TIERS[db().tier]||TIERS.grandsuite; return (t.name||"Grandsuite")+" · every department on"; }

  /* -------------------------------------------------------------- view helpers */
  function el(html) { var t=document.createElement("template"); t.innerHTML=String(html).trim(); return t.content.firstChild; }
  function esc(s) { return String(s==null?"":s).replace(/[&<>"']/g, function (c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function money(n){ return "$"+(Math.round(Number(n)||0)).toLocaleString(); }
  function pct(n, dp){ return (Number(n)||0).toFixed(dp===undefined?0:dp)+"%"; }

  function brandMark() {
    return '<img src="mca-mark.svg" alt="McArthur Engineering" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'fallback\')">' +
      '<svg class="fallback-mark" viewBox="0 0 32 32" width="24" height="24" style="display:none" aria-hidden="true"><g fill="none" stroke="#eaf6f9" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M3 25 L16 6 L29 25 Z"/><path d="M3 25 L16 16 L29 25"/><path d="M16 6 L16 16"/></g></svg>';
  }

  function renderShell(active) {
    var side = document.createElement("aside"); side.className = "sidebar";
    side.appendChild(el('<a href="dashboard.html" class="brand"><div class="bmark" aria-hidden="true">'+brandMark()+'</div><div><div class="bt">McArthur Engineering</div><div class="bs">Engineering Operating System</div></div></a>'));
    var nav = document.createElement("nav"); nav.className = "nav"; var on = activeRooms();
    DEPTS.forEach(function (grp) {
      nav.appendChild(el('<div class="nav-group">'+esc(grp.group)+'</div>'));
      grp.items.forEach(function (it) {
        var off = it.room && on.indexOf(it.room)<0;
        var a = el('<a href="'+(off?"javascript:void(0)":it.href)+'" class="navlink '+(it.href===active?"active":"")+(off?" locked":"")+'"><span class="ic">'+it.ic+'</span><span class="lb">'+esc(it.label)+'</span>'+(off?'<span class="tier-tag">+'+money(ROOMS[it.room].mo)+'</span>':'')+'</a>');
        if (off) { a.title="Add "+ROOMS[it.room].label+" for "+money(ROOMS[it.room].mo)+"/mo + "+money(ROOMS[it.room].build)+" build"; a.addEventListener("click", function (){ toggleRoom(it.room); toast(ROOMS[it.room].label+" added — "+priceLabel(),"ok"); setTimeout(function(){location.reload();},500); }); }
        nav.appendChild(a);
      });
    });
    side.appendChild(nav);
    return side;
  }

  function renderTopbar(crumb) {
    var p = priceNow();
    var bar = document.createElement("div"); bar.className = "topbar";
    bar.innerHTML = '<button class="navtoggle" id="navToggle" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><div class="crumbs">McArthur Engineering · <b>'+esc(crumb)+'</b></div><div class="spacer"></div><div class="tierpill" id="tierPill" role="button" tabindex="0"><span class="dot"></span><div><b>'+esc(p.tier.name)+(p.changed?' <i class="cfg">configured</i>':'')+'</b> <span class="price">every department on</span></div><span class="chev">▾</span></div><div class="who"><div class="av">SM</div><div>Scott McArthur, PE<br><span class="muted small">Principal · Engineer of Record</span></div></div>';
    var menu = document.createElement("div"); menu.className = "tiermenu"; menu.id = "tierMenu";
    menu.appendChild(el('<div class="tm-head">Start from a package, then <b>add or take off any department</b>. Every one is priced on its own, so the build fits the firm instead of the firm fitting the build.</div>'));
    Object.keys(TIERS).sort(function (a,b){ return TIERS[b].rank-TIERS[a].rank; }).forEach(function (k) {
      var tt = TIERS[k];
      var opt = el('<div class="tieropt '+(k===tier()?"on":"")+'"><div class="to-top"><span class="to-name">'+esc(tt.name)+'</span><span class="to-price">'+money(tt.mo)+'/mo · '+money(tt.build)+' build</span></div><div class="to-desc">'+esc(tt.desc)+'</div><div class="to-base">'+esc(tt.base)+' · '+tt.includes.length+' departments</div></div>');
      opt.addEventListener("click", function (e){ e.stopPropagation(); setTier(k); location.reload(); });
      menu.appendChild(opt);
    });
    menu.appendChild(el('<div class="tm-sub">Departments — toggle any one on or off</div>'));
    var on = activeRooms(); var list = document.createElement("div"); list.className = "roomlist";
    Object.keys(ROOMS).forEach(function (k) {
      var r = ROOMS[k], isOn = on.indexOf(k)>=0, inPack = p.tier.includes.indexOf(k)>=0;
      var row = el('<div class="roomrow '+(isOn?"on":"")+'"><span class="rr-box">'+(isOn?"✓":"+")+'</span><span class="rr-name">'+esc(r.label)+(isOn&&!inPack?' <i class="rr-flag add">added</i>':'')+(!isOn&&inPack?' <i class="rr-flag off">removed</i>':'')+'</span><span class="rr-price">'+money(r.mo)+'/mo<i>'+money(r.build)+' build</i></span><span class="rr-why">'+esc(r.why)+'</span></div>');
      row.addEventListener("click", function (e){ e.stopPropagation(); toggleRoom(k); toast(r.label+(activeRooms().indexOf(k)>=0?" added — ":" removed — ")+priceLabel(),"ok"); setTimeout(function(){location.reload();},500); });
      list.appendChild(row);
    });
    menu.appendChild(list);
    var total = '<div class="tm-total"><div class="tt-line"><span>'+esc(p.tier.name)+' package</span><b>'+money(p.tier.mo)+'/mo</b></div>'+(p.adds.length?'<div class="tt-line add"><span>+ '+p.adds.length+' department'+(p.adds.length>1?"s":"")+' added</span><b>+'+money(p.addMo)+'/mo</b></div>':'')+(p.offs.length?'<div class="tt-line off"><span>− '+p.offs.length+' department'+(p.offs.length>1?"s":"")+' removed</span><b>−'+money(p.offMo)+'/mo</b></div>':'')+'<div class="tt-line grand"><span>Configured</span><b>'+money(p.mo)+'/mo · '+money(p.build)+' build</b></div><div class="tt-save">'+p.rooms.length+' department'+(p.rooms.length===1?"":"s")+' at '+money(p.alaMo)+'/mo, plus '+money(p.platformMo)+'/mo platform — '+esc(p.tier.base.toLowerCase())+'.</div><div class="tt-draft">Draft pricing — Accelerated Experiences LLC sets every live price.</div></div>';
    menu.appendChild(el(total));
    menu.addEventListener("click", function (e){ e.stopPropagation(); });
    setTimeout(function () { var pill=document.getElementById("tierPill"); if (pill) pill.addEventListener("click", function (e){ e.stopPropagation(); menu.classList.toggle("open"); }); document.addEventListener("click", function (){ menu.classList.remove("open"); }); }, 0);
    var frag = document.createDocumentFragment(); frag.appendChild(bar); frag.appendChild(menu); return frag;
  }
  function ribbon() { return el('<div class="ribbon"><span class="live">McARTHUR OS · PRIVATE PREVIEW</span> — your real system, running in your browser. Everything you type stays on this machine and resets when you leave. <a href="javascript:void(0)" id="resetFloor">Reset the floor</a></div>'); }
  function footer() { return el('<div class="ae-credit">Built for <b>McArthur Engineering</b> by Accelerated Experiences LLC · The team and The Arc are real; operational figures in this preview are sample data, benchmarks sourced and tagged.</div>'); }

  function mount(opts) {
    opts = opts || {}; db();
    var app = document.createElement("div"); app.className = "app";
    var scrim = document.createElement("div"); scrim.className = "navscrim"; scrim.id = "navScrim";
    var side = renderShell(opts.active);
    var main = document.createElement("div"); main.className = "main";
    main.appendChild(ribbon());
    main.appendChild(renderTopbar(opts.crumb || "Command Center"));
    var content = document.createElement("div"); content.className = "content"; content.id = "content";
    main.appendChild(content); main.appendChild(footer());
    app.appendChild(scrim); app.appendChild(side); app.appendChild(main);
    document.body.innerHTML = ""; document.body.appendChild(app);
    document.body.appendChild(el('<div id="toast-wrap"></div>'));
    setTimeout(function () {
      var r = document.getElementById("resetFloor");
      if (r) r.addEventListener("click", function (){ resetFloor(); toast("Showroom reset to a fresh floor.","ok"); setTimeout(function(){location.reload();},450); });
      var t = document.getElementById("navToggle");
      if (t) t.addEventListener("click", function (){ app.classList.toggle("nav-open"); });
      if (scrim) scrim.addEventListener("click", function (){ app.classList.remove("nav-open"); });
    }, 0);
    return content;
  }
  function toast(msg, kind) { var w=document.getElementById("toast-wrap"); if (!w) return; var t=el('<div class="toast '+(kind||"")+'">'+esc(msg)+'</div>'); w.appendChild(t); setTimeout(function (){ t.style.opacity="0"; setTimeout(function(){t.remove();},250); }, 2600); }

  function page(title, sub, actionsHTML) { return el('<div class="pagehead"><div><h1>'+esc(title)+'</h1>'+(sub?'<p class="sub">'+sub+'</p>':"")+'</div><div class="pagehead-actions">'+(actionsHTML||"")+'</div></div>'); }
  function card(inner, cls) { return el('<section class="card '+(cls||"")+'">'+inner+'</section>'); }
  function stat(label, value, note, band) { return '<div class="stat '+(band||"")+'"><div class="s-l">'+esc(label)+'</div><div class="s-v">'+value+'</div>'+(note?'<div class="s-n">'+note+'</div>':"")+'</div>'; }
  function tag(text, kind) { return '<span class="tag '+(kind||"")+'">'+esc(text)+'</span>'; }
  function srcNote(text) { return '<div class="srcnote">Source: '+esc(text)+'</div>'; }

  document.addEventListener("visibilitychange", function (){ if (!document.hidden) db(); });

  global.Truss = {
    db:db, save:save, resetFloor:resetFloor, fresh:fresh, SEED:SEED,
    MODULES:MODULES, moduleList:moduleList, activeModule:activeModule, setModule:setModule,
    PHASES:PHASES, CA_TYPES:CA_TYPES, BALL:BALL, STANDARDS:STANDARDS, BENCH:BENCH, REPLACES:REPLACES,
    TIERS:TIERS, ROOMS:ROOMS, DEPTS:DEPTS, SEATS:SEATS, BRAIN:BRAIN,
    tier:tier, tierRank:tierRank, setTier:setTier, activeRooms:activeRooms, hasRoom:hasRoom, toggleRoom:toggleRoom, priceNow:priceNow, priceLabel:priceLabel,
    consult:consult, askNova:askNova, routeDept:routeDept,
    feeByPhase:feeByPhase, feeFromConstruction:feeFromConstruction, earnedToDate:earnedToDate, readyToBill:readyToBill, reimbursable:reimbursable, REIMB_MARKUP:REIMB_MARKUP,
    utilization:utilization, netMultiplier:netMultiplier, realization:realization, backlogMonths:backlogMonths, arDays:arDays, wip:wip, kpis:kpis,
    unsealedReadyForSeal:unsealedReadyForSeal, sealProject:sealProject,
    approvals:approvals, stage:stage, decideApproval:decideApproval,
    mount:mount, toast:toast, el:el, esc:esc, money:money, pct:pct, page:page, card:card, stat:stat, tag:tag, srcNote:srcNote
  };
})(window);

/* ============================================================================
   AE in-flow COO assistant (Jul 28 2026) — "Ask the COO" on every page.
   Self-contained. Auto-detects the OS engine and drops a floating assistant
   into every room. Two jobs:
     1) CONCIERGE — explains the agent organization, how the system works,
        customization/white-label, and live pricing (pulled from the OS's own
        TIERS/ROOMS/SEATS).
     2) OPERATOR — business/operational questions route through the real agent
        org (routeDept -> consult -> gated verdict), same as the Org page.
   Ghost Mode: it answers, it never acts.
   ============================================================================ */
(function(){
  function findENG(){
    var names=['FB','Amph','EightMM','Truss','Abode','LilNinja','Buttress','Musical','Showroom'];
    for(var i=0;i<names.length;i++){ var g=window[names[i]]; if(g&&g.routeDept&&g.consult&&g.SEATS&&g.SEATS.coo&&g.SEATS.depts) return g; }
    return null;
  }
  function init(){
    if(document.getElementById('aeCooFab')) return;
    if(!document.querySelector('.app')) return;           // inside the OS only, not the gate
    var ENG=findENG(); if(!ENG) return;
    var isTg=(window.Showroom&&ENG===window.Showroom);
    var esc=ENG.esc||function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
    var money=ENG.money||function(n){return '$'+(Math.round(n||0)).toLocaleString();};
    var coo=ENG.SEATS.coo, nd=ENG.SEATS.depts.length;
    var v=isTg
      ?{surface:'var(--panel,#181E2A)',surf2:'var(--panel-2,#1F2634)',text:'var(--text,#EAEDF4)',mut:'var(--muted,#8B95A9)',line:'var(--line,#2C3547)',prim:'var(--brand,#FF6A2C)',onprim:'#160a04',good:'var(--ok,#4ADE80)',warn:'var(--warn,#FBBF24)'}
      :{surface:'var(--card,#fff)',surf2:'var(--sunk,#efe9df)',text:'var(--ink,#1a1a1a)',mut:'var(--mut,#888)',line:'var(--line,#ddd)',prim:'var(--mag,#c8501e)',onprim:'#fff',good:'var(--good,#4a8a5a)',warn:'var(--watch,#d19a2b)'};
    var st=document.createElement('style'); st.id='aeCooStyle';
    st.textContent=
      '#aeCooFab{position:fixed;right:18px;bottom:18px;z-index:95;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;background:'+v.prim+';color:'+v.onprim+';box-shadow:0 12px 30px -8px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;transition:transform .15s}'+
      '#aeCooFab:hover{transform:translateY(-2px)}'+
      '#aeCooFab .lbl{position:absolute;right:62px;white-space:nowrap;background:'+v.surface+';color:'+v.text+';border:1px solid '+v.line+';border-radius:999px;padding:5px 11px;font-size:11.5px;font-weight:700;box-shadow:0 8px 22px -12px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .15s}'+
      '#aeCooFab:hover .lbl{opacity:1}'+
      '#aeCooPanel{position:fixed;right:18px;bottom:82px;z-index:130;width:346px;max-width:calc(100vw - 30px);height:486px;max-height:calc(100dvh - 120px);border-radius:16px;background:'+v.surface+';border:1px solid '+v.line+';box-shadow:0 26px 64px -20px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden}'+
      '#aeCooPanel.open{display:flex}'+
      '.aecoo-head{padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid '+v.line+'}'+
      '.aecoo-head .av{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;font-weight:800;font-size:13px;background:'+v.prim+';color:'+v.onprim+'}'+
      '.aecoo-head b{font-size:13.5px;color:'+v.text+'} .aecoo-head .r{font-size:10.5px;color:'+v.mut+'}'+
      '.aecoo-x{margin-left:auto;background:transparent;border:none;color:'+v.mut+';cursor:pointer;font-size:19px;line-height:1}'+
      '.aecoo-msgs{flex:1;overflow-y:auto;padding:13px;display:flex;flex-direction:column;gap:11px}'+
      '.aecoo-b{max-width:88%;padding:9px 12px;border-radius:13px;font-size:12.6px;line-height:1.5;white-space:pre-wrap}'+
      '.aecoo-b.you{align-self:flex-end;background:'+v.prim+';color:'+v.onprim+';border-bottom-right-radius:4px}'+
      '.aecoo-b.coo{align-self:flex-start;background:'+v.surf2+';color:'+v.text+';border-bottom-left-radius:4px}'+
      '.aecoo-b.coo.held{border:1px solid '+v.warn+'}'+
      '.aecoo-meta{font-size:10px;font-family:monospace;margin-top:7px;color:'+v.mut+'}'+
      '.aecoo-reasons{margin:8px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:5px}'+
      '.aecoo-reasons li{font-size:11px;line-height:1.45;display:flex;gap:6px;color:'+v.text+'}'+
      '.aecoo-rtag{font-family:monospace;font-size:8px;letter-spacing:.04em;padding:1px 4px;border-radius:3px;height:fit-content;margin-top:2px;font-weight:700;flex:none}'+
      '.aecoo-rtag.data{background:'+v.good+';color:#fff} .aecoo-rtag.assumption{background:'+v.warn+';color:#2a2000}'+
      '.aecoo-foot{padding:10px 12px;border-top:1px solid '+v.line+'}'+
      '.aecoo-samples{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}'+
      '.aecoo-chip{font-size:10.5px;padding:4px 9px;border-radius:999px;cursor:pointer;border:1px solid '+v.line+';background:'+v.surf2+';color:'+v.text+'}'+
      '.aecoo-inrow{display:flex;gap:7px}'+
      '.aecoo-in{flex:1;border-radius:9px;padding:9px 10px;font-size:12.5px;border:1px solid '+v.line+';background:'+v.surface+';color:'+v.text+'}'+
      '.aecoo-in:focus{outline:none;border-color:'+v.prim+'}'+
      '.aecoo-send{border:none;border-radius:9px;padding:0 14px;font-weight:800;cursor:pointer;background:'+v.prim+';color:'+v.onprim+'}';
    document.head.appendChild(st);

    /* ---------- concierge knowledge (about the system itself) ---------- */
    function kb(q){
      q=(q||'').toLowerCase();
      function m(){for(var i=0;i<arguments.length;i++){if(q.indexOf(arguments[i])>=0)return true;}return false;}
      function money2(n){ n=Math.round(n||0); return '$'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,','); }
      var d=ENG.db();
      if(m('the arc','arc doing','post falls')){
        var arc=d.projects.filter(function(p){return p.name.indexOf('The Arc')===0;})[0];
        if(arc){ var earned=ENG.earnedToDate?ENG.earnedToDate(arc):0;
          return 'The Arc — Post Falls: '+arc.pctComplete+'% complete, phase '+arc.phase+'. Fee '+money2(arc.fee)+', earned to date '+money2(earned)+', billed '+money2(arc.billed)+' — about '+money2(earned-arc.billed)+' is earned but not yet invoiced. Lead: '+arc.lead+'. The Projects room has the full spine.'; } }
      if(m('money','cash','billing','invoice','owed','receivable','unbilled','wip','revenue','collect')){
        var fee=0,billed=0,earned=0; d.projects.forEach(function(p){fee+=p.fee||0;billed+=p.billed||0;earned+=(ENG.earnedToDate?ENG.earnedToDate(p):0);});
        var un=(d.invoices||[]).filter(function(i){return !i.paid&&!/paid/i.test(i.status||'');}).length;
        return 'The money right now: '+money2(fee)+' of fee under contract, '+money2(earned)+' earned, '+money2(billed)+' billed — about '+money2(Math.max(0,earned-billed))+' of finished work is not yet invoiced (your WIP). '+un+' invoice(s) out and open. Billing and Books have the line-by-line.';}
      if(m('team','who works','staff','crew','christian','cameron','foster','angela','employees')){
        var hs=d.team.filter(function(t){return t.type==='Human';}).map(function(t){return t.name.split(' ')[0]+' ('+t.role.split('/')[0].trim()+')';});
        return 'The crew: '+hs.join(', ')+'. Each gets their own sign-in and their own permissions — Scott sees everything; everyone else sees their part. HR · People Ops holds licenses and details.';}
      if(m('attention','needs me','waiting','approve','approval','my desk','to do','priorities')){
        var ap=(d.approvals||[]);
        var unsealed=d.projects.filter(function(p){return p.phase==='P100'&&!p.sealed;}).length;
        return 'On your desk: '+ap.length+' item(s) at the Approval Desk'+(unsealed?(' and '+unsealed+' finished package(s) waiting on your PE seal'):'')+'. Nothing sends, spends or signs without you — that is the standing rule.';}
      if(m('office','address','phone','hours','contact','where are'))
        return 'McArthur Engineering Company LLC · 14841 Idaho 41, Rathdrum, ID · (208) 446-3307 · admin@mcarthur-eng.com · Mon–Fri 8:00–4:30.';
      if(m('agent org','organization','the seats','how the org','the org','deliberat','confidence bar','ghost mode','deepseek','ai org','how does the ai','departments do'))
        return 'Under the hood this firm runs a '+nd+'-department organization, and I’m '+coo.name+', the COO. Ask me anything; I route it to one department, its five-seat chain works it under a confidence bar, and I bring back one clean answer with reasons. Money and compliance hold a higher 85% bar and come to Scott if uncertain. Nothing acts alone — anything that would send, spend or sign stops at the Approval Desk.';
      if(m('what is this','what does it do','how does it work','is this real','a demo','real app','what can you do','what can it do'))
        return 'This is McArthur Engineering’s operating system — the whole firm on one spine: projects, the field log, calcs, the seal gate, permits, billing and the books, all computed from the same data. In this private preview it runs in your browser and resets when you leave; the full version runs on secured accounts with your real files. Ask me about The Arc, the money, the team, or what needs your attention.';
      if(m('who are you','your name','what are you'))
        return 'I’m '+coo.name+' — McArthur Engineering’s Chief Operating Officer seat. I sit between Scott and the departments: I take the question, route it, and bring back one answer. Try “How is The Arc doing?” or “What needs my attention?”';
      return null;
    }

    var fab=document.createElement('button'); fab.id='aeCooFab'; fab.setAttribute('aria-label','Ask '+coo.name);
    fab.innerHTML='<span class="lbl">Ask '+esc(coo.name)+'</span>◎';
    document.body.appendChild(fab);

    var samples=['What needs my attention?','How is The Arc doing?','Where is the money right now?','Who is on the team?'];
    var panel=document.createElement('div'); panel.id='aeCooPanel';
    panel.innerHTML=
      '<div class="aecoo-head"><div class="av">'+esc(coo.name.charAt(0))+'</div><div><b>'+esc(coo.name)+'</b><div class="r">'+esc(coo.role)+' · agent org + concierge</div></div><button class="aecoo-x" aria-label="Close">×</button></div>'+
      '<div class="aecoo-msgs" id="aeCooMsgs"></div>'+
      '<div class="aecoo-foot"><div class="aecoo-samples">'+samples.map(function(s){return '<span class="aecoo-chip">'+esc(s)+'</span>';}).join('')+'</div>'+
      '<div class="aecoo-inrow"><input class="aecoo-in" id="aeCooIn" placeholder="Ask '+esc(coo.name)+' anything…"><button class="aecoo-send" id="aeCooSend">Ask</button></div></div>';
    document.body.appendChild(panel);

    var msgs=panel.querySelector('#aeCooMsgs'), input=panel.querySelector('#aeCooIn');
    function bubble(cls,html){ var b=document.createElement('div'); b.className='aecoo-b '+cls; b.innerHTML=html; msgs.appendChild(b); msgs.scrollTop=msgs.scrollHeight; return b; }
    bubble('coo','Morning Scott — I’m '+esc(coo.name)+', your COO. I can tell you how The Arc is tracking, where the money sits, who’s carrying what, and what’s waiting on your desk — or ask anything and I’ll route it to the right department.');
    function ask(q){
      q=(q||'').trim(); if(!q){ input.focus(); return; }
      bubble('you',esc(q)); input.value='';
      var k=kb(q);
      if(k){ bubble('coo', esc(k).replace(/\n/g,'<br>')); return; }        // concierge answer
      var dk=ENG.routeDept(q), r=ENG.consult(dk,q);                         // else route to the org
      if(!r){ bubble('coo','I couldn’t route that one — try rephrasing, or ask me about the org, pricing or customization.'); return; }
      var dept=ENG.SEATS.depts.filter(function(x){return x.key===dk;})[0]||{name:dk,gate:80};
      var vd=r.verdict, passed=r.passed;
      var reasons=(vd.reasons||[]).map(function(x){return '<li><span class="aecoo-rtag '+esc(x.t)+'">'+esc((x.t||'').toUpperCase())+'</span><span>'+esc(x.s)+'</span></li>';}).join('');
      var head=passed?esc(vd.stance):(esc(coo.name)+': Holding this for you — '+esc(dept.name)+' came in at '+vd.conf+'%, under its '+dept.gate+'% bar, so it needs a human. '+esc(vd.stance));
      bubble('coo'+(passed?'':' held'), head+
        '<ul class="aecoo-reasons">'+reasons+'</ul>'+
        '<div class="aecoo-meta">'+esc(dept.name)+' · '+vd.conf+'% vs '+dept.gate+'% bar · '+(passed?'released':'held — needs you')+'</div>');
    }
    fab.onclick=function(){ panel.classList.toggle('open'); if(panel.classList.contains('open')) setTimeout(function(){input.focus();},50); };
    panel.querySelector('.aecoo-x').onclick=function(){ panel.classList.remove('open'); };
    panel.querySelector('#aeCooSend').onclick=function(){ ask(input.value); };
    input.addEventListener('keydown',function(e){ if(e.key==='Enter') ask(input.value); });
    Array.prototype.forEach.call(panel.querySelectorAll('.aecoo-chip'),function(c){ c.onclick=function(){ ask(c.textContent); }; });
  }
  function boot(){ init(); setTimeout(init,200); setTimeout(init,600); setTimeout(init,1400); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ── McArthur Owner's Manual — help panel on every OS page ──────────────────
   Guide (search) + Ask (keyword matcher, honest — no AI freeform).
   Round ? button bottom-LEFT (COO assistant owns bottom-right).
   Support & documentation by Accelerated Experiences, LLC. */
(function(){
  if (typeof document==='undefined') return;
  var MANCATS=[
    {k:'start',label:'Start here',ic:'🚀'},{k:'work',label:'The work',ic:'📐'},
    {k:'money',label:'The money',ic:'💵'},{k:'people',label:'People & org',ic:'👷'},
    {k:'safe',label:'Private & safe',ic:'🔒'}
  ];
  var MANUAL=[
   {c:'start',t:'What this is',g:'overview what is this office system os everything',
    b:'This is your firm\'s operating system — the private side of McArthur Engineering. Every project, dollar, drawing set and person in one place. The public website is separate; customers never see any of this.'},
   {c:'start',t:'The website vs. your Office',g:'website public marketing site difference two doors',
    b:'Two doors, one building. The WEBSITE (the pretty page with The Arc on it) is public — that\'s what customers see. Your OFFICE (this) is private — you reach it through the little gear ⚙ on the website, and only your people can enter.'},
   {c:'start',t:'How to get around',g:'navigate menu sidebar rooms move around find',
    b:'The left sidebar is the whole building — every room is one click: Command Center, Calendar, Projects, Billing, and so on. On a phone, tap the ☰ button to open the same menu.'},
   {c:'start',t:'The Command Center numbers, in English',g:'dashboard wip utilization multiplier realization backlog numbers mean',
    b:'WIP = work you\'ve done but haven\'t billed yet (money sitting on the table). Utilization = how much of your people\'s time is on paying work. Multiplier = what a dollar of labor turns into as fee. Realization = how much of your fee you actually collect. All computed live from your own projects.'},
   {c:'work',t:'Projects & the 30/60/90/100 phases',g:'projects phases percent milestones preliminary detailed ifc issued construction',
    b:'Every job moves 30% → 60% → 90% → 100% (Issued for Construction) — the same way you already work. The Projects room shows each job\'s phase, percent complete, fee and earned value. The Arc sits on top.'},
   {c:'work',t:'The field log — RFIs & submittals',g:'workflow field rfi submittal asi inspection construction log ball in court',
    b:'The Module Workflow room is the construction-administration log: RFIs, submittals, ASIs and field reports, with who\'s holding the ball and for how long. Christian\'s home room.'},
   {c:'work',t:'Calcs & standards',g:'calcs calculations standards codes aashto aci asce checks',
    b:'The Calcs room tracks the calculation packages behind each job and which code they answer to (ASCE 7, ACI 318, AASHTO…). Each calc gets an independent check before it backs a sealed sheet.'},
   {c:'work',t:'The PE Seal — the gate',g:'seal stamp pe sign issued for construction gate release',
    b:'Nothing goes out the door as Issued-for-Construction until the engineer of record — you — seals it. The Seal room is that gate: what\'s waiting on your stamp and what it\'s waiting on.'},
   {c:'work',t:'Permits & agencies',g:'permits ahj city county agency review approvals submittals',
    b:'The Permits room tracks every agency submittal — who has it, how long they\'ve had it, and what\'s due back. No more "wait, did the county ever respond?"'},
   {c:'work',t:'Your calendar — on your phone',g:'calendar subscribe google apple iphone reminders events',
    b:'The Calendar room holds every date the firm runs on. Press Subscribe once and it lands on your iPhone/Google/Apple calendar with native reminders — deadlines follow you.'},
   {c:'money',t:'Pursuits — go or no-go',g:'pursuits leads new business go no go chase work',
    b:'Every prospective job gets a clear-eyed go/no-go before you spend hours on it: fee, odds, and fit, laid out so passing on a loser is easy.'},
   {c:'money',t:'Proposals & fees',g:'proposals fee letter pricing percent construction lump sum hourly',
    b:'Build fee proposals the way engineers actually price — % of construction, lump sum, or hourly NTE — and track which are out, won, or dead.'},
   {c:'money',t:'Billing',g:'billing invoices ar aging collect paid',
    b:'Invoices by project, what\'s been billed against each fee, and AR aging — who owes you and for how long. WIP on the dashboard is the work you haven\'t billed yet.'},
   {c:'money',t:'Books & multipliers',g:'books margins multiplier overhead breakeven labor',
    b:'The firm\'s financial spine: labor cost, overhead, the multiplier, and break-even — the same math Deltek and Zweig publish, computed live from your own jobs.'},
   {c:'people',t:'Your crew & licenses',g:'hr people team pe license renewal pdh ce staff',
    b:'HR · People Ops holds the crew — you, Christian, Cameron, Foster, Angela — plus PE license renewals and PDH hours so a lapse never sneaks up.'},
   {c:'people',t:'Who sees what (privileges)',g:'privileges permissions roles sign in staff access employees accounts',
    b:'When this runs for real, each person gets their own sign-in: you see everything; Christian gets projects and the field but not the books; Cameron gets drawings; Foster his assignments; Angela the front office. You set it, you change it, you can shut anyone\'s door instantly.'},
   {c:'people',t:'The AI departments (the Org)',g:'org ai agents departments coo nova ledger seats',
    b:'Under the hood is a staffed org of AI seats — departments with a head, a checker, and a pacemaker that won\'t release sloppy work. Nova is the COO seat that routes and packages; Ledger owns standards and the independent check. They draft; humans decide.'},
   {c:'safe',t:'Is this private?',g:'private secure who can see safety data security',
    b:'Yes. The website is public; the Office is not. In this preview, everything you type stays in your own browser and is never uploaded anywhere. The real version runs on secured accounts you control.'},
   {c:'safe',t:'Can I break it?',g:'break undo mistake reset floor experiment try',
    b:'No. Click anything, type anything, try everything. In this preview the floor resets itself when you leave — there\'s a "Reset the floor" link in the top bar if you want a clean slate. You cannot hurt it.'},
   {c:'safe',t:'Nothing sends without you',g:'approvals send email publish spend money ghost',
    b:'Anything that would leave the building — an email, an invoice, a filing — stops at the Approval Desk for a human OK first. The system drafts; the owner releases.'}
  ];
  var SYN={password:'sign in',login:'sign in',stamp:'seal',invoice:'billing',bill:'billing',
    pay:'billing',schedule:'calendar',phone:'calendar subscribe',employee:'staff privileges',
    crew:'staff people',rfi:'field workflow',cost:'money books',profit:'multiplier books',
    website:'public marketing',secure:'private safe',help:'manual',manual:'what this is'};
  function mesc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var Q='',CAT='all';
  function score(a,q){var w=q.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(function(x){return x.length>2;});
    var s=0;w.forEach(function(t){var tt=SYN[t]?t+' '+SYN[t]:t;tt.split(' ').forEach(function(x){
      if(a.t.toLowerCase().indexOf(x)>-1)s+=4;if(a.g.indexOf(x)>-1)s+=2;if(a.b.toLowerCase().indexOf(x)>-1)s+=1;});});return s;}
  function guide(){var list=MANUAL.filter(function(a){return CAT==='all'||a.c===CAT;});
    if(Q){list=list.map(function(a){return{a:a,s:score(a,Q)};}).filter(function(x){return x.s>0;})
      .sort(function(x,y){return y.s-x.s;}).map(function(x){return x.a;});}
    var el=document.getElementById('man-list');if(!el)return;
    el.innerHTML=list.length?list.map(function(a){var c=MANCATS.filter(function(x){return x.k===a.c;})[0];
      return '<details class="man-art"><summary>'+(c?c.ic+' ':'')+mesc(a.t)+'</summary><p>'+mesc(a.b)+'</p></details>';}).join('')
      :'<p style="color:#8a8b82;font-size:13px;padding:8px 2px">Nothing matched — try different words, or ask below.</p>';}
  function ask(q){var log=document.getElementById('man-log');if(!log||!q)return;
    log.innerHTML+='<div class="man-me">'+mesc(q)+'</div>';
    var hits=MANUAL.map(function(a){return{a:a,s:score(a,q)};}).filter(function(x){return x.s>0;}).sort(function(x,y){return y.s-x.s;});
    var html; if(hits.length){var top=hits[0].a;
      html='<b>'+mesc(top.t)+'</b><br>'+mesc(top.b);
      if(hits[1])html+='<br><span class="man-rel">Related: '+hits.slice(1,3).map(function(h){return mesc(h.a.t);}).join(' · ')+'</span>';
    } else { html='I don\'t have that one yet — flip to the Guide tab and browse, or ask Anthony at Accelerated Experiences.'; }
    log.innerHTML+='<div class="man-bot">'+html+'</div>'; log.scrollTop=log.scrollHeight;
    var inp=document.getElementById('man-q'); if(inp) inp.value='';}
  function build(){
    if(document.getElementById('mca-man'))return;
    var css=document.createElement('style');
    css.textContent='#mca-help{position:fixed;left:18px;bottom:18px;z-index:9000;width:52px;height:52px;border-radius:50%;background:#1a2b3a;color:#f2b352;font-size:24px;font-weight:700;border:2px solid #f2b352;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.35)}'
     +'#mca-man{position:fixed;inset:0;z-index:9500;display:none}#mca-man.on{display:block}'
     +'#mca-man .scr{position:absolute;inset:0;background:rgba(16,26,36,.55)}'
     +'#mca-man .pan{position:absolute;top:0;right:0;height:100%;width:min(468px,100%);background:#f7f5f0;box-shadow:-14px 0 50px rgba(0,0,0,.35);display:flex;flex-direction:column;font-family:"IBM Plex Sans",system-ui,sans-serif}'
     +'#mca-man .hd{background:linear-gradient(160deg,#1a2b3a,#2c4258);color:#fff;padding:18px 20px 14px}'
     +'#mca-man .hd b{font-size:17px}#mca-man .hd .x{float:right;background:none;border:none;color:#f2b352;font-size:22px;cursor:pointer}'
     +'#mca-man .tabs{display:flex;gap:8px;margin-top:10px}'
     +'#mca-man .tabs button{flex:1;border:none;border-radius:8px;padding:8px;font-weight:600;cursor:pointer;background:rgba(255,255,255,.12);color:#cfe0ef}'
     +'#mca-man .tabs button.on{background:#f2b352;color:#241a08}'
     +'#mca-man .bd{flex:1;overflow:auto;padding:14px 16px}'
     +'#mca-man input{width:100%;border:1px solid #d8d5c7;border-radius:9px;padding:10px 12px;font:inherit;box-sizing:border-box}'
     +'#mca-man .chips{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}'
     +'#mca-man .chips button{border:1px solid #d8d5c7;background:#fff;border-radius:999px;padding:5px 11px;font-size:12px;cursor:pointer}'
     +'#mca-man .chips button.on{background:#1a2b3a;color:#fff;border-color:#1a2b3a}'
     +'.man-art{background:#fff;border:1px solid #e4e0d7;border-radius:11px;padding:11px 14px;margin:8px 0}'
     +'.man-art summary{font-weight:600;cursor:pointer;font-size:14px}.man-art p{font-size:13.5px;color:#454c50;margin:8px 0 2px;line-height:1.55}'
     +'#man-log{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}'
     +'.man-me{align-self:flex-end;background:#1a2b3a;color:#fff;border-radius:12px 12px 2px 12px;padding:8px 12px;font-size:13.5px;max-width:85%}'
     +'.man-bot{align-self:flex-start;background:#fff;border:1px solid #e4e0d7;border-radius:12px 12px 12px 2px;padding:9px 12px;font-size:13.5px;max-width:90%;line-height:1.5}'
     +'.man-rel{font-size:12px;color:#8a8b82}'
     +'#mca-man .ft{border-top:1px solid #e4e0d7;padding:9px 16px;font-size:11px;color:#8a8b82;text-align:center}';
    document.head.appendChild(css);
    var b=document.createElement('button');b.id='mca-help';b.title='Owner\'s Manual';b.textContent='?';document.body.appendChild(b);
    var m=document.createElement('div');m.id='mca-man';
    m.innerHTML='<div class="scr"></div><div class="pan">'
     +'<div class="hd"><button class="x">×</button><b>❓ Owner\'s Manual</b><div style="font-size:12px;color:#cfe0ef;margin-top:2px">Every screen, explained in plain English.</div>'
     +'<div class="tabs"><button id="man-tg" class="on">📖 The Guide</button><button id="man-ta">💬 Ask a question</button></div></div>'
     +'<div class="bd" id="man-guide"><input id="man-s" placeholder="Search the manual… (try: billing, seal, calendar)">'
     +'<div class="chips" id="man-chips"></div><div id="man-list"></div></div>'
     +'<div class="bd" id="man-askv" style="display:none"><div id="man-log"><div class="man-bot">Hey Scott — ask me anything about this system. Try one of these:</div></div>'
     +'<div class="chips"><button class="man-sug">What is this?</button><button class="man-sug">Who can see my stuff?</button><button class="man-sug">How does billing work?</button><button class="man-sug">Can I break it?</button></div>'
     +'<input id="man-q" placeholder="Type a question and press Enter…"></div>'
     +'<div class="ft">Support &amp; documentation by Accelerated Experiences, LLC</div></div>';
    document.body.appendChild(m);
    var chips=document.getElementById('man-chips');
    chips.innerHTML='<button data-c="all" class="on">All</button>'+MANCATS.map(function(c){return '<button data-c="'+c.k+'">'+c.ic+' '+c.label+'</button>';}).join('');
    chips.onclick=function(e){var t=e.target.closest('button');if(!t)return;CAT=t.getAttribute('data-c');
      Array.prototype.forEach.call(chips.children,function(x){x.classList.toggle('on',x===t);});guide();};
    document.getElementById('man-s').oninput=function(e){Q=e.target.value;guide();};
    b.onclick=function(){m.classList.add('on');guide();};
    m.querySelector('.scr').onclick=function(){m.classList.remove('on');};
    m.querySelector('.x').onclick=function(){m.classList.remove('on');};
    document.addEventListener('keydown',function(e){if(e.key==='Escape')m.classList.remove('on');});
    document.getElementById('man-tg').onclick=function(){tab(true);};
    document.getElementById('man-ta').onclick=function(){tab(false);};
    function tab(g){document.getElementById('man-guide').style.display=g?'':'none';
      document.getElementById('man-askv').style.display=g?'none':'';
      document.getElementById('man-tg').classList.toggle('on',g);
      document.getElementById('man-ta').classList.toggle('on',!g);}
    document.getElementById('man-q').addEventListener('keydown',function(e){if(e.key==='Enter')ask(e.target.value.trim());});
    m.querySelector('#man-askv').addEventListener('click',function(e){var s=e.target.closest('.man-sug');if(s){tab(false);ask(s.textContent);}});
    guide();
  }
  // only on OS pages (they load this engine); skip if body missing
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
