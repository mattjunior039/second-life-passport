// Generates the sticker SVG, a single-sticker preview page and a printable Avery 22807 sheet (2" round, 12 per page).
// Usage: node tools/make-sticker.js [ID] [URL]
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-generator");

const id = process.argv[2] || "SLP-0042";
const url = process.argv[3] || `https://mattjunior039.github.io/second-life-passport/p/?id=${id}`;
const out = path.join(__dirname, "..", "sticker");
const RED = "#e1251b", INK = "#16181d";

function qrPath(text, x0, y0, size) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const m = size / n;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (qr.isDark(r, c)) d += `M${(x0 + c * m).toFixed(3)} ${(y0 + r * m).toFixed(3)}h${m.toFixed(3)}v${m.toFixed(3)}h-${m.toFixed(3)}z`;
  }
  return { d, n };
}

function sticker(sizeAttr = "") {
  const qrSize = 80, qx = 100 - qrSize / 2, qy = 52;
  const { d } = qrPath(url, qx, qy, qrSize);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" ${sizeAttr}>
  <defs>
    <path id="top" d="M 21 100 A 79 79 0 0 1 179 100"/>
    <path id="bot" d="M 15 100 A 85 85 0 0 0 185 100"/>
  </defs>
  <circle cx="100" cy="100" r="100" fill="${RED}"/>
  <circle cx="100" cy="100" r="72" fill="#fff"/>
  <g font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="800" fill="#fff" letter-spacing="2.4">
    <text font-size="15.5"><textPath href="#top" startOffset="50%" text-anchor="middle">SECOND LIFE PASSPORT</textPath></text>
    <text font-size="11"><textPath href="#bot" startOffset="50%" text-anchor="middle" dominant-baseline="hanging">DON'T TRUST IT · TAP IT</textPath></text>
  </g>
  <g fill="#fff">
    <circle cx="15" cy="100" r="2.6"/><circle cx="185" cy="100" r="2.6"/>
  </g>
  <g transform="translate(100 41)" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round">
    <path d="M -9 -1 a 9 9 0 0 1 18 0"/><path d="M -5 -1 a 5 5 0 0 1 10 0"/><circle cx="0" cy="-1" r="1.2" fill="${INK}" stroke="none"/>
  </g>
  <path d="${d}" fill="${INK}"/>
  <text x="100" y="146" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="9.5" font-weight="700" fill="${INK}" letter-spacing="1.5">${id}</text>
</svg>`;
}

const svg = sticker();
fs.writeFileSync(path.join(out, "sticker.svg"), svg + "\n");

fs.writeFileSync(path.join(out, "sticker.html"), `<!doctype html><html><head><style>
html,body{margin:0;background:transparent}svg{display:block;width:1200px;height:1200px}
</style></head><body>${svg}</body></html>\n`);

// Avery 22807: 2" round, 3 x 4, letter. Left margin 0.625", top 0.625", pitch 2.625" x 2.5".
const cells = Array.from({ length: 12 }, (_, i) => {
  const c = i % 3, r = Math.floor(i / 3);
  return `<div class="s" style="left:${0.625 + c * 2.625}in;top:${0.625 + r * 2.5}in">${sticker('width="2in" height="2in"')}</div>`;
}).join("");
fs.writeFileSync(path.join(out, "sheet.html"), `<!doctype html><html><head><style>
@page{size:letter;margin:0}html,body{margin:0}
.page{position:relative;width:8.5in;height:11in}
.s{position:absolute;width:2in;height:2in}
</style></head><body><div class="page">${cells}</div></body></html>\n`);

console.log(`Sticker for ${id} -> ${url}`);
