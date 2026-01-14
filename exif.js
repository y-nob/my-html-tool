const { exec } = require('child_process');

window.onload = () => {
  const searchBtn = document.getElementById('searchBtn');
  const status = document.getElementById('status');
  const spinner = document.getElementById('spinner');
  const result = document.getElementById('result');

  searchBtn.addEventListener('click', () => {
    const folder = document.getElementById('folder').value;
    const focal = document.getElementById('focal').value;

    // UI更新
    status.textContent = "ステータス: 検索中…";
    spinner.classList.remove("hidden");
    result.textContent = "";
    searchBtn.disabled = true;

    // ExifToolコマンド
    const command = `exiftool -if "$FocalLength# == ${focal}" -filename -FocalLength -r "${folder}"`;

    exec(command, (error, stdout, stderr) => {
      spinner.classList.add("hidden");
      searchBtn.disabled = false;

      if (error) {
        status.textContent = "ステータス: エラー";
        result.textContent = error.message;
        return;
      }

      if (stderr) {
        status.textContent = "ステータス: 警告あり";
        result.textContent = stderr;
        return;
      }

      status.textContent = "ステータス: 完了";
      result.textContent = stdout || "一致するファイルがありませんでした。";
    });
  });
};