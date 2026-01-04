import { Engine } from "./pyodide_boot.js";
import { setToast } from "../../ui/js/ui.js";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function makeTile(label, idx, isEmpty) {
  const b = document.createElement("button");
  b.className = "tile" + (isEmpty ? " empty" : "");
  if (isEmpty) return b;

  b.innerHTML = `
    <div class="tileTop">
      <div class="tileIcon">▣</div>
      <div class="tileIdx">${String(idx+1).padStart(2,"0")}</div>
    </div>
    <div class="tileLabel">${escapeHtml(label)}</div>
  `;
  return b;
}

function renderGrid(state) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  document.getElementById("emptySlot").textContent = String(state.empty_index);
  document.getElementById("moves").textContent = String(state.moves);
  document.getElementById("active").textContent = String(state.active);

  state.tiles.forEach((t, i) => {
    const isEmpty = i === state.empty_index;
    const btn = makeTile(t.label, i, isEmpty);

    if (!isEmpty) {
      btn.onclick = () => {
        const res = Engine.try_move(i);
        if (res && res.ok === false) setToast(res.msg || "Illegal move");
        EngineAPI.syncUI();
      };
    }
    grid.appendChild(btn);
  });
}

function renderPanel(page) {
  document.getElementById("panelTitle").textContent = page.title;
  document.getElementById("panelSub").textContent = page.subtitle;

  const cards = document.getElementById("cards");
  cards.innerHTML = "";

  page.cards.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="cardTitle">${escapeHtml(c.title)}</div>
      <div class="cardBody">${escapeHtml(c.body)}</div>
    `;
    cards.appendChild(div);
  });
}

export const EngineAPI = {
  setActive(key) {
    Engine.set_active(key);
  },
  syncUI() {
    const state = Engine.get_state();
    renderGrid(state);

    const page = Engine.get_active_page();
    renderPanel(page);

    // Controls
    const btnShuffle = document.getElementById("btnShuffle");
    const btnReset = document.getElementById("btnReset");

    if (btnShuffle) btnShuffle.onclick = () => { Engine.shuffle(60); this.syncUI(); };
    if (btnReset) btnReset.onclick = () => { Engine.reset(); this.syncUI(); };
  }
};
