<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppHeader />
    <div class="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <AppSidebar class="hidden lg:block" />
      <main
        class="min-h-[70vh] flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
