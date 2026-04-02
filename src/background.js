chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url?.startsWith("chrome://") || !tab.url) return;

  try {
    // Pokušavamo da pošaljemo poruku tabu
    await chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_DOM_VISION" });
  } catch (e) {
    // Ako poruka ne prođe (skripta nije učitana), ubrizgavamo je
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/index.js"],
    });

    // Čekamo trenutak da se skripta inicijalizuje i šaljemo poruku ponovo
    setTimeout(async () => {
      await chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_DOM_VISION" });
    }, 100);
  }
});
