/* Everloom public website. Local-only: no network, storage or telemetry.
   v6 adds the fly-through intro, structure explorer, press states and click sounds. */
(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- Sound (Web Audio, synthesized locally) ---------------- */
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null, effects = true, music = false, ambientTimer = null, noteIndex = 0, noiseBuf = null;
  const context = () => {
    if (!AudioCtor) return null;
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  };
  const tone = (freq, duration, volume, shape = "sine", delay = 0, glideTo = 0) => {
    const a = context(); if (!a) return;
    const osc = a.createOscillator(), gain = a.createGain(), now = a.currentTime + delay;
    osc.type = shape;
    osc.frequency.setValueAtTime(freq, now);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(a.destination);
    osc.start(now); osc.stop(now + duration + 0.03);
  };
  const whoosh = (volume = 0.05, duration = 0.32) => {
    const a = context(); if (!a) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = a.createBufferSource(), filter = a.createBiquadFilter(), gain = a.createGain(), now = a.currentTime;
    src.buffer = noiseBuf; filter.type = "bandpass"; filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(400, now); filter.frequency.exponentialRampToValueAtTime(2600, now + duration);
    gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(volume, now + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter).connect(gain).connect(a.destination); src.start(now); src.stop(now + duration);
  };
  const sfx = {
    primary: () => { tone(660, 0.14, 0.05, "sine"); tone(990, 0.22, 0.04, "sine", 0.06); },
    button: () => { tone(420, 0.09, 0.05, "triangle", 0, 300); },
    link: () => { tone(1250, 0.05, 0.025, "sine"); },
    toggle: () => whoosh(0.045, 0.28),
    success: () => { [523.25, 659.25, 783.99].forEach((f, i) => tone(f, 0.26, 0.04, "sine", i * 0.07)); },
    deny: () => { tone(240, 0.18, 0.05, "triangle", 0, 150); },
    conflict: () => { tone(440, 0.12, 0.035, "square"); tone(466, 0.12, 0.03, "square", 0.05); },
    reveal: () => { whoosh(0.06, 0.7); [392, 587.33, 783.99, 1174.66].forEach((f, i) => tone(f, 0.6, 0.03, "sine", 0.1 + i * 0.09)); },
    node: () => { tone(880, 0.08, 0.03, "sine"); tone(1320, 0.16, 0.025, "sine", 0.04); }
  };
  const play = (name) => { if (effects && sfx[name]) { try { sfx[name](); } catch (e) { /* audio is optional */ } } };
  const buzz = () => { if (effects && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) { /* optional */ } } };

  const fxButton = byId("sound-toggle"), fxLabel = byId("sound-label");
  const musicButton = byId("music-toggle"), musicLabel = byId("music-label");
  fxButton.addEventListener("click", () => {
    effects = !effects;
    fxButton.setAttribute("aria-pressed", String(effects));
    if (effects) sfx.success();
  });
  const playAmbient = () => {
    if (!music || document.hidden) return;
    const notes = [196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63];
    const a = context(); if (!a) return;
    const f = notes[noteIndex++ % notes.length], osc = a.createOscillator(), gain = a.createGain(), now = a.currentTime;
    osc.frequency.setValueAtTime(f, now);
    gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(0.011, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);
    osc.connect(gain).connect(a.destination); osc.start(now); osc.stop(now + 2.35);
  };
  const stopAmbient = () => { if (ambientTimer !== null) clearInterval(ambientTimer); ambientTimer = null; };
  const startAmbient = () => { stopAmbient(); playAmbient(); ambientTimer = setInterval(playAmbient, 2600); };
  musicButton.addEventListener("click", () => {
    if (!AudioCtor) { musicLabel.textContent = "Music unavailable"; musicButton.disabled = true; return; }
    music = !music;
    musicButton.setAttribute("aria-pressed", String(music));
    music ? startAmbient() : stopAmbient();
  });
  document.addEventListener("visibilitychange", () => { if (music) { document.hidden ? stopAmbient() : startAmbient(); } });
  window.addEventListener("pagehide", stopAmbient);
  if (!AudioCtor) { fxButton.disabled = true; fxLabel.textContent = "Sounds unavailable"; effects = false; }

  /* ---------------- Press states, ripples and click sounds ---------------- */
  const PRESSABLE = ".btn, button, summary, .nav-links a, .partner-links a, .footer a, .text-link, .visual-tile, .workflow-art a, .to-top, .brand";
  const RIPPLE = ".btn, .demo-toolbar button, .audio-controls button, .menu-toggle, .step, .intro-skip, .to-top, .partner-links a";
  const soundFor = (el) => {
    if (el.matches("#sound-toggle, #music-toggle, .explorer .step, #remember, #handoff, #deny, #conflict, #restore, #intro-skip")) return null; // these choose their own sound
    if (el.matches("summary, .menu-toggle")) return "toggle";
    if (el.matches(".primary")) return "primary";
    if (el.matches("button, .btn, .to-top")) return "button";
    return "link";
  };
  document.addEventListener("pointerdown", (ev) => {
    const el = ev.target.closest(PRESSABLE);
    if (!el || el.disabled) return;
    if (!reduceMotion && el.matches(RIPPLE)) {
      const r = el.getBoundingClientRect(), dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.left = (ev.clientX - r.left) + "px";
      dot.style.top = (ev.clientY - r.top) + "px";
      dot.style.setProperty("--rs", String(Math.ceil(Math.hypot(r.width, r.height) / 5)));
      el.append(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    }
    buzz();
  }, { passive: true });
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest(PRESSABLE);
    if (!el || el.disabled) return;
    const s = soundFor(el); if (s) play(s);
  });
  // Keyboard users get the same visible press state.
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const el = ev.target.closest && ev.target.closest(PRESSABLE);
    if (el) el.classList.add("is-pressed");
  });
  document.addEventListener("keyup", () => {
    document.querySelectorAll(".is-pressed").forEach((n) => n.classList.remove("is-pressed"));
  });

  /* ---------------- Navigation ---------------- */
  const menu = document.querySelector(".menu-toggle");
  const nav = byId("nav-links");
  const setMenu = (open) => { menu.setAttribute("aria-expanded", String(open)); nav.classList.toggle("open", open); };
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menu.focus(); } });
  document.addEventListener("click", (ev) => { if (nav.classList.contains("open") && !ev.target.closest(".nav")) setMenu(false); });

  // Scroll progress, sticky header state, back-to-top, scroll-spy.
  const bar = byId("scroll-progress");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight, y = scrollY;
    bar.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : "0");
    root.classList.toggle("scrolled", y > 24);
    root.classList.toggle("scrolled-far", y > innerHeight * 1.2);
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  const navMap = new Map();
  nav.querySelectorAll('a[href^="#"]').forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) navMap.set(s, a); });
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { navMap.forEach((a) => a.removeAttribute("aria-current")); navMap.get(e.target).setAttribute("aria-current", "true"); } });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navMap.forEach((_, s) => spy.observe(s));
  }

  /* ---------------- Scroll reveals and card spotlight ---------------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".section-heading, .tile, .arch-node, .arch-arrow, .boundary, .security-list > div, .roadmap li, .partner-links > *, .demo-shell, .table-scroll, .code-panel, .explorer, .faq-section details, .endnote-grid > *, .integration-note, .visual-tile, .trust-grid span");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach((el) => {
      const sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(sibs, 5) * 0.08 + "s");
      el.classList.add("rv"); io.observe(el);
    });
  }
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".tile, .arch-node").forEach((card) => {
      card.addEventListener("pointermove", (ev) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ev.clientX - r.left + "px");
        card.style.setProperty("--my", ev.clientY - r.top + "px");
      });
    });
    const art = document.querySelector(".workflow-art img");
    if (art) {
      art.addEventListener("pointermove", (ev) => {
        const r = art.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        art.style.setProperty("--ry", (x * 8).toFixed(2) + "deg"); art.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
      });
      art.addEventListener("pointerleave", () => { art.style.setProperty("--ry", "0deg"); art.style.setProperty("--rx", "0deg"); });
    }
  }

  /* ---------------- The loom: camera + intro fly-through ---------------- */
  const NODES = {
    all: { box: [-120, -10, 1840, 1020], step: "EVERLOOM · MEMORY NEXUS", title: "A memory that never ends.", line: "And always answers to its owner.",
      head: "The whole loom", text: "Six stages orbit a single owner. The private vault sits inside the boundary and never takes an ordinary cloud route.", state: "Concept · design intent, not a production certification" },
    capture: { box: [30, 130, 600, 440], step: "01 · CAPTURE", title: "Every fact keeps its source.", line: "Time, confidence and purpose travel with it.",
      head: "01 · Capture with context", text: "A memory is recorded with where it came from, when, how sure we are and why it was kept, so guesses never quietly become history.", state: "Prototype: local SQLite records with provenance" },
    verify: { box: [500, 0, 600, 440], step: "02 · VERIFY", title: "Nothing crosses unchecked.", line: "An identity gate verifies every grant server-side.",
      head: "02 · Verify at the gate", text: "Agents never vouch for themselves. Owner and classification are bound by the server, and a mismatch is denied by default.", state: "Design principle · production identity tests pending" },
    remember: { box: [970, 130, 600, 440], step: "03 · REMEMBER", title: "Your device is home.", line: "Local SQLite: full-text recall, scopes, audit.",
      head: "03 · Remember locally", text: "The owner's device is the centre of gravity: offline search, per-agent scopes and an audit trail of every action.", state: "Prototype exists · historical tests pass" },
    retrieve: { box: [970, 530, 600, 440], step: "04 · RETRIEVE", title: "The cloud is a guarded annexe.", line: "Private PostgreSQL with row-level security, deny by default.",
      head: "04 · Retrieve through the boundary", text: "Non-vault records may sync to a private database with forced row-level security. Nothing is public, and nothing syncs without a verified grant.", state: "Deployed foundation · end-to-end sync not yet approved" },
    continue: { box: [500, 660, 600, 440], step: "05 · CONTINUE", title: "Pick up where you left off.", line: "Checkpoints and handoffs carry context forward.",
      head: "05 · Continue across sessions", text: "Session checkpoints and portable handoffs let work resume without starting from zero, whichever tool picks it up next.", state: "Prototype session hooks · in development" },
    agents: { box: [30, 530, 600, 440], step: "06 · AGENTS", title: "Many agents. One memory.", line: "Each sees only the smallest useful context.",
      head: "06 · Share with agents", text: "Planned agent interfaces receive scoped, expiring grants and nothing more. The vault is never part of a routine handoff.", state: "Planned · adapters remain unverified" }
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const makeCamera = (svg) => {
    let cur = svg.getAttribute("viewBox").split(/\s+/).map(Number), raf = 0;
    return {
      to(box, ms) {
        cancelAnimationFrame(raf);
        if (reduceMotion || ms <= 0) { cur = box.slice(); svg.setAttribute("viewBox", cur.join(" ")); return; }
        const from = cur.slice(), t0 = performance.now();
        const step = (now) => {
          const k = ease(Math.min(1, (now - t0) / ms));
          cur = from.map((v, i) => v + (box[i] - v) * k);
          svg.setAttribute("viewBox", cur.map((v) => v.toFixed(1)).join(" "));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
    };
  };
  const light = (svg, key) => svg.querySelectorAll(".node").forEach((n) => n.classList.toggle("lit", key !== "all" && n.dataset.node === key));
  const loom = byId("loom");
  // Starfield, generated once so the HTML stays light.
  const stars = byId("loom-stars");
  for (let i = 0; i < 90; i++) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", String(-400 + Math.random() * 2400)); c.setAttribute("cy", String(-250 + Math.random() * 1500));
    c.setAttribute("r", (Math.random() * 1.8 + 0.4).toFixed(2)); c.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    stars.append(c);
  }

  // Explorer: a live clone of the loom inside the page (fallback image stays if JS is off).
  const stage = byId("explorer-stage");
  const clone = loom.cloneNode(true);
  clone.removeAttribute("id");
  // Give every cloned id a suffix so ids stay unique and gradients/paths still resolve.
  clone.querySelectorAll("[id]").forEach((n) => { n.id = n.id + "-x"; });
  clone.querySelectorAll("[fill^='url(#'], [stroke^='url(#']").forEach((n) => {
    ["fill", "stroke"].forEach((a) => { const v = n.getAttribute(a); if (v && v.startsWith("url(#")) n.setAttribute(a, v.replace(/\)$/, "-x)")); });
  });
  clone.querySelectorAll("mpath").forEach((m) => m.setAttribute("href", m.getAttribute("href") + "-x"));
  clone.setAttribute("viewBox", NODES.all.box.join(" "));
  clone.setAttribute("role", "img");
  clone.setAttribute("aria-label", "Everloom structure: an owner core surrounded by capture, verify, remember, retrieve, continue and agent stages, with a private vault kept local");
  clone.querySelectorAll(".node, .threads path").forEach((n) => { n.style.animation = "none"; n.style.opacity = "1"; n.style.strokeDashoffset = "0"; });
  stage.replaceChildren(clone);
  if (reduceMotion && clone.pauseAnimations) clone.pauseAnimations();
  const exCam = makeCamera(clone);
  const steps = document.querySelectorAll(".explorer .step");
  const exCopy = byId("explorer-copy");
  const selectNode = (key, withSound) => {
    const n = NODES[key] || NODES.all;
    exCam.to(n.box, 900); light(clone, key);
    steps.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.node === key)));
    byId("explorer-title").textContent = n.head; byId("explorer-text").textContent = n.text; byId("explorer-state").textContent = n.state;
    exCopy.classList.remove("swap"); void exCopy.offsetWidth; exCopy.classList.add("swap");
    if (withSound) play(key === "all" ? "toggle" : "node");
  };
  steps.forEach((b) => b.addEventListener("click", () => selectNode(b.dataset.node, true)));
  clone.querySelectorAll(".node").forEach((g) => g.addEventListener("click", () => selectNode(g.dataset.node, true)));

  // Intro fly-through.
  const intro = byId("intro"), replay = byId("replay-intro");
  const cam = makeCamera(loom);
  const cap = byId("intro-caption"), prog = byId("intro-progress");
  const SEQ = ["capture", "verify", "remember", "retrieve", "continue", "agents"];
  let timers = [], running = false;
  const caption = (n) => {
    byId("intro-step").textContent = n.step; byId("intro-title").textContent = n.title; byId("intro-line").textContent = n.line;
    cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap");
  };
  const endIntro = (withSound) => {
    if (!running) return;
    running = false; timers.forEach(clearTimeout); timers = [];
    if (withSound) play("reveal");
    cam.to([700, 400, 200, 200], 700);
    intro.classList.add("leaving");
    setTimeout(() => {
      root.classList.remove("intro-on"); intro.classList.remove("leaving");
      if (loom.pauseAnimations) loom.pauseAnimations();
      replay.hidden = false;
    }, 760);
    removeListeners();
  };
  const skipKeys = (ev) => { if (["Escape", "Enter", " ", "ArrowDown", "PageDown", "Tab"].includes(ev.key)) { ev.preventDefault(); endIntro(true); } };
  const skipWheel = () => endIntro(false);
  const removeListeners = () => { removeEventListener("keydown", skipKeys, true); removeEventListener("wheel", skipWheel); removeEventListener("touchmove", skipWheel); };
  const startIntro = () => {
    running = true; root.classList.add("intro-on"); intro.style.animation = "none"; void intro.offsetWidth; intro.style.animation = "";
    if (loom.unpauseAnimations) loom.unpauseAnimations();
    loom.setAttribute("viewBox", "-400 -250 2400 1500"); light(loom, "all"); caption(NODES.all);
    const HOLD = 1050, total = 900 + SEQ.length * HOLD + 1500;
    prog.style.transition = "none"; prog.style.width = "0"; void prog.offsetWidth;
    prog.style.transition = "width " + total + "ms linear"; prog.style.width = "100%";
    let t = 900;
    SEQ.forEach((key) => {
      timers.push(setTimeout(() => { cam.to(NODES[key].box, 760); light(loom, key); caption(NODES[key]); }, t));
      t += HOLD;
    });
    timers.push(setTimeout(() => { cam.to(NODES.all.box, 900); light(loom, "all"); caption(NODES.all); }, t));
    timers.push(setTimeout(() => endIntro(false), t + 1500));
    addEventListener("keydown", skipKeys, true); addEventListener("wheel", skipWheel, { passive: true }); addEventListener("touchmove", skipWheel, { passive: true });
  };
  byId("intro-skip").addEventListener("click", () => endIntro(true));
  intro.addEventListener("click", (ev) => { if (!ev.target.closest("#intro-skip")) endIntro(true); });
  replay.addEventListener("click", () => { scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); startIntro(); });
  if (root.classList.contains("intro-on")) startIntro(); else { replay.hidden = reduceMotion; if (loom.pauseAnimations) loom.pauseAnimations(); }

  /* ---------------- Code copy ---------------- */
  const code = document.querySelector(".code-panel pre");
  if (code && navigator.clipboard) {
    const copy = document.createElement("button");
    copy.type = "button"; copy.className = "btn ghost copy-code"; copy.textContent = "Copy contract";
    copy.addEventListener("click", () => {
      navigator.clipboard.writeText(code.textContent).then(() => { copy.textContent = "Copied ✓"; play("success"); setTimeout(() => { copy.textContent = "Copy contract"; }, 1600); }, () => { copy.textContent = "Copy unavailable"; });
    });
    code.after(copy);
  }

  /* ---------------- Synthetic memory demo ---------------- */
  // Invented facts only. The data lives in volatile JS memory and dies on refresh.
  const seed = [
    { id: 1, text: "The teal lighthouse marks the fictional island's northern shore.", source: "Synthetic fixture A", version: 1 },
    { id: 2, text: "In the demo garden, the moonflower opens after sunset.", source: "Synthetic fixture B", version: 1 }
  ];
  let rows = seed.map((r) => ({ ...r }));
  let nextId = 3, freshId = 0;
  const status = (message, kind) => {
    const ev = byId("event"); ev.textContent = message; ev.dataset.kind = kind || "";
    ev.classList.remove("flash"); void ev.offsetWidth; ev.classList.add("flash");
  };
  const render = () => {
    const q = byId("filter").value.trim().toLocaleLowerCase();
    const subset = rows.filter((r) => r.text.toLocaleLowerCase().includes(q));
    const list = byId("records");
    list.replaceChildren();
    subset.forEach((r) => {
      const li = document.createElement("li");
      if (r.id === freshId) li.className = "new";
      const content = document.createElement("span");
      content.textContent = r.text;
      const source = document.createElement("small");
      source.textContent = r.source + " · version " + r.version + " · owner A";
      li.append(content, source);
      list.append(li);
    });
    if (!subset.length) {
      const li = document.createElement("li");
      li.textContent = "No matching demo records.";
      list.append(li);
    }
    const count = byId("count");
    count.textContent = rows.length + " synthetic record" + (rows.length === 1 ? "" : "s");
    count.classList.remove("bump"); void count.offsetWidth; count.classList.add("bump");
  };
  const remember = () => {
    const input = byId("fact");
    const value = input.value.trim();
    if (value.length < 3) { status("Enter a harmless example with at least 3 characters.", "deny"); play("deny"); input.focus(); return; }
    if (rows.length >= 15) { status("Demo limit: 15 records. Restore the sample to restart.", "deny"); play("deny"); return; }
    freshId = nextId;
    rows.push({ id: nextId++, text: value, source: "User input in this tab only", version: 1 });
    input.value = "";
    byId("filter").value = "";
    render();
    status("Recorded locally in volatile browser memory; nothing was transmitted.", "allow");
    play("success");
  };
  byId("remember").addEventListener("click", remember);
  byId("fact").addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); remember(); } });
  byId("filter").addEventListener("input", () => { freshId = 0; render(); });
  byId("handoff").addEventListener("click", () => {
    status("ALLOW (simulation): owner A grants an invented agent access to " + rows.length + " general example record(s). No data sent.", "allow");
    play("success");
  });
  byId("deny").addEventListener("click", () => {
    status("DENY (simulation): owner B cannot read, enumerate or modify owner A's example records.", "deny");
    play("deny");
  });
  byId("conflict").addEventListener("click", () => {
    status("CONFLICT (simulation): two editors changed the same record. Both versions are retained for review; no silent overwrite.", "");
    play("conflict");
  });
  byId("restore").addEventListener("click", () => {
    rows = seed.map((r) => ({ ...r }));
    nextId = 3; freshId = 0;
    byId("filter").value = "";
    byId("fact").value = "";
    render();
    status("RESTORED (simulation): integrity-checked seed snapshot loaded in this tab. This is not a production backup drill.", "allow");
    play("toggle");
  });

  render();
})();
