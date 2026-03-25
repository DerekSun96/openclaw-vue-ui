import { defineStore } from "pinia";

// import { usePermissionStore } from '/@/stores/modules/permission'
// import { useSettingsStore } from './settings'
// import { useTabsStore } from './tabs'
import { branding } from "@/config/branding";
import { login, getUserInfo, logout } from "@/apis/login.service";
import { notifyMessage } from "@/utils/helper";
import {
  getToken,
  removeToken,
  setToken,
  getLongToken,
  setLongToken,
  removeLongToken,
} from "@/utils/token";
import { isArray, isString } from "@/utils/validate";
// import { useRoutesStore } from "/@/stores/modules/routes";

export const useUserStore = defineStore("user", {
  state: (): any => ({
    token: getToken() as string,
    longToken: getLongToken() as string,
    username: "",
    avatar: "",
    userInfoLoaded: false,
  }),
  getters: {
    getToken: (state) => state.token,
    getUsername: (state) => state.username,
    getAvatar: (state) => state.avatar,
    getLongToken: (state) => state.longToken,
    getUserInfoLoaded: (state) => state.userInfoLoaded,
  },
  actions: {
    /**
     * @description 设置token
     * @param token
     */
    setToken(token: string) {
      this.token = token;
      setToken(token);
    },

    setLongToken(longToken: string) {
      this.longToken = longToken;
      setLongToken(longToken);
    },

    /**
     * @description 设置用户名
     * @param username
     */
    setUsername(username: string) {
      this.username = username;
    },

    /**
     * @description 设置头像
     * @param avatar
     */
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },

    setUserInfoLoaded(loaded: boolean) {
      this.userInfoLoaded = loaded;
    },

    /**
     * @description 登录
     * @param userInfo
     */
    async login(userInfo: any) {
      const { data } = await login(userInfo);
      // const token = data.accessToken
      const { accessToken, refreshToken } = data;
      if (accessToken) {
        this.setToken(accessToken);
        this.setLongToken(refreshToken);
        this.setUserInfoLoaded(false);
        const hour = new Date().getHours();
        const welcomeMsg =
          hour < 8
            ? "早上好"
            : hour <= 11
              ? "上午好"
              : hour <= 13
                ? "中午好"
                : hour < 18
                  ? "下午好"
                  : "晚上好";
        notifyMessage(`${welcomeMsg}！`, "success", `欢迎登录${branding.shortName}`);
      } else {
        const err = `登录接口异常，请与后台管理员联系`;
        notifyMessage(err, "error");
        throw err;
      }
    },

    /**
     * @description 获取用户信息接口
     */
    async getUserInfo() {
      const { data } = await getUserInfo();
      const { avatar, permissions, roles, username, menus } = {
        avatar: data.user.avatar,
        permissions: data.permissions,
        roles: data.roles,
        username: data.user.nickname,
        menus: data.menus,
      };

      // 检验返回数据是否正常，无对应参数，将使用默认用户名,头像和Permissions
      if (
        (username && !isString(username)) ||
        (avatar && !isString(avatar)) ||
        (roles && !isArray(roles)) ||
        (permissions && !isArray(permissions))
      ) {
        const err = "获取用户信息失败，请检查返回JSON格式是否正确";
        notifyMessage(err, "error");
        throw err;
      } else {
        // const permissionStore = usePermissionStore();
        // const routesStore = useRoutesStore();
        this.setUsername(username || "");
        this.setAvatar(avatar || "");
        this.setUserInfoLoaded(true);
        // if (roles) permissionStore.setRole(roles);
        // if (permissions) permissionStore.setPermission(permissions);
        // if (menus) await routesStore.setRoutes(menus);
      }
    },

    /**
     * @description 退出登录
     */
    async logout() {
      // await logout()
      await this.resetAll();
      // location.reload()
    },

    /**
     * @description 重置token、roles、permission、router、tabsBar等
     */
    async resetAll() {
      // const permissionStore = usePermissionStore();
      // const tabsStore = useTabsStore();
      // const routesStore = useRoutesStore();

      removeToken();
      removeLongToken();
      this.setToken("");
      this.setUsername("");
      this.setAvatar("");
      this.setUserInfoLoaded(false);
      // permissionStore.setPermission([]);
      // permissionStore.setRole([]);
      // tabsStore.delAllVisitedRoutes();
      // routesStore.resetRoutes();
    },
  },
});
