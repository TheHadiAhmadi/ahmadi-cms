<script lang="ts">
  import { page } from '$app/stores';
  
  interface NavItem {
    label: string;
    href: string;
    icon: any;
  }
  
  interface NavGroup {
    title: string;
    items: NavItem[];
  }
  
  let { 
    owner, 
    repo,
    groups
  }: {
    owner: string;
    repo: string;
    groups: NavGroup[];
  } = $props();
  
  function isActive(href: string) {
    return $page.url.pathname.includes(href);
  }
</script>

<aside class="w-56 flex-shrink-0 border-r border-border/50 bg-card/50">
  <nav class="flex flex-col p-3">
    {#each groups as group}
      <div class="mb-4">
        <h3 class="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[--muted-foreground]">
          {group.title}
        </h3>
        <ul class="space-y-0.5">
          {#each group.items as item}
            <li>
              <a
                href={item.href}
                class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors {isActive(item.href) ? 'bg-secondary text-foreground' : 'text-[--muted-foreground] hover:bg-secondary/50 hover:text-foreground'}"
              >
                <svelte:component this={item.icon} class="h-4 w-4" />
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>
</aside>