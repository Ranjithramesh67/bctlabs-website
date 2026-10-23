import asyncio, json, os, subprocess, sys
import edge_tts

ROOT = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(f"{ROOT}/script.json"))
voice = spec["voice"]

RATE = os.environ.get("VO_RATE", spec["rate"])
PITCH = os.environ.get("VO_PITCH", spec["pitch"])
RAW = os.environ.get("VO_RAW", f"{ROOT}/raw")
PROC = os.environ.get("VO_PROC", f"{ROOT}/proc")
os.makedirs(RAW, exist_ok=True)
os.makedirs(PROC, exist_ok=True)

async def synth(item, rate, pitch):
    raw = f"{RAW}/{item['id']}.mp3"
    if os.path.exists(raw) and os.path.getsize(raw) > 2000:
        return
    for attempt in range(4):
        try:
            c = edge_tts.Communicate(item["text"], voice, rate=rate, pitch=pitch)
            await c.save(raw)
            if os.path.getsize(raw) > 2000:
                return
        except Exception as e:
            print("retry", item["id"], e, file=sys.stderr)
        await asyncio.sleep(2)
    raise RuntimeError(f"failed {item['id']}")

def duration(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", path])
    return float(out.strip())

def process(item):
    raw = f"{RAW}/{item['id']}.mp3"
    out = f"{PROC}/{item['id']}.wav"
    # Warm, close-mic feel: gentle low cut, a little body, presence lift,
    # soft compression and a short room tail. No echo.
    af = (
        "highpass=f=85,"
        "equalizer=f=210:t=q:w=0.9:g=1.8,"
        "equalizer=f=430:t=q:w=1.0:g=-1.2,"
        "equalizer=f=3100:t=q:w=1.1:g=1.8,"
        "equalizer=f=6800:t=q:w=1.6:g=-1.6,"
        "acompressor=threshold=-19dB:ratio=2.8:attack=6:release=200,"
        "aecho=0.9:0.6:11|19:0.055|0.03,"
        "loudnorm=I=-16:TP=-1.5:LRA=9,"
        "aresample=48000"
    )
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", raw, "-af", af, "-ac", "1", "-ar", "48000", out], check=True)
    return duration(out)

async def main():
    for group in ("marketing", "admin"):
        for item in spec[group]:
            await synth(item, RATE, PITCH)
    manifest = {"voice": voice, "marketing": [], "admin": []}
    for group in ("marketing", "admin"):
        for item in spec[group]:
            d = process(item)
            manifest[group].append({"id": item["id"], "duration": round(d, 3),
                                    "text": item["text"]})
            print(f"{item['id']}  {d:6.2f}s")
    json.dump(manifest, open(f"{ROOT}/manifest.json", "w"), indent=2)
    for group in ("marketing", "admin"):
        print(group, "total", round(sum(x["duration"] for x in manifest[group]), 2))

asyncio.run(main())
