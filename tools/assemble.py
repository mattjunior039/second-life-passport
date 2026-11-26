#!/usr/bin/env python3
"""Assemble the pitch video from your recordings + rendered slides.

    python3 tools/assemble.py            # build video/build/final.mp4
    python3 tools/assemble.py --check    # just list which recordings are missing

Each scene in video/scenes.json has:
  visual  : a slide PNG, or a video file in video/recordings/ (cam, screen, phone)
  audio   : optional voiceover file in video/recordings/. If set, the scene lasts as long as the
            voiceover (video is trimmed or its last frame held). If not set, the video's own sound is used.
  layout  : "full" (default) or "phone" (vertical phone recording centered on a light background)
  hold    : seconds, for slides with no voiceover (e.g. the sources slide)
Missing files are skipped with a warning so you can build a rough cut at any time.
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = os.path.join(ROOT, "video")
REC = os.path.join(VID, "recordings")
BUILD = os.path.join(VID, "build")
W, H, FPS = 1920, 1080, 30
PAD = 0.35  # breathing room after each scene
AUDIO_FX = "highpass=f=80,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,aformat=channel_layouts=stereo"


def resolve(p):
    if not p:
        return None
    for base in (REC, ROOT, VID):
        full = os.path.join(base, p)
        if os.path.exists(full):
            return full
    return None


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return float(out) if out else 0.0


def has_audio(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return bool(out)


def video_filter(layout, still):
    if layout == "phone":
        v = f"scale=-2:{H - 80},pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=#f3f4f6"
    else:
        v = f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=white"
    return f"{v},fps={FPS},format=yuv420p,setsar=1"


def build_scene(i, scene, out):
    visual = resolve(scene["visual"])
    audio = resolve(scene.get("audio"))
    still = visual.lower().endswith((".png", ".jpg", ".jpeg"))
    layout = scene.get("layout", "full")

    if audio:
        dur = duration(audio)
    elif still:
        dur = float(scene.get("hold", 4))
    else:
        dur = duration(visual)
    total = dur + PAD

    cmd = ["ffmpeg", "-y", "-v", "error"]
    cmd += (["-loop", "1", "-framerate", str(FPS)] if still else []) + ["-i", visual]
    if audio:
        cmd += ["-i", audio]
        a_in = "1:a"
    elif not still and has_audio(visual):
        a_in = "0:a"
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
        a_in = "1:a"

    vf = video_filter(layout, still)
    if not still:
        vf += f",tpad=stop_mode=clone:stop_duration={total}"
    af = (AUDIO_FX if a_in != "1:a" or audio else "aresample=48000") + f",apad=whole_dur={total}"
    cmd += ["-filter_complex", f"[0:v]{vf}[v];[{a_in}]{af}[a]", "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", str(FPS),
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", out]
    subprocess.run(cmd, check=True)
    return total


def main():
    scenes = json.load(open(os.path.join(VID, "scenes.json")))["scenes"]
    os.makedirs(BUILD, exist_ok=True)
    missing = []
    for s in scenes:
        for key in ("visual", "audio"):
            if s.get(key) and not resolve(s[key]):
                missing.append(f'{s["id"]}: {s[key]}')
    if missing:
        print("Missing (these scenes will be skipped):\n  " + "\n  ".join(missing))
    if "--check" in sys.argv:
        return

    parts, total = [], 0.0
    for i, s in enumerate(scenes):
        if not resolve(s["visual"]) or (s.get("audio") and not resolve(s["audio"])):
            continue
        out = os.path.join(BUILD, f"part_{i:02d}.mp4")
        t = build_scene(i, s, out)
        total += t
        parts.append(out)
        print(f"  {s['id']:<14} {t:5.1f}s   (running {int(total // 60)}:{total % 60:04.1f})")

    if not parts:
        sys.exit("Nothing to build yet. Record some clips into video/recordings/ first.")
    listfile = os.path.join(BUILD, "parts.txt")
    with open(listfile, "w") as f:
        f.writelines(f"file '{p}'\n" for p in parts)
    final = os.path.join(BUILD, "final.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listfile,
                    "-c", "copy", "-movflags", "+faststart", final], check=True)

    real = duration(final)
    print(f"\nBuilt {final}  ({int(real // 60)}:{real % 60:04.1f})")
    if real < 180:
        print("⚠️  Under 3:00. The challenge requires 3–5 minutes.")
    elif real > 300:
        print("⚠️  Over 5:00. Trim voiceovers; the challenge requires 3–5 minutes.")
    else:
        print("✅ Length is inside the 3–5 minute window.")


if __name__ == "__main__":
    main()
