/* ---------- Helpers ---------- */

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  /* ---------- Preparar personajes ---------- */
  
  const GAME_CHARACTERS = CHARACTERS.map(c => ({
    ...c,
    name: c.name || prettyNameFromFile(c.file)
  }));
  
  function prettyNameFromFile(file) {
    return file
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, m => m.toUpperCase());
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
  
  const selectedOnBoard = new Set();
  const guessed = new Set();
  const history = [];
  
  /* ---------- Render Grid ---------- */
  
  function renderGrid() {
    grid.innerHTML = "";
  
    GAME_CHARACTERS.forEach(ch => {
  
      const card = document.createElement("div");
      card.className = "char";
      card.dataset.file = ch.file;
  
      if (selectedOnBoard.has(ch.file)) {
        card.classList.add("selected");
      }
  
      card.innerHTML = `
        <img src="${ch.src}" alt="${ch.name}">
        <div class="char__label">${ch.name}</div>
      `;
  
      card.addEventListener("click", () => {
        toggleSelectedOnBoard(ch.file);
      });
  
      grid.appendChild(card);
    });
  }
  
  function toggleSelectedOnBoard(file) {
  
    if (selectedOnBoard.has(file))
      selectedOnBoard.delete(file);
    else
      selectedOnBoard.add(file);
  
    renderGrid();
  }
  
  /* ---------- Guessed List ---------- */
  
  function renderGuessedList(filterText = "") {
  
    const f = filterText.trim().toLowerCase();
    guessedList.innerHTML = "";
  
    GAME_CHARACTERS
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
            guessed.add(ch.file);
            selectedOnBoard.add(ch.file);
          } else {
            guessed.delete(ch.file);
            selectedOnBoard.delete(ch.file);
          }
  
          renderGrid();
        });
  
        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = ch.name;
  
        left.appendChild(checkbox);
        left.appendChild(label);
  
        li.appendChild(left);
        guessedList.appendChild(li);
  
      });
  }
  
  /* ---------- Mystery ---------- */
  
  function setMysteryRandom() {
  
    const randomChar = pickRandom(GAME_CHARACTERS);
  
    mysteryInner.innerHTML = `<img src="${randomChar.src}" alt="${randomChar.name}">`;
    mysteryName.textContent = randomChar.name;
  
    history.push({
      name: randomChar.name,
      at: new Date()
    });
  
    renderHistory();
  }
  
  function resetMystery() {
  
    mysteryInner.innerHTML = `<span class="mystery__q">?</span>`;
    mysteryName.textContent = "Sin seleccionar";
  }
  
  /* ---------- History ---------- */
  
  function renderHistory() {
  
    historyList.innerHTML = "";
  
    history.slice().reverse().forEach(item => {
  
      const li = document.createElement("li");
  
      const time = item.at.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
  
      li.textContent = item.name;
  
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = time;
  
      li.appendChild(badge);
  
      historyList.appendChild(li);
    });
  }
  
  /* ---------- Actions ---------- */
  
  btnPickRandom?.addEventListener("click", setMysteryRandom);
  btnChangeRandom?.addEventListener("click", setMysteryRandom);
  
  btnReset?.addEventListener("click", () => {
  
    selectedOnBoard.clear();
  
    guessed.forEach(file => {
      selectedOnBoard.add(file);
    });
  
    notes.value = "";
    searchGuessed.value = "";
  
    resetMystery();
  
    renderGrid();
    renderGuessedList();
    renderHistory();
  });
  
  btnClearGuessed?.addEventListener("click", () => {
  
    guessed.forEach(file => selectedOnBoard.delete(file));
  
    guessed.clear();
  
    renderGuessedList(searchGuessed.value);
    renderGrid();
  });
  
  searchGuessed?.addEventListener("input", () => {
    renderGuessedList(searchGuessed.value);
  });
  
  /* ---------- Init ---------- */
  
  renderGrid();
  renderGuessedList();
  resetMystery();
  renderHistory();