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
      amount = requiredSalt / (2.5 / 15); // 約0.15g塩分/1ml
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
    case "spice21":
      amount = requiredSalt / (50.8 / 100);
      break;
    case "all_seasoning":
      amount = requiredSalt / (73.9 / 100);
      break;
  }

  const label = {
    salt: "塩",
    soy_sauce: "濃口醤油",
    hondashi: "ほんだし",
    garasoup: "丸鶏がらスープ",
    tsuyu: "つゆの素",
    spice21: "スパイス21",
    all_seasoning: "オールシーズニング"
  };

  resultDiv.textContent = `「${label[seasoning]}」を約 ${amount.toFixed(2)} ${unit} 使用してください。`;
}
