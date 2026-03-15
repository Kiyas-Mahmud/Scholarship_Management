<template>
  <header class="border-b border-zinc-200 bg-white/95 backdrop-blur">
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <NuxtLink
        to="/"
        class="text-lg font-semibold tracking-tight text-zinc-900"
      >
        Scholarship Outreach
      </NuxtLink>
      <nav class="flex items-center gap-4 text-sm text-zinc-600">
        <NuxtLink class="hover:text-zinc-900" to="/dashboard"
          >Dashboard</NuxtLink
        >
        <NuxtLink
          v-if="!isAuthenticated"
          class="hover:text-zinc-900"
          to="/auth/login"
          >Login</NuxtLink
        >

        <NuxtLink
          v-if="isAuthenticated"
          class="hover:text-zinc-900"
          to="/dashboard/profile"
          >Profile</NuxtLink
        >

        <button
          v-if="isAuthenticated"
          type="button"
          class="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100"
          :disabled="logoutPending"
          @click="onLogout"
        >
          {{ logoutPending ? "Signing out..." : "Logout" }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const router = useRouter();
const { data: meData } = await useFetch("/api/me", {
  server: false,
});

const isAuthenticated = computed(() => Boolean(meData.value?.data?.user?.id));
const logoutPending = ref(false);

const onLogout = async () => {
  if (logoutPending.value) return;

  logoutPending.value = true;

  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    await router.push("/auth/login");
  } finally {
    logoutPending.value = false;
  }
};
</script>
