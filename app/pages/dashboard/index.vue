<template>
  <section class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <p class="text-sm text-slate-600">
        MVP foundation is ready. Next: professor CRM, templates, and automation.
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-slate-200 p-4">
        <p class="text-xs uppercase text-slate-500">Professors</p>
        <p class="mt-2 text-2xl font-semibold">0</p>
      </div>
      <div class="rounded-lg border border-slate-200 p-4">
        <p class="text-xs uppercase text-slate-500">Templates</p>
        <p class="mt-2 text-2xl font-semibold">0</p>
      </div>
      <div class="rounded-lg border border-slate-200 p-4">
        <p class="text-xs uppercase text-slate-500">Sent Emails</p>
        <p class="mt-2 text-2xl font-semibold">0</p>
      </div>
      <div class="rounded-lg border border-slate-200 p-4">
        <p class="text-xs uppercase text-slate-500">Pending Reminders</p>
        <p class="mt-2 text-2xl font-semibold">0</p>
      </div>
    </div>

    <section class="rounded-xl border border-slate-200 p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold">Billing Preview</h2>
          <p class="text-sm text-slate-600">
            Payment and upgrade flows are in progress. Plan and subscription data is now wired.
          </p>
        </div>
        <button
          type="button"
          class="rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm text-slate-600"
          disabled
        >
          Upgrade (Coming Soon)
        </button>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-slate-200 p-4">
          <p class="text-xs uppercase text-slate-500">Current Plan</p>
          <p class="mt-2 text-lg font-semibold">
            {{ currentPlanLabel }}
          </p>
          <p class="mt-1 text-sm text-slate-600">
            {{ subscriptionStatusLabel }}
          </p>
          <p class="mt-3 text-xs text-slate-500">
            Limits: {{ professorLimitLabel }} professors, {{ templateLimitLabel }} templates
          </p>
        </div>

        <div class="rounded-lg border border-slate-200 p-4">
          <p class="text-xs uppercase text-slate-500">Available Plans</p>
          <p v-if="plansPending" class="mt-2 text-sm text-slate-600">Loading plans...</p>
          <p v-else-if="plansError" class="mt-2 text-sm text-rose-600">Could not load plans.</p>
          <ul v-else-if="availablePlans.length > 0" class="mt-2 space-y-1 text-sm text-slate-700">
            <li v-for="plan in availablePlans" :key="plan.id">
              {{ plan.name }} ({{ plan.billingPeriod }}) - BDT {{ plan.priceBdt }}
            </li>
          </ul>
          <p v-else class="mt-2 text-sm text-slate-600">
            No active plans configured yet.
          </p>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
const { data: subscriptionData } = await useFetch("/api/billing/subscription");
const {
  data: plansData,
  pending: plansPending,
  error: plansError,
} = await useFetch("/api/billing/plans");

const subscription = computed(
  () => subscriptionData.value?.data?.subscription ?? null,
);
const currentPlan = computed(() => subscriptionData.value?.data?.plan ?? null);
const availablePlans = computed(() => plansData.value?.data?.items ?? []);

const currentPlanLabel = computed(() => {
  if (!currentPlan.value) return "Free";
  return `${currentPlan.value.name} (${currentPlan.value.billingPeriod})`;
});

const subscriptionStatusLabel = computed(() => {
  if (!subscription.value) return "No active subscription";
  return `Status: ${subscription.value.status}`;
});

const fallbackLimits = {
  professors: 10,
  templates: 2,
};

const activePlanLimits = computed(() => {
  if (!currentPlan.value?.limitsJson) {
    return fallbackLimits;
  }

  try {
    const parsed = JSON.parse(currentPlan.value.limitsJson) as {
      professor_limit?: number;
      template_limit?: number;
    };

    return {
      professors: parsed.professor_limit ?? fallbackLimits.professors,
      templates: parsed.template_limit ?? fallbackLimits.templates,
    };
  } catch {
    return fallbackLimits;
  }
});

const professorLimitLabel = computed(() => activePlanLimits.value.professors);
const templateLimitLabel = computed(() => activePlanLimits.value.templates);
</script>
