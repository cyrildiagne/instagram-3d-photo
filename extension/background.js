// Send a message to the content script when button is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {
    const message = { action: "run" };
    chrome.tabs.sendMessage(tab.id, message);
  });
  