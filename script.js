async function loadBBM() {
  const url = "https://kanghen10.github.io/harga-bbm/datahargabbm.txt";

  try {
    const res = await fetch(url);
    const text = await res.text();

    // FIX parsing (karena ada ":" di depan)
    const json = JSON.parse(text.replace(/^:\s*/, ''));

    const gasolineData = json.data.content.l9RNzkhMqY.props.items[0].data;
    const gasoilData = json.data.content.l9RNzkhMqY.props.items[1].data;

    const tbody = document.getElementById("bbm-body");
    const wilayahSelect = document.getElementById("filter-wilayah");
    const jenisSelect = document.getElementById("filter-jenis");
    const tableHead = document.getElementById("table-head");

    let wilayahSet = new Set();

    // gabung wilayah dari semua data
    [...gasolineData, ...gasoilData].forEach(row => {
      wilayahSet.add(row["WILAYAH"]);
    });

    wilayahSet.forEach(w => {
      let opt = document.createElement("option");
      opt.value = w;
      opt.textContent = w;
      wilayahSelect.appendChild(opt);
    });

    function render() {
      const filterWilayah = wilayahSelect.value;
      const filterJenis = jenisSelect.value;

      tbody.innerHTML = "";

      let dataSource = gasolineData;
      let mode = "GASOLINE";

      if (filterJenis === "GASOIL") {
        dataSource = gasoilData;
        mode = "GASOIL";
      }

      // update header tabel
      if (mode === "GASOIL") {
        tableHead.innerHTML = `
          <th>Wilayah</th>
          <th>Pertamina Dex</th>
          <th>Dexlite</th>
          <th>Bio Solar</th>
          <th>-</th>
        `;
      } else {
        tableHead.innerHTML = `
          <th>Wilayah</th>
          <th>Pertamax</th>
          <th>Pertalite</th>
          <th>Turbo</th>
          <th>Green</th>
        `;
      }

      dataSource.forEach(row => {
        const wilayah = row["WILAYAH"];
        if (filterWilayah !== "ALL" && wilayah !== filterWilayah) return;

        let tr = document.createElement("tr");

        if (mode === "GASOIL") {
          const dex = Object.values(row).find((v, i) => Object.keys(row)[i].includes("dex.png")) || "-";
          const dexlite = Object.values(row).find((v, i) => Object.keys(row)[i].includes("dexlite")) || "-";
          const biosolar = Object.values(row).find((v, i) => Object.keys(row)[i].includes("bio")) || "-";

          tr.innerHTML = `
            <td>${wilayah}</td>
            <td>${dex}</td>
            <td>${dexlite}</td>
            <td>${biosolar}</td>
            <td>-</td>
          `;
        } else {
          const pertamax = Object.values(row).find((v, i) => Object.keys(row)[i].includes("pertamax.png")) || "-";
          const pertalite = Object.values(row).find((v, i) => Object.keys(row)[i].includes("pertalite.png")) || "-";
          const turbo = Object.values(row).find((v, i) => Object.keys(row)[i].includes("turbo.png")) || "-";
          const green = Object.values(row).find((v, i) => Object.keys(row)[i].includes("green")) || "-";

          tr.innerHTML = `
            <td>${wilayah}</td>
            <td>${pertamax}</td>
            <td>${pertalite}</td>
            <td>${turbo}</td>
            <td>${green}</td>
          `;
        }

        tbody.appendChild(tr);
      });
    }

    wilayahSelect.addEventListener("change", render);
    jenisSelect.addEventListener("change", render);

    // tanggal hari ini
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    document.getElementById("update-info").textContent =
      "Update per " + today;

    render();

  } catch (err) {
    console.error(err);
    document.getElementById("update-info").textContent = "Gagal memuat data";
  }
}

loadBBM();