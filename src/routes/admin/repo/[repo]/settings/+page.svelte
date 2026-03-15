<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Button from '$lib/components/Button.svelte';
  import PendingChanges from '$lib/components/PendingChanges.svelte';
  import { Settings, Layers, Image, FileText, Loader2, X, Plus, Trash2 } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';
  import { saveSettings, publishChanges } from '$lib/client/localSave';
  import { pendingChanges } from '$lib/stores/pending';
  import { onMount } from 'svelte';

  let { data } = $props();

  let settingsData = $state<any>(data.settings || {});
  let settingsSha = $state<string | null>(data.settingsSha || null);
  let saving = $state(false);
  let publishing = $state(false);
  let showEditor = $state(false);
  let editingSingleton = $state<string | null>(null);
  
  const singletons = $derived(data.config?.singletons || []);

  onMount(() => {
    pendingChanges.load(data.repo);
  });

  async function saveSettingsData() {
    saving = true;
    const result = await saveSettings(data.repo, settingsData, settingsSha || undefined);
    saving = false;
    
    if (result.success) {
      toast('Settings saved locally', 'success');
      pendingChanges.refresh(data.repo);
    } else {
      toast(result.error || 'Failed to save', 'error');
    }
  }

  async function handlePublish() {
    publishing = true;
    const result = await publishChanges(data.repo);
    publishing = false;
    
    if (result.success) {
      toast('Published successfully!', 'success');
      pendingChanges.refresh(data.repo);
    } else {
      toast(result.error || 'Failed to publish', 'error');
    }
  }

  function editSingleton(slug: string) {
    editingSingleton = slug;
    showEditor = true;
  }

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
        { label: 'Pages', href: `/admin/repo/${data.repo}`, icon: FileText }
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

<Header title={data.repo} showBack={true} backHref="/admin/repos">
  <PendingChanges repo={data.repo} />
</Header>

<div class="flex min-h-[calc(100vh-3.5rem)]">
  <Sidebar repo={data.repo} groups={navGroups} />
  
  <main class="flex-1 p-5">
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold tracking-tight">Settings</h2>
        <p class="mt-0.5 text-[13px] text-[--muted-foreground]">Configure your site settings</p>
      </div>
      <div class="flex gap-2">
        <Button variant="secondary" size="sm" onclick={handlePublish} disabled={publishing}>
          {#if publishing}
            <Loader2 class="h-3.5 w-3.5 animate-spin" />
          {:else}
            Publish
          {/if}
        </Button>
        <Button size="sm" onclick={() => { showEditor = true; editingSingleton = null; }} disabled={singletons.length === 0}>
          <Plus class="h-3.5 w-3.5" /> Edit Settings
        </Button>
      </div>
    </div>

    {#if singletons.length === 0}
      <div class="surface p-8 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Settings class="h-4 w-4 text-[--muted-foreground]" />
        </div>
        <p class="text-[14px] font-medium">No settings configured</p>
        <p class="mt-1 text-[12px] text-[--muted-foreground]">Add singletons to config.json</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each singletons as singleton}
          <button 
            onclick={() => editSingleton(singleton.slug)}
            class="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-colors hover:bg-secondary/50"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings class="h-4 w-4" />
            </div>
            <div>
              <p class="text-[14px] font-medium">{singleton.label}</p>
              <p class="text-[12px] text-[--muted-foreground]">{singleton.slug}</p>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </main>
</div>

{#if showEditor}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div class="surface w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scale-in">
      <div class="flex items-center justify-between p-4 border-b border-border/30">
        <h3 class="text-[15px] font-semibold">
          {editingSingleton ? editingSingleton : 'Site Settings'}
        </h3>
        <button onclick={() => showEditor = false} class="flex h-7 w-7 items-center justify-center rounded-md text-[--muted-foreground] hover:bg-secondary">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
      
      <div class="p-4 space-y-4">
        <p class="text-[13px] text-[--muted-foreground]">Edit settings for your site.</p>
        
        {#each singletons as singleton}
          <div class="space-y-3">
            <h4 class="text-[13px] font-medium">{singleton.label}</h4>
            <div class="grid gap-3">
              {#each Object.keys(settingsData[singleton.slug] || {}) as key}
                <div>
                  <label for={key} class="text-[12px] font-medium block mb-1 capitalize">{key}</label>
                  <input 
                    id={key}
                    type="text"
                    bind:value={settingsData[singleton.slug][key]}
                    class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px]"
                  />
                </div>
              {/each}
            </div>
          </div>
        {/each}
        
        <div class="flex gap-2 pt-2 border-t border-border/30">
          <Button variant="secondary" class="flex-1 h-9" onclick={() => showEditor = false}>Cancel</Button>
          <Button class="flex-1 h-9" onclick={saveSettingsData} disabled={saving}>
            {#if saving}
              <Loader2 class="h-3.5 w-3.5 animate-spin" />
            {/if}
            Save Locally
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
