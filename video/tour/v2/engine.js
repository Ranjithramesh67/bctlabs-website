/* Deterministic scene engine: builds DOM from window.__SCENES and renders
   every frame from window.__render(frame). No randomness outside seeded PRNG. */
(function () {
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const eo = (t) => 1 - Math.pow(1 - t, 3);
  const eo4 = (t) => 1 - Math.pow(1 - t, 4);
  const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const backOut = (t) => {
    const c = 1.9;
    const p = t - 1;
    return 1 + (c + 1) * p * p * p + c * p * p;
  };

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const scenes = [];
  let FPS = 30;
  let timeline = [];

  function fmtINR(n) {
    return n.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function splitKinetic(node, base, stagger) {
    const words = [];
    let wi = 0;
    function walk(n) {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            continue;
          }
          const wrap = el("span", "w");
          const inner = el("i");
          inner.textContent = part;
          wrap.appendChild(inner);
          wrap.dataset.at = String(base + wi * stagger);
          wi++;
          frag.appendChild(wrap);
          words.push(inner);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        Array.from(n.childNodes).forEach(walk);
      }
    }
    Array.from(node.childNodes).forEach(walk);
    node.classList.add("kin");
    return words;
  }

  function device(scene, m, key) {
    const d = el("div", "device " + (m.cls || ""));
    if (m.width) d.style.width = m.width + "px";
    if (m.height) d.style.height = m.height + "px";
    const bar = el("div", "device-bar");
    bar.innerHTML = "<i></i><i></i><i></i>";
    if (m.url) {
      const u = el("div", "device-url");
      u.innerHTML =
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
        m.url;
      bar.appendChild(u);
    }
    d.appendChild(bar);
    const vp = el("div", "viewport");
    vp.style.height = m.vh ? m.vh + "px" : m.height ? m.height - 41 + "px" : "620px";
    if (m.fill) vp.style.height = "100%";
    const img = el("img", m.fill ? "shot-fill" : "shot");
    img.src = "assets/" + m.src + ".jpg";
    img.alt = "";
    if (m.objectPosition) img.style.objectPosition = m.objectPosition;
    if (m.scale) img.style.transform = `scale(${m.scale})`;
    if (m.scroll) {
      img.dataset.scroll = String(m.scroll.dist);
      img.dataset.at = String(m.scroll.at);
      img.dataset.span = String(m.scroll.span);
    }
    vp.appendChild(img);
    if (m.sweep !== false) vp.appendChild(el("i", "sweep"));
    d.appendChild(vp);

    if (m.stack) {
      // a second, offset screenshot peeking behind
      const back = el("div", "device back");
      back.style.cssText = m.stack.style || "";
      const bimg = el("img", "shot-fill");
      bimg.src = "assets/" + m.stack.src + ".jpg";
      back.appendChild(bimg);
      d.appendChild(back);
    }
    if (m.second) {
      const wrap = el("div", "duo");
      wrap.appendChild(device(scene, { ...m, second: null, stack: null }, key));
      const b = device(scene, m.second, key + "b");
      b.classList.add("duo-b");
      if (m.second.style) b.style.cssText += ";" + m.second.style;
      wrap.appendChild(b);
      return wrap;
    }
    return d;
  }

  function copyBlock(scene, c) {
    const wrap = el("div", "copy");
    if (c.eyebrow) {
      const e = el("div", "eyebrow sr");
      e.innerHTML = `<span class="num">${c.index || scene.index}</span><span class="rule"></span><span>${c.eyebrow}</span>`;
      e.dataset.at = "0.40";
      e.dataset.y = "14";
      wrap.appendChild(e);
    }
    if (c.title) {
      const h = el(c.big === false ? "div" : "h1", (c.big === false ? "h2" : "h1") + " " + (c.small ? "sm" : ""));
      h.innerHTML = c.title;
      h.dataset.at = "0.55";
      h.dataset.words = "1";
      wrap.appendChild(h);
      const words = splitKinetic(h, 0.60, c.stagger || 0.05);
      scene._kinetics.push({ words });
    }
    if (c.body) {
      const b = el("p", "body sr");
      b.innerHTML = c.body;
      b.dataset.at = "0.95";
      b.dataset.y = "22";
      wrap.appendChild(b);
    }
    if (c.stats) {
      const m = el("div", "meta");
      c.stats.forEach((s, i) => {
        const d = el("div", "stat sr");
        d.innerHTML = `<b data-count="${s.v}" ${s.inr ? 'data-inr="1"' : ""}>0</b><span>${s.s}</span>`;
        d.dataset.at = String(1.15 + i * 0.09);
        d.dataset.y = "18";
        d.querySelector("b").dataset.at = String(1.15 + i * 0.09);
        d.querySelector("b").dataset.dur = "1.1";
        if (s.prefix) d.querySelector("b").dataset.prefix = s.prefix;
        if (s.suffix) d.querySelector("b").dataset.suffix = s.suffix;
        m.appendChild(d);
      });
      wrap.appendChild(m);
    }
    if (c.extra) wrap.insertAdjacentHTML("beforeend", c.extra);
    if (c.chips) {
      const row = el("div", "row");
      row.style.marginTop = "34px";
      c.chips.forEach((t, i) => {
        const ch = el("div", "chip plain sr");
        ch.innerHTML = `<span class="dot"></span>${t}`;
        ch.style.position = "relative";
        ch.dataset.at = String(1.45 + i * 0.1);
        ch.dataset.y = "14";
        row.appendChild(ch);
      });
      wrap.appendChild(row);
    }
    return wrap;
  }

  function buildScene(s, si) {
    const scene = s;
    const sec = el("section", "scene");
    sec.id = s.id;
    const inner = el("div", "inner");

    inner.appendChild(el("div", "bg-base"));
    const glow = el("div", "bg-glow " + (s.bg || ""));
    glow.style.left = (s.glowX ?? 62) + "%";
    glow.style.top = (s.glowY ?? 30) + "%";
    glow.style.transform = "translate(-50%,-50%)";
    inner.appendChild(glow);
    const grid = el("div", "bg-grid");
    inner.appendChild(grid);
    if (s.ghost) {
      const g = el("div", "ghost", s.ghost);
      g.style.fontSize = (s.ghostSize || 460) + "px";
      g.style.right = (s.ghostX ?? -40) + "px";
      g.style.top = (s.ghostY ?? 120) + "px";
      inner.appendChild(g);
    }

    // seeded particles
    const rand = rng(1000 + si * 77);
    const parts = [];
    for (let i = 0; i < 22; i++) {
      const p = el("i", "pt");
      const x = rand() * 1920;
      const y = rand() * 1080;
      const r = 1.2 + rand() * 2.2;
      p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${r}px;height:${r}px;border-radius:50%;
        background:rgba(255,255,255,${0.10 + rand() * 0.22});box-shadow:0 0 ${6 + rand() * 10}px rgba(245,23,122,.35)`;
      parts.push({ node: p, x, y, spd: 0.12 + rand() * 0.35, ph: rand() * 6.28, amp: 8 + rand() * 26 });
      inner.appendChild(p);
    }

    const pad = el("div", "pad");
    if (s.layout === "center") {
      const c = el("div", "center");
      if (s.pre) c.insertAdjacentHTML("beforeend", s.pre);
      if (s.copy) c.appendChild(copyBlock(s, { ...s.copy, big: false }));
      if (s.media) c.appendChild(scene._mediaNode = device(s, s.media, s.id));
      if (s.overlay) c.insertAdjacentHTML("beforeend", s.overlay);
      pad.appendChild(c);
    } else if (s.layout === "bleed") {
      const m = scene._mediaNode = device(s, { ...s.media, fill: true, height: 1080 }, s.id);
      m.classList.add("bleed");
      m.style.position = "absolute";
      m.style.inset = "0";
      m.style.height = "1080px";
      m.style.borderRadius = "0";
      m.style.border = "0";
      inner.appendChild(m);
      const sh = el("div", "bleed-shade");
      inner.appendChild(sh);
      const wrap = el("div", "pad");
      wrap.appendChild(copyBlock(s, s.copy));
      pad.appendChild(wrap);
    } else {
      const grid2 = el("div", "split " + (s.layout === "split-rev" ? "rev" : ""));
      const cp = copyBlock(s, s.copy || {});
      const md = el("div", "media");
      if (s.media) md.appendChild((scene._mediaNode = device(s, s.media, s.id)));
      if (s.media2) {
        const m2 = device(s, s.media2, s.id + "2");
        m2.classList.add("media2");
        md.appendChild(m2);
      }
      if (s.overlay) md.insertAdjacentHTML("beforeend", s.overlay);
      grid2.appendChild(cp);
      grid2.appendChild(md);
      pad.appendChild(grid2);
    }
    inner.appendChild(pad);

    // floating chips / focus / cursors in stage coordinates
    (s.chips || []).forEach((c) => {
      const n = el("div", "chip " + (c.cls || ""));
      n.innerHTML = `<span class="dot"></span>${c.text}`;
      n.style.left = c.x + "px";
      n.style.top = c.y + "px";
      n.dataset.at = String(c.at ?? 2.0);
      n.dataset.y = "16";
      inner.appendChild(n);
    });
    (s.focus || []).forEach((f) => {
      const n = el("div", "focus " + (f.cls || ""));
      n.style.cssText += `left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px`;
      n.innerHTML = "<i></i><i></i><i></i><i></i>";
      n.dataset.at = String(f.at ?? 2.0);
      n.dataset.hold = String(f.hold ?? 3.0);
      inner.appendChild(n);
    });
    (s.cursors || []).forEach((c) => {
      const n = el("div", "cursor");
      n.innerHTML =
        '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2.5 19 12l-6.4 1.6L9.2 21z" fill="#fff" stroke="#0b0710" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      const rp = el("div", "ripple");
      n.dataset.path = JSON.stringify(c.path);
      n.dataset.at = String(c.at ?? 2.0);
      n.dataset.span = String(c.span ?? 1.2);
      n.dataset.press = String(c.press ?? -1);
      inner.appendChild(n);
      inner.appendChild(rp);
      n._ripple = rp;
    });

    sec.appendChild(inner);

    // collect animated nodes
    scene._reveals = Array.from(inner.querySelectorAll(".sr")).map((n) => ({
      node: n,
      at: Number(n.dataset.at || 0.5),
      dur: Number(n.dataset.dur || 0.78),
      y: Number(n.dataset.y || 20),
      x: Number(n.dataset.x || 0),
      s0: Number(n.dataset.s0 || 1),
      kind: n.dataset.kind || "fade",
    }));
    scene._counters = Array.from(inner.querySelectorAll("[data-count]")).map((n) => ({
      node: n,
      to: Number(n.dataset.count),
      at: Number(n.dataset.at || 1.2),
      dur: Number(n.dataset.dur || 1.2),
      inr: n.dataset.inr === "1",
      prefix: n.dataset.prefix || "",
      suffix: n.dataset.suffix || "",
    }));
    scene._scrolls = Array.from(inner.querySelectorAll("[data-scroll]")).map((n) => ({
      node: n,
      dist: Number(n.dataset.scroll),
      at: Number(n.dataset.at || 1.0),
      span: Number(n.dataset.span || 6.0),
    }));
    scene._focus = Array.from(inner.querySelectorAll(".focus")).map((n) => ({
      node: n,
      at: Number(n.dataset.at),
      hold: Number(n.dataset.hold),
    }));
    scene._cursors = Array.from(inner.querySelectorAll(".cursor")).map((n) => ({
      node: n,
      path: JSON.parse(n.dataset.path),
      at: Number(n.dataset.at),
      span: Number(n.dataset.span),
      press: Number(n.dataset.press),
      ripple: n._ripple,
    }));
    scene._chips = Array.from(inner.querySelectorAll(".chip")).map((n) => ({
      node: n,
      at: Number(n.dataset.at),
      y: Number(n.dataset.y || 16),
    }));
    scene._bars = Array.from(inner.querySelectorAll("[data-bar]")).map((n) => ({
      node: n,
      h: Number(n.dataset.bar),
      at: Number(n.dataset.at || 1.0),
      dur: Number(n.dataset.dur || 0.9),
    }));
    scene._packets = Array.from(inner.querySelectorAll("[data-packet]")).map((n) => ({
      node: n,
      at: Number(n.dataset.at),
      span: Number(n.dataset.span || 1.1),
      from: Number(n.dataset.from || 0),
      to: Number(n.dataset.to || 100),
      y: Number(n.dataset.py || 0),
    }));
    scene._specials = s.special || null;
    scene._el = sec;
    scene._inner = inner;
    scene._parts = parts;
    scene._glow = glow;
    scene._grid = grid;
    return sec;
  }

  /* ---------------- transitions ---------------- */
  const TRANS = [
    "wipeUp", "whip", "lens", "peel", "bars", "flip", "pushDiag",
    "iris", "zoom", "curtain", "spin", "scan", "stack", "glitch",
    "slideUp", "diag", "mosaic", "zoomBlur", "split", "swirl",
    "flash", "shutter",
  ];

  function resetScene(node) {
    node.style.transform = "";
    node.style.clipPath = "";
    node.style.opacity = "1";
    node.style.filter = "";
    node.style.transformOrigin = "50% 50%";
  }

  function sceneT(node, type, p, incoming) {
    resetScene(node);
    const q = incoming ? p : p; // p goes 0..1 across the cut for both
    const inv = 1 - p;
    switch (type) {
      case "wipeUp":
        node.style.clipPath = incoming
          ? `inset(${inv * 100}% 0 0 0)`
          : `inset(0 0 ${p * 100}% 0)`;
        break;
      case "whip":
        if (incoming) {
          node.style.transform = `translate3d(${inv * 55}%,0,0) skewX(${inv * 7}deg)`;
          node.style.opacity = String(0.3 + p * 0.7);
        } else {
          node.style.transform = `translate3d(${-p * 26}%,0,0) skewX(${-p * 4}deg)`;
          node.style.opacity = String(1 - p * 0.55);
        }
        break;
      case "iris":
        if (incoming) node.style.clipPath = `circle(${p * 78}% at 50% 50%)`;
        else {
          node.style.transform = `scale(${1 + p * 0.05})`;
          node.style.opacity = String(1 - p * 0.35);
        }
        break;
      case "zoom":
        if (incoming) {
          node.style.transform = `scale(${1.16 - p * 0.16})`;
          node.style.opacity = String(p);
        } else {
          node.style.transform = `scale(${1 + p * 0.14})`;
          node.style.opacity = String(1 - p);
        }
        break;
      case "stack":
        if (incoming) {
          node.style.transform = `translate3d(${inv * 16}%,0,0) scale(${0.965 + p * 0.035})`;
          node.style.opacity = String(clamp(p * 1.6));
        } else {
          node.style.transform = `translate3d(${-p * 9}%,0,0) scale(${1 - p * 0.03})`;
          node.style.opacity = String(1 - p * 0.8);
        }
        break;
      case "glitch":
        if (incoming) {
          node.style.transform = `translate3d(${Math.sin(p * 40) * inv * 9}px,0,0)`;
          node.style.opacity = String(clamp(p * 1.8));
        } else {
          node.style.opacity = String(1 - p);
        }
        break;
      case "diag":
        node.style.clipPath = incoming
          ? `polygon(-12% 0, ${p * 128}% 0, ${p * 128 - 26}% 100%, -12% 100%)`
          : `inset(0 0 0 0)`;
        if (!incoming) node.style.opacity = String(1 - p);
        break;
      case "shutter":
        if (incoming) {
          node.style.clipPath = `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)`;
          node.style.transform = `scaleY(${0.94 + p * 0.06})`;
        } else node.style.opacity = String(1 - p * 0.4);
        break;
      case "lens":
        if (incoming) {
          node.style.clipPath = `circle(${p * 82}% at ${68 - p * 18}% 42%)`;
          node.style.transform = `scale(${1.04 - p * 0.04})`;
        } else {
          node.style.transform = `scale(${1 + p * 0.06})`;
          node.style.opacity = String(1 - p * 0.5);
        }
        break;
      case "peel":
        if (incoming) {
          node.style.clipPath = `polygon(${100 - p * 118}% 0, 100% 0, 100% 100%, ${100 - p * 118 - 18}% 100%)`;
        } else {
          node.style.transform = `translate3d(${-p * 8}%,0,0)`;
          node.style.opacity = String(1 - p * 0.9);
        }
        break;
      case "flip":
        if (incoming) {
          node.style.transformOrigin = "0% 50%";
          node.style.transform = `perspective(2800px) rotateY(${-38 * inv}deg) scale(${1.06 + p * 0.02})`;
          node.style.opacity = String(clamp(p * 2.4));
        } else {
          node.style.transformOrigin = "100% 50%";
          node.style.transform = `perspective(2800px) rotateY(${p * 30}deg) scale(${1 + p * 0.04})`;
          node.style.opacity = String(1 - p * 0.9);
        }
        break;
      case "pushDiag":
        if (incoming) {
          node.style.transform = `translate3d(${inv * 66}%,${inv * 40}%,0) rotate(${inv * 2.4}deg) scale(${0.94 + p * 0.06})`;
          node.style.opacity = String(clamp(p * 2));
        } else {
          node.style.transform = `translate3d(${-p * 24}%,${-p * 15}%,0) rotate(${-p * 1.4}deg)`;
          node.style.opacity = String(1 - p * 0.85);
        }
        break;
      case "spin":
        if (incoming) {
          node.style.transform = `rotate(${-6 + 6 * p}deg) scale(${1.26 - p * 0.26})`;
          node.style.opacity = String(clamp(p * 1.8));
        } else {
          node.style.transform = `rotate(${p * 3.5}deg) scale(${1 + p * 0.12})`;
          node.style.opacity = String(1 - p);
        }
        break;
      case "scan":
        if (incoming) {
          node.style.clipPath = `inset(${50 - p * 50}% 0 ${50 - p * 50}% 0)`;
          node.style.transform = `scaleY(${1.05 - p * 0.05})`;
        } else node.style.opacity = String(1 - p * 0.9);
        break;
      case "slideUp":
        if (incoming) {
          node.style.transform = `translate3d(0,${inv * 100}%,0) scale(1.02)`;
        } else {
          node.style.transform = `translate3d(0,${-p * 30}%,0) scale(${1 - p * 0.02})`;
          node.style.opacity = String(1 - p * 0.7);
        }
        break;
      case "zoomBlur":
        if (incoming) {
          node.style.filter = `blur(${inv * 11}px)`;
          node.style.transform = `scale(${1.22 - p * 0.22})`;
          node.style.opacity = String(clamp(p * 1.5));
        } else {
          node.style.filter = `blur(${p * 8}px)`;
          node.style.transform = `scale(${1 + p * 0.07})`;
          node.style.opacity = String(1 - p);
        }
        break;
      case "split":
        if (incoming) {
          node.style.clipPath = `inset(0 ${inv * 50}% 0 ${inv * 50}%)`;
          node.style.transform = `scale(${1.05 - p * 0.05})`;
        } else {
          node.style.transform = `scale(${1 + p * 0.04})`;
          node.style.opacity = String(1 - p * 0.85);
        }
        break;
      case "swirl":
        if (incoming) {
          node.style.transform = `rotate(${-15 * inv}deg) scale(${1.34 - p * 0.34})`;
          node.style.opacity = String(clamp(p * 1.6));
        } else {
          node.style.transform = `rotate(${p * 8}deg) scale(${1 - p * 0.06})`;
          node.style.opacity = String(1 - p);
        }
        break;
      case "bars":
      case "curtain":
      case "mosaic":
      case "flash":
        // overlay handles the cut; scenes swap at the midpoint
        node.style.opacity = incoming ? (p < 0.5 ? "0" : "1") : p < 0.5 ? "1" : "0";
        if (type === "flash" && incoming) node.style.transform = `scale(${1.03 - p * 0.03})`;
        break;
    }
  }

  let fxBars, fxCurtain, fxTiles, fxFlash, fxBeat;
  function buildFx() {
    const fx = el("div", "");
    fx.id = "fx";
    fxBars = el("div", "");
    fxBars.id = "fx-bars";
    for (let i = 0; i < 8; i++) fxBars.appendChild(el("i"));
    fxCurtain = el("div", "");
    fxCurtain.id = "fx-curtain";
    for (let i = 0; i < 6; i++) fxCurtain.appendChild(el("i"));
    fxTiles = el("div", "");
    fxTiles.id = "fx-tiles";
    for (let i = 0; i < 112; i++) fxTiles.appendChild(el("i"));
    fxFlash = el("div", "");
    fxFlash.id = "fx-flash";
    fxBeat = el("div", "");
    fxBeat.id = "fx-beat";
    fx.appendChild(fxBars);
    fx.appendChild(fxCurtain);
    fx.appendChild(fxTiles);
    fx.appendChild(fxFlash);
    fx.appendChild(fxBeat);
    document.getElementById("stage").appendChild(fx);
  }

  // accent streak that fires on every callout, adding a beat between cuts
  function beatStreak(sc, lt) {
    fxBeat.style.opacity = "0";
    for (const c of sc._chips) {
      const p = (lt - (c.at - 0.34)) / 0.9;
      if (p <= 0 || p >= 1) continue;
      fxBeat.style.opacity = String(Math.sin(Math.PI * p) * 0.75);
      fxBeat.style.transform = `translate3d(${lerp(-8, 108, p)}%,0,0) skewX(-14deg)`;
      break;
    }
  }

  function overlay(type, p) {
    fxBars.style.display = "none";
    fxCurtain.style.display = "none";
    fxTiles.style.display = "none";
    fxFlash.style.opacity = "0";
    if (type === "bars") {
      fxBars.style.display = "block";
      const bars = fxBars.children;
      const local = p < 0.5 ? p / 0.5 : (1 - p) / 0.5;
      for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        const st = clamp((local - i * 0.055) / 0.8);
        b.style.left = i * 240 + 14 + "px";
        b.style.width = "168px";
        b.style.transform = `scaleY(${eo(st)})`;
        b.style.transformOrigin = p < 0.5 ? "bottom" : "top";
      }
    } else if (type === "curtain") {
      fxCurtain.style.display = "flex";
      const local = p < 0.5 ? p / 0.5 : (1 - p) / 0.5;
      const panels = fxCurtain.children;
      for (let i = 0; i < panels.length; i++) {
        const st = clamp((local - i * 0.07) / 0.75);
        panels[i].style.transform = `scaleY(${eo(st)})`;
        panels[i].style.transformOrigin = p < 0.5 ? "top" : "bottom";
      }
    } else if (type === "mosaic") {
      fxTiles.style.display = "block";
      const local = p < 0.5 ? p / 0.5 : (1 - p) / 0.5;
      const cols = 14, rows = 8, w = 1920 / cols, h = 1080 / rows;
      for (let i = 0; i < fxTiles.children.length; i++) {
        const t = fxTiles.children[i];
        const cx = i % cols, cy = Math.floor(i / cols);
        const d = (cx + cy) / (cols + rows) * 0.45;
        const st = clamp((local - d) / 0.55);
        t.style.left = cx * w + "px";
        t.style.top = cy * h + "px";
        t.style.width = w + 1 + "px";
        t.style.height = h + 1 + "px";
        t.style.transform = `scale(${eo(st)})`;
      }
    } else if (type === "flash") {
      fxFlash.style.opacity = String(Math.sin(Math.PI * p) * 0.5);
    }
  }

  /* ---------------- per-frame ---------------- */
  function applyReveal(r, lt) {
    const p = clamp((lt - r.at) / r.dur);
    const e = eo(p);
    const n = r.node;
    n.style.opacity = String(clamp(p * 1.35));
    if (r.kind === "clip") {
      n.style.clipPath = `inset(${(1 - e) * 100}% 0 0 0)`;
      n.style.transform = `translate3d(${r.x * (1 - e)}px,0,0)`;
    } else {
      n.style.transform = `translate3d(${r.x * (1 - e)}px,${r.y * (1 - e)}px,0) scale(${lerp(r.s0, 1, eo(p))})`;
    }
  }

  function applyCounter(c, lt) {
    const p = clamp((lt - c.at) / c.dur);
    const v = c.to * eo3(p);
    c.node.textContent = c.prefix + (c.inr ? fmtINR(v) : Math.round(v).toLocaleString("en-IN")) + c.suffix;
  }
  const eo3 = (t) => 1 - Math.pow(1 - t, 3);

  function applyChip(c, lt) {
    const p = clamp((lt - c.at) / 0.55);
    const e = backOut(p);
    c.node.style.opacity = String(clamp(p * 1.6));
    c.node.style.transform = `translate3d(0,${(1 - e) * c.y}px,0) scale(${0.92 + 0.08 * e})`;
  }

  function applyFocus(f, lt) {
    const p = clamp((lt - f.at) / 0.5);
    const q = clamp((lt - f.at - f.hold) / 0.45);
    const e = eo(p);
    f.node.style.opacity = String(clamp(p * 1.5) * (1 - q));
    f.node.style.transform = `scale(${1.14 - 0.14 * e})`;
  }

  function applyCursor(c, lt) {
    const n = c.node;
    const p = clamp((lt - c.at) / c.span);
    if (p <= 0) {
      n.style.opacity = "0";
      c.ripple.style.opacity = "0";
      return;
    }
    if (p >= 1) {
      const b2 = c.path[1];
      n.style.opacity = "1";
      n.style.transform = `translate3d(${b2[0]}px,${b2[1]}px,0) scale(1)`;
      c.ripple.style.opacity = "0";
      return;
    }
    const a = c.path[0], b = c.path[1];
    const e = eio(p);
    const x = lerp(a[0], b[0], e);
    const y = lerp(a[1], b[1], e);
    let s = 1;
    let rip = 0;
    if (c.press >= 0) {
      const dp = (lt - c.press) / 0.22;
      if (dp > 0 && dp < 1) s = 1 - 0.18 * Math.sin(Math.PI * dp);
      const rp = (lt - c.press) / 0.6;
      if (rp > 0 && rp < 1) {
        rip = rp;
        c.ripple.style.left = b[0] - 2 + "px";
        c.ripple.style.top = b[1] - 2 + "px";
      }
    }
    n.style.opacity = "1";
    n.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
    c.ripple.style.opacity = String(rip > 0 ? (1 - rip) * 0.9 : 0);
    c.ripple.style.transform = `scale(${0.4 + rip * 3.4})`;
  }

  function applyScroll(s, lt) {
    const p = clamp((lt - s.at) / s.span);
    const e = eio(p);
    s.node.style.transform = `translate3d(0,${-s.dist * e}px,0)`;
  }

  function applyBars(b, lt) {
    const p = clamp((lt - b.at) / b.dur);
    b.node.style.height = b.h * eo(p) + "px";
  }

  function applyPacket(pk, lt) {
    const p = clamp((lt - pk.at) / pk.span);
    if (p <= 0 || p >= 1) {
      pk.node.style.opacity = "0";
      return;
    }
    pk.node.style.opacity = String(Math.sin(Math.PI * p) * 1.4);
    pk.node.style.left = lerp(pk.from, pk.to, p) + "px";
  }

  function drawScene(sc, lt, si) {
    // ambient
    const g = sc._glow;
    g.style.transform = `translate(-50%,-50%) scale(${1 + Math.sin(lt * 0.14 + si) * 0.06})`;
    sc._grid.style.transform = `translate3d(${(lt * 3) % 72 - 72}px,${(lt * 1.6) % 72 - 72}px,0)`;
    for (const p of sc._parts) {
      const dy = Math.sin(lt * p.spd + p.ph) * p.amp;
      const dx = Math.cos(lt * p.spd * 0.7 + p.ph) * p.amp * 0.6;
      p.node.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      p.node.style.opacity = String(0.35 + 0.45 * (0.5 + 0.5 * Math.sin(lt * 0.6 + p.ph)));
    }
    for (const k of sc._kinetics || []) {
      k.words.forEach((w) => {
        const at = Number(w.parentElement.dataset.at);
        const p = clamp((lt - at) / 0.85);
        w.style.transform = `translate3d(0,${(1 - eo4(p)) * 108}%,0)`;
        w.style.opacity = String(p > 0 ? 1 : 0);
      });
    }
    sc._reveals.forEach((r) => applyReveal(r, lt));
    sc._counters.forEach((c) => applyCounter(c, lt));
    sc._chips.forEach((c) => applyChip(c, lt));
    sc._focus.forEach((f) => applyFocus(f, lt));
    sc._cursors.forEach((c) => applyCursor(c, lt));
    sc._scrolls.forEach((s) => applyScroll(s, lt));
    sc._bars.forEach((b) => applyBars(b, lt));
    sc._packets.forEach((p) => applyPacket(p, lt));

    // generic timed bits
    sc._inner.querySelectorAll("[data-at]").forEach((n) => {
      if (n.classList.contains("sr") || n.classList.contains("chip") || n.classList.contains("cursor")) return;
      if (n.dataset.done) return;
    });

    // light sweep across device
    const sw = sc._inner.querySelector(".sweep");
    if (sw) {
      const p = clamp((lt - 1.9) / 1.5);
      sw.style.opacity = String(Math.sin(Math.PI * p) * 0.85);
      sw.style.left = lerp(-40, 130, p) + "%";
    }

    if (sc._specials === "webhook") {
      const code = sc._inner.querySelectorAll(".wk-code .ln");
      code.forEach((n, i) => {
        const p = clamp((lt - 1.2 - i * 0.12) / 0.4);
        n.style.opacity = String(p);
        n.style.transform = `translateX(${(1 - p) * -10}px)`;
      });
    }
    if (sc._specials === "manifest") {
      const rows = sc._inner.querySelectorAll(".mf-row");
      rows.forEach((n, i) => {
        const p = clamp((lt - 1.1 - i * 0.09) / 0.45);
        n.style.opacity = String(p);
        n.style.transform = `translateX(${(1 - p) * -14}px)`;
      });
    }
    if (sc._specials === "timeline") {
      const steps = sc._inner.querySelectorAll(".mt-step");
      steps.forEach((n, i) => {
        const p = clamp((lt - 1.0 - i * 0.35) / 0.5);
        n.style.opacity = String(p);
        n.style.transform = `translateY(${(1 - p) * 12}px)`;
        const line = n.querySelector(".mt-line i");
        if (line) line.style.height = clamp((lt - 1.25 - i * 0.35) / 0.4) * 100 + "%";
      });
    }
  }

  function render(frame) {
    const t = frame / FPS;
    let idx = 0;
    for (let i = 0; i < timeline.length; i++) if (t >= timeline[i].start) idx = i;
    const cur = scenes[idx];
    const curT = timeline[idx];
    const lt = t - curT.start;

    // reset all
    for (const s of scenes) {
      s._el.classList.remove("on");
      resetScene(s._el);
    }
    cur._el.classList.add("on");
    drawScene(cur, lt, idx);

    // transition from previous scene
    const prevI = idx - 1;
    const type = TRANS[idx % TRANS.length];
    if (prevI >= 0 && lt < 0.72) {
      const prev = scenes[prevI];
      const p = clamp(lt / 0.72);
      prev._el.classList.add("on");
      drawScene(prev, timeline[prevI].dur + lt, prevI);
      sceneT(prev._el, type, p, false);
      sceneT(cur._el, type, p, true);
      overlay(type, p);
    } else {
      overlay("", 0);
    }
    beatStreak(cur, lt);

    // HUD
    hudFill.style.width = (t / totalDur) * 100 + "%";
    hudScene.textContent = String(idx + 1).padStart(2, "0") + " / " + String(scenes.length).padStart(2, "0");
    hudLabel.textContent = cur.label || "";
  }

  let hudFill, hudScene, hudLabel, totalDur = 0;
  function buildHud(meta) {
    const hud = el("div", "hud");
    hud.innerHTML = `
      <div class="hud-top">
        <div class="mark"><img src="assets/logo-mark.png" alt="">BCTLABS</div>
        <div>${meta.hudRight || "BENGALURU, IN / EST. 2013"}</div>
      </div>
      <div class="hud-bottom">
        <div class="hud-scene" id="hud-scene">01 / 11</div>
        <div class="hud-track"><div class="hud-fill" id="hud-fill"></div></div>
        <div class="hud-label" id="hud-label"></div>
      </div>`;
    document.getElementById("stage").appendChild(hud);
    hudFill = document.getElementById("hud-fill");
    hudScene = document.getElementById("hud-scene");
    hudLabel = document.getElementById("hud-label");
  }

  function boot() {
    FPS = window.__TIMING.fps;
    timeline = window.__TIMING.scenes;
    totalDur = window.__TIMING.total;
    const stage = document.getElementById("stage");
    window.__SCENES.forEach((s, i) => {
      s.index = s.index || String(i + 1).padStart(2, "0");
      s._kinetics = [];
      const node = buildScene(s, i);
      scenes.push(s);
      stage.appendChild(node);
    });
    buildFx();
    buildHud(window.__META || {});
    window.__render(0);
    window.__ready = true;
    window.__frames = Math.round(totalDur * FPS);
    window.__fps = FPS;
  }

  window.__render = render;
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
