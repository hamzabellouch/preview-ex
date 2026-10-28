// service-worker.js - Link Preview Background Handler

chrome.runtime.onInstalled.addListener(async () => {
  // Clear any existing context menus first to avoid duplicate IDs
  chrome.contextMenus.removeAll(() => {
    // Two direct options for links: "Open in Popup" and "Open in Slide Bar"
    chrome.contextMenus.create({
      id: "open-in-popup",
      title: "Open in Popup",
      contexts: ["link"]
    });

    chrome.contextMenus.create({
      id: "open-in-slidebar",
      title: "Open in Slide Bar",
      contexts: ["link"]
    });
  });

  // Ensure clicking the toolbar action icon does NOTHING
  if (chrome.sidePanel?.setPanelBehavior) {
    try {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    } catch (e) {
      console.warn("setPanelBehavior error:", e);
    }
  }

  // Default settings in storage
  const existing = await chrome.storage.local.get("settings");
  if (!existing.settings) {
    await chrome.storage.local.set({
      settings: {
        theme: "default",
        enableBlurBackdrop: true,
        enableReaderMode: false
      },
      history: []
    });
  }
});

// Context Menu Click Handling (Strictly for links)
// IMPORTANT: chrome.sidePanel.open MUST be called synchronously with NO preceding await
// to preserve Chrome's transient user activation gesture!
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.linkUrl || !tab || !tab.id) return;

  const targetUrl = info.linkUrl;

  if (info.menuItemId === "open-in-slidebar") {
    // Immediately call sidePanel.open with NO await preceding it!
    if (chrome.sidePanel?.open) {
      chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
        console.warn("sidePanel.open tabId fallback to windowId:", err);
        if (tab.windowId) {
          chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
        }
      });
    }

    // Async state update in background
    (async () => {
      try {
        await chrome.storage.session.set({
          currentPreviewUrl: targetUrl,
          currentPreviewTimestamp: Date.now()
        });
        await saveToHistory(targetUrl, tab.title || "Page");

        chrome.runtime.sendMessage({
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

// Helper: Open Floating Popup Modal in the active tab (with robust injection fallback)
async function openModalInTab(tabId, url) {
  try {
    const res = await chrome.tabs.sendMessage(tabId, {
      action: "SHOW_LINK_PREVIEW_MODAL",
      url: url
    });
    if (res?.success) return;
  } catch (err) {
    console.log("Direct message failed, injecting script into tab...", err);
  }

  // Fallback: dynamically inject content script & css
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content/content.js"]
    });
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["content/content.css"]
    });

    await new Promise((resolve) => setTimeout(resolve, 60));

    await chrome.tabs.sendMessage(tabId, {
      action: "SHOW_LINK_PREVIEW_MODAL",
      url: url
    });
  } catch (injectErr) {
    console.error("Could not inject or show modal in tab:", injectErr);
  }
}

// Runtime Message Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SWITCH_TO_SIDEPANEL") {
    // 1. MUST call sidePanel.open IMMEDIATELY and synchronously on sender.tab.id
    // NO await before this call to preserve user gesture from the modal button click!
    if (chrome.sidePanel?.open && sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch((err) => {
        console.warn("sidePanel.open tabId fallback to windowId:", err);
        if (sender.tab.windowId) {
          chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(console.error);
        }
      });
    }

    // 2. Perform async storage and state updates in background
    (async () => {
      try {
        await chrome.storage.session.set({
          currentPreviewUrl: message.url,
          currentPreviewTimestamp: Date.now()
        });
        await saveToHistory(message.url, sender.tab?.title || "Page");

        chrome.runtime.sendMessage({
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
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.id) {
        await openModalInTab(activeTab.id, message.url);
        sendResponse({ success: true });
      }
    })();
    return true;
  }

  if (message.action === "OPEN_IN_NEW_TAB") {
    (async () => {
      await chrome.tabs.create({ url: message.url, active: true });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === "GET_PREVIEW_URL") {
    (async () => {
      const data = await chrome.storage.session.get("currentPreviewUrl");
      sendResponse({ url: data.currentPreviewUrl || "" });
    })();
    return true;
  }

  return true;
});

// Helper: Save link to history
async function saveToHistory(url, title) {
  try {
    const data = await chrome.storage.local.get("history");
    const history = Array.isArray(data.history) ? data.history : [];
    
    const newItem = {
      url,
      title: title || url,
      timestamp: Date.now()
    };
    
    const filtered = history.filter(item => item.url !== url);
    filtered.unshift(newItem);
    if (filtered.length > 50) filtered.length = 50;

    await chrome.storage.local.set({ history: filtered });
  } catch (e) {
    console.error("Failed to save history:", e);
  }
}
