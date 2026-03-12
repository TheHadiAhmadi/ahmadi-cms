<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon } from 'lucide-svelte';
  
  let isDark = $state(false);
  
  onMount(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark = true;
      document.documentElement.classList.add('dark');
    }
  });
  
  function toggle() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
</script>

<button
  onclick={toggle}
  class="flex h-9 w-9 items-center justify-center rounded-xl text-[--muted-foreground] transition-all hover:bg-secondary hover:text-foreground"
  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if isDark}
    <Moon class="h-4 w-4" />
  {:else}
    <Sun class="h-4 w-4" />
  {/if}
</button>