# 🎬 Storyboard & Recording Guide: Second Life Passport

## ⚡ Quick start: all you do is talk

```bash
cd ~/second-life-passport && python3 tools/studio.py
```
A page opens in your browser. For each of the 20 parts it shows **your line as a teleprompter** (full script: [`SCRIPT.md`](SCRIPT.md)) plus what's on screen. Hit **Space** to record, read it, hit **Space** to stop, then **Enter** to keep it. Fill in the yellow feedback blanks in part 18 with what real people said. 17 parts are voice only and 3 are face plus voice. When everything is ✅, click **🎞️ Build my video**. Then upload `video/build/final.mp4`.

Everything else (sticker, phone demo, Repair Station, tap shot, slides, sources) is already made. The rest of this file is background you can skip.

---

**Target: about 4:30 total** (the challenge requires 3:00–5:00). The visuals are done. You add your voice and face.

> **Why there's no word-for-word script:** the judging sheet says *"The pitch is done yourself, not with AI"* and requires your own voice. So each scene gives you **what's on screen**, **what to record**, and **talking points**. Say them however you'd say them to a friend. Practise each scene twice out loud, then record. Sounding natural beats sounding perfect, and judges can tell when someone is reading.

---

## 0. Before you record (one evening)

1. **Battery numbers are done.** The demo passport uses example numbers typical of a 3-year-old school Chromebook (Lenovo 100e Chromebook Gen 3: **87% health, 380 cycles → about 1 school year left**). The passport shows a yellow "Demo passport" label, and you say "example numbers" once on camera (scene 13).
2. **Your fixer note** is already in the passport, signed Neil Gupta. If you want it in your own words, send me 2–3 sentences and I'll swap it in.
3. **Do the 10-minute feedback test. Don't skip it: "Feedback" is 1 of the 5 judging categories.** No survey needed.
   - Show the sticker to **2 people** (a parent, a friend, a teacher). Open the [sticker page](https://mattjunior039.github.io/second-life-passport/sticker/) on your Mac, don't explain anything, and watch them scan it with their own phone camera.
   - Ask two questions: *"Would you trust this laptop more or less? Why?"* and *"What was confusing?"* Write down their exact words.
   - Pick **one thing to change** because of what each person said. Tell me and I'll make the change on the site.
   - Fill in the `feedback` part of `slides/config.json` (who, what they said, before, after), then run `node tools/make-slides.js`. **Never invent quotes.**
4. **No printer needed.** The sticker lives on screen at https://mattjunior039.github.io/second-life-passport/sticker/. Open it on your Mac and scan it with your iPhone camera. The tap close-up (scene 11) is already animated in `video/generated/11_tap.mp4`. (If you ever print it, see [`sticker/PRINTING.md`](../sticker/PRINTING.md).)
5. **Test the live links in a private/incognito window:**
   - Passport: https://mattjunior039.github.io/second-life-passport/p/?id=SLP-0042
   - Repair Station: https://mattjunior039.github.io/second-life-passport/create/
   - Tamper demo: the `tampered` link in `links.json`

## 1. Recording setup (free, all on your Mac + iPhone)

| What | How | Save as |
|---|---|---|
| **Voiceover** (`_vo.m4a`) | QuickTime → File → **New Audio Recording** → record → Save | `video/recordings/02_vo.m4a` etc. |
| **Face cam** (`.mov`) | QuickTime → File → **New Movie Recording** (pick the 1080p FaceTime camera and built-in mic) | `video/recordings/01_hook.mov` etc. |
| **Mac screen + voice** | QuickTime → File → **New Screen Recording** → Options → Microphone: MacBook Pro Microphone | `video/recordings/16_station.mov` |
| **iPhone screen** | Control Center → Screen Recording (mic **off**) → AirDrop to Mac | `video/recordings/12_phone.mp4` (rename) |

**Sound rules:** quiet room, no music, no TV. Soft furniture helps (sit facing your bed or closet). Keep the mic 1–2 feet away and stay at the same distance every take. The assembler evens out volume and removes light hiss automatically.
**Camera:** laptop raised to eye level, window light in front of you (not behind), plain background, look at the lens.
**One file per scene.** Re-record a scene as many times as you like; just overwrite the file.

## 2. Build the video

```bash
cd ~/second-life-passport
python3 tools/assemble.py --check   # shows which recordings are still missing
python3 tools/assemble.py           # builds video/build/final.mp4 and checks it's 3–5 min
```
You can run it any time; missing scenes are skipped, so you can watch rough cuts as you go. To reorder or swap scenes, edit `video/scenes.json`.

---

## 3. Scene by scene

**Legend:** 🎥 face cam · 🎙️ voiceover over a slide · 📱 phone screen · 🖥️ Mac screen recording

### ACT 1: The problem (≈ 1:40)

**01 · Hook (🎥 `01_hook.mov`, ~15s)**
*Visual:* You on camera, holding up a laptop (yours or the Chromebook).
*Talking points:*
- Used car → you get a Carfax: owners, accidents, mileage.
- Used laptop from your school → you get nothing. Just hoping it doesn't die in a month.
- Your name, and that you fix laptops.
*Tip:* Start talking within the first second, with no "Hi, my name is…" opener. Put your name at the end of the hook.

**02 · E-waste (🎙️ S02, ~10s)**
- 62 million tonnes of e-waste in 2022.
- Only about 22% properly recycled. Heading to 82 million by 2030.

**03 · Carbon (🎙️ S03, ~10s)**
- Most of a laptop's carbon is spent *making* it. In one manufacturer's report it's about three quarters.
- So the greenest laptop is the one that already exists.

**04 · 300 vs 200 (🎙️ S04, ~12s)**
- KnoPro's own scenario: a school can buy 200 new or 300 refurbished for the same money.
- That's 100 more kids with a laptop. So why hesitate?

**05 · The real questions (🎙️ S05, ~10s)**
- Guardians asked two things: "Who had it before?" and "Will it quit?"
- The coordinator noticed nobody asked about price. **It's not about money, it's about trust.**

**06 · Hidden checks (🎙️ S06, ~12s)**
- The surprising part: Lenovo's certified refurb process already replaces batteries under 80% or over 750 cycles, wipes data to NIST standards, and adds a battery warranty.
- The family holding the laptop can't see any of that.

**07 · Insight (🎥 `07_insight.mov`, ~7s)**
*Visual:* You, close to camera. This is the most important line in the video; say it slowly.
- Reuse doesn't have a quality problem. It has a **proof** problem.

**08 · Buyers care about battery (🎙️ S08, ~10s)**
- Assurant's 2026 survey of 1,200+ people buying used devices: battery health was the #1 priority, ahead of price.
- 78% call seller trust a major concern.

**09 · Persona (🎙️ S13, ~10s)**
- Meet Rosa (a persona built from KnoPro's research, so say "imagine" or "picture").
- Works two jobs, got burned by a used phone, won't download an app. But she will point her camera at a sticker.

### ACT 2: The solution and live demo (≈ 1:50)

**10 · Introducing (🎙️ S09, ~10s)**
- Name: Second Life Passport. Tagline: *Don't trust it. Tap it.*
- A sticker on each refurbished laptop. Tap or scan, with no app and no account.

**11 · The tap (✅ auto: `video/generated/11_tap.mp4`, ~4.5s)**
*Visual:* Animated: a phone slides onto the sticker on a laptop lid and the passport opens. Nothing to record. To re-render it, run `node tools/make-tap.js`.

**12 · Demo walkthrough (✅ auto clip `video/generated/12_phone.mp4` + 🎙️ `12_vo.m4a`, ~30s)**
*Visual:* Generated: the passport scrolling on a phone (`node tools/make-demo-clips.js`). The studio plays it while you talk.
*Record the voiceover while watching the clip play.* Talking points, one per section:
- ✅ Verified badge: this record matches the official registry.
- 🔋 Battery health, measured, plus the forecast in *school years*, which answers "will it quit?"
- 🔒 Clean slate: last owner's data erased, which answers "who had it before?"
- 🛠️ What was repaired and tested.
- ✍️ A note from me, the student who fixed it.
- 🤝 Help if anything breaks, and free Lenovo recycling at the end.

**13 · Measured, not typed (✅ auto clip `video/generated/13_battery.mp4` + 🎙️ `13_vo.m4a`, ~10s)**
*Visual:* Generated: slow zoom on the passport's battery card, including the "Demo passport" label.
- In a real passport, these numbers come straight from the laptop itself. No one types "battery good."
- Say once that the demo passport uses example numbers.

**14 · Forecast math (🎙️ S11, ~12s)**
- Walk through the math in plain words: how much it's worn per charge, how many charges until 80%, divided by school days.
- Label it as an estimate.

**15 · Can't someone fake it? (🎙️ S12, ~12s)**
- Change even one number (87 → 99%) and the fingerprint breaks, so it shows "Altered record."
- Real version: secure NFC chips that sign every tap, so copied stickers fail too.
*(Optional upgrade: screen-record the tamper link live on your phone instead of the slide.)*

**16 · The Repair Station (✅ auto clip `video/generated/16_station.mp4` + 🎙️ `16_vo.m4a`, ~12s)**
*Visual:* Generated: the Repair Station filled in from a health check, then **Issue passport** and the QR appears.
- A student fixer can issue a passport in about two minutes.
- The battery numbers fill in automatically.

### ACT 3: Impact, evidence and feedback (≈ 1:10)

**17 · Student fixers (🎙️ S15, ~8s)**
- Every passport is a signed line on a student's résumé: real repair skills, proven.

**18 · How it scales (🎙️ S14, ~15s)**
- Walk the arrows: district retires laptops → student desk or Lenovo Asset Recovery refurbishes → passport auto-fills → families → Lenovo take-back at end of life.
- Cost: QR free, NFC under $1. Back to the opening: 300 trusted laptops instead of 200.

**20 · Feedback → change (🎙️ S16, ~20s)**
- Who you showed it to and how (put the sticker on screen, said nothing, watched).
- What each person said → what you changed because of it. Be specific.
- *This is a whole rubric category (Feedback & Teamwork), so don't skip it.*

**21 · Why Lenovo, why now (🎙️ S17, ~12s)**
- New ThinkPads score 10/10 for repairability, so the passport can say "swap the battery yourself."
- EU rules from Feb 2027: QR codes on batteries and replaceable batteries. Passports are ready.
- It plugs into what Lenovo already does: Certified Refurbished, Asset Recovery and take-back.

**22 · Close (🎥 `22_close.mov`, ~10s)**
*Visual:* You on camera, holding up your phone with the passport open toward the lens.
- Tie back to the hook (the Carfax line).
- End on the tagline: **Don't trust it. Tap it.**

**23 · End card (S18, auto, 4s)** · **24 · Sources (S19, auto, 5s)**

---

## 4. Final checklist before you submit
- [ ] 3:00–5:00 (the assembler tells you)
- [ ] Your own voice throughout, with no music or background noise
- [ ] All FILL-IN boxes gone (feedback is real)
- [ ] Watched once all the way through with headphones
- [ ] Uploaded (YouTube *Unlisted* or Google Drive "Anyone with the link") and **opened in an incognito window** to confirm it plays
- [ ] Live demo link works in incognito
