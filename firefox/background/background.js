// background.js - Firefox Background Script for Link Preview Extension
// Optimized for Mozilla Firefox Manifest V3 & Gecko WebExtensions

const api = typeof browser !== "undefined" ? browser : chrome;

// Helper to access session storage with fallback to local storage
function getSessionStore() {
  return (api.storage && api.storage.session) ? api.storage.session : api.storage.local;
}

api.runtime.onInstalled.addListener(async () => {
  // Clear any existing context menus first to avoid duplicate IDs
  api.contextMenus.removeAll(() => {
    // Two direct options for links: "Open in Popup" and "Open in Slide Bar"
    api.contextMenus.create({
      id: "open-in-popup",
      title: "Open in Popup",
      contexts: ["link"]
    });

    api.contextMenus.create({
      id: "open-in-slidebar",
      title: "Open in Slide Bar",
      contexts: ["link"]
    });
  });

  // Default settings in storage
  try {
    const existing = await api.storage.local.get("settings");
    if (!existing || !existing.settings) {
      await api.storage.local.set({
        settings: {
          theme: "default",
          enableBlurBackdrop: true,
          enableReaderMode: false
        },
        history: []
      });
    }
  } catch (err) {
    console.error("Storage init error:", err);
  }
});

// In Firefox, clicking the toolbar action icon toggles or opens the Slide Bar
if (api.action && api.action.onClicked) {
  api.action.onClicked.addListener(async () => {
    if (api.sidebarAction) {
      try {
        if (api.sidebarAction.toggle) {
          await api.sidebarAction.toggle();
        } else if (api.sidebarAction.open) {
          await api.sidebarAction.open();
        }
      } catch (err) {
        console.warn("sidebarAction toggle error:", err);
      }
    }
  });
}

// Context Menu Click Handling (Strictly for links)
api.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.linkUrl || !tab || !tab.id) return;

  const targetUrl = info.linkUrl;

  if (info.menuItemId === "open-in-slidebar") {
    // Firefox: Open sidebar directly inside user action handler!
    if (api.sidebarAction && api.sidebarAction.open) {
      api.sidebarAction.open().catch((err) => {
        console.warn("sidebarAction.open error:", err);
      });
    }

    // Async state update in background
    (async () => {
      try {
        const store = getSessionStore();
        await store.set({
          currentPreviewUrl: targetUrl,
          currentPreviewTimestamp: Date.now()
        });
        await saveToHistory(targetUrl, tab.title || "Page");

        api.runtime.sendMessage({
          action: "SIDEPANEL_LOAD_URL",
          url: targetUrl
        }).catch(() => {});
      } catch (err) {
        console.error("Failed to update preview state:", err);
      }
    })();

  } else if (info.menuItemId === "open-in-popup") {
    openModalInTab(tab.id, targetUrl);
    saveToHistory(targetUrl, tab.title || "Page");
  }
});

// Helper: Open Floating Popup Modal in the active tab (with injection fallback)
async function openModalInTab(tabId, url) {
  try {
    const res = await api.tabs.sendMessage(tabId, {
      action: "SHOW_LINK_PREVIEW_MODAL",
      url: url
    });
    if (res?.success) return;
  } catch (err) {
    console.log("Direct message failed, injecting script into tab...", err);
  }

  // Fallback: dynamically inject content script & css
  try {
    if (api.scripting) {
      await api.scripting.executeScript({
        target: { tabId },
        files: ["content/content.js"]
      });
      await api.scripting.insertCSS({
        target: { tabId },
        files: ["content/content.css"]
      });

      await new Promise((resolve) => setTimeout(resolve, 60));

      await api.tabs.sendMessage(tabId, {
        action: "SHOW_LINK_PREVIEW_MODAL",
        url: url
      });
    }
  } catch (injectErr) {
    console.error("Could not inject or show modal in tab:", injectErr);
  }
}

// Runtime Message Listener
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SWITCH_TO_SIDEPANEL") {
    // Attempt to open sidebar if possible
    if (api.sidebarAction && api.sidebarAction.open) {
      api.sidebarAction.open().catch((err) => {
        console.log("sidebarAction.open notice (may require user gesture):", err);
      });
    }

    // Perform async storage and state updates
    (async () => {
      try {
        const store = getSessionStore();
        await store.set({
          currentPreviewUrl: message.url,
          currentPreviewTimestamp: Date.now()
        });
        await saveToHistory(message.url, sender.tab?.title || "Page");

        api.runtime.sendMessage({
          action: "SIDEPANEL_LOAD_URL",
          url: message.url
        }).catch(() => {});
      } catch (err) {
        console.error("Failed to update state on SWITCH_TO_SIDEPANEL:", err);
      }
    })();

    sendResponse({ success: true });
    return true;
  }

  if (message.action === "SWITCH_TO_MODAL") {
    (async () => {
      const tabs = await api.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs && tabs[0];
      if (activeTab && activeTab.id) {
        await openModalInTab(activeTab.id, message.url);
        sendResponse({ success: true });
      }
    })();
    return true;
  }

  if (message.action === "OPEN_IN_NEW_TAB") {
    (async () => {
      await api.tabs.create({ url: message.url, active: true });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === "GET_PREVIEW_URL") {
    (async () => {
      const store = getSessionStore();
      const data = await store.get("currentPreviewUrl");
      sendResponse({ url: data.currentPreviewUrl || "" });
    })();
    return true;
  }

  return true;
});

// Helper: Save link to history
async function saveToHistory(url, title) {
  try {
    const data = await api.storage.local.get("history");
    const history = Array.isArray(data.history) ? data.history : [];
    
    const newItem = {
      url,
      title: title || url,
      timestamp: Date.now()
    };
    
    const filtered = history.filter(item => item.url !== url);
    filtered.unshift(newItem);
    if (filtered.length > 50) filtered.length = 50;

    await api.storage.local.set({ history: filtered });
  } catch (e) {
    console.error("Failed to save history:", e);
  }
}
