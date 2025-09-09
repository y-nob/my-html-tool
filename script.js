//　塩分濃度逆算ツール
function calculate() {
  const target = parseFloat(document.getElementById('target').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const seasoning = document.getElementById('seasoning').value;
  const resultDiv = document.getElementById('result');

  if (isNaN(target) || isNaN(weight) || target <= 0 || weight <= 0) {
    resultDiv.textContent = "正しい数値を入力してください。";
    return;
  }

  const requiredSalt = (target / 100) * weight;
  let amount = 0;
  let unit = "g";

  switch (seasoning) {
    case "salt":
      amount = requiredSalt;
      break;
    case "soy_sauce":
      amount = requiredSalt / (2.5 / 15); // 0.15g salt per 0.5g
      unit = "ml";
      break;
    case "hondashi":
      amount = requiredSalt / 0.40;
      break;
    case "garasoup":
      amount = requiredSalt / (1.2 / 2.5);
      break;
    case "tsuyu":
      amount = requiredSalt / (11.2 / 100);
      unit = "ml";
      break;
  }

  const label = {
    salt: "塩",
    soy_sauce: "濃口醤油",
    hondashi: "ほんだし",
    garasoup: "丸鶏がらスープ",
    tsuyu: "つゆの素"
  };

  resultDiv.textContent = `「${label[seasoning]}」を約 ${amount.toFixed(2)} ${unit} 使用してください。`;
}

//　EV計算ツール
// 絞り値とシャッタースピードの定義
//const apertures = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32];
// 絞り値を1/3段ステップで定義
const apertures = [
  1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8,
  3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0,
  10, 11, 13, 14, 16, 18, 20, 22
];

const shutterSpeeds = [1, 2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000, 4000, 8000];

// EV値の計算式
function calculateEV(N, t, ISO) {
  return Math.round(Math.log2((N * N) / t) - Math.log2(ISO / 100));
}

// マトリクスの描画関数
// フルストップの値リスト
const fullStops = [1.0, 1.4, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16, 22];

// マトリクスの描画関数
function renderMatrix() {
  const iso = parseInt(document.getElementById("iso").value);
  const container = document.getElementById("matrix");

  if (isNaN(iso) || iso < 100 || iso > 51200) {
    container.innerHTML = "<p style='color:red;'>⚠️ ISOは100〜51200の範囲で入力してください。</p>";
    return;
  }

  let html = "<table id='evTable'><tr><th>F\\SS</th>";
  shutterSpeeds.forEach((s, colIndex) => {
    html += `<th data-col="${colIndex}">1/${s}</th>`;
  });
  html += "</tr>";

  apertures.forEach((a, rowIndex) => {
    const label = fullStops.includes(a)
      ? `<strong style="color:red;">F${a}</strong>`
      : `F${a}`;
    html += `<tr><th data-row="${rowIndex}">${label}</th>`;

    shutterSpeeds.forEach((s, colIndex) => {
      const ev = calculateEV(a, 1 / s, iso);
      html += `<td data-row="${rowIndex}" data-col="${colIndex}" onclick="highlightMatrix(this)"> ${ev} </td>`;
    });

    html += "</tr>";
  });

  html += "</table>";

  // 明るさの目安表を追加
  html += `
    <div class="ev-guide">
      <h2>■明るさの目安</h2>
      <table class="ev-table">
        <tr><th>EV値</th><th>明るさの目安</th></tr>
        <tr><td>EV16</td><td>真夏のビーチ、雪原</td></tr>
        <tr><td>EV15</td><td>快晴の屋外</td></tr>
        <tr><td>EV14</td><td>晴天の日陰</td></tr>
        <tr><td>EV13</td><td>薄日が差す屋外</td></tr>
        <tr><td>EV12</td><td>曇り空の屋外</td></tr>
        <tr><td>EV11</td><td>雨の日の屋外</td></tr>
        <tr><td>EV10</td><td>明るいショーウィンドウ</td></tr>
        <tr><td>EV9</td><td>昼間の室内（窓あり）</td></tr>
        <tr><td>EV8</td><td>エレベータ内</td></tr>
        <tr><td>EV7</td><td>体育館、ロビー</td></tr>
        <tr><td>EV6</td><td>廊下、控室</td></tr>
        <tr><td>EV5</td><td>休憩室、カフェ</td></tr>
        <tr><td>EV4</td><td>暗い室内、バー</td></tr>
        <tr><td>EV3</td><td>劇場の観客席</td></tr>
        <tr><td>EV2</td><td>映画館のスクリーン前</td></tr>
        <tr><td>EV1</td><td>日没直後の屋外</td></tr>
        <tr><td>EV0</td><td>薄明かりの部屋</td></tr>
        <tr><td>EV-1</td><td>深夜の室内照明</td></tr>
        <tr><td>EV-2</td><td>月明かりの屋外</td></tr>
        <tr><td>EV-3</td><td>おぼろ月夜</td></tr>
        <tr><td>EV-4</td><td>星空の下</td></tr>
      </table>
    </div>
  `;

  
  container.innerHTML = html;
}



function highlightMatrix(cell) {
  const table = document.getElementById("evTable");
  const rowIndex = cell.getAttribute("data-row");
  const colIndex = cell.getAttribute("data-col");
  const isActive = cell.classList.contains("active");

  // すべてのハイライトを解除
  table.querySelectorAll("td, th").forEach(el => {
    el.classList.remove("highlight-row", "highlight-col", "active");
  });

  // すでに選択されていた場合は解除だけで終了
  if (isActive) return;

  // 行と列にハイライトを追加
  table.querySelectorAll(`td[data-row="${rowIndex}"], th[data-row="${rowIndex}"]`).forEach(el => {
    el.classList.add("highlight-row");
  });
  table.querySelectorAll(`td[data-col="${colIndex}"], th[data-col="${colIndex}"]`).forEach(el => {
    el.classList.add("highlight-col");
  });

  // 選択されたセルにアクティブマーク
  cell.classList.add("active");
}

