<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const form = reactive({
  fullName: "",
  email: "",
  password: "",
});

const pending = ref(false);
const errorMessage = ref("");

const onSubmit = async () => {
  pending.value = true;
  errorMessage.value = "";

  try {
    await $fetch("/api/auth/signup", {
      method: "POST",
      body: form,
    });
    await navigateTo("/dashboard");
  } catch (error: any) {
    errorMessage.value = error?.data?.error?.message ?? "Signup failed.";
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <section class="mx-auto max-w-md">
    <h1 class="mb-2 text-2xl font-semibold">Create account</h1>
    <p class="mb-6 text-sm text-slate-600">
      Start tracking your outreach with a structured workflow.
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium">Full name</label>
        <input
          v-model="form.fullName"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
      </div>
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
          minlength="8"
          required
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
      <AppButton type="submit" :loading="pending">Create account</AppButton>
    </form>

    <p class="mt-5 text-sm text-slate-600">
      Already have an account?
      <NuxtLink class="font-medium text-slate-900 underline" to="/auth/login"
        >Login</NuxtLink
      >
    </p>
  </section>
</template>
