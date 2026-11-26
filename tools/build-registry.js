// Builds docs/data/registry.json (id -> record + SHA-256 fingerprint) and prints demo links.
// Usage: node tools/build-registry.js [https://site-root/]
const fs = require("fs");
const path = require("path");
const SLP = require("../docs/assets/app.js");

const root = process.argv[2] || "https://mattjunior039.github.io/second-life-passport/";
const dataDir = path.join(__dirname, "..", "docs", "data");
const records = JSON.parse(fs.readFileSync(path.join(dataDir, "records.json"), "utf8"));

(async () => {
  const registry = {};
  for (const record of records) {
    registry[record.id] = { fingerprint: await SLP.fingerprint(record), record };
  }
  fs.writeFileSync(path.join(dataDir, "registry.json"), JSON.stringify(registry, null, 2) + "\n");

  const links = {};
  for (const record of records) {
    const tampered = JSON.parse(JSON.stringify(record));
    tampered.battery.health = 99;
    tampered.battery.cycles = 12;
    links[record.id] = {
      passport: `${root}p/?id=${record.id}`,
      tampered: `${root}p/#d=${await SLP.encode(tampered)}`,
      forecast: SLP.forecast(record.battery).text,
    };
  }
  fs.writeFileSync(path.join(__dirname, "..", "links.json"), JSON.stringify(links, null, 2) + "\n");
  console.log(JSON.stringify(links, null, 2));
})();
