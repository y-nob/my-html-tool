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
    case "ajinomoto":
      amount = requiredSalt / (0.15 / 0.5); // 0.15g salt per 0.5g
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
    ajinomoto: "味の素",
    hondashi: "ほんだし",
    garasoup: "丸鶏がらスープ",
    tsuyu: "つゆの素"
  };

  resultDiv.textContent = `「${label[seasoning]}」を約 ${amount.toFixed(2)} ${unit} 使用してください。`;
}
