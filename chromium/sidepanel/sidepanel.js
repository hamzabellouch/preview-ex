// sidepanel.js - Pure Edge-to-Edge Webpage Loader for Slide Bar

(() => {
  let currentUrl = "";

  const iframe = document.getElementById("sp-iframe");
  const loader = document.getElementById("sp-loader");
  const emptyState = document.getElementById("sp-empty-state");

  async function init() {
    // 1. Check if there is an active preview URL in storage
    const data = await chrome.storage.session.get("currentPreviewUrl");
    if (data.currentPreviewUrl) {
      loadUrl(data.currentPreviewUrl);
    }

    bindEvents();
  }

  function bindEvents() {
    // Listen for direct runtime messages from context menu or shortcuts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "SIDEPANEL_LOAD_URL" && message.url) {
        loadUrl(message.url);
        sendResponse({ success: true });
      }
    });

    // Sync across tabs/windows via session storage
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "session" && changes.currentPreviewUrl?.newValue) {
        loadUrl(changes.currentPreviewUrl.newValue);
      }
    });

    // Hide loader once the iframe has completed loading
    iframe.addEventListener("load", () => {
      loader.classList.add("sp-hidden");
    });

    iframe.addEventListener("error", () => {
      loader.classList.add("sp-hidden");
    });
  }

  // Load URL into Viewport
  function loadUrl(url) {
    if (!url) return;
    currentUrl = url;
    if (emptyState) emptyState.style.display = "none";
    loader.classList.remove("sp-hidden");
    iframe.src = url;
  }

  init();
})();
