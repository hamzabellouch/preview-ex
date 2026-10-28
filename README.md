# Preview

A modern, lightweight, and versatile browser extension that allows you to easily preview any hyperlink before navigating to it—featuring instant floating modal previews (Popup), native edge-to-edge sidebar integration (Slide Bar), quick keyboard + click shortcuts (Hold `P` to Popup, Hold `S` to Slide Bar), dual-action context menus, reader mode, incremental zoom controls, address bar details, and iframe restriction bypass via `declarativeNetRequest`.

Compatible with all major browsers: **Chrome, Brave, Edge, Opera, Vivaldi (Chromium-based)** and **Mozilla Firefox**.



### <a name="Features"></a> ⭐ Features

- **Instant Keyboard + Click Shortcuts:**
  - **Hold `P` + Left-Click on any link:** Instantly opens the link inside a sleek, centered floating **Popup** modal over the page without leaving your current workflow.
  - **Hold `S` + Click (or Right-Click) on any link:** Instantly opens and loads the link inside the native browser **Slide Bar** (Side Panel) without navigating context menus.
- **Direct Context Menu on Hyperlinks:**
  - Right-click any hyperlink on any website to reveal two dedicated options: **Open in Popup** and **Open in Slide Bar**.
- **Left Floating Dock Toolbar (Inside Popup Modal):**
  - **📖 Reader View:** Distraction-free, clean typography mode optimized for reading articles and blog posts.
  - **📋 Copy Link:** One-click URL clipboard copying with instant toast feedback.
  - **➕ Zoom In (+):** Incremental frame zooming (110%, 125%, 150%, etc.) to inspect small text or detailed diagrams.
  - **➖ Zoom Out (-):** Decreases the zoom scale to fit more content into view.
  - **⚙️ Settings Dialog:** Rapid preferences panel to configure view modes and background blur.
- **Window Header & Navigation Bar:**
  - Light rounded address capsule showing the active URL and real-time zoom percentage badge.
  - **⚡ Reload Button:** Instantly refreshes the previewed frame.
  - **🗗 Open in New Tab:** Quickly opens the active preview URL into a new browser tab.
  - **⭐ Add to Favorites:** Bookmarks the current link into local extension storage.
  - **⛶ Toggle Fullscreen:** Expands the preview window to 100% viewport coverage.
  - **◨ Dock to Slide Bar:** Seamlessly transitions the current preview from popup to sidebar.
  - **✕ Close Button:** Multiple convenient close methods—top-right button, screen-corner close, pressing `Esc`, or clicking the backdrop.
- **Frame Restrictions Bypass (`declarativeNetRequest`):**
  - Built-in network rules remove restrictive `X-Frame-Options` and `Content-Security-Policy: frame-ancestors` from subframes, enabling smooth and reliable previews across almost any website.
- **Dual Browser Architecture (MV3):**
  - **Chromium:** Native Chrome Side Panel API (`chrome.sidePanel.open`) and Manifest V3 background service worker.
  - **Mozilla Firefox:** Native Firefox Sidebar Action (`browser.sidebarAction`), non-persistent background script, and Gecko ID integration.
- **100% Local & Zero External Dependencies:**
  - Operates completely client-side in browser memory with zero tracking, telemetry, data collection, or remote server communications.



### <a name="RepositoryStructure"></a> 📁 Repository Structure

```text

├── chromium/          # Extension build directory for Chrome, Brave, Edge, Opera, Vivaldi, Arc
│   ├── background/    # Service worker handling context menus, side panel, and messaging
│   │   └── service-worker.js
│   ├── content/       # Floating popup modal, Shadow DOM injection, shortcuts, and reader view
│   │   ├── content.css
│   │   └── content.js
│   ├── icons/         # Extension toolbar and store icons (16px, 48px, 128px)
│   ├── options/       # User preferences and saved favorites management
│   │   ├── options.css
│   │   ├── options.html
│   │   └── options.js
│   ├── rules/         # DeclarativeNetRequest rules for removing iframe headers
│   │   └── rules.json
│   ├── sidepanel/     # Edge-to-edge Side Panel HTML/CSS/JS loader
│   │   ├── sidepanel.css
│   │   ├── sidepanel.html
│   │   └── sidepanel.js
│   └── manifest.json  # Chromium Manifest V3 configuration (with side_panel & service_worker)
│
├── firefox/           # Extension build directory for Mozilla Firefox, Zen Browser, LibreWolf
│   ├── background/    # Background script handling menus, sidebarAction, and messaging
│   │   └── background.js
│   ├── content/       # Floating popup modal, Shadow DOM injection, shortcuts, and reader view
│   │   ├── content.css
│   │   └── content.js
│   ├── icons/         # Extension toolbar and store icons (16px, 48px, 128px)
│   ├── options/       # User preferences and saved favorites management
│   │   ├── options.css
│   │   ├── options.html
│   │   └── options.js
│   ├── rules/         # DeclarativeNetRequest rules for removing iframe headers
│   │   └── rules.json
│   ├── sidepanel/     # Edge-to-edge Sidebar HTML/CSS/JS loader
│   │   ├── sidepanel.css
│   │   ├── sidepanel.html
│   │   └── sidepanel.js
│   └── manifest.json  # Firefox Manifest V3 configuration (with sidebar_action & Gecko ID)
│
├── .gitignore         # Prevents tracking of OS metadata, archives, and temporary files
├── LICENSE            # Apache License 2.0
├── PRIVACY_POLICY.md  # Privacy policy and local data handling guidelines (English & Arabic)
├── README.md          # Project documentation and setup guide
└── SECURITY.md        # Security policy and vulnerability disclosure guide

```



### <a name="InstallationUsage"></a> ⚙️ Installation & Usage

### <a name="ForChromiumBasedBrowsers"></a> 🌐 For Chromium-Based Browsers (Chrome, Brave, Edge, Opera, Vivaldi)

1. Open your Chromium-based browser and navigate to:
   - **Google Chrome / Brave / Opera:** `chrome://extensions/`
   - **Microsoft Edge:** `edge://extensions/`

2. Enable **Developer mode** (toggle located in the top-right corner).

3. Click **Load unpacked**.

4. Select the `chromium` directory:

```text
chromium/
├── background/
│   └── service-worker.js
├── content/
│   ├── content.css
│   └── content.js
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── options/
│   ├── options.css
│   ├── options.html
│   └── options.js
├── rules/
│   └── rules.json
├── sidepanel/
│   ├── sidepanel.css
│   ├── sidepanel.html
│   └── sidepanel.js
└── manifest.json
```

5. The extension will be installed and ready to use in your browser.

### <a name="ForMozillaFirefox"></a> 🦊 For Mozilla Firefox (and Zen Browser / LibreWolf)

1. Open **Mozilla Firefox** and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select the `manifest.json` file inside the `firefox` folder:

```text
firefox/
└── manifest.json
```

4. The extension is now loaded as a temporary add-on.

> [!NOTE]
> For permanent installation in Firefox, the extension can be packaged and signed through [addons.mozilla.org](https://addons.mozilla.org) (e.g. submitted as a self-distributed/unlisted add-on to generate a signed `.xpi`).



### <a name="HowToUse"></a> 🖱️ How to Use

1. **Popup Preview via Shortcut:** Hold **`P`** on your keyboard and **Left-Click** any link on any website. The link immediately opens inside the floating popup window.
2. **Slide Bar Preview via Shortcut:** Hold **`S`** on your keyboard and **Right-Click** (or Left-Click) any link. The link immediately loads into the browser's side panel.
3. **Preview via Context Menu:** Right-click on any hyperlink to see two direct options:
   - Select **Open in Popup** to inspect the webpage inside the floating modal.
   - Select **Open in Slide Bar** to open the browser's native side panel.
4. **Dock Controls (Inside Popup):**
   - Click the **Book icon** to activate clean Reader Mode.
   - Click the **Copy icon** to copy the target URL.
   - Click **`+`** / **`-`** to scale and zoom the previewed content.
5. **Header Actions:**
   - Click the **Reload** icon to refresh the page.
   - Click the **External Tab** icon to open the link in a full browser tab.
   - Click the **Star** icon to save the link to your favorites.
   - Click the **Sidebar** icon to transfer the preview into the Side Bar.
6. **Closing the Preview:**
   - Click the **`✕`** close button in the header or the screen-corner button.
   - Or press **`Esc`** on your keyboard.
   - Or click anywhere outside the window on the dark translucent backdrop.



### <a name="Privacy & Safety"></a> 🛡️ Privacy & Safety

- **Strict Local Processing:** All URL handling, modal rendering, Shadow DOM injection, and iframe sandboxing occur strictly within your browser's local runtime. No browsing history, previewed URLs, or personal data are ever captured, logged, or sent to external servers.
- **Safe & Non-Intrusive:** The modal is isolated inside a Shadow DOM tree (`<link-preview-extension-root>`), ensuring that your webpage's styles and scripts do not interfere with the preview, and the extension does not disrupt page functionality.



> [!WARNING]
> While `declarativeNetRequest` removes `X-Frame-Options` and `frame-ancestors` restrictions, some complex websites requiring strict top-level user authentication (e.g., certain online banking portals or aggressive CAPTCHA challenges) may require opening the page in a dedicated tab using the "Open in New Tab" button.



### <a name="Copyright©2026"></a> Copyright © 2026

Thank you for engaging with us. For inquiries or collaboration, please contact:  
hamzabellouchcontact@gmail.com

Stay connected and follow us on:  
[WhatsApp](https://whatsapp.com/channel/0029Vb7MArw0LKZMpjjqOk2P) | [Facebook](https://facebook.com/hamzabellouch1) | [Instagram](https://instagram.com/hamzabellouch0) | [Twitter](https://twitter.com/hamzabellouch0) | [Telegram](https://t.me/hammzabellouch) | [LinkedIn](https://www.linkedin.com/in/hamzabellouch)
