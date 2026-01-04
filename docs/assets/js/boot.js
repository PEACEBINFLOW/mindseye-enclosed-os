let pyodide = null;

async function bootPython() {
  try {
    console.log("Loading Pyodide…");

    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
    });

    console.log("Pyodide loaded");

    const engineCode = await fetch("assets/py/engine.py").then(r => r.text());
    const contentCode = await fetch("assets/py/content.py").then(r => r.text());

    pyodide.runPython(engineCode);
    pyodide.runPython(contentCode);

    console.log("Python engine initialized");

  } catch (err) {
    console.error("Python failed to load:", err);
    document.getElementById("status").innerText =
      "Python failed to load. Check console.";
  }
}

bootPython();
