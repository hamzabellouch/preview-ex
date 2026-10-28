// sidepanel.js - Pure Edge-to-Edge Webpage Loader for Slide Bar (Firefox Version)

(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  let currentUrl = "";

  const iframe = document.getElementById("sp-iframe");
  const loader = document.getElementById("sp-loader");
  const emptyState = document.getElementById("sp-empty-state");

  function getSessionStore() {
    return (api.storage && api.storage.session) ? api.storage.session : api.storage.local;
  }

  async function init() {
    // 1. Check if there is an active preview URL in storage
    try {
      const store = getSessionStore();
      const data = await store.get("currentPreviewUrl");
      if (data && data.currentPreviewUrl) {
        loadUrl(data.currentPreviewUrl);
      }
    } catch (e) {
      console.warn("Could not retrieve initial preview URL:", e);
    }

    bindEvents();
  }

  function bindEvents() {
    // Listen for direct runtime messages from context menu or shortcuts
    api.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "SIDEPANEL_LOAD_URL" && message.url) {
        loadUrl(message.url);
        sendResponse({ success: true });
      }
    });

    // Sync across tabs/windows via storage listener (session or local)
    if (api.storage && api.storage.onChanged) {
      api.storage.onChanged.addListener((changes, area) => {
        if ((area === "session" || area === "local") && changes.currentPreviewUrl?.newValue) {
          loadUrl(changes.currentPreviewUrl.newValue);
        }
      });
    }

    // Hide loader once the iframe has completed loading
    if (iframe) {
      iframe.addEventListener("load", () => {
        if (loader) loader.classList.add("sp-hidden");
      });

      iframe.addEventListener("error", () => {
        if (loader) loader.classList.add("sp-hidden");
      });
    }
  }

  // Load URL into Viewport
  function loadUrl(url) {
    if (!url) return;
    currentUrl = url;
    if (emptyState) emptyState.style.display = "none";
    if (loader) loader.classList.remove("sp-hidden");
    if (iframe) iframe.src = url;
  }

  init();
})();
