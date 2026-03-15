<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { Settings, Layers, Image, FileText } from 'lucide-svelte';
  
  let { data } = $props();
  
  const navGroups = $derived([
    {
      title: 'Content',
      items: [
        { label: 'Collections', href: `/admin/repo/${data.repo}`, icon: Layers }
      ]
    },
    {
      title: 'Media',
      items: [
        { label: 'Images', href: `/admin/repo/${data.repo}/images`, icon: Image }
      ]
    },
    {
      title: 'Pages',
      items: [
        { label: 'Pages', href: `/admin/repo/${data.repo}/pages`, icon: FileText }
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Settings', href: `/admin/repo/${data.repo}/settings`, icon: Settings }
      ]
    }
  ]);
</script>

<Header title={data.repo} showBack={true} backHref="/admin/repos" />

<div class="flex min-h-[calc(100vh-3.5rem)]">
  <Sidebar repo={data.repo} groups={navGroups} />
  
  <main class="flex-1 p-5">
    <div class="mb-5">
      <h2 class="text-lg font-semibold tracking-tight">Settings</h2>
      <p class="mt-0.5 text-[13px] text-[--muted-foreground]">Configure your site settings</p>
    </div>
    
    <div class="surface p-6 max-w-lg">
      <div class="space-y-4">
        <div>
          <label for="content-path" class="text-[13px] font-medium block mb-1.5">Content Path</label>
          <input 
            id="content-path"
            type="text" 
            value={data.config?.contentPath || 'src/content'}
            readonly
            class="h-9 w-full rounded-lg border border-border/60 bg-secondary/50 px-3 text-[13px]"
          />
        </div>
        <div>
          <label for="images-path" class="text-[13px] font-medium block mb-1.5">Images Path</label>
          <input 
            id="images-path"
            type="text" 
            value={data.config?.imagePath || 'public/files'}
            readonly
            class="h-9 w-full rounded-lg border border-border/60 bg-secondary/50 px-3 text-[13px]"
          />
        </div>
        <div>
          <label for="pages-path" class="text-[13px] font-medium block mb-1.5">Pages Path</label>
          <input 
            id="pages-path"
            type="text" 
            value={data.config?.pagesPath || 'src/pages'}
            readonly
            class="h-9 w-full rounded-lg border border-border/60 bg-secondary/50 px-3 text-[13px]"
          />
        </div>
      </div>
    </div>
  </main>
</div>