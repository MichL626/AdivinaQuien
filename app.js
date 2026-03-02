/**
 * IMPORTANTE:
 * - JS en navegador no puede leer automáticamente el contenido de /img
 * - Por eso listamos los archivos aquí.
 * - Agregá personajes: { file: "NOMBRE.jpg" }
 */
const CHARACTERS = [
    { file: "ISAGI.jpg" },
    { file: "BACHIRA.jpg" },
    { file: "CHIGIRI.jpg" },
    { file: "KUNIGAMI.jpg" },
    { file: "NAGI.jpg" },
    { file: "RIN.jpg" },
    { file: "BAROU.jpg" },
    { file: "REO.jpg" },
    { file: "ARYU.jpg"},
    { file: "TOKIMITSU.jpg" },
    { file: "EGO.jpg" },
    { file: "SHIDOU.jpg" },
    { file: "KARASU.jpg" },
    { file: "OTOYA.jpg" },
    { file: "YUKIMIYA.jpg" },
    { file: "AIKU.jpg" },
    { file: "SAE.jpg" },
    { file: "ANRI.jpg" },
    { file: "KAISER.jpg" },
    { file: "NESS.jpg" },
    { file: "KURONA.jpg" },
    { file: "GAGAMARU.jpg" },
    { file: "RAICHI.jpg" },
    { file: "HIORI.jpg" },
    { file: "NIKO.jpg" },
    { file: "LORENZO.jpg" },
    { file: "SENDOU.jpg" },
    { file: "KIYORA.jpg" },
    { file: "NANASE.jpg" },
    { file: "ZANTETSU.jpg" },
    { file: "CHARLES.jpg" },
    { file: "IGARASHI.jpg" },
    { file: "LOKI.jpg" },
    { file: "BURATSUTA.jpg" },
    { file: "BUNNY.jpg" },
    { file: "ONAZI.jpg" },
    { file: "KUSO.jpg" },
    { file: "NOA.jpg" },
    { file: "LAVINHO.jpg" },
    { file: "CHRIS.jpg" },
    { file: "SNUFFY.jpg" },
    { file: "KIRA.jpg" },
    { file: "HUGO.jpg" },


    // ... agregá los que tengas en /img
  ].map(c => ({
    ...c,
    name: prettyNameFromFile(c.file),
    src: `img/${c.file}`
  }));
  
  /* ---------- Helpers ---------- */
  function prettyNameFromFile(file) {
    // "MIKAGE_REO.jpg" => "Mikage Reo"
    return file
      .replace(/\.[^/.]+$/, "")      // quita extensión
      .replace(/[_-]+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, m => m.toUpperCase());
  }
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  /* ---------- DOM ---------- */
  const grid = document.getElementById("gridCharacters");
  const guessedList = document.getElementById("guessedList");
  const historyList = document.getElementById("historyList");
  
  const notes = document.getElementById("notes");
  const mysteryInner = document.getElementById("mysteryInner");
  const mysteryName = document.getElementById("mysteryName");
  
  const btnReset = document.getElementById("btnReset");
  const btnPickRandom = document.getElementById("btnPickRandom");
  const btnChangeRandom = document.getElementById("btnChangeRandom");
  const btnClearGuessed = document.getElementById("btnClearGuessed");
  const searchGuessed = document.getElementById("searchGuessed");
  
  /* ---------- State ---------- */
  const selectedOnBoard = new Set();  // files seleccionados (oscurecidos)
  const guessed = new Set();          // files marcados como "adivinados"
  const history = [];                 // {file,name,at}
  
  /* ---------- Render: Board Grid ---------- */
  function renderGrid() {
    grid.innerHTML = "";
  
    CHARACTERS.forEach((ch) => {
      const card = document.createElement("div");
      card.className = "char";
      card.dataset.file = ch.file;
  
      if (selectedOnBoard.has(ch.file)) card.classList.add("selected");
  
      card.innerHTML = `
        <img src="${ch.src}" alt="${ch.name}">
        <div class="char__label">${ch.name}</div>
      `;
  
      card.addEventListener("click", () => {
        toggleSelectedOnBoard(ch.file); // SOLO tablero
      });
  
      grid.appendChild(card);
    });
  }
  
  function toggleSelectedOnBoard(file) {
    if (selectedOnBoard.has(file)) selectedOnBoard.delete(file);
    else selectedOnBoard.add(file);
    renderGrid();
  }
  
  function setSelectedEverywhere(file, isSelected) {
    // 1) Tablero
    if (isSelected) selectedOnBoard.add(file);
    else selectedOnBoard.delete(file);
  
    // 2) Adivinados (checkbox)
    if (isSelected) guessed.add(file);
    else guessed.delete(file);
  
    // 3) Actualiza checkbox si existe en DOM (sin re-render completo)
    const cb = document.getElementById(`g_${file}`);
    if (cb) cb.checked = isSelected;
  
    // 4) Re-render del tablero para aplicar borde/oscurecido
    renderGrid();
  }

  /* ---------- Render: Guessed List (todos los nombres) ---------- */
  function renderGuessedList(filterText = "") {
    const f = filterText.trim().toLowerCase();
    guessedList.innerHTML = "";
  
    CHARACTERS
      .filter(ch => ch.name.toLowerCase().includes(f))
      .forEach(ch => {
        const li = document.createElement("li");
  
        const left = document.createElement("div");
        left.className = "guessed-item";
  
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = guessed.has(ch.file);
        checkbox.id = `g_${ch.file}`;
  
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              guessed.add(ch.file);          // se guarda como adivinado
              selectedOnBoard.add(ch.file);  // y se marca en el tablero
            } else {
              guessed.delete(ch.file);
              selectedOnBoard.delete(ch.file);
            }
            renderGrid(); // para que el borde/oscuro se actualice
          });
  
        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = ch.name;
  
        // Click extra en el nombre para alternar también
        label.addEventListener("click", (e) => {
          // el label ya cambia, esto solo asegura consistencia visual
          setTimeout(() => {
            if (checkbox.checked) guessed.add(ch.file);
            else guessed.delete(ch.file);
          }, 0);
        });
  
        left.appendChild(checkbox);
        left.appendChild(label);
  
        li.appendChild(left);
        guessedList.appendChild(li);
      });
  }
  
  /* ---------- Mystery box + History ---------- */
  function setMysteryRandom() {
    const randomChar = pickRandom(CHARACTERS);
    setMystery(randomChar);
    pushHistory(randomChar);
    renderHistory();
  }
  
  function setMystery(ch) {
    mysteryInner.innerHTML = `<img src="${ch.src}" alt="${ch.name}">`;
    mysteryName.textContent = ch.name;
  }
  
  function resetMystery() {
    mysteryInner.innerHTML = `<span class="mystery__q">?</span>`;
    mysteryName.textContent = "Sin seleccionar";
  }
  
  function pushHistory(ch) {
    history.push({
      file: ch.file,
      name: ch.name,
      at: new Date()
    });
  }
  
  function renderHistory() {
    historyList.innerHTML = "";
    history.slice().reverse().forEach(item => {
      const li = document.createElement("li");
      const time = item.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      li.textContent = item.name;
  
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = time;
  
      li.appendChild(badge);
      historyList.appendChild(li);
    });
  }
  
  /* ---------- Actions ---------- */
  btnPickRandom.addEventListener("click", setMysteryRandom);
  btnChangeRandom.addEventListener("click", setMysteryRandom);
  
  btnReset.addEventListener("click", () => {
    // ✅ Resetea tablero PERO conserva lo marcado en "Adivinados"
    selectedOnBoard.clear();
    guessed.forEach(file => selectedOnBoard.add(file));
  
    // ✅ No tocar historial (se mantiene)
    // history.length = 0;  // NO
  
    notes.value = "";
    searchGuessed.value = "";
  
    resetMystery();
    renderGrid();
    renderGuessedList();   // mantiene checkboxes como estaban
    renderHistory();       // opcional, no cambia nada
  });
  
  btnClearGuessed.addEventListener("click", () => {
    guessed.forEach(file => selectedOnBoard.delete(file));
  guessed.clear();
  renderGuessedList(searchGuessed.value);
  renderGrid();
  });
  
  searchGuessed.addEventListener("input", () => {
    renderGuessedList(searchGuessed.value);
  });
  
  /* ---------- Init ---------- */
  renderGrid();
  renderGuessedList();
  resetMystery();
  renderHistory();
