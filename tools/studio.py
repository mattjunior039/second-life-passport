#!/usr/bin/env python3
"""Recording studio: one page that walks you through every face/voice clip and saves it with the right name.

    python3 tools/studio.py      # opens http://localhost:8790 in your browser
"""
import json
import os
import subprocess
import sys
import tempfile
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REC = os.path.join(ROOT, "video", "recordings")
PORT = 8790
sys.path.insert(0, os.path.join(ROOT, "tools"))
from assemble import duration, resolve  # noqa: E402


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, *a):
        pass

    def send_json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/":
            self.send_response(302)
            self.send_header("Location", "/video/studio.html")
            self.end_headers()
        elif url.path == "/api/status":
            scenes = json.load(open(os.path.join(ROOT, "video", "scenes.json")))["scenes"]
            for s in scenes:
                f = s.get("audio") or s["visual"]
                path = resolve(f)
                s["done"] = bool(path)
                s["seconds"] = round(duration(path), 1) if path and f.endswith((".m4a", ".mov")) else None
            self.send_json(scenes)
        else:
            super().do_GET()

    def do_POST(self):
        url = urlparse(self.path)
        if url.path == "/api/save":
            name = os.path.basename(parse_qs(url.query)["name"][0])
            if not name.endswith((".m4a", ".mov")):
                return self.send_json({"error": "bad name"}, 400)
            data = self.rfile.read(int(self.headers["Content-Length"]))
            os.makedirs(REC, exist_ok=True)
            with tempfile.NamedTemporaryFile(suffix=".bin", delete=False) as tmp:
                tmp.write(data)
            out = os.path.join(REC, name)
            codec = ["-vn", "-c:a", "aac", "-b:a", "192k"] if name.endswith(".m4a") else \
                ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k"]
            r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp.name, *codec, out], capture_output=True, text=True)
            os.unlink(tmp.name)
            if r.returncode:
                return self.send_json({"error": r.stderr[-400:]}, 500)
            self.send_json({"ok": True, "seconds": round(duration(out), 1)})
        elif url.path == "/api/build":
            r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "assemble.py")], capture_output=True, text=True, cwd=ROOT)
            self.send_json({"ok": r.returncode == 0, "log": (r.stdout + r.stderr)[-4000:]})
        else:
            self.send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://localhost:{PORT}/"
    print(f"Recording studio running at {url}  (Ctrl+C to quit)")
    if "--no-open" not in sys.argv:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
