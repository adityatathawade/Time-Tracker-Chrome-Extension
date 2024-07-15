function formatTime(totalSeconds) {
  let seconds = totalSeconds % 60;
  let minutes = Math.floor(totalSeconds / 60) % 60;
  let hours = Math.floor(totalSeconds / 3600);
  return `${hours}h ${minutes}m ${seconds}s`;
}

chrome.storage.local.get(['tabTimes'], function(result) {
  let tabTimes = result.tabTimes || {};
  let tbody = document.querySelector("#analyticsTable tbody");
  tbody.innerHTML = '';

  for (let tabId in tabTimes) {
    let row = document.createElement('tr');
    let titleCell = document.createElement('td');
    let timeCell = document.createElement('td');

    titleCell.textContent = tabTimes[tabId].title;
    timeCell.textContent = formatTime(tabTimes[tabId].time);

    row.appendChild(titleCell);
    row.appendChild(timeCell);
    tbody.appendChild(row);
  }
});
