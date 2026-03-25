// import { storage as _storage, tokenTableName, longTokenTableName } from '/@/config'

const tokenTableName = "next-admin-token";
const longTokenTableName = "next-admin-long-token";
const storage = "localStorage";

/**
 * @description 获取token
 */
export const getToken = () => {
  if (storage === "localStorage") return localStorage.getItem(tokenTableName);
  else if (storage === "sessionStorage") return sessionStorage.getItem(tokenTableName);
};

/**
 * @description 设置token
 * @param token
 */
export const setToken = (token: string) => {
  if (storage === "localStorage") return localStorage.setItem(tokenTableName, token);
  else if (storage === "sessionStorage") return sessionStorage.setItem(tokenTableName, token);
};

/**
 * @description 移除token
 * @param storage
 */
export const removeToken = (storage = "localStorage") => {
  if (storage === "localStorage") return localStorage.removeItem(tokenTableName);
  else if (storage === "sessionStorage") return sessionStorage.clear();
};

/**
 * @description 获取token
 */
export const getLongToken = () => {
  if (storage === "localStorage") return localStorage.getItem(longTokenTableName);
  else if (storage === "sessionStorage") return sessionStorage.getItem(longTokenTableName);
};

/**
 * @description 设置token
 * @param token
 */
export const setLongToken = (token: string) => {
  if (storage === "localStorage") return localStorage.setItem(longTokenTableName, token);
  else if (storage === "sessionStorage") return sessionStorage.setItem(longTokenTableName, token);
};

/**
 * @description 移除token
 * @param storage
 */
export const removeLongToken = (storage = "localStorage") => {
  if (storage === "localStorage") return localStorage.removeItem(longTokenTableName);
  else if (storage === "sessionStorage") return sessionStorage.clear();
};
