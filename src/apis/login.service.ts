import request from '@/utils/request'

/**
 * 获取验证码
 */
export function captcha() {
  return request({
    url: '/system/captcha/get-picture-word',
    method: 'post'
  })
}

/**
 * 登录接口
 */
export function login(data: object) {
  return request({
    url: '/system/auth/login',
    method: 'post',
    data
  })
}

/**
 * 退出登录接口
 */
export function logout(params: object) {
  return request({
    url: '/business/api/sysUser/logout',
    method: 'post',
    data: params
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: '/system/auth/get-permission-info-next',
    method: 'get'
  })
}

/**
 * 获取用户菜单
 */
export function getUserMenus() {
  return request({
    url: '/business/api/sysMenu/getMenuTree',
    method: 'get'
  })
}

/*
 刷新token
 */
export function getRefreshToken(refreshToken: string) {
  return request({
    url: `/system/auth/refresh-token?refreshToken=${refreshToken}`,
    method: 'post'
  })
}
