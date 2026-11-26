// Generates the screen-recording clips so nothing but face and voice has to be recorded.
// Usage: node tools/make-demo-clips.js  ->  video/generated/{12_phone,13_battery,16_station}.mp4
const fs = require("fs");
const path = require("path");
const { execFileSync, spawn } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const OUT = path.join(ROOT, "video", "generated");
const TMP = path.join(OUT, "frames");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 8771;
const BASE = `http://localhost:${PORT}`;
fs.mkdirSync(TMP, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ff = args => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args]);

function shot(name, html, w, h, scale = 1) {
  const file = path.join(DOCS, `_cap_${name}.html`);
  fs.writeFileSync(file, `<!doctype html><html><body style="margin:0;overflow:hidden">${html}</body></html>`);
  const png = path.join(TMP, name + ".png");
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--force-device-scale-factor=${scale}`,
    `--window-size=${w},${h}`, "--virtual-time-budget=10000", `--screenshot=${png}`, `${BASE}/_cap_${name}.html`], { stdio: "ignore" });
  fs.rmSync(file);
  return png;
}

(async () => {
  const server = spawn("python3", ["-m", "http.server", String(PORT)], { cwd: DOCS, stdio: "ignore" });
  await sleep(1200);
  try {
    // 12: the passport on a phone, scrolling top to bottom (~30s).
    const measure = path.join(DOCS, "_cap_measure.html");
    fs.writeFileSync(measure, `<iframe id="f" src="/p/?id=SLP-0042" style="border:0;width:390px;height:900px"></iframe>
      <script>f.onload=()=>setTimeout(()=>document.title="H"+f.contentDocument.documentElement.scrollHeight,500)</script>`);
    const dom = execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--virtual-time-budget=6000", "--dump-dom",
      `${BASE}/_cap_measure.html`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    fs.rmSync(measure);
    const PH = Math.max(1000, +(/<title>H(\d+)/.exec(dom) || [0, 3000])[1]);
    const full = shot("passport", `<iframe src="/p/?id=SLP-0042" style="border:0;width:390px;height:${PH}px"></iframe>`, 500, PH, 2);
    const phone = path.join(OUT, "12_phone.mp4");
    ff(["-loop", "1", "-framerate", "30", "-i", full, "-vf",
      "crop=780:1688:0:'min(max((t-2)/25\\,0)\\,1)*(ih-1688)',format=yuv420p",
      "-t", "30", "-r", "30", "-c:v", "libx264", "-crf", "18", phone]);

    // 13: slow zoom into the battery card (measured numbers + demo label).
    ff(["-loop", "1", "-framerate", "30", "-i", path.join(ROOT, "slides", "assets", "p_top.png"), "-vf",
      "crop=780:1000:0:300,scale=1560:2000,zoompan=z='1+0.12*on/360':x='iw/2-iw/zoom/2':y='ih/3-ih/zoom/3':d=1:s=780x1000:fps=30,format=yuv420p",
      "-frames:v", "360", "-c:v", "libx264", "-crf", "18", path.join(OUT, "13_battery.mp4")]);

    // 16: Repair Station auto-filled from a health check, then "Issue passport" → QR.
    const q = "model=Lenovo%20100e%20Chromebook%20Gen%203&source=ChromeOS%20Diagnostics&health=87&cycles=380";
    const frame = click => `<iframe id="f" src="/create/?${q}" style="border:0;width:1200px;height:675px"></iframe>
      <script>f.addEventListener("load",()=>{f.contentDocument.getElementById("f").pid.value="SLP-0107"});${click ? `f.onload=()=>setTimeout(()=>{const d=f.contentDocument;d.getElementById("issue").click();
        setTimeout(()=>{const r=d.querySelector("canvas,svg,img[src^='data']");if(r)r.scrollIntoView({block:"center"})},400)},300)` : ""}</script>`;
    const before = shot("station_a", frame(false), 1200, 675, 1.6);
    const after = shot("station_b", frame(true), 1200, 675, 1.6);
    ff(["-loop", "1", "-framerate", "30", "-t", "5", "-i", before, "-loop", "1", "-framerate", "30", "-t", "9", "-i", after,
      "-filter_complex", "[0][1]xfade=transition=fade:duration=0.6:offset=4.4,format=yuv420p",
      "-r", "30", "-c:v", "libx264", "-crf", "18", path.join(OUT, "16_station.mp4")]);
  } finally {
    server.kill();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
  console.log("wrote video/generated/12_phone.mp4, 13_battery.mp4, 16_station.mp4");
})();
