"""Synthesise the two tour scores.

Marketing: warm, forward-moving tech/corporate groove in A minor.
Admin: calmer, more deliberate theme in D minor.

Everything is generated from oscillators and noise so the beds are
deterministic, royalty-free and can be rebuilt at any length.
"""

import json
import math
import sys
import wave

import numpy as np

SR = 48000


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def env_ad(n, attack, decay, curve=4.0):
    a = max(1, int(attack * SR))
    d = max(1, n - a)
    out = np.empty(n, dtype=np.float64)
    out[:a] = np.linspace(0, 1, a) ** 0.7
    out[a:] = np.exp(-curve * np.linspace(0, 1, d))
    return out


def tone(freq, dur, harmonics, attack=0.008, decay=0.25, curve=5.0, detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n, dtype=np.float64)
    for mult, amp in harmonics:
        f = freq * mult * (1 + detune)
        out += amp * np.sin(2 * np.pi * f * t + mult * 0.7)
    return out * env_ad(n, attack, decay, curve)


def pad(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n, dtype=np.float64)
    for mult, amp in ((1, 1.0), (2, 0.32), (3, 0.16), (4, 0.07), (0.5, 0.10)):
        out += amp * np.sin(2 * np.pi * freq * mult * t + mult)
    a = int(min(0.45, dur * 0.35) * SR)
    r = int(min(0.6, dur * 0.4) * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 1.6
    e[-r:] = np.linspace(1, 0, r) ** 1.4
    return out * e


def noise_burst(dur, hp=None, lp=None, curve=14.0):
    n = int(dur * SR)
    rng = np.random.default_rng(1234 + n)
    x = rng.standard_normal(n)
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    if hp:
        spec[freqs < hp] *= np.linspace(1, 0, max(1, int(np.sum(freqs < hp)))) ** 2
    if lp:
        spec[freqs > lp] *= np.linspace(1, 0, max(1, int(np.sum(freqs > lp)))) ** 2
    x = np.fft.irfft(spec, n)
    return x / (np.max(np.abs(x)) + 1e-9) * env_ad(n, 0.001, dur, curve)


def kick(dur=0.32):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 118 * np.exp(-t * 26) + 40
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5)


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[1] or i + len(sig) <= 0:
        return
    j = min(buf.shape[1], i + len(sig))
    seg = sig[: j - i]
    l = math.sqrt(0.5 * (1 - pan))
    r = math.sqrt(0.5 * (1 + pan))
    buf[0, i:j] += seg * gain * l * 1.414
    buf[1, i:j] += seg * gain * r * 1.414


PLAN = {
    "marketing": {
        "bpm": 104,
        "prog": [
            [57, 60, 64, 67],   # Am7
            [53, 57, 60, 64],   # Fmaj7
            [48, 55, 60, 64],   # Cmaj7
            [55, 59, 62, 64],   # G6
        ],
        "bass": [45, 41, 36, 43],
        "sections": [("intro", 2), ("build", 2), ("main", 8), ("break", 2),
                     ("main", 8), ("main", 8), ("break", 2), ("main", 8),
                     ("outro", 3)],
        "bell": True,
    },
    "admin": {
        "bpm": 92,
        "prog": [
            [50, 53, 57, 60],   # Dm7
            [46, 50, 53, 57],   # Bbmaj7
            [41, 48, 53, 57],   # Fmaj7
            [48, 52, 55, 57],   # C6
        ],
        "bass": [38, 34, 29, 36],
        "sections": [("intro", 3), ("build", 3), ("main", 8), ("break", 2),
                     ("main", 8), ("main", 8), ("break", 2), ("main", 8),
                     ("outro", 3)],
        "bell": False,
    },
}

LAYERS = {
    "intro": dict(pad=1.0, bass=0.0, pluck=0.55, kick=0.0, clap=0.0, hat=0.0, bell=0.0),
    "build": dict(pad=1.0, bass=0.75, pluck=0.75, kick=0.0, clap=0.0, hat=0.4, bell=0.0),
    "main": dict(pad=0.9, bass=1.0, pluck=0.9, kick=1.0, clap=0.85, hat=0.85, bell=1.0),
    "break": dict(pad=1.15, bass=0.55, pluck=0.45, kick=0.0, clap=0.0, hat=0.25, bell=0.5),
    "outro": dict(pad=1.1, bass=0.6, pluck=0.5, kick=0.35, clap=0.0, hat=0.3, bell=0.4),
}


def build(cut, total):
    cfg = PLAN[cut]
    beat = 60.0 / cfg["bpm"]
    bar = beat * 4
    bars = int(math.ceil(total / bar))
    n = int(bars * bar * SR) + SR
    buf = np.zeros((2, n), dtype=np.float64)

    bar_layers = []
    for name, count in cfg["sections"]:
        bar_layers += [name] * count
    while len(bar_layers) < bars:
        bar_layers.append("main")

    for b in range(bars):
        t0 = b * bar
        sec = bar_layers[b]
        g = LAYERS[sec]
        chord = cfg["prog"][b % 4]
        root = cfg["bass"][b % 4]

        # keep the pad out of the bass register so the low end stays clean
        for k, note in enumerate(chord):
            add(buf, pad(hz(note + 12), bar * 1.02), t0, 0.052 * g["pad"], pan=(-0.45 + 0.3 * k))
            add(buf, pad(hz(note + 24), bar * 1.02), t0, 0.020 * g["pad"], pan=(0.45 - 0.3 * k))

        if g["bass"]:
            for s in range(8):
                if s in (3, 7) and sec == "main":
                    pitch = root + 12
                else:
                    pitch = root
                sig = tone(hz(pitch), beat * 0.5, ((1, 1.0), (2, 0.26), (3, 0.08)),
                           attack=0.004, decay=0.16, curve=6.0)
                add(buf, sig, t0 + s * beat / 2, 0.17 * g["bass"], pan=0.0)

        if g["pluck"]:
            pattern = [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 3, 1, 2, 0, 1, 3]
            for s in range(16):
                accent = 1.0 if s % 4 == 0 else 0.62
                note = chord[pattern[s] % len(chord)] + 12
                sig = tone(hz(note), beat * 0.34,
                           ((1, 1.0), (2, 0.45), (3, 0.24), (4, 0.12), (5, 0.07), (6, 0.04)),
                           attack=0.003, decay=0.1, curve=7.0)
                add(buf, sig, t0 + s * beat / 4, 0.085 * accent * g["pluck"],
                    pan=(-0.5 if s % 2 else 0.5))

        if g["kick"]:
            for s in (0, 1, 2, 3):
                add(buf, kick(), t0 + s * beat, 0.34 * g["kick"], pan=0.0)
            if sec == "main" and b % 4 == 3:
                add(buf, kick(), t0 + 3.5 * beat, 0.30 * g["kick"], pan=0.0)

        if g["clap"]:
            for s in (1, 3):
                sig = noise_burst(0.14, hp=1400, lp=7500, curve=14.0)
                add(buf, sig, t0 + s * beat, 0.23 * g["clap"], pan=0.08)
                add(buf, sig, t0 + s * beat + 0.011, 0.14 * g["clap"], pan=-0.08)

        if g["hat"]:
            for s in range(16):
                if s % 2 == 0:
                    continue
                sig = noise_burst(0.05, hp=7000, curve=18.0)
                gain = 0.30 if s % 4 == 2 else 0.19
                if s == 14 and sec == "main":
                    sig = noise_burst(0.16, hp=6500, curve=8.0)
                    gain = 0.24
                add(buf, sig, t0 + s * beat / 4, gain * g["hat"], pan=0.22)

        if cfg["bell"] and g["bell"] and sec in ("main", "break", "outro") and b % 4 in (1, 3):
            motif = [72, 76, 79, 76, 74, 72]
            for k, note in enumerate(motif):
                sig = tone(hz(note), beat * 0.9, ((1, 1.0), (2, 0.22), (3, 0.08), (4, 0.03)),
                           attack=0.01, decay=0.5, curve=3.2)
                add(buf, sig, t0 + k * beat * 0.66, 0.055 * g["bell"], pan=0.3)

    # gentle bus treatment
    out = np.zeros((2, int(total * SR)), dtype=np.float64)
    m = min(buf.shape[1], out.shape[1])
    out[:, :m] = buf[:, :m]
    out = np.tanh(out * 1.15)

    fade_in = int(1.2 * SR)
    fade_out = int(4.0 * SR)
    out[:, :fade_in] *= np.linspace(0, 1, fade_in) ** 1.5
    out[:, -fade_out:] *= np.linspace(1, 0, fade_out) ** 1.2

    peak = np.max(np.abs(out)) + 1e-9
    out *= 0.5 / peak
    return out


def write_wav(path, stereo):
    data = np.clip(stereo.T, -1, 1)
    pcm = (data * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    import os

    VO = os.path.dirname(os.path.abspath(__file__))
    V2 = os.path.join(os.path.dirname(VO), "v2")
    for cut in ("marketing", "admin"):
        src = open(f"{V2}/timing-{cut}.js").read()
        total = json.loads(src[src.index("{"):src.rindex("}") + 1])["total"]
        audio = build(cut, total)
        path = f"{VO}/music-{cut}.wav"
        write_wav(path, audio)
        print(cut, "score", round(len(audio[0]) / SR, 2), "s")
