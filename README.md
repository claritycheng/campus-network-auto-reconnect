# 校园网自动重连 · Portal Auto Reconnect

可配置网址的 Chrome 扩展，辅助校园网、酒店或公共 Wi-Fi 网页认证在会话到期后重新登录。
A configurable Chrome extension to assist with reconnecting web-based campus, hotel and public Wi-Fi captive portals after session expiry.

## 中文

### 安装与设置

1. 在本仓库选择 **Code → Download ZIP**，解压到固定文件夹。
2. 打开 `chrome://extensions`，启用开发者模式，点击“加载已解压的扩展程序”，选择含 `manifest.json` 的文件夹。
3. 点击扩展图标打开中英文设置页，输入自己网络的**完整认证网址**，勾选启用，点击“保存并授权站点”。没有预设学校地址，无需改源码。
4. 点击“打开认证页”，正常登录，让浏览器填入登录信息。保存配置和认证页加载完成后会触发检查，此后每分钟检查。
5. 如果认证页面只有刷新后才显示掉线，可启用“已登录时每分钟刷新”。默认关闭，避免刷新影响页面使用。

### 日常使用与实测

**认证标签页需要一直保留；扩展设置页可以关闭。** 可以切换到其他标签页或最小化 Chrome，但不要完全退出浏览器。电脑需要保持唤醒。只需保留一个认证页；“打开认证页”会优先复用已有匹配页面，检查优先选择活动或最近使用的匹配页面。

2026-11-17，用户在一套校园网认证环境中手动注销后，确认扩展成功自动重新登录。此结果验证了该环境的重连流程，不代表所有认证系统均已验证，也尚未验证自然会话到期后的表现。

自行测试时，先确认左下角显示“网络助手 / Portal”，再在不依赖远程连接的情况下手动注销，等待约两分钟观察是否恢复。未恢复时，记录提示后手动登录。每小时重试限制仍然生效，请勿连续注销测试。

### Windows 登录后自动打开认证页

扩展本身不会创建 Windows 启动项。需要开机连接时，可手动创建 Chrome 快捷方式，目标参数填写：

```text
"C:\Program Files\Google\Chrome\Application\chrome.exe" --profile-directory="Default" "https://portal.example.edu/login"
```

将 Chrome 路径、浏览器配置目录和认证网址替换为自己的实际值，再把快捷方式放入当前用户的启动文件夹（资源管理器地址栏输入 `shell:startup`）。该 Chrome 配置中必须已安装、启用并配置扩展，浏览器也需能自动填入密码。

流程为：登录 Windows → Chrome 打开认证页 → 扩展辅助登录。此方式在登录 Windows 后执行，不能提供 Windows 登录前联网；电脑还需先连上 Wi-Fi 或网线。开发者本机已配置启动快捷方式，但完整重启后的无人值守联网流程尚未实测；该本机配置不会随仓库下载自动安装。

### 检查与诊断

设置页点击“立即检查与诊断”，可查看未启用、缺少授权、未找到匹配页或页面读取失败等结果。保存时会核验 Chrome 授权并立即诊断。遇到问题请保留完整诊断结果，避免反复重置权限。更新源码后，在扩展管理页重新加载扩展，并重新打开设置页、刷新认证页。

### 功能

- 每分钟检查一个匹配认证页；范围为配置网址的同源（含端口）、同目录和子目录，查询参数不参与范围匹配。建议使用固定入口，不使用临时令牌链接。
- 自动识别常见按钮：登录、登陆、立即登录、连接、Login、Sign in、Log on、Connect；通过注销、退出登录、登出、Log out、Sign out、Log off 判断已登录。
- 页面不符合默认识别规则时，在高级设置填写登录按钮、已登录标记、密码框的 CSS 选择器，例如 `#login-button`。自定义标记必须仅在对应状态可见。
- 浏览器已填入密码且按钮可用时点击登录；按认证地址限制每滚动小时最多 3 次，两次至少间隔 2 分钟。
- 检测到常见验证码输入或认证错误时跳过提交，需手动处理。检测规则不能覆盖所有认证系统。

### 适用边界

这是**可配置的通用工具框架**，不是对所有认证协议的零配置支持。支持顶层页面中的普通账号密码表单；短信、扫码、SSO、多步登录、跨域 iframe、Shadow DOM 和特殊脚本认证可能需要额外适配。浏览器自动填充可能要求用户交互，不保证无人值守重连。

通过页面标记推断登录状态，不直接检测互联网连通性，也不会延长网络时限。只处理已打开且匹配的标签页，不会重新创建关闭的认证页，也不会在浏览器关闭或电脑睡眠时运行。跨域重定向后的认证页需要配置其实际地址。

### 隐私与权限

不保存或上传账号密码，无统计或外部服务。配置和重试时间戳存于本机。安装时不申请所有网站的访问权；保存设置时仅申请所填主机的权限。Chrome 站点授权不按端口限制，但实际运行还会检查端口和目录。旧站点授权可能保留，可在扩展管理页撤销。

证书问题需手动处理。停用时在设置页取消“启用”并保存，或直接在扩展管理页关闭扩展。不要将含密码或令牌的认证网址、Cookie 上传到 Issues。

### 从 1.x 升级

在扩展管理页点击重新加载，打开设置页填写原有认证网址、启用并授权。旧版写死的网址不会自动迁移；新版默认未启用。若希望保留原来刷新已登录页面的行为，请手动勾选刷新选项。

## English

### Install and configure

1. Select **Code → Download ZIP**, then extract to a permanent folder.
2. Open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the folder containing `manifest.json`.
3. Click the extension icon. Enter your **full portal URL**, enable reconnection, and select **Save & allow site**. No school URL is preset and no source editing is required.
4. Select **Open portal**, sign in normally and let the browser fill your credentials. Checks run after configuration is saved and the portal finishes loading, then every minute.
5. Enable the optional signed-in page refresh if your portal needs a refresh to reveal session expiry. It is off by default.

### Everyday use and field test

**Keep the authentication tab open; the extension settings tab can be closed.** You may switch tabs or minimize Chrome, but keep the browser running and the computer awake. One portal tab is sufficient. **Open portal** reuses an existing matching tab, and checks prefer an active or recently used matching tab.

On 2026-11-17, a user confirmed successful automatic sign-in after manually signing out of one campus portal. This verifies reconnection in that environment, not compatibility with every portal or recovery after natural session expiry.

To test, first confirm the status badge is visible. When you are not relying on a remote connection, sign out manually and observe for about two minutes. If reconnection fails, note the badge message and sign in manually. Retry limits still apply; avoid repeated sign-out tests.

### Open the portal after Windows sign-in

The extension does not install an operating-system startup entry. To opt in, create a Chrome shortcut using the example command above, replacing the executable path, profile directory and portal URL with your own values. Place it in your user Startup folder (enter `shell:startup` in File Explorer). That Chrome profile must have the extension installed, enabled and configured, with working browser autofill.

The sequence is: Windows sign-in → Chrome opens the portal → extension assists with sign-in. This does not provide connectivity before Windows sign-in, and Wi-Fi or Ethernet must already be connected. A startup shortcut has been configured on the maintainer's machine, but the full unattended flow after reboot has not yet been field-tested. Downloading this repository does not install that machine-specific shortcut.

### Diagnostics

Use **Check now** to distinguish disabled configuration, missing site access, no matching loaded tab and page-access failures. Saving verifies the permission grant and runs diagnostics immediately. Keep diagnostic output rather than repeatedly resetting permissions. After updating source files, reload the extension, reopen settings and refresh the portal page.

### Behavior and customization

Checks one matching tab per minute. Matching is restricted to the configured origin (including port) and directory subtree; query parameters do not restrict matching. Use a stable entry URL without temporary tokens.

Common Chinese and English sign-in/sign-out labels are recognized. For other layouts, specify CSS selectors for the sign-in button, signed-in indicator and password field under **Advanced**. Indicators must be visible only in the corresponding state.

The extension clicks sign-in only when the password field is filled and the button is available. Attempts are limited per portal URL to three per rolling hour, at least two minutes apart. Recognized CAPTCHAs and authentication errors require manual handling; detection is not exhaustive.

### Compatibility and limitations

This is a **configurable general-purpose framework**, not zero-configuration support for every portal. It handles ordinary password forms in the top-level page. SMS, QR codes, SSO, multi-step login, cross-origin frames, Shadow DOM and special authentication scripts may require adaptation. Browser autofill may require interaction; unattended reconnection is not guaranteed.

Status is inferred from page elements rather than an internet connectivity test. The extension does not extend session limits, recreate closed portal tabs, run after the browser closes, or operate during sleep. Configure the actual authentication address when a portal redirects to another origin.

### Privacy, permissions and upgrades

No credentials are stored or uploaded, and there is no analytics or external service. Configuration and retry timestamps stay in local extension storage. Site access is requested only for the entered host when saving. Chrome host grants cover ports, while runtime checks additionally enforce the configured port and directory. Previous host grants may remain and can be revoked in extension settings.

Handle certificate warnings manually. Disable reconnection in settings or disable the extension at `chrome://extensions`. Do not share credential/token-bearing URLs or cookies in issues.

Upgrading from 1.x: reload the extension, enter your previous portal URL in settings, enable and grant access. The old hard-coded address is not migrated; version 2 starts unconfigured. Enable signed-in refresh manually if you want the previous refresh behavior.

## Feedback / 反馈

[Open an issue](https://github.com/claritycheng/campus-network-auto-reconnect/issues) with browser version, observed behavior and sanitized page structure. 请提供脱敏后的页面结构和现象，不要提交凭据。

Keywords: 校园网自动重连、校园网自动登录、认证超时、公共 Wi-Fi、campus network auto reconnect, captive portal auto login, session timeout, configurable Chrome extension.
