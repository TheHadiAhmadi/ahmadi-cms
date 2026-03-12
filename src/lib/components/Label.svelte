<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements';
  
  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: import('svelte').Snippet;
  } & HTMLLabelAttributes = $props();
</script>

<label class="text-[13px] font-medium text-[--foreground] {className}" {...rest}>
  {@render children?.()}
</label>