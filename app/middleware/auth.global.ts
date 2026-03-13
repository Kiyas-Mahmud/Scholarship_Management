export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ["/auth/login", "/auth/signup"];

  if (publicRoutes.includes(to.path)) {
    return;
  }

  try {
    await $fetch("/api/me");
  } catch {
    return navigateTo("/auth/login");
  }
});
