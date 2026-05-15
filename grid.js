let board = Array(6).fill().map(() => Array(6).fill(0));
let pieces = [];
let nextId = 2; // 0 = empty, 1 = occupied, 2+ = piece id
let holdingPiece = null;
let holdingRune = null;
let hoverRow = -1;
let hoverCol = -1;
let units = null;
let unit = null;
let inventory = null;
const count = 10; // จำนวนสีที่ต้องการ
const colors = Array.from({ length: count }, (_, i) =>
  `hsl(${Math.round(i * (360 / count))}, 55%, 50%)`
);
const getColor = (index) => colors[index % colors.length];

export function createGrid() {

  const grid = document.getElementById("grid");

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      board[r][c] = 0; // ล้างข้อมูลใน board ด้วย
      const cell = document.createElement("div");

      cell.style.width = "50px";
      cell.style.height = "50px";

      cell.onclick = () => {
        handleClick(r, c);
      };
      cell.onmouseenter = () => {
        hoverRow = r;
        hoverCol = c;
        renderBoard();
        renderStats(r, c);
      };

      grid.appendChild(cell);
    }
  }
}



function handleClick(r, c) {
  if (holdingRune !== null && canPlace(holdingPiece, r, c)) {
    socketRune(holdingRune, holdingPiece, r, c);
    renderBoard();
    renderStats(r, c);
  } else {
    removePiece(r, c);
    renderBoard();
    renderStats(r, c);
  }
  renderHoldingRune();
}

function socketRune(rune, piece, row, col) {
  piece.row = row;
  piece.col = col;
  placePiece(piece, row, col);
  unit.socketed_runes.push({
    ...rune,
    baseRow: row,
    baseCol: col
  });
  holdingPiece = null;
  holdingRune = null;
  console.log(unit);
}

function placePiece(piece, row, col) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[0].length; c++) {
      if (piece.shape[r][c]) {
        board[row + r][col + c] = piece.id;
        const cell = document.getElementById("grid").children[(row + r) * 6 + (col + c)];
        cell.style.backgroundColor = piece.color;
      }
    }
  }
}

function canPlace(piece, row, col) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[0].length; c++) {
      if (piece.shape[r][c]) {
        let br = row + r;
        let bc = col + c;
        if (br < 0 || bc < 0 || br >= 6 || bc >= 6 || board[br][bc] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

function createPiece(shape, color, id = nextId++) {
  return {
    id: id,
    shape: shape,
    color: color,
    row: null,
    col: null
  };
}

function removePiece(row, col) {
  const id = board[row][col];
  if (id < 2) return;
  const rune = unit.socketed_runes[id - 2];
  holdRune(rune);
  unit.socketed_runes.splice(id - 2, 1);
  // ลบทุก cell ที่เป็นของ piece นี้
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] === id) board[r][c] = 0;
    }
  }
}

function returnRuneFromHand() {
  const emptySlot = Object.entries(inventory).find(([key, r]) => r && r.name === "");

  if (emptySlot) {
    const key = parseInt(emptySlot[0]);
    inventory[key] = holdingRune;
  } else {
    const nextKey = Object.keys(inventory).length > 0
      ? Math.max(...Object.keys(inventory).map(Number)) + 1
      : 0;
    inventory[nextKey] = holdingRune;
  }

  holdingPiece = null;
  holdingRune = null;
  renderBoard();
  renderInventory();
}

export function renderInventory() {
  const list = document.getElementById("runeList");
  list.innerHTML = "";
  Object.entries(inventory).forEach(([id, rune]) => {
    if (!rune || !rune.name) return;
    const div = document.createElement("div");
    div.classList.add("label");

    div.textContent = `${id} : ${rune.name}\n${rune.statusDescription}${rune.description}`;

    const placeButton = document.createElement("button");
    placeButton.classList.add("btn");
    placeButton.textContent = "Place";
    placeButton.onclick = () => {
      holdRune(rune);
    };

    list.appendChild(div);
    list.appendChild(placeButton);
  });
}

function holdRune(rune) {
  if (holdingRune || holdingPiece) {
        returnRuneFromHand();
      }
      {
        rune.shape = trimShape(rune.shape);
        holdingPiece = createPiece(rune.shape, "crimson", unit.socketed_runes.length + 2);
        holdingRune = rune;
        console.log(holdingRune);
        console.log(holdingPiece);
        
      inventory = Object.fromEntries(
      Object.entries(inventory).filter(([id, r]) => r !== rune)
      );
      renderInventory();
      renderHoldingRune();
    };
  }

export function renderBoard() {
  nextId = 2; // รีเซ็ต id ของชิ้นส่วน
  pieces = []; // ล้างชิ้นส่วนทั้งหมด
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
        const cell = document.getElementById("grid").children[r * 6 + c];
      if (unit.rune_board[r][c] === false) {
        cell.style.backgroundColor = "var(--bg-secondary)";
        board[r][c] = 1; // ล้างข้อมูลใน board ด้วย
      } else if (unit.rune_board[r][c] === true && board[r][c] === 0) {
        cell.style.backgroundColor = "lightgray";
      }
    }
  }

  unit.socketed_runes.forEach(r => {
    const cell = document.getElementById("grid").children[r.baseRow * 6 + r.baseCol];
    const piece = createPiece(r.shape, getColor(nextId - 2));
    pieces.push(piece);
    placePiece(pieces[pieces.length - 1], r.baseRow, r.baseCol);
  });

    if (holdingPiece && hoverRow >= 0) {
  for (let r = 0; r < holdingPiece.shape.length; r++) {
    for (let c = 0; c < holdingPiece.shape[0].length; c++) {

      if (!holdingPiece.shape[r][c]) continue;

      let br = hoverRow + r;
      let bc = hoverCol + c;

      // เช็คว่าอยู่ใน grid
      if (br >= 0 && bc >= 0 && br < 6 && bc < 6 && board[br][bc] === 0) {
        // ทำสี preview
        const cells = document.getElementById("grid").children;
        cells[br * 6 + bc].style.background = "lightgreen";
      }
    }
  }
}
}

function renderHoldingRune() {
  const rotateButton = document.createElement("button");
  rotateButton.classList.add("btn");
  rotateButton.textContent = "Rotate";
  rotateButton.onclick = () => {
    if (!holdingRune) return;
    holdingRune.shape = rotate90(holdingRune.shape);
    holdingPiece.shape = rotate90(holdingPiece.shape);
    renderHoldingRune();
  }
  const holdingDiv = document.getElementById("pieceDisplay");
  holdingDiv.innerHTML = "";
  if (holdingRune) {
    const div = document.createElement("div");
    div.classList.add("label");
    div.textContent = `${holdingRune.name}\n${holdingRune.statusDescription}${holdingRune.description}`;

    // แสดงรูปร่างของ rune ที่ถืออยู่

    const gridWrapper = document.createElement("div");
    const grid = document.createElement("div");
    gridWrapper.classList.add("holding-wrapper");
    grid.classList.add("mini-grid");
    grid.style.gridTemplateColumns =
  `repeat(${holdingRune.shape[0].length}, 30px)`;

  for (let r = 0; r < holdingRune.shape.length; r++) {
    for (let c = 0; c < holdingRune.shape[0].length; c++) {
      const cell = document.createElement("div");

      cell.style.width = "30px";
      cell.style.height = "30px";
      cell.style.backgroundColor = holdingRune.shape[r][c] ? "red" : "--bg-main";
      grid.appendChild(cell);
    }
  }
    gridWrapper.appendChild(grid);
    holdingDiv.appendChild(gridWrapper);
    holdingDiv.appendChild(rotateButton);
    holdingDiv.appendChild(div);
  } else {
    holdingDiv.textContent = "";
  
  }
}

function renderStats(row, col) {
  const runeId = board[row][col];
  const rune = unit.socketed_runes[runeId - 2];

  const sidebar = document.querySelector(".sidebar");
  sidebar.innerHTML = "";
    const div = document.createElement("div");
    const sum = document.createElement("div");
    div.style.minHeight = "250px";
    div.className = "label-item";
    sum.className = "label-item";
  if (rune) {
    div.innerHTML = `<strong>${rune.name}</strong><br>${rune.statusDescription}<br>${rune.description}`;
  } else {
    div.textContent = "";
  }

  let string = "";
  unit.socketed_runes.forEach(r => {
    if (!r) return;
    string += `${r.name}<br>${r.statusDescription}${r.description}<br>`;
  });
  sum.innerHTML = string;

  const saveButton = document.createElement("button");
  saveButton.classList.add("btn");
  saveButton.textContent = "Save";
  saveButton.onclick = async () => {
    try {
    const emptySlot = Object.entries(inventory).find(([key, r]) => r && r.name === "");

  if (emptySlot) {
    const key = parseInt(emptySlot[0]);
    inventory[key] = holdingRune;
  } else {
    const nextKey = Object.keys(inventory).length > 0
      ? Math.max(...Object.keys(inventory).map(Number)) + 1
      : 0;
    inventory[nextKey] = holdingRune;
  }
      const res = await fetch("https://lastopus-discord-service.onrender.com/update_unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: unit.name, socketed_runes: unit.socketed_runes , rune_inventory: inventory})
      });
      const data = await res.text();
      alert(data);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Save Error");
    }
}
    sidebar.appendChild(div);
    sidebar.appendChild(sum);
    sidebar.appendChild(saveButton);
}

function rotate90(shape) {
  const rows = shape.length;
  const cols = shape[0].length;

  const result = Array.from({ length: cols }, () =>
    Array(rows).fill(0)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = shape[r][c];
    }
  }

  return result;
}

function trimShape(shape) {
  // ตัด row ว่างบน/ล่าง
  let top = shape.findIndex(row => row.some(Boolean));
  let bottom = shape.findLastIndex(row => row.some(Boolean));
  let trimmed = shape.slice(top, bottom + 1);

  // ตัด col ว่างซ้าย/ขวา
  let left = Math.min(...trimmed.map(row => row.findIndex(Boolean)));
  let right = Math.max(...trimmed.map(row => row.findLastIndex(Boolean)));

  return trimmed.map(row => row.slice(left, right + 1));
}

export function setUnits(data) {
  units = data;
}

export function getUnits() {
  return units;
}

export function getUnit() {
  return unit;
}

export function setUnit(name) {
  unit = name;
  inventory = unit.rune_inventory;
  board.forEach((row, r) => {
    row.forEach((_, c) => {
      board[r][c] = 0;
    });
});
}

export function resetAll() {
  board.forEach((row, r) => {
    row.forEach((_, c) => {
      board[r][c] = 0;
    });
});
pieces = [];
holdingPiece = null;
holdingRune = null;
hoverRow = -1;
hoverCol = -1;
renderHoldingRune();
renderStats(0, 0);
}
