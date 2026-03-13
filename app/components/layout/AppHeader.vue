<template>
  <header class="border-b border-slate-200 bg-white">
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <NuxtLink
        to="/"
        class="text-lg font-semibold tracking-tight text-slate-900"
      >
        Scholarship Outreach
      </NuxtLink>
      <nav class="flex items-center gap-5 text-sm text-slate-600">
        <NuxtLink class="hover:text-slate-900" to="/dashboard"
          >Dashboard</NuxtLink
        >
        <NuxtLink class="hover:text-slate-900" to="/auth/login">Login</NuxtLink>
      </nav>
    </div>
  </header>
</template>
