window.onload = () => {
  const searchBtn = document.getElementById('searchBtn');
  const status = document.getElementById('status');
  const spinner = document.getElementById('spinner');
  const result = document.getElementById('result');

  searchBtn.addEventListener('click', () => {
    const folder = document.getElementById('folder').value;
    const focal = document.getElementById('focal').value;

    status.textContent = "ステータス: 検索中…";
    spinner.classList.remove("hidden");
    result.textContent = "";
    searchBtn.disabled = true;

    window.exifAPI.searchByFocalLength(folder, focal, (response) => {
      spinner.classList.add("hidden");
      searchBtn.disabled = false;

      if (response.error) {
        status.textContent = "ステータス: エラー";
        result.textContent = response.error;
      } else {
        status.textContent = "ステータス: 完了";
        result.textContent = response.result || "一致するファイルがありませんでした。";
      }
    });
  });
};