import type { RouteRecordRaw } from "vue-router";

// Halaman auth di-import statis agar halaman login (yang diaudit Lighthouse) tidak
// menunggu rantai request: main -> chunk layout -> chunk login.
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";

// Halaman setelah login tetap di-lazy-load supaya ukuran bundle awal tetap kecil
const CashFlowLayout = () => import("./features/cashflows/layouts/CashFlowLayout.vue");
const HomePage = () => import("./features/cashflows/pages/HomePage.vue");
const DetailPage = () => import("./features/cashflows/pages/DetailPage.vue");
const NotFoundPage = () => import("./features/common/pages/NotFoundPage.vue");
const ProfilePage = () => import("./features/users/pages/ProfilePage.vue");
const UsersPage = () => import("./features/users/pages/UsersPage.vue");

const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "", redirect: "/auth/login" },
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: CashFlowLayout,
    children: [
      { path: "", redirect: "/home" },
      { path: "home", component: HomePage },
      { path: "cash-flows/:cashFlowId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];

export default routes;