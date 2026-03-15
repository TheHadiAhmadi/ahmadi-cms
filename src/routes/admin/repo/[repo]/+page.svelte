<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { 
    FolderOpen, 
    FileText, 
    Plus, 
    Image,
    Search,
    FileCode,
    FileJson,
    File,
    X,
    Settings,
    Layers
  } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { toast } from '$lib/stores/toast';
  
  let { data, form } = $props();
  
  let searchQuery = $state('');
  let showCreateModal = $state(false);
  
  let newFileName = $state('');
  let newFileType = $state<'file' | 'folder'>('file');
  
  const navGroups = $derived([
    {
      title: 'Content',
      items: [
        ...(data.collections || []).map((c: any) => ({ 
          label: c.name, 
          href: `/admin/repo/${data.repo}/collection/${c.name}`, 
          icon: Layers 
        }))
      ]
    },
    {
      title: 'Pages',
      items: [
        { label: 'All Pages', href: `/admin/repo/${data.repo}/pages`, icon: FileText }
      ]
    },
    {
      title: 'Media',
      items: [
        { label: 'Images', href: `/admin/repo/${data.repo}/images`, icon: Image }
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Settings', href: `/admin/repo/${data.repo}/settings`, icon: Settings }
      ]
    }
  ]);
  
  const filteredContents = $derived(
    (data.contents || []).filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredCollections = $derived(
    (data.collections || []).filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  function getFileIcon(name: string, type: string) {
    if (type === 'dir') return FolderOpen;
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'md' || ext === 'markdown') return FileText;
    if (ext === 'json') return FileJson;
    if (ext === 'js' || ext === 'ts') return FileCode;
    return File;
  }
  
  function getIconBg(name: string, type: string) {
    if (type === 'dir') return 'bg-amber-500/10 text-amber-600';
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'md' || ext === 'markdown') return 'bg-blue-500/10 text-blue-600';
    if (ext === 'json') return 'bg-purple-500/10 text-purple-600';
    return 'bg-secondary text-[--muted-foreground]';
  }
  
  function formatSize(bytes: number) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  $effect(() => {
    if (form?.success) {
      toast(form.message || 'Created successfully', 'success');
      showCreateModal = false;
    } else if (form?.message) {
      toast(form.message, 'error');
    }
  });
</script>

<Header title={data.repo} showBack={true} backHref="/admin/repos" />

<div class="flex min-h-[calc(100vh-3.5rem)]">
  <Sidebar repo={data.repo} groups={navGroups} />
  
  <main class="flex-1 p-5">
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold tracking-tight">Collections</h2>
        <p class="mt-0.5 text-[13px] text-[--muted-foreground]">Manage your content</p>
      </div>
      <Button size="sm" onclick={() => showCreateModal = true}>
        <Plus class="h-3.5 w-3.5" /> New
      </Button>
    </div>
    
    <div class="mb-4 max-w-xs">
      <Input bind:value={searchQuery} icon={Search} placeholder="Search..." />
    </div>

    {#if filteredCollections.length > 0}
      <div class="mb-6">
        <h3 class="mb-3 text-[13px] font-medium text-[--muted-foreground]">Collections</h3>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {#each filteredCollections as coll}
            <a href="/admin/repo/{data.repo}/collection/{coll.name}" class="flex items-center gap-2 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:bg-secondary/50">
              <div class="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                <FolderOpen class="h-4 w-4" />
              </div>
              <span class="text-[13px] font-medium">{coll.name}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    {#if filteredContents.length > 0}
      <div>
        <h3 class="mb-3 text-[13px] font-medium text-[--muted-foreground]">Files</h3>
        <div class="flex flex-col rounded-xl border border-border/50 bg-card">
          {#each filteredContents as item}
            {@const Icon = getFileIcon(item.name, item.type)}
            <a href="/admin/repo/{data.repo}/edit/{item.path}" class="flex items-center gap-3 border-b border-border/30 px-4 py-2.5 transition-colors hover:bg-secondary/50 last:border-b-0">
              <div class="flex h-8 w-8 items-center justify-center rounded-md {getIconBg(item.name, item.type)}">
                <Icon class="h-3.5 w-3.5" />
              </div>
              <span class="flex-1 text-[13px] font-medium">{item.name}</span>
              <span class="text-[11px] text-[--muted-foreground]">{formatSize(item.size)}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}
    
    {#if filteredCollections.length === 0 && filteredContents.length === 0}
      <div class="surface p-8 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Layers class="h-4 w-4 text-[--muted-foreground]" />
        </div>
        <p class="text-[14px] font-medium">No content yet</p>
        <p class="mt-1 text-[12px] text-[--muted-foreground]">Create collections or add files</p>
        <div class="mt-4">
          <Button size="sm" onclick={() => showCreateModal = true}>
            <Plus class="h-3.5 w-3.5" /> Create
          </Button>
        </div>
      </div>
    {/if}
  </main>
</div>

{#if showCreateModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div class="surface w-full max-w-sm p-5 mx-4 scale-in">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-[15px] font-semibold">Create New</h3>
        <button onclick={() => showCreateModal = false} class="flex h-7 w-7 items-center justify-center rounded-md text-[--muted-foreground] transition-colors hover:bg-secondary">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
      
      <form method="POST" action="?/createFile" use:enhance={() => {
        return async ({ update }) => {
          await update();
          if (form?.success) showCreateModal = false;
        };
      }}>
        <input type="hidden" name="path" value={data.currentPath} />
        
        <div class="space-y-3">
          <div class="flex gap-1.5 rounded-lg bg-secondary p-1">
            <button type="button" onclick={() => newFileType = 'file'} class="flex-1 rounded-md py-1.5 text-[12px] font-medium transition-all {newFileType === 'file' ? 'bg-card shadow-sm' : 'text-[--muted-foreground]'}">File</button>
            <button type="button" onclick={() => newFileType = 'folder'} class="flex-1 rounded-md py-1.5 text-[12px] font-medium transition-all {newFileType === 'folder' ? 'bg-card shadow-sm' : 'text-[--muted-foreground]'}">Collection</button>
          </div>
          <input type="text" name="name" bind:value={newFileName} placeholder={newFileType === 'folder' ? 'collection-name' : 'filename.md'} class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20" required />
        </div>
        
        <input type="hidden" name="type" value={newFileType === 'folder' ? 'folder' : 'file'} />
        
        <div class="mt-4 flex gap-2">
          <Button variant="secondary" class="flex-1 h-8" onclick={() => showCreateModal = false}>Cancel</Button>
          <Button class="flex-1 h-8">Create</Button>
        </div>
      </form>
    </div>
  </div>
{/if}