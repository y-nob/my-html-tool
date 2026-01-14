function calculate() {
  const target = parseFloat(document.getElementById('target').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const resultDiv = document.getElementById('result');

  if (isNaN(target) || isNaN(weight) || target <= 0 || weight <= 0) {
    resultDiv.innerHTML = "<div class='result'>正しい数値を入力してください。</div>";
    return;
  }

  const requiredSalt = (target / 100) * weight;

  const seasonings = {
    salt: { label: "塩", saltRatio: 1.0, unit: "g" },
    soy_sauce: { label: "濃口醤油", saltRatio: 2.5 / 15, unit: "ml" },
    hondashi: { label: "ほんだし", saltRatio: 0.40, unit: "g" },
    garasoup: { label: "丸鶏がらスープ", saltRatio: 1.2 / 2.5, unit: "g" },
    consomme: { label: "味の素コンソメ顆粒", saltRatio: 2.4 / 5.3, unit: "g" },
    tsuyu: { label: "つゆの素", saltRatio: 11.2 / 100, unit: "ml" },
    spice21: { label: "スパイス21", saltRatio: 50.8 / 100, unit: "g" },
    all_seasoning: { label: "オールシーズニング", saltRatio: 73.9 / 100, unit: "g" }
  };

  let tableHTML = `<table>
    <thead>
      <tr><th>調味料</th><th>使用量</th><th>単位</th><th>ブレンド選択</th><th>ブレンド比率</th></tr>
    </thead>
    <tbody>`;

  for (const key in seasonings) {
    const { label, saltRatio, unit } = seasonings[key];
    const amount = requiredSalt / saltRatio;
    tableHTML += `
      <tr>
        <td>${label}</td>
        <td>${amount.toFixed(2)}</td>
        <td>${unit}</td>
        <td><input type="checkbox" class="blend-check" data-key="${key}"></td>
        <td><input type="number" class="blend-ratio" data-key="${key}" disabled></td>
      </tr>`;
  }

  tableHTML += `</tbody></table>
    <button onclick="calculateBlend()">ブレンド使用量を計算</button>`;

  resultDiv.innerHTML = tableHTML;

  // チェックボックス連動で入力欄を有効化
  document.querySelectorAll('.blend-check').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const key = checkbox.dataset.key;
      const ratioInput = document.querySelector(`.blend-ratio[data-key="${key}"]`);
      ratioInput.disabled = !checkbox.checked;
      if (!checkbox.checked) ratioInput.value = '';
    });
  });
}

function calculateBlend() {
  const target = parseFloat(document.getElementById('target').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const requiredSalt = (target / 100) * weight;

  const seasonings = {
    salt: { label: "塩", saltRatio: 1.0, unit: "g" },
    soy_sauce: { label: "濃口醤油", saltRatio: 2.5 / 15, unit: "ml" },
    hondashi: { label: "ほんだし", saltRatio: 0.40, unit: "g" },
    garasoup: { label: "丸鶏がらスープ", saltRatio: 1.2 / 2.5, unit: "g" },
    consomme: { label: "味の素コンソメ顆粒", saltRatio: 2.4 / 5.3, unit: "g" },
    tsuyu: { label: "つゆの素", saltRatio: 11.2 / 100, unit: "ml" },
    spice21: { label: "スパイス21", saltRatio: 50.8 / 100, unit: "g" },
    all_seasoning: { label: "オールシーズニング", saltRatio: 73.9 / 100, unit: "g" }
  };

  const selected = [];
  let totalRatio = 0;

  document.querySelectorAll('.blend-check').forEach(checkbox => {
    if (checkbox.checked) {
      const key = checkbox.dataset.key;
      const ratioInput = document.querySelector(`.blend-ratio[data-key="${key}"]`);
      const ratio = parseFloat(ratioInput.value);
      if (!isNaN(ratio) && ratio > 0) {
        selected.push({ key, ratio });
        totalRatio += ratio;
      }
    }
  });

  if (selected.length === 0 || totalRatio === 0) {
    alert("有効なブレンド比率を入力してください。");
    return;
  }

  // 表形式で出力
  let blendTable = `<h3>🧪ブレンド使用量</h3>
    <table>
      <thead>
        <tr><th>調味料</th><th>使用量</th><th>単位</th><th>比率</th></tr>
      </thead>
      <tbody>`;

  selected.forEach(({ key, ratio }) => {
    const { label, saltRatio, unit } = seasonings[key];
    const saltShare = requiredSalt * (ratio / totalRatio);
    const amount = saltShare / saltRatio;
    blendTable += `<tr>
      <td>${label}</td>
      <td>${amount.toFixed(2)}</td>
      <td>${unit}</td>
      <td>${ratio}</td>
    </tr>`;
  });

  blendTable += `</tbody></table>`;

  document.getElementById('result').insertAdjacentHTML('beforeend', blendTable);
}
