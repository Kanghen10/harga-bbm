const DATA_URL = "datahargabbm.txt";

let rawData = [];
let currentType = 0;

const titleEl = document.getElementById("title");
const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");
const searchInput = document.getElementById("search");
const typeSelect = document.getElementById("typeSelect");

function getTodayDate() {
  const d = new Date();
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('id-ID', options);
}

async function loadData() {
  try {
    const res = await fetch(DATA_URL);
    const text = await res.text();
    const json = JSON.parse(text);

    const content = json.data.content;

    let productTable = null;
    for (let key in content) {
      if (content[key].type?.resolvedName === "ProductTable") {
        productTable = content[key].props.items;
        break;
      }
    }

    rawData = productTable;

    titleEl.innerText = "Update per tanggal " + getTodayDate();

    renderTable();

  } catch (err) {
    titleEl.innerText = "Gagal load data (cek datahargabbm.txt)";
    console.error(err);
  }
}

function renderTable() {
  const selected = rawData[currentType];
  if (!selected) return;

  const data = selected.data;
  const keys = Object.keys(data[0]);

  thead.innerHTML = "<tr>" + keys.map(k => `<th>${formatHeader(k)}</th>`).join("") + "</tr>";

  renderRows(data);
}

function renderRows(data) {
  const keyword = searchInput.value.toLowerCase();
  tbody.innerHTML = "";

  data.forEach(row => {
    if (!row.WILAYAH.toLowerCase().includes(keyword)) return;

    let tr = "<tr>";
    Object.values(row).forEach(val => {
      tr += `<td>${val}</td>`;
    });
    tr += "</tr>";

    tbody.innerHTML += tr;
  });
}

function formatHeader(key) {
  if (key === "WILAYAH") return "Wilayah";

  if (key.includes("turbo")) return "Turbo";
  if (key.includes("green")) return "Green 95";
  if (key.includes("pertamax.png")) return "Pertamax";
  if (key.includes("pertalite")) return "Pertalite";
  if (key.includes("dex.png")) return "Dex";
  if (key.includes("dexlite")) return "Dexlite";
  if (key.includes("bio")) return "Bio Solar";

  return "BBM";
}

/* EVENT */
searchInput.addEventListener("input", renderTable);

typeSelect.addEventListener("change", (e) => {
  currentType = parseInt(e.target.value);
  renderTable();
});

/* INIT */
loadData();