<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Input from '$lib/components/Input.svelte';
  import { GitBranch, ArrowRight, Loader2, Globe, Layout, Image, FileText, Settings } from 'lucide-svelte';
  
  let { data } = $props();
  
  let searchQuery = $state('');
  let isNavigating = $state(false);
  let navigatedRepo = $state('');
  
  const filteredRepos = $derived(
    data.repos.filter((repo: any) => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function handleNavigate(repoName: string) {
    isNavigating = true;
    navigatedRepo = repoName;
  }
</script>

<Header title="Sites" />

<main class="mx-auto max-w-4xl px-5 py-8">
  <div class="mb-8">
    <h2 class="text-2xl font-semibold tracking-tight">Your Sites</h2>
    <p class="mt-2 text-[14px] text-[--muted-foreground]">Select a site to manage its content, pages, and settings</p>
  </div>
  
  <div class="mb-6">
    <Input
      bind:value={searchQuery}
      icon={GitBranch}
      placeholder="Search sites..."
    />
  </div>

  {#if isNavigating}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div class="surface p-8 rounded-2xl flex flex-col items-center gap-4">
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
        <div class="text-center">
          <p class="text-[15px] font-medium">Loading {navigatedRepo}</p>
          <p class="text-[13px] text-[--muted-foreground] mt-1">Fetching content...</p>
        </div>
      </div>
    </div>
  {/if}

  {#if filteredRepos.length === 0}
    <div class="surface p-12 rounded-2xl text-center">
      <div class="mx-auto mb-4 w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
        <GitBranch class="h-7 w-7 text-[--muted-foreground]" />
      </div>
      <p class="text-[15px] font-medium">No sites found</p>
      <p class="mt-1 text-[13px] text-[--muted-foreground]">Try adjusting your search</p>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each filteredRepos as repo, i}
        <a 
          href="/admin/repo/{repo.name}"
          onclick={() => handleNavigate(repo.name)}
          class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          style="opacity: 0; animation: fadeIn 0.5s ease-out {i * 0.08}s forwards;"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          
          <div class="relative flex items-center gap-5">
            <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Globe class="h-6 w-6 text-primary" />
            </div>
            
            <div class="min-w-0 flex-1">
              <h3 class="text-[16px] font-semibold truncate group-hover:text-primary transition-colors">{repo.name}</h3>
              <p class="mt-1 truncate text-[13px] text-[--muted-foreground]">
                {repo.description || 'No description'}
              </p>
              <div class="mt-3 flex items-center gap-4 text-[11px] text-[--muted-foreground]">
                <span class="flex items-center gap-1">
                  <Layout class="h-3 w-3" />
                  Collections
                </span>
                <span class="flex items-center gap-1">
                  <FileText class="h-3 w-3" />
                  Pages
                </span>
                <span class="flex items-center gap-1">
                  <Image class="h-3 w-3" />
                  Media
                </span>
              </div>
            </div>
            
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
              <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</main>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
