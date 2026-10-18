/**
 * 用户信息管理工具
 * 提供登录脚本共享的用户信息更新与保存逻辑
 */

import { printBlue, printGreen, printRed, printYellow } from './colorOut.js'
import { hasSecretWriteToken, setRepoSecret } from './githubSecrets.js'
import { maskIdentifier, sanitizeForLog, shouldPrintSensitiveValue } from './safeLog.js'

/**
 * 将登录用户信息更新或追加到 userinfo 数组中
 * @param {Array} userinfo - 用户信息数组
 * @param {{ userid: string, token: string }} loginUser - 新登录的用户
 * @param {boolean} append - 是否追加模式（已存在则更新，否则添加）
 */
function upsertUser(userinfo, loginUser, append) {
  if (append) {
    for (const user of userinfo) {
      if (user.userid == loginUser.userid) {
        printYellow(`userid: ${maskIdentifier(user.userid)} 此账号已存在, 仅更新登录信息`)
        user.token = loginUser.token
        return
      }
    }
  }
  userinfo.push({ userid: loginUser.userid, token: loginUser.token })
}

/**
 * 保存 userinfo 到 GitHub Secret，失败时降级为日志输出
 * @param {Array} userinfo - 用户信息数组
 */
function saveUserinfo(userinfo) {
  if (!userinfo.length) return

  const userinfoJSON = JSON.stringify(userinfo)

  if (hasSecretWriteToken()) {
    try {
      setRepoSecret('USERINFO', userinfoJSON)
      printGreen('secret <USERINFO> 更改成功')
    } catch (error) {
      printRed('自动写入 secret <USERINFO> 出错')
      console.dir(sanitizeForLog({ message: error.message }), { depth: null })
      printUserinfoFallback(userinfoJSON)
    }
  } else {
    printYellow('PAT/GH_TOKEN 未配置，无法自动写入 secret <USERINFO>')
    printUserinfoFallback(userinfoJSON)
  }
}

/**
 * 降级方案：按配置决定是否在日志中输出 USERINFO
 */
function printUserinfoFallback(userinfoJSON) {
  if (shouldPrintSensitiveValue()) {
    printGreen('登录信息如下，把它添加到secret USERINFO 即可')
    printYellow('注意：日志包含登录 token，请用完后删除 Actions 日志')
    printBlue(userinfoJSON)
  } else {
    printYellow('为避免泄露 token，默认不在日志输出 USERINFO')
    printYellow('如必须手动复制，请重新运行并将 print_userinfo 选择为 是')
  }
}

export { upsertUser, saveUserinfo }
