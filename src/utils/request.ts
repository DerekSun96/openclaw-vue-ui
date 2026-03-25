import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { getRefreshToken } from '@/apis/login.service'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { addPendingRequest, removePendingRequestKey } from '@/utils/axios/axiosCancel'
import { notifyMessage } from '@/utils/helper'

type RequestConfig = InternalAxiosRequestConfig & {
  ignoreCancelRequest?: boolean
}

type ApiResponse<T = unknown> = {
  code?: number
  msg?: string
  message?: string
  data: T
}

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json;',
  },
})

/**
 * 配置请求参数
 * @param config
 */
const requestConfig = (config: RequestConfig): RequestConfig => {
  const userStore = useUserStore()
  const { token } = userStore

  // 如果启用了“取消重复请求”功能，则“取消重复请求”将被禁止。
  const ignoreCancelRequest = config.ignoreCancelRequest ?? false
  // 添加当前请求到等待中
  !ignoreCancelRequest && addPendingRequest(config)

  if (token) config.headers.set('Authorization', `Bearer ${token}`)

  return config
}

// 是否正在刷新中
let isRefreshingToken = false
// 请求队列
let requestList: Array<() => void> = []

const handleAuthError = async () => {
  notifyMessage('登录状态已过期，请重新登录', 'error')
  const { resetAll } = useUserStore()
  await resetAll()
  await router.replace('/login')
}

/**
 * 刷新token
 * @param config
 */
const refreshToken = async (config: RequestConfig): Promise<unknown> => {
  const userStore = useUserStore()
  if (isRefreshingToken) {
    const { longToken } = userStore
    if (!longToken) {
      await handleAuthError()
      return
    }

    return new Promise<unknown>((resolve) => {
      // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
      requestList.push(() => {
        resolve(instance(requestConfig(config)))
      })
    })
  } else {
    isRefreshingToken = true
    try {
      const { longToken } = userStore
      userStore.setLongToken('')
      const { data } = (await getRefreshToken(String(longToken))) as ApiResponse<{
        accessToken: string
        refreshToken: string
      }>
      const { accessToken, refreshToken } = data
      userStore.setToken(accessToken)
      userStore.setLongToken(refreshToken)

      // 刷新token后，重新执行队列中的请求
      requestList.forEach((cb) => cb())
      requestList = []

      return instance(requestConfig(config as RequestConfig))
    } catch (_error: unknown) {
      await handleAuthError()
    } finally {
      isRefreshingToken = false
    }
  }
}

/**
 * 响应拦截器
 * @param config
 * @param data
 * @param status
 * @param statusText
 */
const handleData = async (response: AxiosResponse<ApiResponse>): Promise<unknown> => {
  const { data, status, statusText } = response
  const config = response.config as RequestConfig
  let code = data && data.code ? data.code : status
  const successCodes = [200, 0, 201]
  // 从等待中移除当前请求
  removePendingRequestKey(config)

  if (successCodes.includes(code)) code = 200

  switch (code) {
    case 200: {
      return data
    }
    case 401: {
      return await refreshToken(config)
    }
    case 403: {
      router.push({ path: '/403' }).then(() => {})
      break
    }
  }

  if (code != 200) {
    const errMsg = `${data && data.msg ? data.msg : data.message ? data.message : statusText}`
    notifyMessage(errMsg, 'error')
    throw data
  }
}

/**
 * @description 请求拦截器
 */
instance.interceptors.request.use(requestConfig, (error: AxiosError) => {
  return Promise.reject(error)
})

/**
 * @description 响应拦截器
 */
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => handleData(response) as Promise<never>,
  (error: AxiosError) => {
    const { code } = error
    const config = error.config as AxiosRequestConfig | undefined
    // 从等待中移除当前请求
    if (config) removePendingRequestKey(config)
    if (code != 'ERR_CANCELED') {
      notifyMessage(
        '连接后台接口失败，可能由以下原因造成：后端不支持跨域CORS、接口地址不存在、请求超时等',
        'error',
      )
    }
    return Promise.reject(error)
  },
)

export default instance
