// Renders the pitch slides (1920x1080 PNG) from slides/config.json.
// Usage: node tools/make-slides.js        -> slides/png/S01.png ... S20.png
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const qrcode = require("qrcode-generator");
const SLP = require("../docs/assets/app.js");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "slides");
const cfg = JSON.parse(fs.readFileSync(path.join(DIR, "config.json"), "utf8"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const asset = f => `file://${path.join(DIR, "assets", f)}`;
const sticker = `file://${path.join(ROOT, "sticker", "sticker.png")}`;
const blank = v => v === null || v === undefined || v === "";
const fill = (v, hint, fmt = x => x) => blank(v) ? `<span class="fill">FILL IN: ${hint}</span>` : fmt(v);

function qrSvg(text, size) {
  const qr = qrcode(0, "M"); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), m = size / n;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c * m} ${r * m}h${m}v${m}h-${m}z`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><path d="${d}" fill="#16181d"/></svg>`;
}

const phone = (img, extra = "") => `<div class="phone" ${extra}><img src="${asset(img)}"></div>`;
const src = s => `<div class="src">Source: ${s}</div>`;
const kicker = s => `<div class="kicker">${s}</div>`;

const d = cfg.demo;
const fc = SLP.forecast({ health: d.health, cycles: d.cycles });
const wear = (100 - d.health) / d.cycles;
const s = cfg.survey;

const slides = [
  // S01 Title
  () => `<div class="row center" style="gap:90px">
    <img src="${sticker}" style="width:520px">
    <div>
      <div class="title">Second Life<br>Passport</div>
      <div class="sub" style="color:var(--red);font-weight:800">Don't trust it. Tap it.</div>
      <div class="sub" style="margin-top:50px">${cfg.name}${cfg.school_line ? " · " + cfg.school_line : ""}</div>
      <div class="muted" style="font-size:30px">KnoPro × Lenovo · Second Life, Smarter Tech Challenge</div>
    </div></div>`,

  // S02 E-waste
  () => `${kicker("The problem")}
    <div class="huge">62 million tonnes</div>
    <div class="sub">of electronics were thrown away in 2022.</div>
    <div class="row" style="gap:120px;margin-top:70px">
      <div><div class="num red">22.3%</div><div class="lbl">documented as properly recycled</div></div>
      <div><div class="num">82 Mt</div><div class="lbl">expected by 2030</div></div>
    </div>
    ${src("Global E-waste Monitor 2024 (ITU / UNITAR)")}`,

  // S03 Carbon
  () => `${kicker("The carbon is in the making")}
    <div class="row" style="gap:100px;align-items:center">
      <div class="donut" style="--p:75"><span>~75%</span></div>
      <div style="flex:1">
        <div class="h2">of a laptop's lifetime emissions happen <span class="red">before you open the box.</span></div>
        <div class="sub muted" style="margin-top:40px">The greenest laptop is the one that already exists.</div>
      </div>
    </div>
    ${src("Apple Product Environmental Report, 13-inch MacBook Air (M3), 2024: production ≈ 75% of life-cycle emissions")}`,

  // S04 300 vs 200
  () => `${kicker("Same budget. Two choices.")}
    <div class="row" style="gap:80px;align-items:flex-end;margin-top:30px">
      <div class="col"><div class="dots">${"<i></i>".repeat(200)}</div><div class="lbl"><b>200</b> new laptops</div></div>
      <div class="col"><div class="dots red">${"<i></i>".repeat(300)}</div><div class="lbl"><b class="red">300</b> refurbished laptops</div></div>
    </div>
    <div class="h2" style="margin-top:50px">100 more students get a laptop. So why does the district hesitate?</div>
    ${src("KnoPro × Lenovo challenge materials, “Can You Find the Real Problem?”")}`,

  // S05 The real questions
  () => `${kicker("What families actually asked")}
    <div class="quote">“Who had it before?”</div>
    <div class="quote" style="margin-left:240px">“Will it quit?”</div>
    <div class="quote small muted" style="margin-top:70px">“Nobody asked the price.”</div>
    <div class="muted" style="font-size:30px;margin-top:10px">— School Tech Coordinator</div>
    ${src("KnoPro × Lenovo challenge materials, “Can You Find the Real Problem?”")}`,

  // S06 Hidden checks
  () => `${kicker("The checks already happen")}
    <div class="h1">Lenovo Certified Refurbished already…</div>
    <div class="grid3" style="margin-top:60px">
      <div class="tile"><div class="num">80%</div><div class="lbl">Battery replaced if health is under 80%…</div></div>
      <div class="tile"><div class="num">750</div><div class="lbl">…or if it has more than 750 charge cycles</div></div>
      <div class="tile"><div class="num">NIST</div><div class="lbl">Data wiped to NIST 800-88 standards, plus a 1-year battery warranty</div></div>
    </div>
    <div class="h2" style="margin-top:70px">But the family holding the laptop <span class="red">can't see any of it.</span></div>
    ${src("Lenovo, Certified Refurbishment Services")}`,

  // S07 Insight
  () => `<div class="center col" style="height:100%;justify-content:center">
    <div class="title" style="font-size:104px;text-align:center;line-height:1.1">Reuse doesn't have a<br>quality problem.</div>
    <div class="title red" style="font-size:104px;text-align:center;margin-top:30px">It has a proof problem.</div>
  </div>`,

  // S08 Assurant
  () => `${kicker("What buyers of used devices care about most")}
    <div class="row" style="gap:110px">
      <div style="flex:1.2">
        <div class="lbl" style="margin-bottom:24px">Importance, 0–10</div>
        ${[["Battery health", 8.2, true], ["Return policy", 8.0], ["Price", 8.0], ["Financing", 2.4]].map(([l, v, hi]) =>
          `<div class="bar"><span>${l}</span><div><i style="width:${v * 10}%;${hi ? "background:var(--red)" : ""}"></i></div><b>${v.toFixed(1)}</b></div>`).join("")}
      </div>
      <div style="flex:1">
        <div class="num red">#1</div><div class="lbl">Battery health is the top priority, ahead of price</div>
        <div class="num" style="margin-top:50px">78%</div><div class="lbl">say seller trustworthiness is a major concern</div>
      </div>
    </div>
    ${src("Assurant, 2026 Certified Pre-Owned Devices Consumer Research Report (1,200+ U.S. smartphone owners)")}`,

  // S09 Introducing
  () => `<div class="row" style="gap:100px;align-items:center;height:100%">
    <div style="flex:1">
      ${kicker("Introducing")}
      <div class="title">Second Life Passport</div>
      <div class="h2" style="margin-top:40px">A sticker on every refurbished laptop.<br><b>Tap it</b> (NFC) or <b>scan it</b> (QR) with any phone.</div>
      <div class="sub muted" style="margin-top:30px">No app. No account. Just proof.</div>
    </div>
    <img src="${sticker}" style="width:400px">
    ${phone("p_top.png")}
  </div>`,

  // S10 Five blocks
  () => `${kicker("What's inside")}
    <div class="row" style="gap:70px">
      <div style="flex:1">
        ${[["🔋", "Battery: measured, not typed", "Health % and cycles read from the laptop itself, plus a forecast."],
           ["🔒", "Clean slate", "Proof the last owner's data was erased. Answers “who had it before?”"],
           ["🛠️", "Repairs & checks", "What was fixed, which parts, and every test it passed."],
           ["✍️", "A note from the student who fixed it", "A real name and a real person behind the repair."],
           ["🤝", "Help for life", "Repair desk, battery guide, and free Lenovo take-back at the end."]]
          .map(([i, t, x]) => `<div class="block"><span>${i}</span><div><b>${t}</b><p>${x}</p></div></div>`).join("")}
      </div>
      ${phone("p_wipe.png", 'style="transform:scale(.9);transform-origin:top"')}
      ${phone("p_note.png", 'style="transform:scale(.9);transform-origin:top"')}
    </div>`,

  // S11 Forecast math
  () => `${kicker("Answering “will it quit?”")}
    <div class="row" style="gap:90px;align-items:center">
      <div style="flex:1">
        <div class="h1">Measured, not typed.</div>
        <div class="sub muted">Battery numbers come straight from the laptop (ChromeOS Diagnostics, Windows battery report), so nobody can type “battery: good.”</div>
        <div class="math">
          <div><span>Health</span><b>${d.health}%</b></div>
          <div><span>Charge cycles</span><b>${d.cycles}</b></div>
          <div><span>Wear per charge</span><b>(100 − ${d.health}) ÷ ${d.cycles} = ${wear.toFixed(3)}%</b></div>
          <div><span>Charges left until 80%</span><b>(${d.health} − 80) ÷ ${wear.toFixed(3)} ≈ ${fc.cyclesLeft}</b></div>
          <div><span>÷ 180 school days</span><b class="red">${fc.text.replace(" before it needs a new battery", "")}</b></div>
        </div>
      </div>
      ${phone("p_top.png")}
    </div>
    ${src("80% / 750-cycle threshold: Lenovo Certified Refurbished. Linear estimate; shown to families as an estimate.")}`,

  // S12 Tamper
  () => `${kicker("Can't someone just fake it?")}
    <div class="row" style="gap:70px;align-items:center">
      <div style="flex:1">
        <div class="h1">Change one number…</div>
        <div class="sub muted">Every passport has a digital fingerprint (SHA-256) saved in the registry when it's issued. Edit the battery from 93% to 99% and the fingerprint no longer matches.</div>
        <div class="sub" style="margin-top:40px">In production: <b>NTAG 424 DNA</b> NFC tags sign every tap, so a copied sticker fails too.</div>
      </div>
      <div class="col center">${phone("p_top.png", 'style="transform:scale(.92)"')}<div class="lbl green">✅ Real record</div></div>
      <div class="col center">${phone("p_tamper.png", 'style="transform:scale(.92)"')}<div class="lbl red">⛔ Edited record</div></div>
    </div>`,

  // S13 Persona
  () => `${kicker("Who it's for")}
    <div class="row" style="gap:90px;align-items:center">
      <div class="avatar">RD</div>
      <div style="flex:1">
        <div class="h1">Rosa, mom of a 7th grader</div>
        <div class="sub muted">Works two jobs. A used phone died on her in three months. Her son's school is offering refurbished laptops to take home.</div>
        <div class="row" style="gap:30px;margin-top:50px">
          ${["Who had it before?", "Will it quit?", "What if it breaks?"].map(q => `<div class="chip">${q}</div>`).join("")}
        </div>
        <div class="sub" style="margin-top:50px">She won't download an app. <b>She will point her phone camera at a sticker.</b></div>
      </div>
    </div>
    <div class="src">Persona based on the guardian questions in the KnoPro × Lenovo challenge materials</div>`,

  // S14 Scale
  () => `${kicker("How it scales")}
    <div class="flow">
      ${[["🏫", "District retires laptops"], ["🛠️", "Student repair desk or Lenovo Asset Recovery refurbishes"], ["🔋", "Health Check fills the passport automatically"], ["🏠", "Families & nonprofits get trusted laptops"], ["♻️", "End of life: free Lenovo take-back"]]
        .map(([i, t]) => `<div class="step"><span>${i}</span><p>${t}</p></div>`).join('<div class="arrow">→</div>')}
    </div>
    <div class="row" style="gap:60px;margin-top:80px">
      <div class="tile"><div class="num">$0</div><div class="lbl">QR sticker</div></div>
      <div class="tile"><div class="num">&lt;$1</div><div class="lbl">NFC sticker</div></div>
      <div class="tile"><div class="num">~2 min</div><div class="lbl">to issue a passport</div></div>
      <div class="tile"><div class="num red">+50%</div><div class="lbl">more students reached with the same budget</div></div>
    </div>`,

  // S15 Student portfolio
  () => `${kicker("The hidden win: student fixers")}
    <div class="row" style="gap:70px;align-items:center">
      <div style="flex:.8">
        <div class="h1">Every passport is a signed line on a student's résumé.</div>
        <div class="sub muted">Students run the Repair Station, learn real hardware skills, and build a verified repair portfolio, one laptop at a time.</div>
      </div>
      <div class="shot"><img src="${asset("station.png")}"></div>
    </div>`,

  // S16 Survey
  () => `${kicker("I asked people")}
    <div class="h1">${fill(s.responses, "number of responses", v => `${v} students & parents answered my survey`)}</div>
    <div class="row" style="gap:100px;margin-top:40px">
      <div style="flex:1.2">
        <div class="lbl" style="margin-bottom:24px">Biggest worry about a used laptop</div>
        ${s.worries.map(w => `<div class="bar"><span>${w.label}</span><div><i style="width:${blank(w.pct) ? 0 : w.pct}%"></i></div><b>${fill(w.pct, "%", v => v + "%")}</b></div>`).join("")}
      </div>
      <div style="flex:1">
        <div class="num red">${fill(s.forecast_helps_pct, "%", v => v + "%")}</div><div class="lbl">said a battery forecast would make them more likely to take it</div>
        <div class="num" style="margin-top:40px">${fill(s.student_fixer_more_pct, "%", v => v + "%")}</div><div class="lbl">trust it more if a student signed the repair</div>
      </div>
    </div>
    ${s.quote ? `<div class="quote small" style="margin-top:30px">“${s.quote}”</div>` : ""}`,

  // S17 Feedback
  () => `${kicker("Feedback I got, and what I changed")}
    <div class="row" style="gap:60px;margin-top:20px">
      ${cfg.feedback.map(f => `<div class="fb">
        <div class="who">${f.who}</div>
        <div class="said">“${fill(f.said, "what they said")}”</div>
        <div class="ba"><div><span>Before</span>${fill(f.before, "what it was")}</div><div class="arrow">→</div><div><span>After</span>${fill(f.after, "what you changed")}</div></div>
      </div>`).join("")}
    </div>`,

  // S18 Why Lenovo
  () => `${kicker("Why Lenovo, why now")}
    <div class="grid2">
      <div class="tile left"><div class="num" style="font-size:72px">10/10</div><div class="lbl">iFixit repairability for the ThinkPad T14 Gen 7. The passport can tell owners: “you can swap this battery yourself.”</div></div>
      <div class="tile left"><div class="num" style="font-size:72px">Feb 2027</div><div class="lbl">EU law requires QR codes on batteries and user-replaceable batteries in portable devices. Passports are ready.</div></div>
      <div class="tile left"><div class="num" style="font-size:72px">1M+</div><div class="lbl">devices already retired through Lenovo Asset Recovery Services. The passport is the family-facing layer.</div></div>
      <div class="tile left"><div class="num" style="font-size:72px">800M lbs</div><div class="lbl">of old tech Lenovo has taken back since 2005. Every passport ends with a free take-back link.</div></div>
    </div>
    ${src("iFixit (Mar 2026); EU Battery Regulation 2023/1542 Art. 11 & 13; Lenovo press release; KnoPro × Lenovo challenge materials")}`,

  // S19 Close
  () => `<div class="row center" style="gap:120px;height:100%">
    <div>
      <div class="title">Don't trust it.<br><span class="red">Tap it.</span></div>
      <div class="sub" style="margin-top:50px">Give every laptop a second life,<br>and the proof to go with it.</div>
      <div class="muted" style="font-size:34px;margin-top:50px">${cfg.site}</div>
    </div>
    <div class="col center"><div class="qr">${qrSvg("https://" + cfg.site + "/", 380)}</div><div class="lbl">Try the live demo</div></div>
  </div>`,

  // S20 Sources
  () => `${kicker("Sources")}
    <ol class="sources">
      <li>Global E-waste Monitor 2024, ITU/UNITAR. itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx</li>
      <li>Apple, Product Environmental Report: 13-inch MacBook Air (M3), 2024. apple.com/environment</li>
      <li>KnoPro × Lenovo, Second Life Smarter Tech Challenge materials (Explore). knopro.org</li>
      <li>Lenovo, Certified Refurbishment Services. lenovo.com/…/certified-refurbishment-services</li>
      <li>Assurant, 2026 Certified Pre-Owned Devices Consumer Research Report. assurant.com</li>
      <li>iFixit, “New ThinkPads score perfect 10 repairability” (Mar 2026). ifixit.com/News/115827</li>
      <li>EU Battery Regulation (EU) 2023/1542, Articles 11 & 13. eur-lex.europa.eu</li>
      <li>Lenovo press release, Asset Recovery Services (1M+ devices). news.lenovo.com</li>
      <li>U.S. PIRG Education Fund, “Chromebook Churn.” pirg.org</li>
      <li>NXP, NTAG 424 DNA (secure unique NFC messages). nxp.com</li>
      <li>Survey: my own Google Form, ${fill(s.responses, "n", v => v + " responses")}. Prototype: ${cfg.site}</li>
    </ol>`,
];

const CSS = `
:root{--red:#e1251b;--ink:#16181d;--muted:#6b7280;--green:#15803d}
*{box-sizing:border-box}html,body{margin:0}
body{width:1920px;height:1080px;overflow:hidden;background:#fff;color:var(--ink);
 font-family:-apple-system,"SF Pro Display","Helvetica Neue",Helvetica,Arial,sans-serif}
.slide{position:relative;width:1920px;height:1080px;padding:100px 130px 110px}
.slide:before{content:"";position:absolute;left:0;top:0;bottom:0;width:18px;background:var(--red)}
.row{display:flex}.col{display:flex;flex-direction:column}.center{align-items:center;justify-content:center}
.red{color:var(--red)}.green{color:var(--green)}.muted{color:var(--muted)}
.kicker{font-size:28px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:var(--red);margin-bottom:30px}
.title{font-size:120px;font-weight:900;line-height:1.02;letter-spacing:-2px}
.huge{font-size:170px;font-weight:900;letter-spacing:-4px;line-height:1}
.h1{font-size:72px;font-weight:850;line-height:1.1;letter-spacing:-1px;margin-bottom:24px}
.h2{font-size:52px;font-weight:700;line-height:1.25}
.sub{font-size:42px;line-height:1.35}
.num{font-size:110px;font-weight:900;letter-spacing:-2px;line-height:1}
.lbl{font-size:32px;color:var(--muted);margin-top:12px;line-height:1.3}
.lbl b{color:var(--ink)}
.src{position:absolute;left:130px;bottom:44px;font-size:22px;color:var(--muted)}
.phone{width:388px;height:830px;border:14px solid var(--ink);border-radius:58px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.25);flex:none;background:#f3f4f6}
.phone img{width:360px;display:block}
.shot{flex:1.2;border-radius:24px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.22);border:2px solid #e5e7eb}
.shot img{width:100%;display:block}
.donut{width:460px;height:460px;border-radius:50%;background:conic-gradient(var(--red) calc(var(--p)*1%),#e5e7eb 0);display:grid;place-items:center;flex:none}
.donut span{width:300px;height:300px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:96px;font-weight:900}
.dots{display:grid;grid-template-columns:repeat(20,28px);gap:8px}
.dots i{width:28px;height:28px;border-radius:50%;background:#9ca3af}
.dots.red i{background:var(--red)}
.lbl b{font-size:48px}
.quote{font-size:110px;font-weight:850;letter-spacing:-2px;line-height:1.15}
.quote.small{font-size:56px;font-style:italic;font-weight:600}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.tile{background:#f5f5f7;border-radius:28px;padding:40px 44px;flex:1;text-align:center}
.tile.left{text-align:left}
.bar{display:grid;grid-template-columns:300px 1fr 120px;align-items:center;gap:24px;margin:22px 0;font-size:34px}
.bar div{height:46px;background:#eef0f3;border-radius:12px;overflow:hidden}
.bar i{display:block;height:100%;background:#4b5563;border-radius:12px}
.bar b{font-size:38px}
.block{display:flex;gap:26px;align-items:flex-start;margin-bottom:26px}
.block span{font-size:52px;width:70px;flex:none}
.block b{font-size:38px}.block p{font-size:28px;color:var(--muted);margin:6px 0 0}
.math{margin-top:40px;background:#f5f5f7;border-radius:28px;padding:30px 44px}
.math div{display:flex;justify-content:space-between;font-size:34px;padding:12px 0;border-bottom:1px solid #e5e7eb}
.math div:last-child{border:0}.math span{color:var(--muted)}
.avatar{width:340px;height:340px;border-radius:50%;background:#fde7e5;color:var(--red);display:grid;place-items:center;font-size:120px;font-weight:900;flex:none}
.chip{background:var(--ink);color:#fff;border-radius:999px;padding:18px 34px;font-size:34px;font-weight:700}
.flow{display:flex;align-items:center;gap:18px;margin-top:40px}
.step{flex:1;background:#f5f5f7;border-radius:28px;padding:36px 24px;text-align:center;min-height:300px}
.step span{font-size:84px}.step p{font-size:32px;font-weight:650;margin:20px 0 0;line-height:1.3}
.arrow{font-size:60px;color:var(--red);font-weight:900}
.fb{flex:1;background:#f5f5f7;border-radius:28px;padding:44px}
.fb .who{font-size:28px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--muted)}
.fb .said{font-size:44px;font-weight:700;margin:24px 0 40px;line-height:1.3}
.fb .ba{display:flex;align-items:center;gap:24px;font-size:32px}
.fb .ba>div:not(.arrow){flex:1;background:#fff;border-radius:20px;padding:24px}
.fb .ba span{display:block;font-size:22px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.qr{background:#fff;padding:30px;border-radius:28px;box-shadow:0 20px 60px rgba(0,0,0,.15)}
.sources{font-size:29px;line-height:1.45;padding-left:40px;margin:0}
.sources li{margin-bottom:8px}
.fill{background:#fff3b0;border:3px dashed #d4a000;color:#7a5b00;border-radius:12px;padding:2px 14px;font-size:.6em;font-weight:700;letter-spacing:0;vertical-align:middle;display:inline-block;line-height:1.3}
`;

const buildDir = path.join(DIR, "build"), pngDir = path.join(DIR, "png");
fs.mkdirSync(buildDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });
const only = process.argv.slice(2);

slides.forEach((fn, i) => {
  const id = "S" + String(i + 1).padStart(2, "0");
  if (only.length && !only.includes(id)) return;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="slide">${fn()}</div></body></html>`;
  const file = path.join(buildDir, id + ".html");
  fs.writeFileSync(file, html);
  execFileSync(CHROME, ["--headless=new", "--hide-scrollbars", "--allow-file-access-from-files", "--virtual-time-budget=2000",
    "--window-size=1920,1080", `--screenshot=${path.join(pngDir, id + ".png")}`, `file://${file}`], { stdio: "ignore" });
  console.log("rendered", id);
});
