const API_URL = "https://pertaminapatraniaga.com/api/api/v1/post/get-by-slug/page/harga-terbaru-bbm?language=en";

let rawData = [];
let currentType = 0;

const titleEl = document.getElementById("title");
const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");
const searchInput = document.getElementById("search");
const typeSelect = document.getElementById("typeSelect");

async function loadData() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();

    const content = json.data.content;
    const nodes = content;

    // cari ProductTable
    let productTable = null;
    for (let key in nodes) {
      if (nodes[key].type?.resolvedName === "ProductTable") {
        productTable = nodes[key].props.items;
        break;
      }
    }

    rawData = productTable;

    titleEl.innerText = json.data.title;

    renderTable();

  } catch (err) {
    titleEl.innerText = "Gagal load data";
    console.error(err);
  }
}

function renderTable() {
  const selected = rawData[currentType];

  if (!selected) return;

  const data = selected.data;

  // ambil header
  const keys = Object.keys(data[0]);

  // HEADER
  thead.innerHTML = "<tr>" + keys.map(k => `<th>${formatHeader(k)}</th>`).join("") + "</tr>";

  // BODY
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
searchInput.addEventListener("input", () => {
  renderTable();
});

typeSelect.addEventListener("change", (e) => {
  currentType = parseInt(e.target.value);
  renderTable();
});

/* INIT */
loadData();