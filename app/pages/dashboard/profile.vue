<script setup lang="ts">
definePageMeta({
  layout: "default",
});

type ProfilePayload = {
  fullName: string;
  degreeTarget: "MS" | "PhD" | "RA";
  researchInterests: string | null;
  preferredCountries: string | null;
  signatureBlock: string | null;
};

const degreeOptions: Array<ProfilePayload["degreeTarget"]> = ["MS", "PhD", "RA"];

const form = reactive<ProfilePayload>({
  fullName: "",
  degreeTarget: "MS",
  researchInterests: null,
  preferredCountries: null,
  signatureBlock: null,
});

const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const applyProfile = (profile: Partial<ProfilePayload> | null | undefined) => {
  form.fullName = profile?.fullName ?? "";
  form.degreeTarget = (profile?.degreeTarget as ProfilePayload["degreeTarget"]) ?? "MS";
  form.researchInterests = profile?.researchInterests ?? null;
  form.preferredCountries = profile?.preferredCountries ?? null;
  form.signatureBlock = profile?.signatureBlock ?? null;
};

const loadProfile = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await $fetch<{ data?: ProfilePayload }>("/api/profile");
    applyProfile(response?.data);
  } catch (error: any) {
    errorMessage.value = error?.data?.error?.message ?? "Could not load profile.";
  } finally {
    loading.value = false;
  }
};

const onSave = async () => {
  saving.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const response = await $fetch<{ data?: ProfilePayload }>("/api/profile", {
      method: "PUT",
      body: {
        fullName: form.fullName,
        degreeTarget: form.degreeTarget,
        researchInterests: form.researchInterests,
        preferredCountries: form.preferredCountries,
        signatureBlock: form.signatureBlock,
      },
    });

    applyProfile(response?.data);
    successMessage.value = "Profile updated.";
  } catch (error: any) {
    errorMessage.value = error?.data?.error?.message ?? "Profile update failed.";
  } finally {
    saving.value = false;
  }
};

await loadProfile();
</script>

<template>
  <section class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold text-zinc-900">Profile</h1>
      <p class="text-sm text-zinc-600">
        Keep your identity and signature details up to date for template generation.
      </p>
    </header>

    <section class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <p v-if="loading" class="text-sm text-zinc-600">Loading profile...</p>

      <div v-else class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Full name</label>
          <input
            v-model="form.fullName"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            maxlength="100"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Degree target</label>
          <select
            v-model="form.degreeTarget"
            class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
          >
            <option v-for="option in degreeOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Research interests</label>
          <textarea
            v-model="form.researchInterests"
            class="min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            maxlength="500"
            placeholder="e.g. Machine learning, distributed systems"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Preferred countries</label>
          <textarea
            v-model="form.preferredCountries"
            class="min-h-20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            maxlength="500"
            placeholder="e.g. Germany, Netherlands, Canada"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-800">Signature block</label>
          <textarea
            v-model="form.signatureBlock"
            class="min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            maxlength="1000"
            placeholder="Your closing line and signature"
          />
        </div>

        <p v-if="errorMessage" class="rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {{ successMessage }}
        </p>

        <div class="flex justify-end">
          <AppButton type="button" :loading="saving" @click="onSave">
            Save profile
          </AppButton>
        </div>
      </div>
    </section>
  </section>
</template>
