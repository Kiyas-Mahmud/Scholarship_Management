<template>
  <div class="min-h-screen bg-zinc-100 text-zinc-900">
    <AppHeader />
    <div class="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <AppSidebar class="hidden lg:block" />
      <main
        class="min-h-[70vh] flex-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
