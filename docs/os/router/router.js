import { bootPython, EngineAPI } from "../engine/boot/engine_bridge.js";

const app = document.getElementById("app");
const statusEl = document.getElementById("status");

function setStatus(s){ if(statusEl) statusEl.textContent = s; }

async function loadShell() {
  const html = await fetch("./os/shell/app.html").then(r => r.text());
  app.innerHTML = html;
}

function routeKey() {
  const h = (location.hash || "#/HOME").replace("#/", "");
  return h || "HOME";
}

async function start() {
  setStatus("Loading shell…");
  await loadShell();

  setStatus("Booting Python engine…");
  await bootPython();

  // go to route
  const key = routeKey();
  EngineAPI.setActive(key);
  EngineAPI.syncUI();

  window.addEventListener("hashchange", () => {
    EngineAPI.setActive(routeKey());
    EngineAPI.syncUI();
  });

  setStatus("Ready.");
}

start().catch(err => {
  console.error(err);
  setStatus("Boot failed. Check console.");
});
