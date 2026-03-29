import type { AxiosRequestConfig } from 'axios'

// 用于存储每个请求的标识和取消函数
const pendingMap = new Map<string, AbortController>()

const getPendingKey = (config: AxiosRequestConfig) => {
  const { method, url } = config
  return [method, url].join('&')
}

export const addPendingRequest = (config: AxiosRequestConfig) => {
  // 首先需要判断是不是重复请求，如果是的话取消上一次的请求
  removePendingRequest(config)
  const key = getPendingKey(config)
  const abortController = new AbortController()
  config.signal = config.signal || abortController.signal
  if (!pendingMap.has(key)) {
    // 如果当前请求不在等待中，将其添加到等待中
    pendingMap.set(key, abortController)
  }
}

export const removePendingRequest = (config: AxiosRequestConfig) => {
  const key = getPendingKey(config)
  if (pendingMap.has(key)) {
    // 如果当前请求在等待中，取消它并将其从等待中移除
    const abortController = pendingMap.get(key)
    abortController && abortController?.abort()
    pendingMap.delete(key)
  }
}

export const removePendingRequestKey = (config: AxiosRequestConfig) => {
  const key = getPendingKey(config)
  if (pendingMap.has(key)) {
    pendingMap.delete(key)
  }
}

// 取消所有等待中的请求
// 例如：在路由守卫中，当用户切换路由时，取消所有等待中的请求
export const removeAllPendingRequests = () => {
  pendingMap.forEach((abortController) => {
    abortController && abortController.abort()
  })
  pendingMap.clear()
}

export const getPendingMap = () => {
  return pendingMap
}
