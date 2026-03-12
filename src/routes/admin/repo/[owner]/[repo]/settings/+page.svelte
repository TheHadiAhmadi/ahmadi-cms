<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { Settings } from 'lucide-svelte';
  
  let { data } = $props();
  
  const navGroups = $derived([
    {
      title: 'Content',
      items: [
        { label: 'Collections', href: `/admin/repo/${data.owner}/${data.repo}?tab=content`, icon: Settings },
      ]
    },
    {
      title: 'Media',
      items: [
        { label: 'Images', href: `/admin/repo/${data.owner}/${data.repo}/images`, icon: Settings },
      ]
    },
    {
      title: 'Pages',
      items: [
        { label: 'Pages', href: `/admin/repo/${data.owner}/${data.repo}/pages`, icon: Settings },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Settings', href: `/admin/repo/${data.owner}/${data.repo}/settings`, icon: Settings },
      ]
    }
  ]);
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
      <h2 class="text-lg font-semibold tracking-tight">Settings</h2>
      <p class="mt-0.5 text-[13px] text-[--muted-foreground]">
        Configure your site settings
      </p>
    </div>
    
    <div class="surface p-6 max-w-lg">
      <div class="space-y-4">
        <div>
          <label class="text-[13px] font-medium block mb-1.5">Content Path</label>
          <input 
            type="text" 
            value={data.config.contentPath || 'src/content'}
            readonly
            class="h-9 w-full rounded-lg border border-border/60 bg-secondary/50 px-3 text-[13px]"
          />
        </div>
        <div>
          <label class="text-[13px] font-medium block mb-1.5">Images Path</label>
          <input 
            type="text" 
            value={data.config.imagePath || 'public/files'}
            readonly
            class="h-9 w-full rounded-lg border border-border/60 bg-secondary/50 px-3 text-[13px]"
          />
        </div>
        <div>
          <label class="text-[13px] font-medium block mb-1.5">Pages Path</label>
          <input 
            type="text" 
            value={data.config.pagesPath || 'src/pages'}
            readonly
            class="h-9 w-full rounded-lg border border-border/60 bg-secondary/50 px-3 text-[13px]"
          />
        </div>
      </div>
    </div>
  </main>
</div>