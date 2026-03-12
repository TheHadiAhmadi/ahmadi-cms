<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-svelte';
  import { toasts } from '$lib/stores/toast';
  
  function getIcon(type: string) {
    if (type === 'success') return CheckCircle;
    if (type === 'error') return XCircle;
    return AlertCircle;
  }
  
  function getStyles(type: string) {
    if (type === 'success') return 'bg-green-500/10 text-green-600 ring-green-500/20 dark:text-green-400 dark:ring-green-500/30';
    if (type === 'error') return 'bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400 dark:ring-red-500/30';
    return 'bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400 dark:ring-blue-500/30';
  }
</script>

<div class="fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
  {#each $toasts as t (t.id)}
    <div 
      in:fly={{ y: -20, duration: 300 }}
      out:fade={{ duration: 200 }}
      class="flex items-center gap-3 rounded-lg px-4 py-2.5 shadow-lg ring-1 {getStyles(t.type)}"
    >
      <svelte:component this={getIcon(t.type)} class="h-4 w-4 flex-shrink-0" />
      <span class="text-[13px] font-medium">{t.message}</span>
      <button onclick={() => toasts.remove(t.id)} class="ml-1 flex h-5 w-5 items-center justify-center rounded hover:bg-black/5">
        <X class="h-3 w-3" />
      </button>
    </div>
  {/each}
</div>