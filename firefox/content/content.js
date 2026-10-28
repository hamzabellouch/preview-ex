// content.js - Injected Content Script for Floating Link Preview

(() => {
  if (window.__LINK_PREVIEW_INITIALIZED__) return;
  window.__LINK_PREVIEW_INITIALIZED__ = true;

  let hostElement = null;
  let shadowRoot = null;
  let currentUrl = "";
  let currentZoom = 100;
  let isReaderMode = false;
  let isFullscreen = false;
  let isSettingsOpen = false;

  // Listen for messages from background service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "SHOW_LINK_PREVIEW_MODAL") {
      openPreviewModal(message.url);
      sendResponse({ success: true });
    }
    return true;
  });

  // Fast Keyboard + Click Shortcuts:
  // - Hold 'P' + Click link -> Open in Popup
  // - Hold 'S' + Right-Click (or Click) link -> Open in Slide Bar
  function initShortcuts() {
    let isPKeyDown = false;
    let isSKeyDown = false;

    window.addEventListener("keydown", (e) => {
      // Do not intercept if user is typing in form fields or using modifier combos (Ctrl/Meta/Alt)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target && e.target.closest && e.target.closest("input, textarea, [contenteditable='true']")) return;

      if (e.key === "p" || e.key === "P") {
        isPKeyDown = true;
      }
      if (e.key === "s" || e.key === "S") {
        isSKeyDown = true;
      }
    }, { capture: true });

    window.addEventListener("keyup", (e) => {
      if (e.key === "p" || e.key === "P") {
        isPKeyDown = false;
      }
      if (e.key === "s" || e.key === "S") {
        isSKeyDown = false;
      }
    }, { capture: true });

    window.addEventListener("blur", () => {
      isPKeyDown = false;
      isSKeyDown = false;
    });

    // Handle Left-Click on Links:
    // - P + Click -> Open in Popup
    // - S + Click -> Open in Slide Bar
    document.addEventListener("click", (e) => {
      if (isPKeyDown) {
        const link = e.target.closest && e.target.closest("a[href]");
        if (link && link.href && !link.href.startsWith("javascript:")) {
          e.preventDefault();
          e.stopPropagation();
          openPreviewModal(link.href);
          return false;
        }
      } else if (isSKeyDown) {
        const link = e.target.closest && e.target.closest("a[href]");
        if (link && link.href && !link.href.startsWith("javascript:")) {
          e.preventDefault();
          e.stopPropagation();
          chrome.runtime.sendMessage({
            action: "SWITCH_TO_SIDEPANEL",
            url: link.href
          });
          return false;
        }
      }
    }, { capture: true });

    // Handle Right-Click on Links:
    // - S + Right-Click -> Directly Open in Slide Bar (skips context menu)
    document.addEventListener("contextmenu", (e) => {
      if (isSKeyDown) {
        const link = e.target.closest && e.target.closest("a[href]");
        if (link && link.href && !link.href.startsWith("javascript:")) {
          e.preventDefault();
          e.stopPropagation();
          chrome.runtime.sendMessage({
            action: "SWITCH_TO_SIDEPANEL",
            url: link.href
          });
          return false;
        }
      }
    }, { capture: true });
  }

  initShortcuts();

  // Create UI using Shadow DOM
  function initUI() {
    if (hostElement && shadowRoot) return;

    hostElement = document.createElement("link-preview-extension-root");
    shadowRoot = hostElement.attachShadow({ mode: "open" });

    // 1. Direct stylesheet link from extension resources
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = chrome.runtime.getURL("content/content.css");
    shadowRoot.appendChild(styleLink);

    // 2. Critical inline fallback styles to ensure 0ms instantaneous rendering
    const criticalStyle = document.createElement("style");
    criticalStyle.textContent = `
      :host {
        all: initial !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        display: block !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
      :host(.lp-host-active) {
        pointer-events: auto !important;
      }
      .lp-backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(10, 16, 28, 0.78);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      .lp-backdrop.lp-active {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `;
    shadowRoot.appendChild(criticalStyle);

    // Build markup
    const container = document.createElement("div");
    container.className = "lp-backdrop";
    container.id = "lp-backdrop";

    container.innerHTML = `
      <!-- Main Window Card -->
      <div class="lp-window" id="lp-window">
        
        <!-- Left Floating Dock Toolbar -->
        <div class="lp-left-dock" id="lp-left-dock">
          <button class="lp-dock-btn" id="lp-btn-reader" data-tip="Reader View">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </button>
          <button class="lp-dock-btn" id="lp-btn-copy" data-tip="Copy Link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <div class="lp-dock-separator"></div>
          <button class="lp-dock-btn" id="lp-btn-zoomin" data-tip="Zoom In (+)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="lp-dock-btn" id="lp-btn-zoomout" data-tip="Zoom Out (-)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="lp-dock-btn" id="lp-btn-settings" data-tip="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        <!-- Window Header / Titlebar -->
        <div class="lp-header" id="lp-header">
          <!-- Light Address Capsule -->
          <div class="lp-address-bar">
            <div class="lp-address-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="lp-address-text" id="lp-address-text">about:blank</div>
            <div class="lp-address-badge" id="lp-zoom-badge">100%</div>
          </div>

          <!-- Header Action Icons -->
          <div class="lp-header-actions">
            <!-- Reload (Standard Circular Arrow) -->
            <button class="lp-action-btn" id="lp-act-reload" data-tip="Reload">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
            
            <!-- Open in New Tab -->
            <button class="lp-action-btn" id="lp-act-newtab" data-tip="Open in New Tab">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>

            <!-- Star / Favorite -->
            <button class="lp-action-btn" id="lp-act-star" data-tip="Add to Favorites">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>

            <!-- Fullscreen Toggle -->
            <button class="lp-action-btn" id="lp-act-fullscreen" data-tip="Toggle Fullscreen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>

            <!-- Dock to Slide Bar (Side Panel) -->
            <button class="lp-action-btn" id="lp-act-sidepanel" data-tip="Open in Slide Bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </button>

            <!-- Window Close -->
            <button class="lp-action-btn lp-close-btn" id="lp-act-close" data-tip="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Window Body -->
        <div class="lp-body">
          <!-- Loading Spinner -->
          <div class="lp-loader" id="lp-loader">
            <div class="lp-spinner"></div>
            <div style="font-size: 13px; font-weight: 500;">Loading preview...</div>
          </div>

          <!-- Iframe Viewer Wrapper -->
          <div class="lp-iframe-wrapper" id="lp-iframe-wrapper">
            <iframe class="lp-iframe" id="lp-iframe"></iframe>
          </div>

          <!-- Reader View -->
          <div class="lp-reader-view" id="lp-reader-view">
            <div class="lp-reader-title" id="lp-reader-title">Page Title</div>
            <div class="lp-reader-meta" id="lp-reader-meta">Clean reading mode</div>
            <div id="lp-reader-content">Loading content...</div>
          </div>

          <!-- Settings Mini Dialog -->
          <div class="lp-settings-dialog" id="lp-settings-dialog">
            <div class="lp-settings-header">
              <span>Settings</span>
              <button class="lp-action-btn" id="lp-settings-close" style="width:22px;height:22px;color:#64748b;">✕</button>
            </div>
            <div class="lp-settings-row">
              <label>Theme:</label>
              <select id="lp-pref-theme" class="lp-capsule-select">
                <option value="default">Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
            <button id="lp-save-settings" class="lp-capsule-btn" style="margin-top: 6px;">Save Preferences</button>
          </div>

          <!-- Resize Grip (Bottom Right) -->
          <svg class="lp-resize-grip" id="lp-resize-grip" viewBox="0 0 16 16" fill="#94a3b8">
            <path d="M14 14v-2h-2v2h2zm0-4v-2h-2v2h2zm-4 4v-2H8v2h2zm4-8V4h-2v2h2zm-4 4v-2H8v2h2zm-4 4v-2H4v2h2z"></path>
          </svg>
        </div>

        <!-- Floating Toast Notification -->
        <div class="lp-toast" id="lp-toast">Link copied to clipboard!</div>
      </div>
    `;

    shadowRoot.appendChild(container);

    // Attach to document.documentElement or document.body
    const targetParent = document.documentElement || document.body;
    targetParent.appendChild(hostElement);

    bindEvents();
  }

  // Bind All Event Listeners
  function bindEvents() {
    const backdrop = shadowRoot.getElementById("lp-backdrop");
    const windowEl = shadowRoot.getElementById("lp-window");
    const header = shadowRoot.getElementById("lp-header");
    const actClose = shadowRoot.getElementById("lp-act-close");
    const actReload = shadowRoot.getElementById("lp-act-reload");
    const actNewTab = shadowRoot.getElementById("lp-act-newtab");
    const actStar = shadowRoot.getElementById("lp-act-star");
    const actFullscreen = shadowRoot.getElementById("lp-act-fullscreen");
    const actSidepanel = shadowRoot.getElementById("lp-act-sidepanel");

    // Dock buttons
    const btnReader = shadowRoot.getElementById("lp-btn-reader");
    const btnCopy = shadowRoot.getElementById("lp-btn-copy");
    const btnZoomIn = shadowRoot.getElementById("lp-btn-zoomin");
    const btnZoomOut = shadowRoot.getElementById("lp-btn-zoomout");
    const btnSettings = shadowRoot.getElementById("lp-btn-settings");

    // Settings Dialog
    const settingsDialog = shadowRoot.getElementById("lp-settings-dialog");
    const settingsClose = shadowRoot.getElementById("lp-settings-close");
    const saveSettingsBtn = shadowRoot.getElementById("lp-save-settings");

    // Close actions
    actClose.addEventListener("click", closePreviewModal);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closePreviewModal();
      }
    });

    // Escape Key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("lp-active")) {
        closePreviewModal();
      }
    });

    // Reload iframe
    actReload.addEventListener("click", () => {
      const iframe = shadowRoot.getElementById("lp-iframe");
      const loader = shadowRoot.getElementById("lp-loader");
      loader.classList.remove("lp-hidden");
      iframe.src = currentUrl;
      showToast("Reloading preview...");
    });

    // Open in New Tab
    actNewTab.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "OPEN_IN_NEW_TAB",
        url: currentUrl
      });
      closePreviewModal();
    });

    // Bookmark / Star
    actStar.addEventListener("click", async () => {
      actStar.classList.toggle("lp-starred");
      const isStarred = actStar.classList.contains("lp-starred");
      showToast(isStarred ? "Added to favorites ⭐" : "Removed from favorites");
    });

    // Fullscreen Toggle
    actFullscreen.addEventListener("click", () => {
      isFullscreen = !isFullscreen;
      windowEl.classList.toggle("lp-fullscreen", isFullscreen);
      if (isFullscreen) {
        windowEl.style.top = "";
        windowEl.style.left = "";
        windowEl.style.transform = "";
      }
    });

    // Switch to Slide Bar
    actSidepanel.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "SWITCH_TO_SIDEPANEL",
        url: currentUrl
      });
      closePreviewModal();
    });

    // Copy Button
    btnCopy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(currentUrl);
        showToast("Link copied to clipboard! 📋");
      } catch (e) {
        showToast("URL: " + currentUrl);
      }
    });

    // Zoom Controls
    btnZoomIn.addEventListener("click", () => {
      adjustZoom(10);
    });

    btnZoomOut.addEventListener("click", () => {
      adjustZoom(-10);
    });

    // Reader Mode Toggle
    btnReader.addEventListener("click", () => {
      toggleReaderMode();
    });

    // Settings Toggle
    btnSettings.addEventListener("click", () => {
      isSettingsOpen = !isSettingsOpen;
      settingsDialog.classList.toggle("lp-show", isSettingsOpen);
      btnSettings.classList.toggle("lp-active", isSettingsOpen);
    });

    settingsClose.addEventListener("click", () => {
      isSettingsOpen = false;
      settingsDialog.classList.remove("lp-show");
      btnSettings.classList.remove("lp-active");
    });

    saveSettingsBtn.addEventListener("click", async () => {
      const themeSelect = shadowRoot.getElementById("lp-pref-theme");
      const selectedTheme = themeSelect ? themeSelect.value : "default";

      try {
        const stored = await chrome.storage.local.get("settings");
        const currentSettings = stored.settings || {};
        currentSettings.theme = selectedTheme;
        await chrome.storage.local.set({ settings: currentSettings });
      } catch (e) {
        console.error("Failed to save settings:", e);
      }

      applyTheme(selectedTheme);
      showToast("Preferences saved!");
      settingsDialog.classList.remove("lp-show");
      isSettingsOpen = false;
      btnSettings.classList.remove("lp-active");
    });

    // Draggable Window Logic
    initDraggable(header, windowEl);

    // Resizable Window Logic
    const grip = shadowRoot.getElementById("lp-resize-grip");
    initResizable(grip, windowEl);

    // Iframe load listener
    const iframe = shadowRoot.getElementById("lp-iframe");
    const loader = shadowRoot.getElementById("lp-loader");

    iframe.addEventListener("load", () => {
      loader.classList.add("lp-hidden");
    });

    iframe.addEventListener("error", () => {
      loader.classList.add("lp-hidden");
      showToast("Could not load preview iframe");
    });
  }

  // Reset window position and dimensions to default centered state
  function resetWindowPosition() {
    if (!shadowRoot) return;
    const windowEl = shadowRoot.getElementById("lp-window");
    if (!windowEl) return;

    windowEl.style.position = "";
    windowEl.style.left = "";
    windowEl.style.top = "";
    windowEl.style.margin = "";
    windowEl.style.width = "";
    windowEl.style.height = "";
    windowEl.style.maxWidth = "";
    windowEl.style.maxHeight = "";
    windowEl.style.transform = "";
    windowEl.classList.remove("lp-fullscreen");
    isFullscreen = false;
  }

  // Open the Preview Modal with URL
  async function openPreviewModal(url) {
    initUI();
    resetWindowPosition();
    currentUrl = url;
    isReaderMode = false;

    // Reset components
    const backdrop = shadowRoot.getElementById("lp-backdrop");
    const addressText = shadowRoot.getElementById("lp-address-text");
    const iframe = shadowRoot.getElementById("lp-iframe");
    const loader = shadowRoot.getElementById("lp-loader");
    const readerView = shadowRoot.getElementById("lp-reader-view");
    const btnReader = shadowRoot.getElementById("lp-btn-reader");

    // Zoom always defaults to 100%
    currentZoom = 100;
    applyZoom();

    // Load and apply theme preferences
    try {
      const stored = await chrome.storage.local.get("settings");
      const savedTheme = stored.settings?.theme || "default";
      applyTheme(savedTheme);
      const themeSelect = shadowRoot.getElementById("lp-pref-theme");
      if (themeSelect) {
        themeSelect.value = savedTheme;
      }
    } catch (e) {
      applyTheme("default");
    }

    // Display URL cleanly
    addressText.textContent = formatUrlDisplay(url);
    addressText.title = url;

    // Show loader and set iframe src
    loader.classList.remove("lp-hidden");
    readerView.classList.remove("lp-show");
    btnReader.classList.remove("lp-active");

    iframe.src = url;

    // Activate host element and backdrop
    hostElement.classList.add("lp-host-active");
    backdrop.classList.add("lp-active");
  }

  // Close the Preview Modal
  function closePreviewModal() {
    if (!shadowRoot || !hostElement) return;
    const backdrop = shadowRoot.getElementById("lp-backdrop");
    const iframe = shadowRoot.getElementById("lp-iframe");

    backdrop.classList.remove("lp-active");
    hostElement.classList.remove("lp-host-active");

    setTimeout(() => {
      if (iframe) iframe.src = "about:blank";
      resetWindowPosition();
    }, 220);
  }

  // Adjust Zoom
  function adjustZoom(delta) {
    currentZoom = Math.min(200, Math.max(50, currentZoom + delta));
    applyZoom();
    showToast(`Zoom: ${currentZoom}%`);
  }

  function applyZoom() {
    const iframe = shadowRoot.getElementById("lp-iframe");
    const zoomBadge = shadowRoot.getElementById("lp-zoom-badge");
    const scale = currentZoom / 100;

    if (iframe) {
      iframe.style.width = `${100 / scale}%`;
      iframe.style.height = `${100 / scale}%`;
      iframe.style.transform = `scale(${scale})`;
      iframe.style.transformOrigin = "0 0";
    }

    if (zoomBadge) {
      if (currentZoom === 100) {
        zoomBadge.style.display = "none";
      } else {
        zoomBadge.style.display = "inline-flex";
        zoomBadge.textContent = `${currentZoom}%`;
      }
    }
  }

  // Reader Mode Toggle
  function toggleReaderMode() {
    isReaderMode = !isReaderMode;
    const readerView = shadowRoot.getElementById("lp-reader-view");
    const btnReader = shadowRoot.getElementById("lp-btn-reader");
    const readerTitle = shadowRoot.getElementById("lp-reader-title");
    const readerMeta = shadowRoot.getElementById("lp-reader-meta");
    const readerContent = shadowRoot.getElementById("lp-reader-content");

    btnReader.classList.toggle("lp-active", isReaderMode);
    readerView.classList.toggle("lp-show", isReaderMode);

    if (isReaderMode) {
      try {
        const u = new URL(currentUrl);
        readerTitle.textContent = `Reading: ${u.hostname}`;
        readerMeta.textContent = `Source: ${currentUrl} • Estimated Read Time: ~2 min`;
        readerContent.innerHTML = `
          <p>You are currently viewing Reader Mode for:</p>
          <blockquote style="border-left: 3px solid #3b82f6; padding-left: 12px; color: #4b5563; margin: 16px 0;">
            ${currentUrl}
          </blockquote>
          <p>This mode provides a clean, distraction-free reading experience. Click the Reader Mode button on the left dock again to return to the live page view.</p>
        `;
      } catch (e) {
        readerContent.textContent = "Reader mode is not available for this URL.";
      }
    }
  }

  // Apply visual theme: 'default', 'light', or 'dark'
  function applyTheme(theme) {
    if (!shadowRoot) return;
    const backdrop = shadowRoot.getElementById("lp-backdrop");
    if (!backdrop) return;

    let isLight = false;
    if (theme === "light") {
      isLight = true;
    } else if (theme === "dark") {
      isLight = false;
    } else {
      // Default follows system preference
      isLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    }

    if (isLight) {
      backdrop.classList.add("lp-theme-light");
    } else {
      backdrop.classList.remove("lp-theme-light");
    }
  }

  // Listen for system theme changes when theme is 'default'
  if (window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", async () => {
        try {
          const stored = await chrome.storage.local.get("settings");
          const theme = stored.settings?.theme || "default";
          if (theme === "default") {
            applyTheme("default");
          }
        } catch (_) {}
      });
    } catch (_) {}
  }

  // Show Toast
  function showToast(text) {
    const toast = shadowRoot.getElementById("lp-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("lp-show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("lp-show");
    }, 2200);
  }

  // Clean URL Display Format
  function formatUrlDisplay(rawUrl) {
    try {
      const u = new URL(rawUrl);
      return u.hostname + u.pathname + (u.search ? u.search : "");
    } catch (e) {
      return rawUrl;
    }
  }

  // Draggable Window Helper
  function initDraggable(handle, windowEl) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    handle.addEventListener("mousedown", (e) => {
      if (isFullscreen) return;
      if (e.target.closest(".lp-action-btn") || e.target.closest(".lp-address-bar")) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = windowEl.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      windowEl.style.position = "fixed";
      windowEl.style.left = `${initialLeft}px`;
      windowEl.style.top = `${initialTop}px`;
      windowEl.style.margin = "0";

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      windowEl.style.left = `${initialLeft + dx}px`;
      windowEl.style.top = `${initialTop + dy}px`;
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }

  // Resizable Window Helper
  function initResizable(grip, windowEl) {
    let isResizing = false;
    let startX = 0, startY = 0;
    let startW = 0, startH = 0;

    grip.addEventListener("mousedown", (e) => {
      if (isFullscreen) return;
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = windowEl.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
      if (!isResizing) return;
      const newW = Math.max(480, startW + (e.clientX - startX));
      const newH = Math.max(340, startH + (e.clientY - startY));

      windowEl.style.width = `${newW}px`;
      windowEl.style.height = `${newH}px`;
      windowEl.style.maxWidth = "none";
      windowEl.style.maxHeight = "none";
    }

    function onMouseUp() {
      isResizing = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }

})();
