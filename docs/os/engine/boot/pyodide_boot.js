export let pyodide = null;
export let Engine = null;

export async function bootPython() {
  // Pyodide injected via index.html script tag
  if (typeof loadPyodide !== "function") {
    throw new Error("loadPyodide not found. Pyodide script failed to load.");
  }

  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
  });

  // Load python modules as plain text and execute
  const contentCode = await fetch("./os/engine/py/content.py").then(r => r.text());
  const engineCode = await fetch("./os/engine/py/engine.py").then(r => r.text());

  pyodide.runPython(contentCode);
  pyodide.runPython(engineCode);

  Engine = pyodide.globals.get("create_engine")();
}
