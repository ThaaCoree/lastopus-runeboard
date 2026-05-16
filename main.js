import { createGrid , setUnits, getUnits, renderBoard, setUnit, getUnit, renderInventory, resetAll} from "./grid.js";

const UNIT_NAMES = [
  "Select",
  "Akivili",
  "Leda",
  "Pumpkin'Slayerman",
  "Acheros Aki",
  "Twelve",
  "Slafier",
  "Shiranui",
  "Four-Leaf Clover777",
  "Onebrek",
  "Christ",
  "Aard",
  "Archer",
  "Esther",
  "Yasha",
  "Voahri",
  "Scarlet"
];

async function loadBoard() {
  const firstName = UNIT_NAMES[0];
  const res = await fetch(
    `https://lastopus-discord-service.onrender.com/get_unit?name=${encodeURIComponent(firstName)}`
  );
  const data = await res.json();
  setUnit(data);

  renderComboBox();
  createGrid();
  renderBoard();
  renderInventory();
}

function renderComboBox() {
  const select = document.getElementById("unitSelect");
  select.innerHTML = "";

  UNIT_NAMES.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  select.onchange = async () => {
    const selected = select.value;
    const res = await fetch(
      `https://lastopus-discord-service.onrender.com/get_unit?name=${encodeURIComponent(selected)}`
    );
    const data = await res.json();
    setUnit(data);
    resetAll();
    renderBoard();
    renderInventory();
  };
}

loadBoard();