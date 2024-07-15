let timerInterval = null;
let isTracking = false;

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ 'tabTimes': {}, 'isTracking': false });
});

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get(['isTracking'], function(result) {
    isTracking = result.isTracking;
    if (isTracking) {
      startTimer();
    }
  });
});

function startTimer() {
  if (!isTracking) {
    isTracking = true;
    timerInterval = setInterval(updateTimer, 1000);
    chrome.storage.local.set({ 'isTracking': true });
  }
}

function stopTimer() {
  if (isTracking) {
    isTracking = false;
    clearInterval(timerInterval);
    chrome.storage.local.set({ 'isTracking': false });
  }
}

function updateTimer() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      let tab = tabs[0];
      let tabId = tab.id;

      chrome.storage.local.get(['tabTimes'], function(result) {
        let tabTimes = result.tabTimes || {};
        if (!tabTimes[tabId]) {
          tabTimes[tabId] = { time: 0, title: tab.title };
        }
        tabTimes[tabId].time += 1;
        tabTimes[tabId].title = tab.title;  // Update title every second to handle title changes
        chrome.storage.local.set({ 'tabTimes': tabTimes });
      });
    }
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'startTimer') {
    startTimer();
    sendResponse({ status: 'Timer started' });
  } else if (request.action === 'stopTimer') {
    stopTimer();
    sendResponse({ status: 'Timer stopped' });
  }
  return true;
});
