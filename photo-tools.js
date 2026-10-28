// 露出・被写界深度ツール（evkeisan.js + hisyakai.html を統合）
(() => {
  "use strict";

  // ---------- データ ----------
  // 絞り値（1/3段）
  const APERTURES = [
    1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8,
    3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0,
    10, 11, 13, 14, 16, 18, 20, 22
  ];
  const FULL_STOPS = [1.0, 1.4, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16, 22];
  const SHUTTER_SPEEDS = [1, 2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000, 4000, 8000];

  const SENSORS = {
    full:  { name: "フルフレーム",         coc: 0.030, width: 36.0, height: 24.0 },
    aps_n: { name: "APS-C (Nikon/Sony)", coc: 0.020, width: 23.6, height: 15.7 },
    aps_c: { name: "APS-C (Canon)",      coc: 0.019, width: 22.3, height: 14.9 },
    mft:   { name: "MFT",                coc: 0.015, width: 17.3, height: 13.0 }
  };

  const EV_GUIDE = [
    [16, "真夏のビーチ、雪原"], [15, "快晴の屋外"], [14, "晴天の日陰"],
    [13, "薄日が差す屋外"], [12, "曇り空の屋外"], [11, "雨の日の屋外"],
    [10, "明るいショーウィンドウ"], [9, "昼間の室内（窓あり）"], [8, "エレベータ内"],
    [7, "体育館、ロビー"], [6, "廊下、控室"], [5, "休憩室、カフェ"],
    [4, "暗い室内、バー"], [3, "劇場の観客席"], [2, "映画館のスクリーン前"],
    [1, "日没直後の屋外"], [0, "薄明かりの部屋"], [-1, "深夜の室内照明"],
    [-2, "月明かりの屋外"], [-3, "おぼろ月夜"], [-4, "星空の下"]
  ];

  // ---------- 計算 ----------
  // EV（ISO換算）。丸めなし
  function exactEV(N, t, iso) {
    return Math.log2((N * N) / t) - Math.log2(iso / 100);
  }

  // 被写界深度（距離はすべてmm）
  function calcDof(f, N, s, c) {
    const H = (f * f) / (N * c) + f;          // 過焦点距離
    const near = (H * s) / (H + (s - f));     // 近点
    const denom = H - (s - f);
    const far = denom > 0 ? (H * s) / denom : Infinity; // 遠点
    return { H, near, far };
  }

  // ---------- 表示ヘルパー ----------
  const $ = (id) => document.getElementById(id);
  const fmtM = (mm) => (mm === Infinity ? "∞" : (mm / 1000).toFixed(2));
  const fmtDepth = (near, far) => (far === Infinity ? "∞" : ((far - near) / 1000).toFixed(2));
  const fmtEV = (ev) => (ev >= 0 ? String(ev) : String(ev)); // 目安表と同じ整数表記

  let selected = null; // { row, col }

  // ---------- 入力読み取り ----------
  function readInputs() {
    const sensor = SENSORS[$("sensor").value];
    return {
      iso: parseInt($("iso").value, 10),
      f: parseFloat($("focalLength").value),
      s: parseFloat($("subjectDistance").value) * 1000,
      sensor
    };
  }

  // ---------- 描画 ----------
  function render() {
    const inp = readInputs();
    const { sensor } = inp;

    $("sensorInfo").textContent =
      `許容錯乱円径 ${sensor.coc.toFixed(3)} mm ／ センサー ${sensor.width.toFixed(1)} × ${sensor.height.toFixed(1)} mm`;

    if (!(inp.f > 0) || !(inp.s > 0) || isNaN(inp.iso)) {
      $("error").textContent = "⚠️ 焦点距離と被写体距離を正しく入力してください。";
      $("matrix").innerHTML = "";
      return;
    }
    if (inp.s <= inp.f) {
      $("error").textContent = "⚠️ 被写体距離は焦点距離より大きくしてください。";
      $("matrix").innerHTML = "";
      return;
    }
    $("error").textContent = "";

    let html = "<table class='matrix' id='evTable'><thead><tr><th class='fcol'>F＼SS</th>";
    html += "<th class='dof-head'>近点(m)</th><th class='dof-head'>遠点(m)</th><th class='dof-head'>深度(m)</th>";
    SHUTTER_SPEEDS.forEach((ss, col) => {
      html += `<th data-col="${col}">1/${ss}</th>`;
    });
    html += "</tr></thead><tbody>";

    APERTURES.forEach((a, row) => {
      const label = FULL_STOPS.includes(a)
        ? `<strong style="color:red;">F${a}</strong>`
        : `F${a}`;
      const d = calcDof(inp.f, a, inp.s, sensor.coc);
      html += `<tr><th class="fcol" data-row="${row}">${label}</th>`;
      html += `<td class="dof-cell" data-row="${row}">${fmtM(d.near)}</td>`;
      html += `<td class="dof-cell" data-row="${row}">${fmtM(d.far)}</td>`;
      html += `<td class="dof-cell" data-row="${row}">${fmtDepth(d.near, d.far)}</td>`;
      SHUTTER_SPEEDS.forEach((ss, col) => {
        const ev = Math.round(exactEV(a, 1 / ss, inp.iso));
        html += `<td data-row="${row}" data-col="${col}">${ev}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";

    $("matrix").innerHTML = html;
    applySelection();
  }

  function renderGuide() {
    let html = "<tr><th>EV値</th><th>明るさの目安</th></tr>";
    EV_GUIDE.forEach(([ev, text]) => {
      html += `<tr data-ev="${ev}"><td>EV${ev}</td><td>${text}</td></tr>`;
    });
    $("evGuideTable").innerHTML = html;
  }

  // ---------- 選択 ----------
  function clearHighlight() {
    const table = $("evTable");
    if (table) {
      table.querySelectorAll(".highlight-row, .highlight-col, .active").forEach((el) => {
        el.classList.remove("highlight-row", "highlight-col", "active");
      });
    }
    document.querySelectorAll("#evGuideTable tr.highlight-guide").forEach((el) => {
      el.classList.remove("highlight-guide");
    });
  }

  function applySelection() {
    clearHighlight();
    const table = $("evTable");
    if (!selected || !table) {
      $("selection").textContent = "表のセルをタップすると、ここに詳細が表示されます。";
      return;
    }
    const { row, col } = selected;

    table.querySelectorAll(`[data-row="${row}"]`).forEach((el) => el.classList.add("highlight-row"));
    table.querySelectorAll(`th[data-col="${col}"], td[data-col="${col}"]`).forEach((el) => el.classList.add("highlight-col"));
    const cell = table.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add("active");

    // 詳細
    const inp = readInputs();
    const a = APERTURES[row];
    const ss = SHUTTER_SPEEDS[col];
    const ev = exactEV(a, 1 / ss, inp.iso);
    const evInt = Math.round(ev);
    const d = calcDof(inp.f, a, inp.s, inp.sensor.coc);
    const subjectM = inp.s / 1000;
    const nearDiff = (subjectM - d.near / 1000).toFixed(2);
    const farDiff = d.far === Infinity ? "∞" : (d.far / 1000 - subjectM).toFixed(2);

    $("selection").innerHTML = `
      <div class="sel-title">F${a}　1/${ss}秒　ISO${inp.iso}</div>
      EV ${ev.toFixed(1)}（目安表は EV${evInt}）<br>
      ピント位置 ${subjectM.toFixed(2)} m ／ 近点 ${fmtM(d.near)} m（手前 ${nearDiff} m）／ 遠点 ${fmtM(d.far)} m（奥 ${farDiff} m）<br>
      被写界深度 ${fmtDepth(d.near, d.far)} m ／ 過焦点距離 ${(d.H / 1000).toFixed(1)} m`;

    const guideRow = document.querySelector(`#evGuideTable tr[data-ev="${evInt}"]`);
    if (guideRow) guideRow.classList.add("highlight-guide");
  }

  function onMatrixClick(e) {
    const cell = e.target.closest("td[data-col]");
    if (!cell) return;
    const row = cell.dataset.row;
    const col = cell.dataset.col;
    // 同じセルを再タップで解除
    if (selected && selected.row === row && selected.col === col) {
      selected = null;
    } else {
      selected = { row, col };
    }
    applySelection();
  }

  // ---------- 初期化 ----------
  document.addEventListener("DOMContentLoaded", () => {
    renderGuide();
    ["iso", "focalLength", "subjectDistance", "sensor"].forEach((id) => {
      $(id).addEventListener("input", render);
      $(id).addEventListener("change", render);
    });
    $("matrix").addEventListener("click", onMatrixClick);
    render();
  });
})();
