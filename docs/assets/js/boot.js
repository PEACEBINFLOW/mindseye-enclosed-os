const toast = document.getElementById("toast");
const gridEl = document.getElementById("grid");

const emptySlotEl = document.getElementById("emptySlot");
const movesEl = document.getElementById("moves");
const activeEl = document.getElementById("active");

const panelTitle = document.getElementById("panelTitle");
const panelSub = document.getElementById("panelSub");
const panelBody = document.getElementById("panelBody");
const cardsEl = document.getElementById("cards");

const btnShuffle = document.getElementById("btnShuffle");
const btnReset = document.getElementById("btnReset");
const btnHome = document.getElementById("btnHome");

const PY_FILES = [
  "./assets/py/engine.py",
  "./assets/py/content.py"
];

let pyodide = null;
let Engine = null; // Python-side engine instance

function setToast(msg, show=true) {
  toast.textContent = msg;
  toast.classList.toggle("show", !!show);
}

function createTile(label, idx, isEmpty=false) {
  const b = document.createElement("button");
  b.className = "tile";
  b.dataset.idx = String(idx);
  if (isEmpty) b.classList.add("empty");
  b.innerHTML = `
    <div class="tileTop">
      <div class="tileIcon">${isEmpty ? "" : "▣"}</div>
      <div class="tileIdx">${isEmpty ? "" : String(idx+1).padStart(2,"0")}</div>
    </div>
    <div class="tileLabel">${isEmpty ? "" : label}</div>
  `;
  return b;
}

function renderGrid(state) {
  gridEl.innerHTML = "";
  const { tiles, empty_index } = state;
  emptySlotEl.textContent = String(empty_index);

  tiles.forEach((t, i) => {
    const isEmpty = (i === empty_index);
    const tile = createTile(isEmpty ? "" : t.label, i, isEmpty);
    tile.addEventListener("click", async () => {
      if (isEmpty) return;
      await move(i);
    });
    gridEl.appendChild(tile);
  });
}

function renderPanel(page) {
  panelTitle.textContent = page.title;
  panelSub.textContent = page.subtitle;
  activeEl.textContent = page.key;

  cardsEl.innerHTML = "";
  page.cards.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="cardTitle">${escapeHtml(c.title)}</div>
      <div class="cardBody">${escapeHtml(c.body)}</div>
      ${c.actions?.length ? `
        <div class="cardActions">
          ${c.actions.map(a => `<button class="miniBtn" data-action="${escapeHtml(a.action)}">${escapeHtml(a.label)}</button>`).join("")}
        </div>
      ` : ""}
    `;
    div.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const action = btn.getAttribute("data-action");
        await runAction(action);
      });
    });
    cardsEl.appendChild(div);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

async function syncUI() {
  const state = Engine.get_state();
  renderGrid(state);

  const page = Engine.get_active_page();
  renderPanel(page);

  movesEl.textContent = String(state.moves);
}

async function move(idx) {
  const res = Engine.try_move(idx);
  if (!res.ok) {
    setToast(res.msg, true);
    setTimeout(() => setToast("", false), 900);
    return;
  }
  await syncUI();
}

async function goHome() {
  Engine.set_active("HOME");
  await syncUI();
}

async function shuffle() {
  Engine.shuffle(60);
  await syncUI();
}

async function reset() {
  Engine.reset();
  await syncUI();
}

async function runAction(action) {
  const out = Engine.action(action);
  if (out?.toast) {
    setToast(out.toast, true);
    setTimeout(() => setToast("", false), 900);
  }
  if (out?.active) {
    Engine.set_active(out.active);
  }
  await syncUI();
}

async function loadPython() {
  setToast("Loading Python engine…", true);
  pyodide = await loadPyodide();

  // Load python files
  for (const f of PY_FILES) {
    const r = await fetch(f);
    const txt = await r.text();
    pyodide.runPython(txt);
  }

  // Create engine instance
  Engine = pyodide.globals.get("create_engine")();
  setToast("Ready. Tap tiles to navigate.", true);
  setTimeout(() => setToast("", false), 1200);
  await syncUI();
}

btnHome.addEventListener("click", goHome);
btnShuffle.addEventListener("click", shuffle);
btnReset.addEventListener("click", reset);

loadPython().catch(err => {
  console.error(err);
  setToast("Python failed to load. Check console.", true);
});
