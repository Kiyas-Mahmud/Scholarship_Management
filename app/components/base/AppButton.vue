<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary";
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: "button",
    variant: "primary",
    loading: false,
    disabled: false,
  },
);
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :class="[
      'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
      props.variant === 'primary'
        ? 'bg-slate-900 text-white hover:bg-slate-800'
        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    ]"
  >
    <span v-if="props.loading">Please wait...</span>
    <slot v-else />
  </button>
</template>
