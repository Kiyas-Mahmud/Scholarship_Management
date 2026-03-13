<template>
  <aside class="w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p
      class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      Workspace
    </p>
    <nav class="space-y-2 text-sm">
      <NuxtLink
        class="block rounded-md px-3 py-2 hover:bg-slate-100"
        to="/dashboard"
        >Overview</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 hover:bg-slate-100"
        to="/dashboard/professors"
        >Professors</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 hover:bg-slate-100"
        to="/dashboard/templates"
        >Templates</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 hover:bg-slate-100"
        to="/dashboard/reminders"
        >Reminders</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 hover:bg-slate-100"
        to="/dashboard/billing"
        >Billing</NuxtLink
      >
    </nav>
  </aside>
</template>
