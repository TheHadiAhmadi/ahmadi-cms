<script lang="ts">
  import type { Snippet } from 'svelte';
  import { LogOut, Globe, ChevronLeft } from 'lucide-svelte';
  import { page } from '$app/stores';
  import ThemeToggle from './ThemeToggle.svelte';
  
  let { 
    title = 'CMS',
    showBack = false,
    backHref = '/admin/repos',
    showActions = true,
    children
  }: {
    title?: string;
    showBack?: boolean;
    backHref?: string;
    showActions?: boolean;
    children?: Snippet;
  } = $props();
  
  const isRoot = $derived($page.url.pathname === '/admin/repos');
</script>

<header class="sticky top-0 z-50 border-b border-border/50 glass">
  <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
    <div class="flex items-center gap-3">
      {#if showBack && !isRoot}
        <a 
          href={backHref}
          class="flex h-8 w-8 items-center justify-center rounded-lg text-[--muted-foreground] transition-all hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft class="h-4 w-4" />
        </a>
      {/if}
      
      <div class="flex items-center gap-2.5">
        <div class="gradient-bg flex h-7 w-7 items-center justify-center rounded-md shadow-lg shadow-primary/20">
          <svg class="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="text-[15px] font-semibold tracking-tight">{title}</h1>
      </div>
    </div>
    
    {#if showActions}
      <div class="flex items-center gap-1">
        {#if children}
          {@render children()}
        {/if}
        <a 
          href="/admin/repos"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-[--muted-foreground] transition-all hover:bg-secondary hover:text-foreground"
        >
          <Globe class="h-3.5 w-3.5" />
          <span class="hidden sm:inline">Sites</span>
        </a>
        <ThemeToggle />
        <a 
          href="/logout"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-[--muted-foreground] transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
          title="Sign out"
        >
          <LogOut class="h-3.5 w-3.5" />
        </a>
      </div>
    {/if}
  </div>
</header>