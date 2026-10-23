import json
import os
import subprocess

V = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(V), "v2")


def timing(group):
    src = open(f"{OUT}/timing-{group}.js").read()
    return json.loads(src[src.index("{"):src.rindex("}") + 1])


for group in ("marketing", "admin"):
    t = timing(group)
    total = t["total"]
    n = len(t["scenes"])
    inputs, filters = [], []
    for i, sc in enumerate(t["scenes"]):
        inputs += ["-i", f"{V}/proc2/{sc['id']}.wav"]
        ms = int(round(sc["voiceAt"] * 1000))
        filters.append(f"[{i}:a]adelay={ms}|{ms},apad[v{i}]")

    voice = "".join(f"[v{i}]" for i in range(n))
    fc = (
        ";".join(filters)
        + f";{voice}amix=inputs={n}:normalize=0,atrim=0:{total},asetpts=N/SR/TB,"
        "highpass=f=75,asplit=2[voice][key]"
    )

    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
        "-i", f"{V}/music-{group}.wav",
        "-filter_complex", fc + ";" + (
            f"[{n}:a]atrim=0:{total},asetpts=N/SR/TB,"
            "volume=0.74,highpass=f=38,"
            "afade=t=in:st=0:d=2.0,"
            f"afade=t=out:st={total - 3.5:.2f}:d=3.5[bed];"
            "[bed][key]sidechaincompress=threshold=0.08:ratio=5:attack=18:release=380:makeup=1[duck];"
            "[voice][duck]amix=inputs=2:normalize=0,"
            "alimiter=limit=0.94,"
            "loudnorm=I=-16:TP=-1.5:LRA=9,aresample=48000[out]"
        ),
        "-map", "[out]", "-t", str(total), "-ar", "48000", "-ac", "2",
        f"{V}/{group}-mix.wav",
    ]
    subprocess.run(cmd, check=True)
    print(group, "ok", total)
