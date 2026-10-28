# Privacy Policy - Preview

Last Updated: October 28, 2026


### 0. Rule 0: Disclaimer on Modified Builds, External Packages & Unofficial Forks:

- **Original Source Integrity:** This privacy policy, safety guarantees, and security features apply strictly and exclusively to the official, unmodified extension binaries and source code distributed directly through this official repository ([hamzabellouch/preview-ex](https://github.com/hamzabellouch/preview-ex)) and its verified official releases.
- **Zero Liability for Modified / External Builds:** We (the publisher and maintainer) assume **no responsibility or liability whatsoever** for any modified extensions, third-party forks, repackaged `.crx` / `.xpi` / `.zip` archives, unofficial distribution channels, or altered projects not originating directly from this official repository. Any installation or use of modified, tampered, or third-party builds is entirely at your own risk, and the publisher assumes no responsibility for any consequences, damages, security compromises, or data breaches that may occur.


### 1. Executive Summary & Overview:

Preview is a modern, lightweight browser extension designed to allow users to preview any hyperlink in a floating popup window or native side panel before navigating to it—featuring fast keyboard & click shortcuts (`P + Click`, `S + Click`), dual-action context menus (`Open in Popup`, `Open in Slide Bar`), clean left dock toolbar with Reader View, incremental zoom controls (+/-), full address capsule, iframe restriction bypass via `declarativeNetRequest`, and edge-to-edge Slide Bar integration.

#### Core Privacy Commitment:
Preview operates **100% locally on your device**. We do **not** collect, store, transmit, share, or sell any personal data, previewed URLs, page contents, browsing history, device identifiers, or IP addresses to external servers, analytics providers, or third parties.


### 2. Information Processed On-Device:

To deliver its core link previewing and side panel functionality, Preview processes operations **strictly locally within your browser**:

- **On-Demand Link Previewing & Shadow DOM Isolation:** When you trigger a preview via keyboard shortcuts or context menu, the extension constructs the floating modal interface inside an isolated Shadow DOM container (`<link-preview-extension-root>`). This query runs purely in client-side memory without exposing page contents to external services.
- **Subframe Loading & Declarative Header Modification:** To enable previews across websites that set restrictive frame headers, the extension uses `declarativeNetRequest` rules to remove `X-Frame-Options` and `Content-Security-Policy: frame-ancestors` strictly for subframe requests on your device. No request bodies, authentication cookies, or URLs are intercepted, captured, or uploaded.
- **Native Browser Sidebar / Side Panel Invocations:** In Chromium, the extension invokes `chrome.sidePanel.open()`. In Mozilla Firefox, it invokes `browser.sidebarAction.open()`. Both integrations utilize native browser windowing mechanisms without third-party proxies.
- **Local Preference & Bookmark Storage:** User settings (such as theme choice, blur backdrop preference, and reader mode toggle) and optional starred favorites/history are persisted strictly on your device via `chrome.storage.local` and in-memory session storage (`chrome.storage.session`). No URLs or timestamps are ever sent to remote databases or external servers.
- **Zero Cloud Processing & Immediate Garbage Collection:** All modal DOM elements, event listeners, and zoom transformations run in local memory. Closing the modal immediately releases resources and clears active iframe sessions.
- **No Browsing Tracking:** The extension never monitors, records, logs, or profiles your browsing activity, click habits, or the webpages you visit.


### 3. Permissions Used & Their Purposes:

Preview adheres to the principle of least privilege and requests only the minimal permissions required for operation:

**A. Context Menus (`contextMenus`)**
- **Purpose:** Adds two direct preview options ("Open in Popup" and "Open in Slide Bar") to the right-click menu strictly when right-clicking hyperlinks (`contexts: ["link"]`).

**B. Side Panel (`sidePanel` - Chromium only)**
- **Purpose:** Enables opening and rendering link previews in Chrome's native Side Panel drawer.

**C. Scripting (`scripting`)**
- **Purpose:** Injects the preview modal scripts (`content.js` and `content.css`) on demand if a tab was opened prior to extension installation or lacks active content script attachment.

**D. Storage (`storage`)**
- **Purpose:** Saves your custom display preferences (blur backdrop, reader mode, theme) and optional local history/favorites on your device.

**E. Declarative Net Request (`declarativeNetRequest`)**
- **Purpose:** Removes restrictive `X-Frame-Options` and `CSP: frame-ancestors` headers on subframe iframe requests so previews render smoothly.

**F. Tabs (`tabs`)**
- **Purpose:** Allows opening the previewed link into a full new browser tab when clicking the "Open in New Tab" header button, and querying the active tab for modal injection.

**G. Host Permissions (`<all_urls>`)**
- **Purpose:** Enables previewing links from and to any website on the internet.

**H. Browser Specific Settings (Firefox Gecko ID: `preview@tkno`)**
- **Purpose:** Required by Mozilla Firefox for extension identification, Manifest V3 compliance, and temporary/signed add-on installation.


### 4. Safety & Content Handling Policy:

Preview complies strictly with modern browser extension security standards:

- **Strict Local Isolation:** The extension executes exclusively within the local browser runtime. No remote scripts (`eval`, remote script injection, or external CDN dependencies) are ever loaded or executed.
- **Isolated Shadow DOM Architecture:** The preview modal is encapsulated in a closed-boundary Shadow DOM tree, completely shielding it from host webpage scripts and CSS bleed-over, and preventing interference with host site behavior.
- **Safe Sandboxing:** Previewed web content is loaded in standard browser iframes that inherit your browser's robust multi-process sandbox security architecture.
- **Zero Data Exfiltration:** The extension possesses no background API endpoints, telemetry servers, or outbound network channels.


### 5. Data Sharing, Analytics & Advertising:

- **No Data Sharing:** Zero user data, URLs, or browsing information leaves your browser.
- **No Third-Party Analytics / Telemetry:** Preview contains no tracking SDKs, Google Analytics, telemetry beacons, or behavioral monitoring tools.
- **No Advertisements:** Preview does not inject, display, or monetize advertisements of any kind.


### 6. Data Retention & Lifecycle:

- **Zero Data Retention:** Because Preview does not collect or log personal data or browsing activity, there is no user data retained on any external server or database.
- **Immediate In-Memory Cleanup:** Iframe elements and DOM nodes are immediately destroyed and garbage collected when the preview modal or side panel is closed.
- **Complete Removal:** Uninstalling or disabling Preview instantly ceases all script execution and removes all extension files and local settings.


### 7. Managing Permissions & User Rights:

You maintain full control over Preview. You may clear local data, disable, or remove the extension at any time via your browser settings:

- **Chromium Browsers (Chrome, Edge, Brave, Opera, Vivaldi):** Navigate to `chrome://extensions/` (or `edge://extensions/`), locate **Preview**, and toggle it off or click **Remove**.
- **Mozilla Firefox:** Navigate to `about:addons` > **Extensions**, locate **Preview**, and choose **Disable** or **Remove**.


### 8. Contact & Support:

If you have any questions, suggestions, or concerns regarding this Privacy Policy or the security of Preview, please contact:  
**Email:** hamzabellouchcontact@gmail.com  
**GitHub:** [https://github.com/hamzabellouch/preview-ex](https://github.com/hamzabellouch/preview-ex)


-------------------------------------------



# سياسة الخصوصية - Preview

آخر تحديث: ٢٨ أكتوبر ٢٠٢٦


### ٠. القاعدة رقم ٠: إخلاء المسؤولية عن الإضافات المعدلة والحزم الخارجية والمشاريع المشتقة:

* **سلامة المصدر الأصلي:** تنطبق سياسة الخصوصية، وضمانات الأمان، والميزات المذكورة في هذه الوثيقة حصرياً وصراحةً على الإصدارات الرسمية غير المعدلة من الإضافة والشفرة المصدرية المنشورة مباشرة عبر هذا المستودع الأصلي المعتمد ([hamzabellouch/preview-ex](https://github.com/hamzabellouch/preview-ex)) وصفحة إصداراته الرسمية فقط.
* **عدم تحمل المسؤولية عن النسخ المعدلة أو الخارجية:** نحن (الناشر والمطور) **لا نتحمل أي مسؤولية قانونية أو أمنية أو تقنية** عن تثبيت أو استخدام أي إضافات معدلة، أو حزم خارجية (`.crx` / `.xpi` / `.zip`)، أو نسخ مُعاد تجميعها، أو مشاريع مشتقة ومعدلة لا تنتمي لهذا المستودع الأصلي. كل ما ينتج عن استخدام أو تثبيت نسخ خارجية أو معدلة (من فقدان بيانات، أو ثغرات أمنية، أو برمجيات خبيثة، أو أي أضرار ناجمة) يقع بالكامل على عاتق المستخدم وحده دون أدنى مسؤولية على الناشر.


### ١. الملخص التنفيذي والنظرة العامة:

إضافة Preview هي إضافة متصفح حديثة وخفيفة، صُممت لتمكين المستخدمين من معاينة أي رابط تشعبي فورياً قبل الانتقال إليه—إما عبر نافذة منبثقة عائمة (Popup Modal) أو داخل الشريط الجانبي المدمج للمتصفح (Slide Bar)، مع دعم اختصارات لوحة المفاتيح السريعة (`P + Click` و `S + Click`)، وخيارات القائمة السياقية للروابط، ووضع القراءة، وأدوات التكبير والتصغير، وتجاوز قيود التضمين عبر `declarativeNetRequest`.

#### الالتزام الأساسي بالخصوصية:
تعمل إضافة Preview **بنسبة ١٠٠٪ محلياً داخل متصفحك**. نحن **لا نجمع**، ولا نخزن، ولا ننقل، ولا نشارك، ولا نبيع أي بيانات شخصية، أو روابط تتم معاينتها، أو محتوى صفحات، أو سجل تصفح، أو معرفات أجهزة، أو عناوين IP إلى أي خوادم تحليلات خارجية أو أطراف ثالثة.


### ٢. المعلومات والعمليات التي تتم معالجتها محلياً:

لأداء وظيفتها الأساسية المتمثلة في معاينة الروابط والشريط الجانبي، تقوم إضافة Preview بالعمليات التالية **محلياً وحصرياً داخل متصفحك**:

* **إنشاء نافذة المعاينة داخل Shadow DOM معزول:** عند تفعيل المعاينة عبر الاختصارات أو القائمة السياقية، يتم بناء واجهة النافذة العائمة داخل شجرة Shadow DOM معزولة تماماً (`<link-preview-extension-root>`) في الذاكرة المحلية، دون مشاركة أي بيانات خارج الجهاز.
* **تعديل الترويسات محلياً لتجاوز قيود التضمين:** لتمكين معاينة المواقع التي تمنع التضمين داخل إطارات iframes، تستخدم الإضافة قواعد `declarativeNetRequest` لحذف ترويسات `X-Frame-Options` و `CSP: frame-ancestors` محلياً وبشكل خاص لطلبات الإطارات الفرعية (subframes). لا يتم اعتراض أو تسجيل أو رفع نصوص الطلبات أو ملفات تعريف الارتباط أو الروابط.
* **استدعاء واجهات الشريط الجانبي المدمجة بالمتصفح:** تستخدم الإضافة واجهة `chrome.sidePanel.open` في متصفحات كروميوم، وواجهة `browser.sidebarAction.open` في فايرفوكس، وكلتاهما تعملان عبر نظام النوافذ الأصلي للمتصفح دون استخدام أي خوادم وسيطة.
* **تخزين التفضيلات والمفضلة محلياً فقط:** يتم حفظ خيارات المستخدم (مثل تفعيل ضبابية الخلفية، ووضع القراءة، والتكبير) والروابط المحفوظة محلياً في `chrome.storage.local` وجلسة التخزين المؤقت `chrome.storage.session`. لا يتم إرسال أي روابط أو سجلات لخوادم خارجية.
* **انعدام المعالجة السحابية والتفريغ الفوري:** تجري كافة العمليات البرمجية والتكبير داخل الذاكرة المؤقتة (RAM) للجهاز، ويتم إفراغ محتوى الإطار فور إغلاق نافذة المعاينة.
* **عدم تتبع نشاط التصفح:** الإضافة لا ترصد، ولا تسجل، ولا تحلل المواقع التي تزورها أو سلوك تصفحك.


### ٣. الأذونات المستخدمة وأغراضها:

تلتزم Preview بمبدأ الحد الأدنى من الصلاحيات ولا تطلب إلا الأذونات الضرورية لعملها:

**أ. القوائم السياقية (`contextMenus`)**
* **الغرض:** إضافة خيارين مباشرين ("Open in Popup" و "Open in Slide Bar") عند النقر بزر الفأرة الأيمن على الروابط فقط.

**ب. الشريط الجانبي (`sidePanel` - كروميوم فقط)**
* **الغرض:** تفعيل فتح المعاينة داخل درج الشريط الجانبي الأصلي في متصفح كروم.

**ج. السكربتات البرمجية (`scripting`)**
* **الغرض:** حقن سكربتات واجهة المعاينة (`content.js` و `content.css`) عند الطلب في التبويبات التي لم تكن محقونة مسبقاً.

**د. التخزين المحلي (`storage`)**
* **الغرض:** حفظ تفضيلات العرض (السمة، ضبابية الخلفية، وضع القراءة) والمفضلة المحلية على جهازك.

**هـ. تعديل طلبات الشبكة (`declarativeNetRequest`)**
* **الغرض:** إزالة ترويسات حظر التضمين (`X-Frame-Options` و `CSP: frame-ancestors`) للإطارات الفرعية لتمكين المعاينة السلسة.

**و. التبويبات (`tabs`)**
* **الغرض:** فتح الرابط في تبويب جديد مستقل عند النقر على زر "Open in New Tab" والتحقق من التبويب النشط.

**ز. أذونات النطاقات المضيفة (`<all_urls>`)**
* **الغرض:** تمكين معاينة الروابط على أي موقع ويب.

**ح. إعدادات فايرفوكس الخاصة (Gecko ID: `preview@tkno`)**
* **الغرض:** مطلوب من قبل متصفح Mozilla Firefox لتعريف الإضافة وضمان توافقيتها مع مواصفات Manifest V3.


### ٤. سياسة الأمان والتعامل مع المحتوى:

تلتزم إضافة Preview بالمعايير الصارمة لأمان المتصفحات:

* **العزل المحلي التام:** تعمل الإضافة حصرياً داخل بيئة المتصفح المحلية. لا يتم تنزيل أو تنفيذ أي سكربتات أو أكواد برمجية خارجية (`eval` أو روابط CDN خارجية).
* **عزل كامل عبر Shadow DOM:** واجهة المعاينة محاطة بشجرة Shadow DOM مغلقة، مما يمنع تعارض أنماط CSS أو سكربتات صفحة الويب الأصلية مع الإضافة والعكس.
* **أمان الحاوية الرملية (Sandbox):** تعمل المواقع المعاينة داخل إطارات iframe القياسية المحمية بالحاوية الرملية الأمنية لنظام المتصفح متعدد العمليات.
* **انعدام تسريب البيانات:** لا تحتوي الإضافة على أي خوادم أو قنوات اتصال خارجية، ولا تقوم بأي طلبات HTTP/HTTPS لخوادم طرف ثالث.


### ٥. مشاركة البيانات والتحليلات والإعلانات:

* **عدم مشاركة البيانات:** لا تغادر أي روابط، أو بيانات تصفح جهازك على الإطلاق.
* **عدم وجود تحليلات أو تتبع من جهات خارجية:** لا تحتوي إضافة Preview على أي مكتبات تتبع، أو Google Analytics، أو خدمات Telemetry، أو أدوات تقارير خارجية.
* **خالية تماماً من الإعلانات:** لا تعرض الإضافة أو تحقن أو تروّج لأي نوع من الإعلانات التجارية أو السلوكية.


### ٦. الاحتفاظ بالبيانات ودورة حياتها:

* **عدم الاحتفاظ بالبيانات:** نظراً لأن إضافة Preview لا تجمع ولا تسجل أي بيانات شخصية أو سجلات تصفح، فإنه لا توجد أي بيانات للمستخدم يتم الاحتفاظ بها على أي خوادم أو مساحات تخزين دائمة.
* **مسح فوري من الذاكرة:** يتم إفراغ وتدمير عناصر iframe ومكونات الواجهة من الذاكرة المؤقتة (RAM) فور إغلاق نافذة المعاينة أو الشريط الجانبي.
* **الحذف الكامل:** يؤدي تعطيل أو إلغاء تثبيت إضافة Preview إلى إزالة كافة ملفات الإضافة وتفضيلاتها فوراً وبشكل دائم.


### ٧. إدارة الأذونات وحقوق المستخدم:

تحتفظ بالتحكم الكامل في إضافة Preview، ويمكنك تعطيلها أو إزالتها في أي وقت من خلال إعدادات المتصفح:

* **متصفحات كروميوم (Chrome، Edge، Brave، Opera، Vivaldi):** توجه إلى `chrome://extensions/` (أو `edge://extensions/`)، ثم ابحث عن **Preview** وقم بإيقاف تفعيلها أو الضغط على **إزالة (Remove)**.
* **متصفح موزيلا فايرفوكس (Firefox):** توجه إلى `about:addons` ثم قسم **الملحقات (Extensions)**، وابحث عن **Preview** واختر **تعطيل (Disable)** أو **إزالة (Remove)**.


### ٨. التواصل والدعم:

إذا كانت لديك أي أسئلة أو استفسارات أو ملاحظات بخصوص سياسة الخصوصية هذه أو أمان إضافة Preview، يُرجى التواصل معنا عبر:  
**البريد الإلكتروني:** hamzabellouchcontact@gmail.com  
**مستودع GitHub:** [https://github.com/hamzabellouch/preview-ex](https://github.com/hamzabellouch/preview-ex)
