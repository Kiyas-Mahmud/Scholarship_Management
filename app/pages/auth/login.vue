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
    <h1 class="mb-2 text-2xl font-semibold">Sign in</h1>
    <p class="mb-6 text-sm text-slate-600">
      Access your scholarship outreach workspace.
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium">Email</label>
        <input
          v-model="form.email"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          type="email"
          required
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">Password</label>
        <input
          v-model="form.password"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          type="password"
          required
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
      <AppButton type="submit" :loading="pending">Login</AppButton>
    </form>

    <p class="mt-5 text-sm text-slate-600">
      New user?
      <NuxtLink class="font-medium text-slate-900 underline" to="/auth/signup"
        >Create an account</NuxtLink
      >
    </p>
  </section>
</template>
