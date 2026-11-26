// Shared logic for Second Life Passport (static, no backend).
const SLP = (() => {
  const REPLACE_AT = 80;           // Lenovo Certified Refurbished replaces batteries under 80% health
  const MAX_CYCLES = 750;          // ...or over 750 cycles
  const CHARGES_PER_SCHOOL_YEAR = 180;

  // Stable JSON: sorted keys so the same record always produces the same fingerprint.
  function canonical(value) {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  async function fingerprint(record) {
    const bytes = new TextEncoder().encode(canonical(record));
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function healthFrom(battery) {
    if (battery.design && battery.full) return Math.round((battery.full / battery.design) * 1000) / 10;
    return Number(battery.health);
  }

  // Simple linear wear model: average wear per cycle so far, projected to the 80% threshold.
  function forecast(battery) {
    const health = healthFrom(battery);
    const cycles = Number(battery.cycles) || 0;
    if (!(health > 0)) return { health, status: "unknown", text: "Battery health not measured." };
    if (health < REPLACE_AT || cycles > MAX_CYCLES) {
      return { health, cycles, status: "replace", years: 0,
        text: `Below Lenovo's replacement standard (${REPLACE_AT}% / ${MAX_CYCLES} cycles). Battery should be replaced before reuse.` };
    }
    const wearPerCycle = cycles > 0 ? Math.max((100 - health) / cycles, 0.005) : null;
    if (!wearPerCycle) return { health, cycles, status: "new", text: "Like-new battery. Not enough charge history to forecast yet." };
    const cyclesByHealth = (health - REPLACE_AT) / wearPerCycle;
    const cyclesLeft = Math.max(0, Math.min(cyclesByHealth, MAX_CYCLES - cycles));
    const years = cyclesLeft / CHARGES_PER_SCHOOL_YEAR;
    const rounded = Math.max(0.5, Math.round(years * 2) / 2);
    const status = years >= 2 ? "good" : years >= 1 ? "fair" : "low";
    const yearsText = years > 6 ? "6+ school years" : `${rounded} school year${rounded === 1 ? "" : "s"}`;
    return { health, cycles, status, years, cyclesLeft: Math.round(cyclesLeft),
      text: `About ${yearsText} before it needs a new battery`,
      detail: `${Math.round(cyclesLeft)} more full charges until it reaches ${REPLACE_AT}% health or ${MAX_CYCLES} cycles, at about one charge per school day.` };
  }

  // Records travel inside the link (#d=...) so the demo works with no server.
  // Deflate-compressed + base64url keeps the QR code small enough to scan.
  async function pipe(bytes, stream) {
    const out = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
    return new Uint8Array(out);
  }
  function toB64url(bytes) {
    let s = "";
    bytes.forEach(b => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromB64url(str) {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }
  async function encode(record) {
    const raw = new TextEncoder().encode(JSON.stringify(record));
    return "z" + toB64url(await pipe(raw, new CompressionStream("deflate-raw")));
  }
  async function decode(str) {
    const bytes = str[0] === "z"
      ? await pipe(fromB64url(str.slice(1)), new DecompressionStream("deflate-raw"))
      : fromB64url(str);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function siteRoot() {
    const path = location.pathname.replace(/(p|create)\/(index\.html)?$/, "");
    return location.origin + path.replace(/index\.html$/, "");
  }

  async function registry() {
    const res = await fetch(siteRoot() + "data/registry.json", { cache: "no-store" });
    return res.ok ? res.json() : {};
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function qrSvg(text, cell = 4) {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: cell, margin: 2, scalable: true });
  }

  return { REPLACE_AT, MAX_CYCLES, canonical, fingerprint, healthFrom, forecast, encode, decode, siteRoot, registry, esc, qrSvg };
})();
if (typeof module !== "undefined") module.exports = SLP;
