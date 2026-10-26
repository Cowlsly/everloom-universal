/* Everloom public website. Local-only: no network requests, no cookies, no analytics.
   Sound is synthesised in the browser with the Web Audio API and stays off until a visitor taps.
   Sound and motion choices live in sessionStorage only and clear when the tab closes. */
(() => {
  "use strict";
  const doc = document, root = doc.documentElement;
  const byId = (id) => doc.getElementById(id);
  const $ = (sel, scope) => (scope || doc).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || doc).querySelectorAll(sel));
  const page = (doc.body && doc.body.dataset.page) || "other";
  const onHome = page === "home";
  const reducedQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const osReduced = !!(reducedQuery && reducedQuery.matches) || !!(navigator.connection && navigator.connection.saveData);
  root.classList.add("ready");

  /* ---------- Session preferences (sessionStorage only) ---------- */
  const defaults = { vol: 0.6, muted: false, calm: false, haptics: true, keys: true };
  let prefs = Object.assign({}, defaults);
  try { prefs = Object.assign(prefs, JSON.parse(sessionStorage.getItem("everloom.prefs") || "{}")); } catch (e) { /* storage may be blocked */ }
  const savePrefs = () => { try { sessionStorage.setItem("everloom.prefs", JSON.stringify(prefs)); } catch (e) { /* ignore */ } };
  const isCalm = () => osReduced || prefs.calm;
  const applyCalm = () => root.classList.toggle("calm", isCalm());
  applyCalm();

  /* ---------- Navigation menu (small screens) ---------- */
  const menu = $(".menu-toggle");
  const nav = byId("nav-links");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
      fx(open ? "open" : "close");
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- Web Audio: effects and ambient music ---------- */
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, sfxBus = null, musicBus = null, effects = false, musicOn = false;
  let lastClick = 0;
  const live = new Set();

  function ensure() {
    if (!AudioCtor) return false;
    if (ctx) return true;
    try {
      ctx = new AudioCtor();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 6; comp.attack.value = 0.01; comp.release.value = 0.25;
      master = ctx.createGain();
      master.gain.value = 0.0001;
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55;
      musicBus = ctx.createGain(); musicBus.gain.value = 0.0001;
      sfxBus.connect(master); musicBus.connect(master); master.connect(comp); comp.connect(ctx.destination);
      applyMaster(true);
      return true;
    } catch (e) { ctx = null; return false; }
  }
  function masterTarget() { return prefs.muted ? 0.0001 : Math.max(0.0001, Math.pow(prefs.vol, 1.6) * 0.9); }
  function applyMaster(instant) {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    if (instant) master.gain.setValueAtTime(masterTarget(), t); else master.gain.setTargetAtTime(masterTarget(), t, 0.04);
  }
  function wake() { if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {}); }

  function blip(freq, start, dur, vol, type, bend) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (bend) osc.frequency.exponentialRampToValueAtTime(bend, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g); g.connect(sfxBus);
    osc.start(start); osc.stop(start + dur + 0.03);
  }
  const SFX = {
    click: (t) => { blip(540, t, 0.07, 0.2, "triangle", 420); blip(1080, t, 0.04, 0.05, "sine"); },
    on: (t) => { blip(440, t, 0.12, 0.2, "triangle"); blip(660, t + 0.07, 0.16, 0.2, "triangle"); },
    off: (t) => { blip(660, t, 0.12, 0.18, "triangle"); blip(440, t + 0.07, 0.16, 0.18, "triangle"); },
    open: (t) => { blip(392, t, 0.14, 0.16, "sine"); blip(523, t + 0.07, 0.14, 0.16, "sine"); blip(659, t + 0.14, 0.2, 0.16, "sine"); },
    close: (t) => { blip(659, t, 0.12, 0.14, "sine"); blip(523, t + 0.07, 0.12, 0.14, "sine"); blip(392, t + 0.14, 0.2, 0.14, "sine"); },
    success: (t) => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, t + i * 0.08, 0.38, 0.17, "sine")); }
  };
  function fx(name, force) {
    if (!force && !effects) return;
    if (!ctx || !SFX[name]) return;
    const now = performance.now();
    if (name === "click" && now - lastClick < 45) return;
    if (name === "click") lastClick = now;
    wake();
    SFX[name](ctx.currentTime + 0.005);
  }

  /* Ambient music: slow pads over a four chord loop in D major plus a gentle, sparse arpeggio. */
  const ROOT = 146.83;
  const hz = (n) => ROOT * Math.pow(2, n / 12);
  const CHORDS = [
    { bass: -12, pad: [0, 7, 11, 14], arp: [12, 14, 16, 19, 23, 26] },
    { bass: -15, pad: [-3, 4, 7, 12], arp: [12, 16, 19, 21, 24, 28] },
    { bass: -19, pad: [5, 9, 12, 16], arp: [12, 14, 17, 21, 24, 26] },
    { bass: -5, pad: [7, 11, 14, 16], arp: [11, 14, 16, 19, 23, 26] }
  ];
  const CHORD_LEN = 8, ARP_STEP = 0.75;
  const music = { timer: null, start: 0, nextChord: 0, chordIdx: 0, nextArp: 0, seed: 11, padFilter: null, delay: null, lfo: null };
  const rnd = () => { music.seed = (music.seed * 16807) % 2147483647; return music.seed / 2147483647; };

  function track(node) { live.add(node); node.onended = () => live.delete(node); return node; }
  function playChord(c, t) {
    const dur = CHORD_LEN + 3;
    const voices = c.pad.map((n) => [n, 0.034]).concat([[c.bass, 0.05]]);
    voices.forEach(([n, v]) => {
      [-5, 5].forEach((cents) => {
        const o = track(ctx.createOscillator()), g = ctx.createGain();
        o.type = n === c.bass ? "sine" : "triangle";
        o.frequency.value = hz(n); o.detune.value = cents;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(v, t + 3);
        g.gain.setValueAtTime(v, t + CHORD_LEN - 0.5);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(music.padFilter);
        o.start(t); o.stop(t + dur + 0.1);
      });
    });
  }
  function playArp(t) {
    const idx = Math.floor((t - music.start) / CHORD_LEN) % CHORDS.length;
    if (rnd() < 0.3) return;
    const notes = CHORDS[idx].arp;
    const n = notes[Math.floor(rnd() * notes.length)];
    const o = track(ctx.createOscillator()), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = hz(n);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(g); g.connect(music.delay); g.connect(musicBus);
    o.start(t); o.stop(t + 2.3);
  }
  function schedule() {
    if (!ctx || !musicOn || ctx.state !== "running") return;
    const horizon = ctx.currentTime + 4;
    while (music.nextChord < horizon) { playChord(CHORDS[music.chordIdx % CHORDS.length], music.nextChord); music.chordIdx++; music.nextChord += CHORD_LEN; }
    while (music.nextArp < horizon) { playArp(music.nextArp); music.nextArp += ARP_STEP; }
  }
  function buildMusicGraph() {
    music.padFilter = ctx.createBiquadFilter();
    music.padFilter.type = "lowpass"; music.padFilter.frequency.value = 900; music.padFilter.Q.value = 0.5;
    music.padFilter.connect(musicBus);
    music.lfo = track(ctx.createOscillator());
    const lg = ctx.createGain();
    music.lfo.frequency.value = 0.06; lg.gain.value = 280;
    music.lfo.connect(lg); lg.connect(music.padFilter.frequency); music.lfo.start();
    music.delay = ctx.createDelay(1.5); music.delay.delayTime.value = 0.45;
    const fb = ctx.createGain(); fb.gain.value = 0.35;
    const dl = ctx.createBiquadFilter(); dl.type = "lowpass"; dl.frequency.value = 2200;
    const wet = ctx.createGain(); wet.gain.value = 0.6;
    music.delay.connect(dl); dl.connect(fb); fb.connect(music.delay); dl.connect(wet); wet.connect(musicBus);
  }
  function startMusic() {
    if (!ensure()) return false;
    wake();
    if (!music.padFilter) buildMusicGraph();
    const t = ctx.currentTime;
    musicOn = true;
    music.start = t + 0.1; music.nextChord = music.start; music.nextArp = music.start + 0.5; music.chordIdx = 0;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), t);
    musicBus.gain.linearRampToValueAtTime(0.5, t + 3);
    schedule();
    music.timer = setInterval(schedule, 400);
    return true;
  }
  function stopMusic() {
    musicOn = false;
    if (music.timer) { clearInterval(music.timer); music.timer = null; }
    if (!ctx) return;
    const t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), t);
    musicBus.gain.linearRampToValueAtTime(0.0001, t + 1.5);
    setTimeout(() => {
      if (musicOn) return;
      live.forEach((n) => { if (n !== music.lfo) { try { n.stop(); } catch (e) { /* already stopped */ } } });
    }, 1700);
  }

  function setEffects(on) {
    if (on) {
      if (!ensure()) { sync(); return; }
      wake(); effects = true; fx("on");
    } else { fx("off"); effects = false; }
    sync();
  }
  function setMusic(on) {
    if (on) { if (!startMusic()) { sync(); return; } fx("on"); } else { fx("off"); stopMusic(); }
    sync();
  }
  function setMuted(m) {
    prefs.muted = m; savePrefs();
    if (!m && !ctx && (effects || musicOn)) ensure();
    applyMaster(false); sync();
  }
  doc.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (doc.hidden) {
      if (musicOn) { const t = ctx.currentTime; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), t); musicBus.gain.linearRampToValueAtTime(0.0001, t + 0.3); }
      setTimeout(() => { if (doc.hidden && ctx.state === "running") ctx.suspend().catch(() => {}); }, 400);
      tourStop();
    } else if (effects || musicOn) {
      ctx.resume().then(() => {
        if (musicOn) { const t = ctx.currentTime; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(0.0001, t); musicBus.gain.linearRampToValueAtTime(0.5, t + 2); schedule(); }
      }).catch(() => {});
    }
  });
  window.addEventListener("pagehide", () => { if (music.timer) clearInterval(music.timer); });

  /* ---------- Header controls and shared state ---------- */
  const fxBtn = byId("sound-toggle"), musicBtn = byId("music-toggle");
  const muteBtn = $('[data-act="mute"]');
  function sync() {
    if (fxBtn) { fxBtn.setAttribute("aria-pressed", String(effects)); fxBtn.textContent = effects ? "♫ Effects on" : "♫ Effects off"; }
    if (musicBtn) { musicBtn.setAttribute("aria-pressed", String(musicOn)); musicBtn.textContent = musicOn ? "♪ Music on" : "♪ Music off"; }
    if (muteBtn) { muteBtn.setAttribute("aria-pressed", String(prefs.muted)); muteBtn.textContent = prefs.muted ? "Unmute" : "Mute"; }
    const set = (k, v) => { const s = $('[data-sw="' + k + '"]'); if (s) s.setAttribute("aria-checked", String(v)); };
    set("fx", effects); set("music", musicOn); set("mute", prefs.muted); set("haptics", prefs.haptics); set("calm", isCalm()); set("keys", prefs.keys);
    const out = $("#vol-out"), vol = $("#vol");
    if (out) out.textContent = Math.round(prefs.vol * 100) + "%";
    if (vol) vol.value = String(Math.round(prefs.vol * 100));
  }
  if (!AudioCtor) {
    [fxBtn, musicBtn, muteBtn].forEach((b) => { if (b) { b.disabled = true; b.title = "Audio is not supported in this browser"; } });
    if (fxBtn) fxBtn.textContent = "♫ Effects unavailable";
    if (musicBtn) musicBtn.textContent = "♪ Music unavailable";
  } else {
    if (fxBtn) fxBtn.addEventListener("click", () => setEffects(!effects));
    if (musicBtn) musicBtn.addEventListener("click", () => setMusic(!musicOn));
    if (muteBtn) muteBtn.addEventListener("click", () => setMuted(!prefs.muted));
  }

  /* ---------- Pressed states, haptics and click sound ---------- */
  const PRESS = "button, .btn, summary, [role=tab], .text-link";
  let pressed = null;
  const unpress = () => { if (pressed) { const el = pressed; pressed = null; setTimeout(() => el.classList.remove("is-pressed"), 90); } };
  doc.addEventListener("pointerdown", (e) => {
    const el = e.target.closest ? e.target.closest(PRESS) : null;
    if (!el || el.disabled) return;
    el.classList.add("is-pressed"); pressed = el;
    if (prefs.haptics && !isCalm() && navigator.vibrate && e.pointerType === "touch") { try { navigator.vibrate(8); } catch (x) { /* unsupported */ } }
  }, true);
  ["pointerup", "pointercancel", "pointerleave", "dragend"].forEach((n) => doc.addEventListener(n, unpress, true));
  doc.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target.closest ? e.target.closest("button, .btn, summary") : null;
    if (el) { el.classList.add("is-pressed"); pressed = el; }
  }, true);
  doc.addEventListener("keyup", unpress, true);
  doc.addEventListener("click", (e) => {
    const el = e.target.closest ? e.target.closest("button, a.btn, [role=tab]") : null;
    if (!el || el.dataset.sfx === "none" || el.closest("summary")) return;
    fx("click");
  });
  doc.addEventListener("toggle", (e) => {
    const d = e.target;
    if (d && d.tagName === "DETAILS") fx(d.open ? "open" : "close");
  }, true);

  /* ---------- Tabs ---------- */
  function setupTabs(list, onSelect) {
    const tabs = $$('[role="tab"]', list);
    const panelOf = (t) => byId(t.getAttribute("aria-controls"));
    function select(i, userMade) {
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const p = panelOf(t);
        if (p) p.hidden = !on;
      });
      if (onSelect) onSelect(i, userMade);
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => { select(i, true); });
      t.addEventListener("keydown", (e) => {
        let n = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabs.length - 1;
        if (n < 0) return;
        e.preventDefault(); select(n, true); tabs[n].focus(); fx("click");
      });
    });
    return { select, count: tabs.length };
  }

  /* Lifecycle explorer and tour */
  let tourTimer = null, lcApi = null, lcIndex = 0;
  const tourBtn = $("[data-tour]");
  function tourStop() {
    if (tourTimer) { clearInterval(tourTimer); tourTimer = null; }
    if (tourBtn) { tourBtn.setAttribute("aria-pressed", "false"); tourBtn.textContent = "Play the tour"; }
  }
  function lcShow(i) {
    lcIndex = i;
    const track = $(".lc-track");
    if (track) track.style.setProperty("--p", String(i / 4));
    $$("#lc-rec li").forEach((li, k) => {
      li.dataset.state = k < i ? "done" : k === i ? "now" : "todo";
      li.lastElementChild.textContent = k < i ? "Done" : k === i ? "Now" : "Next";
    });
  }
  const lcList = $(".lc-track");
  if (lcList) {
    lcApi = setupTabs(lcList, (i, user) => { lcShow(i); if (user) tourStop(); });
    lcShow(0);
    $$("[data-lc]").forEach((b) => b.addEventListener("click", () => {
      tourStop();
      const n = b.dataset.lc === "next" ? (lcIndex + 1) % lcApi.count : (lcIndex - 1 + lcApi.count) % lcApi.count;
      lcApi.select(n, false);
    }));
    if (tourBtn) tourBtn.addEventListener("click", () => {
      if (tourTimer) { tourStop(); return; }
      if (isCalm()) return;
      tourBtn.setAttribute("aria-pressed", "true"); tourBtn.textContent = "Pause the tour";
      tourTimer = setInterval(() => { lcApi.select((lcIndex + 1) % lcApi.count, false); fx("click"); }, 4500);
    });
  }
  $$(".about-tabs [role=tablist]").forEach((l) => setupTabs(l));

  /* Architecture and future expanders */
  function setNode(btn, open) {
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Hide detail" : "More detail";
    const p = byId(btn.getAttribute("aria-controls"));
    if (p) p.hidden = !open;
  }
  const nodeBtns = $$(".node-toggle");
  nodeBtns.forEach((b) => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    setNode(b, open); fx(open ? "open" : "close");
    syncAll();
  }));
  const archAll = byId("arch-all");
  function syncAll() { if (archAll) { const all = nodeBtns.every((b) => b.getAttribute("aria-expanded") === "true"); archAll.setAttribute("aria-pressed", String(all)); archAll.textContent = all ? "Collapse all details" : "Expand all details"; } }
  if (archAll) archAll.addEventListener("click", () => {
    const open = archAll.getAttribute("aria-pressed") !== "true";
    nodeBtns.forEach((b) => setNode(b, open)); syncAll(); fx(open ? "open" : "close");
  });
  const futureAll = byId("future-all");
  if (futureAll) futureAll.addEventListener("click", () => {
    const open = futureAll.getAttribute("aria-pressed") !== "true";
    $$(".phases details").forEach((d) => { d.open = open; });
    futureAll.setAttribute("aria-pressed", String(open));
    futureAll.textContent = open ? "Collapse all phases" : "Expand all phases";
  });

  /* ---------- Progress bar, back to top, reveal, active section ---------- */
  const bar = doc.createElement("div");
  bar.id = "progress"; bar.setAttribute("aria-hidden", "true");
  const barFill = doc.createElement("i"); bar.append(barFill); doc.body.prepend(bar);
  const topBtn = doc.createElement("button");
  topBtn.type = "button"; topBtn.className = "to-top"; topBtn.setAttribute("aria-label", "Back to top"); topBtn.textContent = "↑";
  topBtn.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: isCalm() ? "auto" : "smooth" }); });
  doc.body.append(topBtn);
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - window.innerHeight;
      barFill.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ")";
      topBtn.classList.toggle("show", window.scrollY > 700);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  const revealSel = ".section-heading,.tile,.arch-node,.boundary,.security-list>div,.roadmap li,.ack-card,.built-list li,.phases details,.partner-links>*,.demo-shell,.code-panel,.gallery-card,.integration-note,.tabs,.rec,.faq-section details";
  const revealEls = $$(revealSel).filter((el) => !el.closest("[hidden]"));
  revealEls.forEach((el) => el.setAttribute("data-reveal", ""));
  if ("IntersectionObserver" in window && !isCalm()) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else { revealEls.forEach((el) => el.classList.add("in")); }
  if (isCalm()) revealEls.forEach((el) => el.classList.add("in"));

  if (onHome && nav && "IntersectionObserver" in window) {
    const links = $$('a[href^="#"]', nav);
    const map = new Map();
    links.forEach((a) => { const s = byId(a.getAttribute("href").slice(1)); if (s) map.set(s, a); });
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const a = map.get(en.target); if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((a, s) => so.observe(s));
  }

  /* Hero tilt: fine pointers only, never in calm mode */
  const heroArt = $(".workflow-art img");
  if (heroArt && window.matchMedia && matchMedia("(pointer: fine)").matches) {
    const fig = heroArt.closest("figure");
    fig.addEventListener("pointermove", (e) => {
      if (isCalm()) return;
      const r = fig.getBoundingClientRect();
      heroArt.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + "deg");
      heroArt.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 5).toFixed(2) + "deg");
    });
    fig.addEventListener("pointerleave", () => { heroArt.style.setProperty("--rx", "0deg"); heroArt.style.setProperty("--ry", "0deg"); });
  }

  /* ---------- Dialogs: sound and motion panel, jump menu ---------- */
  let lastOpener = null;
  function makeDialog(id, html) {
    const d = doc.createElement("dialog");
    d.id = id; d.setAttribute("aria-labelledby", id + "-t");
    d.innerHTML = '<div class="dlg">' + html + "</div>";
    d.addEventListener("click", (e) => { if (e.target === d || (e.target.closest && e.target.closest("[data-close]"))) d.close(); });
    d.addEventListener("close", () => { fx("close"); if (lastOpener && lastOpener.focus) lastOpener.focus(); });
    doc.body.append(d);
    return d;
  }
  function openDialog(d) {
    if (!d || d.open) return;
    lastOpener = doc.activeElement;
    d.showModal(); fx("open");
  }
  const sw = (key, label, hint) => '<div class="row"><div class="lbl" id="lbl-' + key + '">' + label + "<small>" + hint + '</small></div><button type="button" class="switch" role="switch" aria-checked="false" aria-labelledby="lbl-' + key + '" data-sw="' + key + '" data-sfx="none"><span class="knob"></span></button></div>';
  const panel = makeDialog("panel",
    '<div class="dlg-head"><div><h2 id="panel-t">Sound and motion</h2><p>Sound is made live in your browser. Nothing is downloaded or sent, and it stays off until you switch it on.</p></div><button type="button" class="dlg-close" data-close data-sfx="none">Close</button></div>' +
    sw("fx", "Button effects", "Clicks, toggles, open and close, success") +
    sw("music", "Ambient music", "A calm, original loop with a gentle fade in and out") +
    sw("mute", "Mute everything", "Silences effects and music without losing your place") +
    '<div class="row"><label class="lbl" for="vol">Master volume<small>Applies to effects and music</small></label><output class="vol-out" id="vol-out" for="vol">60%</output></div><input type="range" id="vol" min="0" max="100" step="5" value="60">' +
    sw("haptics", "Touch vibration", "A tiny buzz on press, on phones that support it") +
    sw("calm", "Calm mode (less motion)", osReduced ? "On, because your device asks for reduced motion or data saving" : "Switches off animation, tilt and the guided tour") +
    sw("keys", "Keyboard shortcuts", "Single keys. Turn off if they clash with your tools") +
    '<div class="dlg-actions"><button type="button" class="btn secondary" data-test data-sfx="none">Play a test sound</button></div>' +
    '<dl class="keys"><dt><kbd>/</kbd></dt><dd>Jump to a section</dd><dt><kbd>s</kbd> or <kbd>?</kbd></dt><dd>Sound and motion panel</dd><dt><kbd>e</kbd></dt><dd>Effects on or off</dd><dt><kbd>m</kbd></dt><dd>Music on or off</dd><dt><kbd>t</kbd></dt><dd>Back to top</dd><dt><kbd>Esc</kbd></dt><dd>Close a panel</dd></dl>');
  const calmSwitch = $('[data-sw="calm"]', panel);
  if (osReduced && calmSwitch) calmSwitch.setAttribute("aria-disabled", "true");
  panel.addEventListener("click", (e) => {
    const s = e.target.closest ? e.target.closest("[data-sw]") : null;
    if (s) {
      const k = s.dataset.sw;
      if (k === "fx") setEffects(!effects);
      else if (k === "music") setMusic(!musicOn);
      else if (k === "mute") { if (AudioCtor) setMuted(!prefs.muted); }
      else if (k === "haptics") { prefs.haptics = !prefs.haptics; savePrefs(); sync(); fx("click"); }
      else if (k === "keys") { prefs.keys = !prefs.keys; savePrefs(); sync(); fx("click"); }
      else if (k === "calm") { if (osReduced) return; prefs.calm = !prefs.calm; savePrefs(); applyCalm(); if (prefs.calm) tourStop(); sync(); fx("click"); }
    }
    if (e.target.closest && e.target.closest("[data-test]")) { if (ensure()) { wake(); fx("success", true); } }
  });
  $("#vol", panel).addEventListener("input", (e) => { prefs.vol = Number(e.target.value) / 100; savePrefs(); applyMaster(false); sync(); });
  $("#vol", panel).addEventListener("change", () => fx("click"));

  const base = onHome ? "" : "index.html";
  const entries = [
    ["Home", base + "#home", "Section"], ["How it works", base + "#how", "Section"], ["Life of a memory", base + "#lifecycle", "Interactive"],
    ["About us", base + "#about", "Section"], ["The future", base + "#future", "Section"], ["App and shop", base + "#shop", "Section"],
    ["Security", base + "#security", "Section"], ["Live demo", base + "#demo", "Interactive"], ["Build status", base + "#status", "Section"],
    ["Developers", base + "#developers", "Section"], ["Questions worth asking", base + "#faq", "Section"],
    ["Visual gallery", "gallery.html", "Page"], ["Acknowledgements and Accreditations", "acknowledgements.html", "Page"]
  ];
  const jump = makeDialog("jump",
    '<div class="dlg-head"><div><h2 id="jump-t">Jump to</h2><p>Type to filter, then press Enter. Use the arrow keys to move.</p></div><button type="button" class="dlg-close" data-close data-sfx="none">Close</button></div>' +
    '<label class="sr" for="jump-q">Filter sections</label><input id="jump-q" type="search" autocomplete="off" placeholder="Search sections and pages"><ul id="jump-list"></ul>');
  const jq = $("#jump-q", jump), jl = $("#jump-list", jump);
  function drawJump() {
    const q = jq.value.trim().toLowerCase();
    jl.replaceChildren();
    entries.filter((x) => x[0].toLowerCase().includes(q)).forEach((x) => {
      const li = doc.createElement("li"), a = doc.createElement("a"), sm = doc.createElement("small");
      a.href = x[1]; a.textContent = x[0]; sm.textContent = x[2]; a.append(sm);
      a.addEventListener("click", () => jump.close());
      li.append(a); jl.append(li);
    });
    if (!jl.children.length) { const li = doc.createElement("li"); li.textContent = "Nothing matches."; li.style.padding = "12px 14px"; jl.append(li); }
  }
  drawJump();
  jq.addEventListener("input", drawJump);
  jump.addEventListener("keydown", (e) => {
    const links = $$("a", jl);
    if (e.key === "Enter" && e.target === jq && links[0]) { e.preventDefault(); links[0].click(); window.location.href = links[0].href; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const cur = links.indexOf(doc.activeElement);
      const n = e.key === "ArrowDown" ? Math.min(links.length - 1, cur + 1) : cur - 1;
      if (n < 0) jq.focus(); else if (links[n]) links[n].focus();
    }
  });
  jump.addEventListener("close", () => { jq.value = ""; drawJump(); });
  $$('[data-open="panel"]').forEach((b) => b.addEventListener("click", () => openDialog(panel)));
  $$('[data-open="jump"]').forEach((b) => b.addEventListener("click", () => { openDialog(jump); jq.focus(); }));
  sync();

  /* ---------- Keyboard shortcuts ---------- */
  doc.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const t = e.target, tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (doc.querySelector("dialog[open]")) return;
    if (!prefs.keys && e.key !== "?") return;
    const k = e.key;
    if (k === "/") { e.preventDefault(); openDialog(jump); jq.focus(); }
    else if (k === "s" || k === "S" || k === "?") { e.preventDefault(); openDialog(panel); }
    else if (k === "e" || k === "E") { if (AudioCtor) setEffects(!effects); }
    else if (k === "m" || k === "M") { if (AudioCtor) setMusic(!musicOn); }
    else if (k === "t" || k === "T") { window.scrollTo({ top: 0, behavior: isCalm() ? "auto" : "smooth" }); }
  });

  /* ---------- Safe demo (home page only). Invented facts, volatile memory ---------- */
  if (byId("remember")) {
    const seed = [
      { id: 1, text: "The teal lighthouse marks the fictional island's northern shore.", source: "Synthetic fixture A", version: 1 },
      { id: 2, text: "In the demo garden, the moonflower opens after sunset.", source: "Synthetic fixture B", version: 1 }
    ];
    let rows = seed.map((r) => ({ ...r }));
    let nextId = 3;
    const status = (message) => { byId("event").textContent = message; };
    const render = () => {
      const q = byId("filter").value.trim().toLocaleLowerCase();
      const subset = rows.filter((r) => r.text.toLocaleLowerCase().includes(q));
      const list = byId("records");
      list.replaceChildren();
      subset.forEach((r) => {
        const li = doc.createElement("li");
        const content = doc.createElement("span");
        content.textContent = r.text;
        const source = doc.createElement("small");
        source.textContent = r.source + " · version " + r.version + " · owner A";
        li.append(content, source);
        list.append(li);
      });
      if (!subset.length) {
        const li = doc.createElement("li");
        li.textContent = "No matching demo records.";
        list.append(li);
      }
      byId("count").textContent = rows.length + " synthetic record" + (rows.length === 1 ? "" : "s");
    };
    byId("remember").addEventListener("click", () => {
      const input = byId("fact");
      const value = input.value.trim();
      if (value.length < 3) { status("Enter a harmless example with at least 3 characters."); fx("off"); return; }
      if (rows.length >= 15) { status("Demo limit: 15 records. Restore the sample to restart."); fx("off"); return; }
      rows.push({ id: nextId++, text: value, source: "User input in this tab only", version: 1 });
      input.value = "";
      byId("filter").value = "";
      render();
      status("Recorded locally in volatile browser memory; nothing was transmitted.");
      fx("success");
    });
    byId("filter").addEventListener("input", render);
    byId("handoff").addEventListener("click", () => {
      status("ALLOW (simulation): owner A grants an invented agent access to " + rows.length + " general example record(s). No data sent.");
      fx("on");
    });
    byId("deny").addEventListener("click", () => {
      status("DENY (simulation): owner B cannot read, enumerate or modify owner A's example records.");
      fx("off");
    });
    byId("conflict").addEventListener("click", () => {
      status("CONFLICT (simulation): two editors changed the same record. Both versions are retained for review; no silent overwrite.");
      fx("click");
    });
    byId("restore").addEventListener("click", () => {
      rows = seed.map((r) => ({ ...r }));
      nextId = 3;
      byId("filter").value = "";
      byId("fact").value = "";
      render();
      status("RESTORED (simulation): integrity-checked seed snapshot loaded in this tab. This is not a production backup drill.");
      fx("success");
    });
    render();
  }
})();
