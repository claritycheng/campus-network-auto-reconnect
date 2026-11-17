# 校园网自动重连 · Campus Network Auto Reconnect

用于校园网认证会话到期后辅助重新登录的 Chrome 扩展。适合需要定时重新认证、登录超时后重新连接的校园网场景。

A Chrome extension that assists with signing in again when a campus network captive portal session expires.

[中文说明](#中文说明) · [English](#english)

## 中文说明

### 功能与适配范围

- 每分钟检查一个已打开的认证标签页；检测到“注销”按钮时视为已登录，并刷新页面以更新状态。
- 出现登录页面、密码框已填入且登录按钮可用时，自动点击登录。
- 滚动一小时内最多尝试 3 次，两次提交至少间隔 2 分钟。
- 检测到验证码输入框、已识别的认证错误或空密码框时，不自动提交。
- 在页面左下角显示“校园网助手”状态提示。

**当前版本仅针对 `https://192.168.0.9:8002/portal/local/` 及其页面结构编写，并非所有校园网通用。** 它通过页面元素判断状态，不直接检测互联网连通性；不会延长认证时限。其他校园、酒店或公共 Wi-Fi 认证页面需要先适配。

### 安装与使用

1. 点击本仓库 **Code → Download ZIP**，解压到固定文件夹。
2. 在 Chrome 地址栏打开 `chrome://extensions`，开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择包含 `manifest.json` 的文件夹。
4. 打开校园网认证页面，正常登录；如需自动重连，让浏览器保存并填入登录信息。
5. 刷新认证标签页，确认左下角出现“校园网助手”。保持 Chrome、认证标签页打开，并让电脑保持唤醒。

浏览器自动填充可能需要用户交互，因此保存密码不保证能够无人值守重连。实际效果需在自然掉线后确认；使用远程连接时，避免主动注销网络测试。扩展不会在关闭 Chrome 后独立运行，也不会自动创建一个已被关闭的认证标签页。

停用：在 `chrome://extensions` 中关闭或移除扩展。

### 适配其他认证页面

| 文件 | 需要核对的内容 |
| --- | --- |
| `manifest.json` | `host_permissions` 和 `content_scripts.matches` 中的主机与路径 |
| `background.js` | 完整认证地址、标签页匹配规则和端口检查 |
| `content.js` | `location.origin`、登录/注销按钮文字、输入框和错误提示识别 |

当前在线状态只识别中文“注销”按钮。登录按钮识别规则也需结合实际页面核对；本项目的中英文文档不代表已适配英文认证页面。修改后在扩展管理页重新加载扩展，再刷新认证页。

### 数据与权限

源码不包含账号或密码；扩展只检查密码框是否非空，然后点击页面按钮，不保存或上传密码。`storage` 用于保存重试时间戳，`alarms` 用于定时检查，站点权限限定认证主机。证书警告需要手动处理。

反馈适配问题时，可通过 [Issues](https://github.com/claritycheng/campus-network-auto-reconnect/issues) 提供浏览器版本、现象和脱敏后的页面结构；请勿提交账号、密码、Cookie 或令牌。

## English

### Features and compatibility

- Checks one open portal tab every minute. A visible button labeled `注销` is treated as a signed-in state, and the page is refreshed to update its status.
- Clicks the sign-in button when the password field is already filled and the button is available.
- Limits attempts to three per rolling hour, with at least two minutes between submissions.
- Skips automatic submission when it detects a CAPTCHA input, a recognized authentication error, or an empty password field.
- Displays a status badge in the lower-left corner of the portal page.

**This version targets `https://192.168.0.9:8002/portal/local/` and its specific page structure.** It infers status from page elements rather than testing internet connectivity. It does not extend the network session limit. Other campus, hotel, or public Wi-Fi captive portals require adaptation.

### Installation and usage

1. Select **Code → Download ZIP** on this repository and extract it to a permanent folder.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Select **Load unpacked** and choose the folder containing `manifest.json`.
4. Open your campus portal and sign in normally. For automatic reconnection, allow the browser to save and fill your login information.
5. Refresh the portal tab and look for the status badge. Keep Chrome and the portal tab open, and keep the computer awake.

Autofill may require user interaction, so saved credentials do not guarantee unattended reconnection. Verify behavior after a natural session expiry. Avoid signing out to test while relying on a remote connection. The extension does not run independently after Chrome closes or recreate a portal tab that you have closed.

To disable it, turn off or remove the extension at `chrome://extensions`.

### Adapting another portal

| File | Settings to review |
| --- | --- |
| `manifest.json` | Host permissions and content script URL patterns |
| `background.js` | Full portal URL, tab URL pattern, and port check |
| `content.js` | Origin check, sign-in/sign-out labels, inputs, and error detection |

The current online-state detector only recognizes the Chinese sign-out label `注销`. Review sign-in matching against your actual page as well. Bilingual documentation does not mean English portals are already supported. After editing, reload the extension and refresh the portal tab.

### Data and permissions

The source contains no account credentials. The extension checks whether the password field is nonempty and clicks the page button; it does not store or upload passwords. Local storage holds retry timestamps, alarms schedule checks, and host permissions are restricted to the portal host. Certificate warnings require manual handling.

For compatibility requests, open an [issue](https://github.com/claritycheng/campus-network-auto-reconnect/issues) with your browser version, observed behavior, and sanitized page structure. Do not include credentials, cookies, or tokens.

---

关键词 / Search terms: 校园网自动重连、校园网自动登录、校园网掉线、认证超时、定时重新认证、campus network auto reconnect, captive portal auto login, session timeout, Chrome extension.
