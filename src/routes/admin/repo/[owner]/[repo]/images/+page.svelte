<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { 
    Image,
    Search,
    X,
    Trash2,
    Upload
  } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { toast } from '$lib/stores/toast';
  
  let { data, form } = $props();
  
  let searchQuery = $state('');
  let showDeleteModal = $state(false);
  let selectedFile = $state<any>(null);
  
  const navGroups = $derived([
    {
      title: 'Content',
      items: [
        { label: 'Collections', href: `/admin/repo/${data.owner}/${data.repo}?tab=content`, icon: Image },
      ]
    },
    {
      title: 'Media',
      items: [
        { label: 'Images', href: `/admin/repo/${data.owner}/${data.repo}/images`, icon: Image },
      ]
    },
    {
      title: 'Pages',
      items: [
        { label: 'Pages', href: `/admin/repo/${data.owner}/${data.repo}/pages`, icon: Image },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Settings', href: `/admin/repo/${data.owner}/${data.repo}/settings`, icon: Image },
      ]
    }
  ]);
  
  const filteredImages = $derived(
    (data.images || []).filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  function formatSize(bytes: number) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  $effect(() => {
    if (form?.success) {
      toast(form.message || 'Action completed', 'success');
      showDeleteModal = false;
    } else if (form?.message) {
      toast(form.message, 'error');
    }
  });
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
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold tracking-tight">Images</h2>
        <p class="mt-0.5 text-[13px] text-[--muted-foreground]">
          Upload and manage images
        </p>
      </div>
    </div>
    
    <div class="mb-4 max-w-xs">
      <Input
        bind:value={searchQuery}
        icon={Search}
        placeholder="Search images..."
      />
    </div>

    {#if filteredImages.length > 0}
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {#each filteredImages as item}
          <div class="group relative aspect-square rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
            {#if item.download_url}
              <img 
                src={item.download_url} 
                alt={item.name}
                class="h-full w-full object-cover"
              />
            {/if}
            <div class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40">
              <button
                onclick={() => { selectedFile = item; showDeleteModal = true; }}
                class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-[--muted-foreground] opacity-0 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="surface p-8 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Image class="h-4 w-4 text-[--muted-foreground]" />
        </div>
        <p class="text-[14px] font-medium">No images</p>
        <p class="mt-1 text-[12px] text-[--muted-foreground]">Upload images to get started</p>
      </div>
    {/if}
  </main>
</div>

{#if showDeleteModal && selectedFile}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div class="surface w-full max-w-sm p-5 mx-4 scale-in">
      <h3 class="text-[15px] font-semibold">Delete {selectedFile.name}?</h3>
      <p class="mt-2 text-[13px] text-[--muted-foreground]">
        This action cannot be undone.
      </p>
      
      <form method="POST" action="?/deleteFile" use:enhance>
        <input type="hidden" name="path" value={selectedFile.path} />
        <input type="hidden" name="sha" value={selectedFile.sha} />
        
        <div class="mt-4 flex gap-2">
          <Button variant="secondary" class="flex-1 h-8" onclick={() => { showDeleteModal = false; selectedFile = null; }}>
            Cancel
          </Button>
          <Button variant="danger" class="flex-1 h-8">
            Delete
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}