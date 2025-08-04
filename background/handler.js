chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "updateIcon") {
    chrome.action.setBadgeText({
      text: message.status,
      tabId: sender.tab.id,
    });
  }
})

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "togglePause" });
});