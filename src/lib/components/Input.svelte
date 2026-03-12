<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  
  let {
    value = $bindable(''),
    class: className = '',
    icon: Icon,
    ...rest
  }: {
    value?: string;
    class?: string;
    icon?: typeof import('lucide-svelte').Search;
  } & HTMLInputAttributes = $props();
</script>

<div class="relative {className}">
  {#if Icon}
    <Icon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--muted-foreground]" />
  {/if}
  <input
    bind:value
    class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 pl-9 text-[13px] transition-all placeholder:text-[--muted-foreground] hover:border-border hover:bg-secondary/30 focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
    {...rest}
  />
</div>