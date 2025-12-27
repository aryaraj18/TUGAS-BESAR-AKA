let chart = null;
const REPEAT = 1500;

// ================= UTIL =================
function parseItems() {
  return document.getElementById("prices").value
    .split(",")
    .map(x => {
      const [name, price] = x.split(":");
      return { name: name?.trim(), price: parseInt(price) };
    })
    .filter(i => i.name && !isNaN(i.price));
}

function clearOutput() {
  document.getElementById("output").innerHTML = "";

  const canvas = document.getElementById("chart");

  if (chart) {
    chart.destroy();
    chart = null;
  }

  // sembunyikan dulu
  canvas.style.display = "none";
}

// ================= KOMBINASI MENU =================
function runCombination() {
  clearOutput();

  const budget = parseInt(document.getElementById("budget").value);
  const items = parseItems();
  const out = document.getElementById("output");

  if (items.length === 0) {
    out.innerHTML = "<div class='danger'>Input menu tidak valid</div>";
    return;
  }

  const results = [];
  const n = items.length;

  for (let mask = 1; mask < (1 << n); mask++) {
    let total = 0;
    let combo = [];

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        total += items[i].price;
        combo.push(items[i]);
      }
    }

    if (total <= budget) {
      results.push({ combo, total });
    }
  }

  results.sort((a, b) => b.total - a.total);

  let html = `<h3>Kombinasi Menu ≤ Rp ${budget.toLocaleString()}</h3>`;
  results.forEach((r, i) => {
    html += `
      <div class="result">
        <b>${i + 1}. ${r.combo.map(x => x.name).join(" + ")}</b><br>
        Total: Rp ${r.total.toLocaleString()}
      </div>
    `;
  });

  out.innerHTML = html;
}

// ================= ANALISIS KOMPLEKSITAS =================
function runAnalysis() {
  clearOutput();

  const budget = parseInt(document.getElementById("budget").value);
  const items = parseItems();
  const out = document.getElementById("output");

  if (items.length === 0) {
    out.innerHTML = "<div class='danger'>Input menu tidak valid</div>";
    return;
  }

  const sizes = [];
  const iterTimes = [];
  const recTimes = [];

  for (let n = 1; n <= items.length; n++) {
    const subset = items.slice(0, n);

    sizes.push(n);
    iterTimes.push(iterative(subset));
    recTimes.push(recursive(subset));
  }

  out.innerHTML = `
  <div class="result">
    <b>Algoritma Iteratif</b><br>
    Kompleksitas Waktu: <b>O(n · 2ⁿ)</b><br>
    Running Time: ${iterTimes.at(-1).toFixed(6)} ms
    <hr>
    <b>Algoritma Rekursif</b><br>
    Kompleksitas Waktu: <b>O(2ⁿ)</b><br>
    Running Time: ${recTimes.at(-1).toFixed(6)} ms
  </div>
 `;

  renderChart(sizes, iterTimes, recTimes);
}

// ================= ALGORITMA =================
function iterative(items) {
  const n = items.length;
  const start = performance.now();

  for (let r = 0; r < REPEAT; r++) {
    for (let mask = 1; mask < (1 << n); mask++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) sum += items[i].price;
      }
    }
  }

  return (performance.now() - start) / REPEAT;
}

function recursive(items) {
  const start = performance.now();

  function dfs(i) {
    if (i === items.length) return;
    dfs(i + 1);
    dfs(i + 1);
  }

  for (let r = 0; r < REPEAT; r++) dfs(0);

  return (performance.now() - start) / REPEAT;
}

// ================= GRAFIK =================
function renderChart(labels, iterData, recData) {
  const canvas = document.getElementById("chart");

  // tampilkan canvas SEKALI
  canvas.style.display = "block";

  const ctx = canvas.getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Iteratif",
          data: iterData,
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#fff",
          pointBorderWidth: 2
        },
        {
          label: "Rekursif",
          data: recData,
          borderColor: "#f5576c",
          backgroundColor: "rgba(245, 87, 108, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#f5576c",
          pointBorderColor: "#fff",
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,          
      maintainAspectRatio: true,
      aspectRatio: 2.2,
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      layout: {
        padding: {
          left: 5,
          right: 15,
          top: 10,
          bottom: 10
        }
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 15,
            color: '#4a5568',
            boxWidth: 20
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#4a5568',
            padding: 8
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#4a5568',
            padding: 8
          }
        }
      }
    }
  });
}
