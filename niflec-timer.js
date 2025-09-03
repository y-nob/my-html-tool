let currentCup = 0;
let timer = null;
let remainingSeconds = 0;
let isPaused = false;

const cupDisplay = document.getElementById("cupDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const logBody = document.getElementById("logBody");

// 各杯の服用間隔（分）
function getIntervalMinutes(cup) {
  if (cup === 1 || cup === 2) return 15;
  if (cup >= 3 && cup <= 12) return 10;
  return 0;
}

// スタート処理
function startTimer() {
  if (currentCup >= 12) return;

  if (isPaused && remainingSeconds > 0) {
    isPaused = false;
    runCountdown();
    return;
  }

  currentCup++;
  const interval = getIntervalMinutes(currentCup);

  if (interval === 0) {
    startTimer(); // スキップ杯（定義なし）を飛ばす
    return;
  }

  remainingSeconds = interval * 60;
  logCupStart(currentCup);
  updateDisplay();
  runCountdown();
}

// カウントダウン処理
function runCountdown() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(timer);
      if (currentCup < 12) {
        startTimer();
      } else {
        cupDisplay.textContent = "服用完了 🎉";
        timeDisplay.textContent = "お疲れさまでした！";
        progressBar.value = 0;
      }
      return;
    }

    remainingSeconds--;
    updateDisplay();
  }, 1000);
}

// 一時停止
function pauseTimer() {
  isPaused = true;
  clearInterval(timer);
}

// リセット
function resetTimer() {
  clearInterval(timer);
  currentCup = 0;
  remainingSeconds = 0;
  isPaused = false;
  cupDisplay.textContent = "現在：未開始";
  timeDisplay.textContent = "残り時間：--:--";
  progressBar.value = 0;
  logBody.innerHTML = "";
}

// 表示更新
function updateDisplay() {
  cupDisplay.textContent = `現在：第${currentCup}杯目`;
  const min = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  timeDisplay.textContent = `残り時間：${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const interval = getIntervalMinutes(currentCup) * 60;
  const progress = (remainingSeconds / interval) * 100;
  progressBar.value = progress;
}

// タイムスタンプ生成
function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}:${sec}`;
}

// 表に行追加
function addLogRow(label, timestamp) {
  const row = document.createElement("tr");

  const labelCell = document.createElement("td");
  labelCell.textContent = label;
  labelCell.style.border = "1px solid #999";
  labelCell.style.padding = "6px";

  const timeCell = document.createElement("td");
  timeCell.textContent = timestamp;
  timeCell.style.border = "1px solid #999";
  timeCell.style.padding = "6px";

  row.appendChild(labelCell);
  row.appendChild(timeCell);
  logBody.appendChild(row);
}

// 服用開始ログ
function logCupStart(cupNumber) {
  const timestamp = getTimestamp();
  addLogRow(`${cupNumber}杯目開始`, timestamp);
}

// 排便ログ
function recordDefecation() {
  const timestamp = getTimestamp();
  addLogRow("排便", timestamp);
}

// CSV出力
function exportCSV() {
  const rows = Array.from(logBody.querySelectorAll("tr"));
  if (rows.length === 0) {
    alert("ログがありません。");
    return;
  }

  let csvContent = "イベント,日時\n";

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const event = cells[0].textContent.replace(/"/g, '""');
    const time = cells[1].textContent.replace(/"/g, '""');
    csvContent += `"${event}","${time}"\n`;
  });

  // BOM（Byte Order Mark）を先頭に追加
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "niflec_log.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

