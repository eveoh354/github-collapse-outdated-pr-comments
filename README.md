# GitHub Collapse Outdated PR Comments

A lightweight userscript that automatically collapses expanded **Outdated** review threads on GitHub pull requests.

GitHub does not provide a preference to collapse outdated PR comments by default. This script restores that focused review experience without changing any pull request data.

## Features

- Automatically collapses outdated review threads on GitHub PR pages
- Supports GitHub's classic and newer pull request interfaces
- Handles GitHub's client-side navigation and dynamically loaded comments
- Never expands a thread that is already collapsed
- No dependencies, network requests, tracking, or GitHub permissions

## Install

### 1. Install a userscript manager

Tampermonkey is available for all major browsers, not only Chrome:

| Browser | Quick install |
| --- | --- |
| Chrome | **[Install Tampermonkey from the Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** |
| Microsoft Edge | **[Install Tampermonkey from Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)** |
| Firefox | **[Install Tampermonkey from Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)** |
| Safari on macOS/iOS | **[Install Tampermonkey from the App Store](https://apps.apple.com/app/tampermonkey/id6738342400)** (paid) |
| Opera | **[Open the official Tampermonkey download page](https://www.tampermonkey.net/index.php?browser=opera&locale=en)** |

You can alternatively use the open-source [Violentmonkey](https://violentmonkey.github.io/).

### 2. Install this script

1. **[Install GitHub Collapse Outdated PR Comments](https://raw.githubusercontent.com/eveoh354/github-collapse-outdated-pr-comments/main/github-collapse-outdated-pr-comments.user.js)**.
2. Confirm the installation in your userscript manager.
3. Refresh a GitHub pull request page.

The script runs only on URLs matching:

```text
https://github.com/<owner>/<repository>/pull/<number>
```

## Privacy and security

The script only clicks GitHub's existing collapse controls in the current page. It does not:

- make network requests;
- collect or store data;
- read repository contents through an API;
- modify comments, reviews, commits, or pull requests.

## Compatibility

GitHub occasionally changes its page structure. If outdated comments stop collapsing, please [open an issue](https://github.com/eveoh354/github-collapse-outdated-pr-comments/issues) with the affected PR view (`Conversation` or `Files changed`) and browser name.

## 中文说明

这个用户脚本会在打开 GitHub Pull Request 时，自动折叠标记为 **Outdated** 的 Review 评论。脚本只改变当前页面的展示状态，不会修改 PR、评论或仓库数据。

Tampermonkey 不仅支持 Chrome，也支持 Edge、Firefox、Safari 和 Opera。先点击上表中对应浏览器的链接安装 Tampermonkey，再点击 **Install GitHub Collapse Outdated PR Comments** 安装本脚本即可。

## License

[MIT](LICENSE)
