<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { FileText, Search } from 'lucide-svelte';
  import Input from '$lib/components/Input.svelte';
  
  let { data } = $props();
  
  let searchQuery = $state('');
  
  const navGroups = $derived([
    {
      title: 'Content',
      items: [
        { label: 'Collections', href: `/admin/repo/${data.owner}/${data.repo}?tab=content`, icon: FileText },
      ]
    },
    {
      title: 'Media',
      items: [
        { label: 'Images', href: `/admin/repo/${data.owner}/${data.repo}/images`, icon: FileText },
      ]
    },
    {
      title: 'Pages',
      items: [
        { label: 'Pages', href: `/admin/repo/${data.owner}/${data.repo}/pages`, icon: FileText },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Settings', href: `/admin/repo/${data.owner}/${data.repo}/settings`, icon: FileText },
      ]
    }
  ]);
  
  const filteredPages = $derived(
    (data.pages || []).filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<Header 
  title={data.repo} 
  showBack={true}
  backHref="/admin/repos"
/>

<div class="flex min-h-[calc(100vh-3.5rem)]">
  <Sidebar 
    owner={data.owner} 
    repo={data.repo} 
    groups={navGroups}
  />
  
  <main class="flex-1 p-5">
    <div class="mb-5">
      <h2 class="text-lg font-semibold tracking-tight">Pages</h2>
      <p class="mt-0.5 text-[13px] text-[--muted-foreground]">
        Manage your pages
      </p>
    </div>
    
    <div class="mb-4 max-w-xs">
      <Input
        bind:value={searchQuery}
        icon={Search}
        placeholder="Search pages..."
      />
    </div>

    {#if filteredPages.length > 0}
      <div class="flex flex-col rounded-xl border border-border/50 bg-card">
        {#each filteredPages as item}
          <a 
            href="/admin/repo/{data.owner}/{data.repo}/edit/{item.path}"
            class="flex items-center gap-3 border-b border-border/30 px-4 py-2.5 transition-colors hover:bg-secondary/50 last:border-b-0"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
              <FileText class="h-3.5 w-3.5" />
            </div>
            <span class="flex-1 text-[13px] font-medium">{item.name}</span>
          </a>
        {/each}
      </div>
    {:else}
      <div class="surface p-8 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <FileText class="h-4 w-4 text-[--muted-foreground]" />
        </div>
        <p class="text-[14px] font-medium">No pages</p>
        <p class="mt-1 text-[12px] text-[--muted-foreground]">Pages will appear here</p>
      </div>
    {/if}
  </main>
</div>