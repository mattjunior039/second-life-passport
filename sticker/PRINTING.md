# 🖨️ Printing the sticker (step by step)

> **No printer? Skip this file.** Use the on-screen sticker at https://mattjunior039.github.io/second-life-passport/sticker/ and the animated tap clip (`node tools/make-tap.js`).

**File:** `sticker/sticker-sheet-avery22807.pdf`, a single US Letter page with **12 identical stickers**. Each one is exactly **2 inches (5.1 cm)** across, and every QR code opens passport SLP-0042.

## 1. Pick your paper

| Option | What to get | Cost |
|---|---|---|
| **A. Free (fine for the video)** | Regular printer paper, plus **clear packing tape** (or Scotch tape) and a glue stick or double-sided tape | $0 |
| **B. Looks like a real product** | **Avery 22807** round labels: 2″, glossy white, 12 per sheet. Sold at Staples, Office Depot, Target and Amazon. Get exactly this number, because the PDF is lined up to its layout. | ~$10–15 |

## 2. Print it (Mac)

1. In Finder, open `second-life-passport` → `sticker` and double-click **`sticker-sheet-avery22807.pdf`**. It opens in Preview.
2. Press **⌘P**.
3. Click **Show Details** if you only see a small dialog.
4. Set **Paper Size: US Letter**.
5. Set **Scale: 100%**. Do **not** choose "Scale to Fit."
6. Under **Media & Quality**, set Quality to **Best/High**. On Avery labels, also set Paper Type to **Labels** or **Glossy**.
7. If you use a school or library printer, save as PDF first (bottom-left dropdown → Save as PDF), then print from a USB stick. Tell them **"actual size, no scaling."**

**If you bought Avery labels:** print one test page on plain paper first. Hold it behind a label sheet against a window and check that the circles line up. To find out which side your printer prints on, draw an arrow on a plain sheet, feed it in and see where the ink lands. Then print on the label sheet.

## 3. Check it before cutting (30 seconds)

- [ ] Measure with a ruler: the circle should be **2 inches** across. If it's smaller, scaling was on, so reprint at 100%.
- [ ] Open the iPhone **Camera** app and point it at a QR code from about 6 inches away. A yellow `mattjunior039.github.io` link pops up. Tap it and you should see a green **"Verified record · matches registry."**
  - If the link doesn't appear, go to Settings → Camera and turn on **Scan QR Codes**.

## 4. Cut and stick

- **Avery:** just peel one off.
- **Plain paper:**
  1. Cut along the outside edge of the red ring.
  2. Cover the front with a piece of **clear packing tape** a bit bigger than the circle, then trim it. This protects it and makes it look glossy.
  3. Put double-sided tape or glue on the back.

**Where to put it for the video:** on your **own MacBook lid** (bottom-right corner) with removable tape, such as painter's tape or Scotch Removable, so it peels off clean. **Don't stick anything on the school Chromebook**, because it's school property. Keep a second sticker loose to hold up to the camera in the opening and closing shots.

**Filming the scan:**
- Use bright light from a window or lamp.
- Tilt the laptop a little so the tape doesn't glare.
- Hold the phone 4–8 inches away and keep it still for a second.

## 5. Optional: make "tap" really work (NFC)

You don't need this, because the QR code is a working demo. If you want the tap moment on camera:

1. **Buy NTAG215 NFC stickers** (25 mm round, about $8 for 10 on Amazon).
   - ⚠️ NFC **does not work on metal**, and your MacBook is aluminum. Either buy **"anti-metal" / "on-metal" NTAG215** tags, or put the tag on a plastic surface or a piece of cardboard.
2. Install the free app **NFC Tools** (App Store).
3. In the app: **Write** → **Add a record** → **URL / URI**.
4. Paste `https://mattjunior039.github.io/second-life-passport/p/?id=SLP-0042`, then tap **OK** → **Write**.
5. Hold the top edge of the iPhone against the tag until it says "Write complete."
6. Test it: with the iPhone unlocked, touch its top edge to the tag. A banner appears; tap it and the passport opens.
7. Stick the printed QR sticker **on top of** the NFC tag. Now it does both.
