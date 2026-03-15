<template>
  <aside class="w-56 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
    <p
      class="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500"
    >
      Workspace
    </p>
    <nav class="space-y-2 text-sm">
      <NuxtLink
        class="block rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
        active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        exact-active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        to="/dashboard"
        >Overview</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
        active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        exact-active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        to="/dashboard/professors"
        >Professors</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
        active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        exact-active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        to="/dashboard/templates"
        >Templates</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
        active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        exact-active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        to="/dashboard/reminders"
        >Reminders</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
        active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        exact-active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        to="/dashboard/billing"
        >Billing</NuxtLink
      >
      <NuxtLink
        class="block rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
        active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        exact-active-class="bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        to="/dashboard/profile"
        >Profile</NuxtLink
      >
    </nav>
  </aside>
</template>
