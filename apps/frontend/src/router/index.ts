import { createRouter, createWebHistory } from "vue-router";
import { routerPermissions } from "./permissions";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/chat",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
    // {
    //   path: '/home',
    //   name: 'home',
    //   component: () => import('@/views/HomeView.vue'),
    // },
    {
      path: "/data",
      name: "data",
      component: () => import("@/views/DataView.vue"),
    },
    {
      path: "/skills",
      name: "skills",
      component: () => import("@/views/SkillsView.vue"),
    },
    {
      path: "/history",
      name: "history",
      component: () => import("@/views/HistoryView.vue"),
    },
    {
      path: "/chat",
      name: "chat",
      component: () => import("@/views/ChatPageView.vue"),
    },
  ],
});

routerPermissions(router);

export default router;
