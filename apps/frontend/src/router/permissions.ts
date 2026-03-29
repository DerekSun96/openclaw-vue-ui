import type { Router } from "vue-router";
import { useUserStore } from "@/stores/user";
import { removeAllPendingRequests } from "@/utils/axios/axiosCancel";

const LOGIN_PATH = "/login";
const HOME_PATH = "/";

function toLoginRoute(redirect?: string) {
  if (!redirect || redirect === LOGIN_PATH) {
    return { path: LOGIN_PATH };
  }

  return {
    path: LOGIN_PATH,
    query: {
      redirect,
    },
  };
}

export const routerPermissions = (router: Router) => {
  router.beforeEach(async (to) => {
    removeAllPendingRequests();

    const userStore = useUserStore();
    const { token, userInfoLoaded, getUserInfo, resetAll } = userStore;

    if (!token) {
      if (to.path === LOGIN_PATH) {
        return true;
      }

      return toLoginRoute(to.fullPath);
    }

    if (to.path === LOGIN_PATH) {
      return { path: HOME_PATH, replace: true };
    }

    if (userInfoLoaded) {
      return true;
    }

    try {
      await getUserInfo();
      return { ...to, replace: true };
    } catch (_error) {
      await resetAll();
      return toLoginRoute(to.fullPath);
    }
  });

  router.onError((error: any) => {
    console.error("路由错误拦截:", error);
  });

  return router;
};
