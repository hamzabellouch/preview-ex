# Security Policy

## Supported Versions

The following versions of **Preview** are currently supported with security and stability updates.

| Version | Supported |
| -------- | --------- |
| 1.0.x (latest release) | ✅ |
| < 1.0.0 | ❌ |

---

## Reporting a Vulnerability

If you discover a security vulnerability, privacy issue, or behavior that could negatively impact users or the extension, please report it responsibly.

### Before Reporting

Please ensure that:

- The issue is reproducible.
- You are using the latest supported version of **Preview**.
- The issue is not caused by modified builds, unsupported browser forks, or conflicting third-party extensions.

### How to Report

You can report vulnerabilities through:

- **GitHub Issues:** [hamzabellouch/preview-ex/issues](https://github.com/hamzabellouch/preview-ex/issues) (for general non-sensitive bugs or security queries)
- **Email Contact:** `hamzabellouchcontact@gmail.com` (for sensitive vulnerabilities, security disclosures, or exploit details)

When submitting a report, please include:

- Browser name and version (e.g., Chrome 130, Firefox 132, Edge 130)
- Operating system and version (e.g., Windows 11, macOS Sequoia, Ubuntu 24.04)
- **Preview** version (e.g., v1.0.0)
- Steps to reproduce the issue
- Target webpage URL where the issue occurred (if applicable)
- Screenshots, logs, or console error messages (if available)
- A clear description of the potential security impact

### Response Policy

Security reports are reviewed as quickly as possible.

If a report is confirmed:

- The vulnerability will be investigated and patched promptly.
- A fix will be included in the next update release.
- Credit may be given to the reporter upon request.

If a report cannot be reproduced, lacks sufficient information, or is determined not to be a security issue, it will be closed with a clear explanation.

---

## Security & Architecture Notes

**Preview** runs locally within your browser and is designed with strict security principles:

- **Local Client-Side Execution:** All script logic runs locally using Manifest V3 service workers (Chromium) and event-based background scripts (Firefox). No remote code execution (`eval`, external script injection, or remote CDN loading) is used, fully complying with modern browser extension store security standards.
- **Isolated Shadow DOM Architecture:** The preview modal is encapsulated inside a custom Shadow DOM host element (`<link-preview-extension-root>`). This encapsulates modal styling, prevents CSS bleeding, and insulates the extension interface from malicious or conflicting page scripts.
- **Sandboxed Iframe Previews:** Web content is loaded within standard browser subframes that inherit the host browser's multi-process security sandbox. Previewed sites operate under their origin's normal boundaries and cannot escape into extension privileged contexts.
- **Declarative Header Stripping without Arbitrary Script Modification:** Using the declarative `declarativeNetRequest` API, restrictive `X-Frame-Options` and `CSP: frame-ancestors` headers are stripped strictly for `sub_frame` resource types in memory. No network request bodies, headers, or cookies are altered or inspected.
- **On-Demand Minimal Script Injection:** When triggering a preview, the extension uses `chrome.tabs.sendMessage` with a fallback to `chrome.scripting.executeScript` only if the tab was opened prior to extension installation.
- **Secure Local State Storage:** `chrome.storage.local` and `chrome.storage.session` are used exclusively to persist display preferences (theme, backdrop blur) and optional bookmarks. No sensitive user credentials or full browsing histories are recorded.
- **Zero Background Telemetry:** The extension contains zero tracking SDKs, analytics beacons, telemetry collectors, or background network calls.

Users are encouraged to:

- Keep **Preview** updated to the latest release.
- Install the extension only from the official repository ([hamzabellouch/preview-ex](https://github.com/hamzabellouch/preview-ex)) or verified store listings.
- Avoid installing modified, repackaged, or unofficial third-party builds.
- Report any unexpected behavior that could affect security or privacy.

Security and user privacy are foundational priorities for this project.
