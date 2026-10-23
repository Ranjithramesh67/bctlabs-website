import json
import os

VO = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(VO), "v2")

m = json.load(open(f"{VO}/manifest.json"))
LEAD, TAIL, LAST_TAIL, FPS = 0.45, 0.45, 2.4, 30
for group in ("marketing", "admin"):
    t = 0.0
    scenes = []
    n = len(m[group])
    for i, item in enumerate(m[group]):
        dur = LEAD + item["duration"] + (TAIL if i < n - 1 else LAST_TAIL)
        scenes.append({
            "id": item["id"],
            "start": round(t, 3),
            "dur": round(dur, 3),
            "voiceAt": round(t + LEAD, 3),
            "voiceDur": item["duration"],
        })
        t += dur
    data = {"fps": FPS, "total": round(t, 3), "scenes": scenes}
    js = "window.__TIMING = " + json.dumps(data, indent=2) + ";\n"
    open(f"{OUT}/timing-{group}.js", "w").write(js)
    print(group, "total", round(t, 2), "frames", round(t * FPS))
