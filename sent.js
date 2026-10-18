import { close_api, delay, send, startService, waitForApi } from "./utils/utils.js";
import { summarizeResponse } from "./utils/safeLog.js";

async function login() {

  const phone = process.env.PHONE

  if (!phone) {
    throw new Error("参数错误！请检查")
  }
  // 启动服务并等待就绪（避免冷启动竞态）
  const api = startService()
  try {
    await waitForApi()
  } catch (e) {
    close_api(api)
    throw e
  }

  console.log("开始发送验证码")
  try {
    // 验证码请求
    const result = await send(`/captcha/sent?mobile=${phone}`, "GET", {})
    if (result.status === 1) {
      console.log("发送成功")
    } else {
      console.log("响应内容")
      console.dir(summarizeResponse(result), { depth: null })
      throw new Error("发送失败！请检查")
    }
  } finally {
    close_api(api)
  }
}

login().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
