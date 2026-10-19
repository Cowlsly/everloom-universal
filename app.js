/* Everloom public website. Local-only simulation: no network, storage or telemetry. */
(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const menu = document.querySelector(".menu-toggle");
  const nav = byId("nav-links");
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }));

  // Invented facts only. The data lives in volatile JS memory and dies on refresh.
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
      const li = document.createElement("li");
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
    byId("count").textContent = rows.length + " synthetic record" + (rows.length === 1 ? "" : "s");
  };
  byId("remember").addEventListener("click", () => {
    const input = byId("fact");
    const value = input.value.trim();
    if (value.length < 3) { status("Enter a harmless example with at least 3 characters."); return; }
    if (rows.length >= 15) { status("Demo limit: 15 records. Restore the sample to restart."); return; }
    rows.push({id: nextId++, text: value, source: "User input in this tab only", version: 1});
    input.value = "";
    byId("filter").value = "";
    render();
    status("Recorded locally in volatile browser memory; nothing was transmitted.");
  });
  byId("filter").addEventListener("input", render);
  byId("handoff").addEventListener("click", () => {
    status("ALLOW (simulation): owner A grants an invented agent access to " + rows.length + " general example record(s). No data sent.");
  });
  byId("deny").addEventListener("click", () => {
    status("DENY (simulation): owner B cannot read, enumerate or modify owner A's example records.");
  });
  byId("conflict").addEventListener("click", () => {
    status("CONFLICT (simulation): two editors changed the same record. Both versions are retained for review; no silent overwrite.");
  });
  byId("restore").addEventListener("click", () => {
    rows = seed.map((r) => ({...r}));
    nextId = 3;
    byId("filter").value = "";
    byId("fact").value = "";
    render();
    status("RESTORED (simulation): integrity-checked seed snapshot loaded in this tab. This is not a production backup drill.");
  });

  // Web Audio is opt-in, synthesized locally and never sent to a network.
  // Pause ambient playback when the page is hidden; no autoplay or saved state.
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  const fxButton = byId("sound-toggle");
  const musicButton = byId("music-toggle");
  let audioCtx=null, effects=false, music=false, ambientTimer=null, noteIndex=0;
  const context=()=>{if(!AudioCtor)return null; if(!audioCtx)audioCtx=new AudioCtor();if(audioCtx.state==="suspended") audioCtx.resume().catch(()=>{});return audioCtx;};
  const tone=(freq,duration,volume,shape="sine")=>{const a=context();if(!a)return;const osc=a.createOscillator(),gain=a.createGain(),now=a.currentTime;osc.type=shape;osc.frequency.setValueAtTime(freq,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(volume,now+.09);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain).connect(a.destination);osc.start(now);osc.stop(now+duration+.02);};
  if(fxButton)fxButton.addEventListener("click",()=>{effects=!effects;fxButton.setAttribute("aria-pressed",String(effects));fxButton.textContent=effects?"♫ Effects on":"♫ Effects off";if(effects)tone(740,.17,.045);});
  document.addEventListener("click",(ev)=>{if(!effects||ev.target.closest("#sound-toggle"))return;if(ev.target.closest("button, a, summary"))tone(620,.12,.02,"triangle");});
  const playAmbient=()=>{if(!music||document.hidden)return;const notes=[196,246.94,293.66,246.94,220,261.63,329.63,261.63];tone(notes[noteIndex++%notes.length],2.3,.011);};
  const stopAmbient=()=>{if(ambientTimer!==null)clearInterval(ambientTimer);ambientTimer=null;};
  const startAmbient=()=>{stopAmbient();playAmbient();ambientTimer=setInterval(playAmbient,2600);};
  if(musicButton)musicButton.addEventListener("click",()=>{if(!AudioCtor){musicButton.textContent="Music unavailable";musicButton.disabled=true;return;}music=!music;musicButton.setAttribute("aria-pressed",String(music));musicButton.textContent=music?"♪ Music on":"♪ Music off";music?startAmbient():stopAmbient();});
  document.addEventListener("visibilitychange",()=>{if(music){document.hidden?stopAmbient():startAmbient();}});
  window.addEventListener("pagehide",stopAmbient);

  render();
})();
