<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Input from '$lib/components/Input.svelte';
  import { GitBranch, ArrowRight } from 'lucide-svelte';
  
  let { data } = $props();
  
  let searchQuery = $state('');
  
  const filteredRepos = $derived(
    data.repos.filter((repo: any) => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<Header title="Sites" />

<main class="mx-auto max-w-5xl px-5 py-8">
  <div class="mb-8">
    <h2 class="text-xl font-semibold tracking-tight">Your Sites</h2>
    <p class="mt-1 text-[14px] text-[--muted-foreground]">Select a site to manage its content</p>
  </div>
  
  <div class="mb-6 max-w-xs">
    <Input
      bind:value={searchQuery}
      icon={GitBranch}
      placeholder="Search sites..."
    />
  </div>

  {#if filteredRepos.length === 0}
    <div class="surface p-10 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
        <GitBranch class="h-5 w-5 text-[--muted-foreground]" />
      </div>
      <p class="text-[14px] font-medium">No sites found</p>
      <p class="mt-1 text-[13px] text-[--muted-foreground]">Try adjusting your search</p>
    </div>
  {:else}
    <div class="grid gap-3 sm:grid-cols-2">
      {#each filteredRepos as repo, i}
        <a 
          href="/admin/repo/{repo.owner}/{repo.name}"
          class="group surface flex items-center gap-4 p-4 transition-all duration-200 hover:bg-secondary/50 hover:shadow-md"
          style="opacity: 0; animation: fadeIn 0.4s ease-out {i * 0.05}s forwards;"
        >
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <GitBranch class="h-4 w-4" />
          </div>
          
          <div class="min-w-0 flex-1">
            <h3 class="text-[14px] font-semibold truncate">{repo.name}</h3>
            <p class="truncate text-[12px] text-[--muted-foreground]">
              {repo.description || 'No description'}
            </p>
          </div>
          
          <ArrowRight class="h-4 w-4 flex-shrink-0 text-[--muted-foreground] transition-transform group-hover:translate-x-0.5" />
        </a>
      {/each}
    </div>
  {/if}
</main>