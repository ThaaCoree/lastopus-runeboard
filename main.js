import { createGrid , setUnits, getUnits, renderBoard, setUnit, getUnit, renderInventory, resetAll} from "./grid.js";

async function loadBoard() {
  const res = await fetch("https://lastopus-discord-service.onrender.com/get_unit");
  const data = await res.json();
  setUnits(data);
  const unit = getUnits()["Akivili"];
  setUnit(unit);
  
  renderComboBox(getUnits());
  createGrid();
  renderBoard();
  renderInventory();
}

function renderComboBox(units) {
  const select = document.getElementById("unitSelect");

  select.innerHTML = ""; // ล้างก่อน

  Object.keys(units).forEach(key => {
    const option = document.createElement("option");

    option.value = key;
    option.textContent = key;

    select.appendChild(option);
  });

  select.onchange = () => {
  const selected = select.value;

  setUnit(getUnits()[selected]);

  resetAll();
  renderBoard();
  renderInventory();
};
}

loadBoard();