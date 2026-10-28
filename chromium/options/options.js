// options.js - Link Preview Options Management

document.addEventListener("DOMContentLoaded", async () => {
  const theme = document.getElementById("opt-theme");
  const blurCheck = document.getElementById("opt-blur");
  const saveBtn = document.getElementById("opt-save-btn");
  const clearHistoryBtn = document.getElementById("opt-clear-history");
  const statusMsg = document.getElementById("opt-status-msg");

  // Load existing settings
  try {
    const data = await chrome.storage.local.get("settings");
    const s = data.settings || {};
    if (s.theme) theme.value = s.theme;
    if (typeof s.enableBlurBackdrop === "boolean") blurCheck.checked = s.enableBlurBackdrop;
  } catch (e) {
    console.error("Error loading settings:", e);
  }

  // Save Settings
  saveBtn.addEventListener("click", async () => {
    const data = await chrome.storage.local.get("settings");
    const settings = data.settings || {};
    settings.theme = theme.value;
    settings.enableBlurBackdrop = blurCheck.checked;

    await chrome.storage.local.set({ settings });
    statusMsg.textContent = "Preferences saved successfully! ✓";
    setTimeout(() => {
      statusMsg.textContent = "";
    }, 2500);
  });

  // Clear History
  clearHistoryBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear your preview history?")) {
      await chrome.storage.local.set({ history: [] });
      statusMsg.textContent = "History cleared successfully!";
      setTimeout(() => {
        statusMsg.textContent = "";
      }, 2500);
    }
  });
});
