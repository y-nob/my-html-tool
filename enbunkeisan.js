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
    tsuyu: { label: "つゆの素", saltRatio: 11.2 / 100, unit: "ml" },
    spice21: { label: "スパイス21", saltRatio: 50.8 / 100, unit: "g" },
    all_seasoning: { label: "オールシーズニング", saltRatio: 73.9 / 100, unit: "g" }
  };

  let tableHTML = `<table>
    <thead>
      <tr><th>調味料</th><th>使用量</th><th>単位</th></tr>
    </thead>
    <tbody>`;

  for (const key in seasonings) {
    const { label, saltRatio, unit } = seasonings[key];
    const amount = requiredSalt / saltRatio;
    tableHTML += `<tr><td>${label}</td><td>${amount.toFixed(2)}</td><td>${unit}</td></tr>`;
  }

  tableHTML += `</tbody></table>`;
  resultDiv.innerHTML = tableHTML;
}
