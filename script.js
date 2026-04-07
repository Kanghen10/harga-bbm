const DATA_URL = "datahargabbm.txt";

let rawData = [];
let currentType = 0;

const titleEl = document.getElementById("title");
const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");
const searchInput = document.getElementById("search");
const wilayahList = document.getElementById("wilayahList");
const typeSelect = document.getElementById("typeSelect");
const bbmFilter = document.getElementById("bbmFilter");
const sortSelect = document.getElementById("sort");
const toggleTheme = document.getElementById("toggleTheme");
const refreshBtn = document.getElementById("refreshBtn");

function getTodayDate() {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

async function loadData() {
  const res = await fetch(DATA_URL);
  const json = await res.json();

  let productTable = null;

  for (let key in json.data.content) {
    if (json.data.content[key].type?.resolvedName === "ProductTable") {
      productTable = json.data.content[key].props.items;
      break;
    }
  }

  rawData = productTable;

  titleEl.innerText = "Update per tanggal " + getTodayDate();

  setupFilter();
  renderTable();
}

function setupFilter() {
  const data = rawData[currentType].data;

  wilayahList.innerHTML = "";
  wilayahList.innerHTML += `<option value="Lihat Semua">`;

  data.forEach(row => {
    wilayahList.innerHTML += `<option value="${row.WILAYAH}">`;
  });

  // BBM FILTER
  bbmFilter.innerHTML = '<option value="all">Semua BBM</option>';

  const headers = Object.keys(data[0]);
  headers.forEach(h => {
    if (h !== "WILAYAH") {
      bbmFilter.innerHTML += `<option value="${h}">${formatHeader(h)}</option>`;
    }
  });
}

refreshBtn.addEventListener("click", () => {
  refreshBtn.classList.add("spin");

  loadData();

  setTimeout(() => {
    refreshBtn.classList.remove("spin");
  }, 600);
});

function renderTable() {
  const selected = rawData[currentType];
  let data = [...selected.data];

  const keyword = searchInput.value.toLowerCase();

  if (keyword && keyword !== "lihat semua") {
    data = data.filter(r => r.WILAYAH.toLowerCase().includes(keyword));
  }

  const bbm = bbmFilter.value;

  let keys = Object.keys(data[0]);

  if (bbm !== "all") {
    keys = ["WILAYAH", bbm];
  }

  // SORT
  if (sortSelect.value !== "default") {
    data.sort((a, b) => {
      const valA = getFirstNumber(a, keys);
      const valB = getFirstNumber(b, keys);

      return sortSelect.value === "asc" ? valA - valB : valB - valA;
    });
  }
searchInput.addEventListener("change", () => {
  if (searchInput.value.toLowerCase() === "lihat semua") {
    searchInput.value = "";
  }

  renderTable();

  // ❗ HILANGKAN KURSOR + KEYBOARD
  searchInput.blur();

  // reset isi supaya bisa cari lagi
  setTimeout(() => {
    searchInput.value = "";
  }, 300);
});

  // HEADER
  thead.innerHTML = "<tr>" + keys.map(k => `<th>${formatHeader(k)}</th>`).join("") + "</tr>";

  renderRows(data, keys);
}

function renderRows(data, keys) {
  tbody.innerHTML = "";

  let numbers = [];

  data.forEach(row => {
    keys.forEach(k => {
      if (k !== "WILAYAH") {
        const val = parseInt(row[k].replace(/,/g, ""));
        if (!isNaN(val)) numbers.push(val);
      }
    });
  });

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  data.forEach(row => {
    let tr = "<tr>";

    keys.forEach(k => {
      let val = row[k];

      let num = parseInt(val?.replace(/,/g, ""));

      let cls = "";

      if (num === min) cls = "min";
      if (num === max) cls = "max";

      tr += `<td class="${cls}">${val}</td>`;
    });

    tr += "</tr>";
    tbody.innerHTML += tr;
  });
}

function getFirstNumber(row, keys) {
  for (let k of keys) {
    if (k !== "WILAYAH") {
      let n = parseInt(row[k].replace(/,/g, ""));
      if (!isNaN(n)) return n;
    }
  }
  return 0;
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

/* EVENTS */
searchInput.addEventListener("input", renderTable);
typeSelect.addEventListener("change", (e) => {
  currentType = parseInt(e.target.value);
  setupFilter();
  renderTable();
});
bbmFilter.addEventListener("change", renderTable);
sortSelect.addEventListener("change", renderTable);

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

/* INIT */
loadData();

// ❗ MATIKAN PULL TO REFRESH (ANDROID)
let startY = 0;

document.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  const y = e.touches[0].clientY;

  if (window.scrollY === 0 && y > startY) {
    e.preventDefault();
  }
}, { passive: false });