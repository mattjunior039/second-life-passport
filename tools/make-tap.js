// Renders the "tap" shot (scene 11) as a short animation, so no printed sticker or filming is needed.
// Usage: node tools/make-tap.js  ->  video/generated/11_tap.mp4
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "video", "generated");
const TMP = path.join(OUT, "frames");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
fs.mkdirSync(TMP, { recursive: true });

const svg = fs.readFileSync(path.join(ROOT, "sticker", "sticker.svg"), "utf8");
const shot = `file://${path.join(ROOT, "slides", "assets", "p_top.png")}`;

// Layout (1920x1080): closed laptop lid seen from above, sticker in the upper-right corner.
const LID = { x: 285, y: 120, w: 1350, h: 860 };
const ST = { size: 220, cx: LID.x + LID.w - 210, cy: LID.y + 210 };
const PH = { w: 410, h: 870 };
const phoneX = ST.cx - PH.w / 2, phoneY = ST.cy - 215;

const base = `*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;overflow:hidden}`;
const phoneCss = `.phone{position:absolute;left:${phoneX}px;top:${phoneY}px;width:${PH.w}px;height:${PH.h}px;border:13px solid #16181d;
  border-radius:52px;overflow:hidden;background:#0b0c0e;box-shadow:0 40px 80px rgba(0,0,0,.45)}
  .phone img{width:${PH.w - 26}px;display:block}`;

const pages = {
  bg: `<style>${base}
    body{background:radial-gradient(ellipse at 40% 30%,#f4efe7,#dcd3c6)}
    .lid{position:absolute;left:${LID.x}px;top:${LID.y}px;width:${LID.w}px;height:${LID.h}px;border-radius:38px;
      background:linear-gradient(160deg,#3a3d43,#24262b 60%,#1d1f23);box-shadow:0 50px 90px rgba(60,40,20,.35),inset 0 2px 0 rgba(255,255,255,.08)}
    .hinge{position:absolute;left:${LID.x + 40}px;top:${LID.y - 14}px;width:${LID.w - 80}px;height:18px;border-radius:9px 9px 0 0;background:#17181b}
    .st{position:absolute;left:${ST.cx - ST.size / 2}px;top:${ST.cy - ST.size / 2}px;width:${ST.size}px;height:${ST.size}px;
      filter:drop-shadow(0 3px 4px rgba(0,0,0,.4))}
    .st svg{width:100%;height:100%}</style>
    <div class="hinge"></div><div class="lid"></div><div class="st">${svg}</div>`,
  phone_dark: `<style>${base}${phoneCss}</style><div class="phone"></div>`,
  phone_on: `<style>${base}${phoneCss}</style><div class="phone"><img src="${shot}"></div>`,
  ripple: `<style>${base}
    .r{position:absolute;border:6px solid #e1251b;border-radius:50%;opacity:var(--o)}</style>
    ${[150, 215, 280].map((r, i) => `<div class="r" style="--o:${0.85 - i * 0.25};left:${ST.cx - r}px;top:${ST.cy - r}px;width:${2 * r}px;height:${2 * r}px"></div>`).join("")}`,
};

for (const [name, html] of Object.entries(pages)) {
  const file = path.join(TMP, `${name}.html`);
  fs.writeFileSync(file, `<!doctype html><html><body>${html}</body></html>`);
  const args = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
    "--window-size=1920,1080", `--screenshot=${path.join(TMP, name + ".png")}`];
  if (name !== "bg") args.push("--default-background-color=00000000");
  execFileSync(CHROME, [...args, `file://${file}`], { stdio: "ignore" });
}

// 0–0.8s laptop · 0.8–1.6s phone slides up · 1.6–2.3s NFC ripple · 2.0s passport opens · hold to 4.5s
const ease = "1080*pow(1-min(max((t-0.8)/0.8\\,0)\\,1)\\,3)";
const f = n => path.join(TMP, n + ".png");
execFileSync("ffmpeg", ["-loglevel", "error", "-y",
  "-loop", "1", "-framerate", "30", "-i", f("bg"),
  "-loop", "1", "-framerate", "30", "-i", f("ripple"),
  "-loop", "1", "-framerate", "30", "-i", f("phone_dark"),
  "-loop", "1", "-framerate", "30", "-i", f("phone_on"),
  "-filter_complex",
  "[1]format=rgba,fade=in:st=1.55:d=0.2:alpha=1,fade=out:st=2.1:d=0.35:alpha=1[r];" +
  "[3]format=rgba,fade=in:st=2.0:d=0.3:alpha=1[on];" +
  `[0][r]overlay=0:0[a];[a][2]overlay=x=0:y='${ease}'[b];[b][on]overlay=0:0,format=yuv420p[v]`,
  "-map", "[v]", "-t", "4.5", "-r", "30", "-c:v", "libx264", "-crf", "18", path.join(OUT, "11_tap.mp4")]);
fs.rmSync(TMP, { recursive: true, force: true });
console.log("wrote video/generated/11_tap.mp4");
