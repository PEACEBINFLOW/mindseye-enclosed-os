import { bootPython } from "../engine/boot/pyodide_boot.js";
import { EngineAPI } from "../engine/boot/engine_bridge.js";
import { routeKeyFromHash, setHash } from "../ui/js/state.js";

const app = document.getElementById("app");

async function loadHTML(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return await res.text();
}

async function showSplash() {
  const splash = await loadHTML("./os/shell/splash.html");
  app.innerHTML = splash;
}

async function showShell() {
  const shell = await loadHTML("./os/shell/app.html");
  app.innerHTML = shell;
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

async function start() {
  await showSplash();
  setStatus("Loading shell…");

  await showShell();
  setStatus("Booting Python engine…");

  await bootPython();
  setStatus("Syncing UI…");

  // Initial route
  const key = routeKeyFromHash();
  EngineAPI.setActive(key);
  EngineAPI.syncUI();

  // Buttons
  document.getElementById("btnHome").onclick = () => setHash("HOME");

  // Hash routing
  window.addEventListener("hashchange", () => {
    const k = routeKeyFromHash();
    EngineAPI.setActive(k);
    EngineAPI.syncUI();
  });

  // mark ready
  const mode = document.getElementById("mode");
  if (mode) mode.textContent = "offline · python-engine · ready";
}

start().catch(err => {
  console.error(err);
  setStatus("Boot failed. Check console.");
});
