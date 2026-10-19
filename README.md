# 酷狗概念自动签到领VIP

面向个人账号的 GitHub Actions 签到模板，基于 [develop202/kgcheckin](https://github.com/develop202/kgcheckin) 调整。支持本地扫码授权、Actions Secret 保存登录信息、手动执行和可选定时签到。

**公开模板不包含任何账号凭据，定时任务默认关闭。建议在自己的私有仓库部署。**

## 实现方式与限制

- 直接调用酷狗接口，不操作手机界面，不实际播放广告。
- 上游领取实现使用固定广告 ID 和构造的播放起止时间；请自行确认平台活动规则，不将本项目视为官方授权工具。
- 领取结果、可领取权益和账号资格由服务端决定，不保证未来有效。
- HTTPS 令牌刷新尚未验证可用，自动刷新默认关闭。令牌失效后需要重新扫码并更新 Secret。
- 云端运行无需个人电脑保持开机。GitHub 定时任务可能延迟，也可能受账户额度或服务状态影响。

## 安全改动

- 登录二维码只在本地生成；本模板不提供将二维码发布到公开 Release 的工作流。
- 不要求为定时签到提供 GitHub PAT。
- Actions 仅申请 contents: read，checkout 不保留 Git 凭据。
- 官方 Actions 固定为具体提交哈希。
- 依赖按锁文件安装，使用 --omit=dev --ignore-scripts。
- 默认日志脱敏；不要启用输出完整 USERINFO 的选项。
- 不自动同步或执行上游的新代码。

Secret 仍然能被获得执行权限的工作流读取，私有仓库也不等于凭据不可泄露。不要将仓库写权限授予不信任的人，不要盲目运行外部 PR。

## 部署

### 1. 创建自己的私有部署仓库

在本项目页面选择 **Use this template → Create a new repository**，选择 **Private**。不要把实际运行账号的 Secret 配置在本公开模板仓库。

### 2. 在电脑本地扫码登录

需要 Node.js 24 和 npm。在项目根目录运行：

```sh
npm ci --prefix api --omit=dev --ignore-scripts
node qrcodeLogin.js gen
node local-login.mjs
```

第三条命令运行时，在本地打开 `qr/login.html` 或 `qr/qr-1.png`，用酷狗 App 扫码并在手机确认。二维码有效期短，超时就重新生成。

登录成功后，凭据保存在本地 `local-userinfo.json`，不会打印到日志。不要上传或分享该文件，也不要分享二维码及 `qrkeys.json`。Windows 用户应限制凭据文件的访问权限；Node.js 的 mode 参数不能替代 Windows ACL。

### 3. 写入自己的仓库 Secret

可用 GitHub 官方 CLI 登录后，将本地文件通过标准输入写入 Secret。将下方 OWNER/REPO 替换为自己的私有部署仓库：

PowerShell：

```powershell
Get-Content -LiteralPath ./local-userinfo.json -Raw | gh secret set USERINFO --repo OWNER/REPO
```

macOS / Linux：

```sh
gh secret set USERINFO --repo OWNER/REPO < local-userinfo.json
```

不要把 token 写进命令参数、源码、Issues、聊天记录或截图。

### 4. 先手动验证

打开私有仓库 **Actions → 签到 → Run workflow**，检查执行结果，再在酷狗内确认对应会员到期时间。当天已经领取或次数已用光，也可能正常结束；绿色流水线不代表必然新增权益。

### 5. 启用定时任务

验证成功后，在自己私有仓库的 `.github/workflows/签到.yml` 中启用：

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: '10 17 * * *' # UTC 17:10，即北京时间次日 01:10
```

保留当前 `workflow_dispatch` 配置。每日执行一次即可，不要高频重试。暂停时在 Actions 页面禁用签到工作流。

## 通知与维护

通知渠道沿用上游实现，全部可选；不配置时不向通知服务发送结果。可在工作流 env 列表和 `utils/notify.js` 中查看支持的 Secret 名称。

令牌失效后重新本地扫码，再更新 `USERINFO`。不要改回 HTTP 或关闭证书校验来尝试恢复刷新。

## 来源与许可证状态

本项目保留了上游代码和署名：

- 签到及登录流程：[develop202/kgcheckin](https://github.com/develop202/kgcheckin)，基于提交 `8bf3e12aada29682f27af0852457ebc7fd19227d`。该版本未声明根目录许可证。
- 内置接口代码来自 [MakcRe/KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi)，现有 MIT 声明保留在 [api/LICENSE](api/LICENSE)。
- 依赖包各自适用其原有许可证。

**这是源码公开的修改版本，不代表全部代码已取得统一开源许可。**本仓库不擅自为整套代码添加 MIT、Apache 等统一许可证；使用或再分发前请核实上游授权。发布者不拥有酷狗商标、服务或相关音乐版权。
