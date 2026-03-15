<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const form = reactive({
  email: "",
  password: "",
});

const pending = ref(false);
const errorMessage = ref("");

const onSubmit = async () => {
  pending.value = true;
  errorMessage.value = "";

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: form,
    });
    await navigateTo("/dashboard");
  } catch (error: any) {
    errorMessage.value = error?.data?.error?.message ?? "Login failed.";
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <section class="mx-auto max-w-md">
    <div class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
      <h1 class="mb-2 text-2xl font-semibold text-zinc-900">Sign in</h1>
      <p class="mb-6 text-sm text-zinc-600">
        Access your scholarship outreach workspace.
      </p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Email</label>
          <input
            v-model="form.email"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Password</label>
          <input
            v-model="form.password"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="errorMessage" class="rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {{ errorMessage }}
        </p>

        <AppButton class="w-full" type="submit" :loading="pending">Sign in</AppButton>
      </form>
    </div>

    <p class="mt-5 text-sm text-zinc-600">
      New user?
      <NuxtLink class="font-medium text-zinc-900 underline" to="/auth/signup"
        >Create an account</NuxtLink
      >
    </p>
  </section>
</template>
