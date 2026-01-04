let pyodide = null;
let Engine = null;

export async function bootPython() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
  });

  const engineCode = await fetch("./os/engine/py/engine.py").then(r => r.text());
  const contentCode = await fetch("./os/engine/py/content.py").then(r => r.text());

  pyodide.runPython(contentCode);
  pyodide.runPython(engineCode);

  Engine = pyodide.globals.get("create_engine")();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function setToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 900);
}

function tileButton(label, idx, isEmpty){
  const b = document.createElement("button");
  b.className = "tile" + (isEmpty ? " empty" : "");
  b.innerHTML = isEmpty ? "" : `
    <div class="tileTop">
      <div class="tileIcon">▣</div>
      <div class="tileIdx">${String(idx+1).padStart(2,"0")}</div>
    </div>
    <div class="tileLabel">${escapeHtml(label)}</div>
  `;
  return b;
}

function renderGrid(state){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  document.getElementById("emptySlot").textContent = state.empty_index;
  document.getElementById("moves").textContent = state.moves;
  document.getElementById("active").textContent = state.active;

  state.tiles.forEach((t, i) => {
    const isEmpty = i === state.empty_index;
    const btn = tileButton(t.label, i, isEmpty);

    if(!isEmpty){
      btn.addEventListener("click", () => {
        const res = Engine.try_move(i);
        if(!res.ok) setToast(res.msg);
        EngineAPI.syncUI();
      });
    }

    grid.appendChild(btn);
  });
}

function renderPanel(page){
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
  setActive(key){
    Engine.set_active(key);
  },
  syncUI(){
    const state = Engine.get_state();
    renderGrid(state);
    const page = Engine.get_active_page();
    renderPanel(page);

    // buttons
    document.getElementById("btnShuffle").onclick = () => { Engine.shuffle(60); EngineAPI.syncUI(); };
    document.getElementById("btnReset").onclick = () => { Engine.reset(); EngineAPI.syncUI(); };
    document.getElementById("btnHome").onclick = () => { location.hash = "#/HOME"; };
  }
};
