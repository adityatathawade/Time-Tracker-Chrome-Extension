let isTracking = false;
let timerInterval = null;

function startTimer() {
  if (!isTracking) {
    isTracking = true;
    chrome.runtime.sendMessage({ action: 'startTimer' }, function(response) {
      if (response && response.status === 'Timer started') {
        timerInterval = setInterval(updateTimerDisplay, 1000);
      }
    });
  }
}

function stopTimer() {
  if (isTracking) {
    isTracking = false;
    chrome.runtime.sendMessage({ action: 'stopTimer' }, function(response) {
      if (response && response.status === 'Timer stopped') {
        clearInterval(timerInterval);
      }
    });
  }
}

function updateTimerDisplay() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      let tabId = tabs[0].id;

      chrome.storage.local.get(['tabTimes'], function(result) {
        let tabTimes = result.tabTimes || {};
        if (tabTimes[tabId]) {
          let totalTime = tabTimes[tabId].time;
          let seconds = totalTime % 60;
          let minutes = Math.floor(totalTime / 60) % 60;
          let hours = Math.floor(totalTime / 3600);
          document.getElementById("timer").textContent = `${hours}h ${minutes}m ${seconds}s`;
        } else {
          document.getElementById("timer").textContent = `0h 0m 0s`;
        }
      });
    }
  });
}

function resetData() {
  chrome.storage.local.set({ 'tabTimes': {}, 'isTracking': false }, function() {
    isTracking = false;
    chrome.runtime.sendMessage({ action: 'stopTimer' });
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = '0h 0m 0s';
    alert('Data has been reset.');
  });
}

document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("stopBtn").addEventListener("click", stopTimer);
document.getElementById("analyticsBtn").addEventListener("click", function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("analytics.html") });
});
document.getElementById("resetBtn").addEventListener("click", resetData);

// Load the initial state and update the timer display
chrome.storage.local.get(['isTracking'], function(result) {
  if (result.isTracking) {
    startTimer();
  } else {
    updateTimerDisplay();
  }
});
