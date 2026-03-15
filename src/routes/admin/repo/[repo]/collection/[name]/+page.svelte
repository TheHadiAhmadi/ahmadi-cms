<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import PendingChanges from '$lib/components/PendingChanges.svelte';
  import { 
    Settings, Layers, Image, FileText, Plus, Search, 
    Edit, Trash2, Eye, EyeOff, Loader2, X
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';
  import { saveCollectionEntry, publishChanges } from '$lib/client/localSave';
  import { pendingChanges } from '$lib/stores/pending';
  import { onMount } from 'svelte';

  let { data } = $props();
  
  let entries = $state<any[]>(data.entries || []);
  let entriesSha = $state<string | null>(data.entriesSha || null);
  let searchQuery = $state('');
  let showEditor = $state(false);
  let editingIndex = $state<number | null>(null);
  let saving = $state(false);
  let publishing = $state(false);
  
  let entryForm = $state<Record<string, any>>({});
  
  const collectionDef = $derived(data.collectionDef);
  const fields = $derived(collectionDef?.fields || []);
  
  const filteredEntries = $derived(
    entries.filter((e: any) => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return Object.values(e).some((v: any) => 
        String(v).toLowerCase().includes(search)
      );
    })
  );

  onMount(() => {
    pendingChanges.load(data.repo);
  });

  function createNewEntry() {
    const newEntry: Record<string, any> = {};
    for (const field of fields) {
      if (field.type === 'boolean') {
        newEntry[field.name] = field.default ?? false;
      } else if (field.type === 'date') {
        newEntry[field.name] = new Date().toISOString().split('T')[0];
      } else {
        newEntry[field.name] = '';
      }
    }
    entryForm = newEntry;
    editingIndex = null;
    showEditor = true;
  }

  function editEntry(entry: any, index: number) {
    entryForm = { ...entry };
    editingIndex = index;
    showEditor = true;
  }

  async function saveEntry() {
    saving = true;
    
    let newEntries = [...entries];
    if (editingIndex !== null && editingIndex >= 0) {
      newEntries[editingIndex] = entryForm;
    } else {
      newEntries.push(entryForm);
    }
    
    const result = await saveCollectionEntry(data.repo, data.collectionSlug, newEntries, entriesSha || undefined);
    
    saving = false;
    
    if (result.success) {
      entries = newEntries;
      toast(editingIndex !== null ? 'Entry updated locally' : 'Entry created locally', 'success');
      showEditor = false;
      pendingChanges.refresh(data.repo);
    } else {
      toast(result.error || 'Failed to save', 'error');
    }
  }

  async function deleteEntry(index: number) {
    if (!confirm('Delete this entry?')) return;
    
    const newEntries = entries.filter((_, i) => i !== index);
    const result = await saveCollectionEntry(data.repo, data.collectionSlug, newEntries, entriesSha || undefined);
    
    if (result.success) {
      entries = newEntries;
      toast('Entry deleted locally', 'success');
      pendingChanges.refresh(data.repo);
    } else {
      toast(result.error || 'Failed to delete', 'error');
    }
  }

  async function publish() {
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

  function getFieldValue(entry: any, fieldName: string) {
    return entry[fieldName] ?? '';
  }

  function renderFieldValue(entry: any, field: any) {
    const value = entry[field.name];
    if (field.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (field.type === 'markdown') {
      return (value || '').substring(0, 100) + ((value || '').length > 100 ? '...' : '');
    }
    return value || '-';
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

<Header title={data.repo} showBack={true} backHref="/admin/repos">
  <PendingChanges repo={data.repo} />
</Header>

<div class="flex min-h-[calc(100vh-3.5rem)]">
  <Sidebar repo={data.repo} groups={navGroups} />
  
  <main class="flex-1 p-5">
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold tracking-tight">{collectionDef?.label || data.collectionSlug}</h2>
        <p class="mt-0.5 text-[13px] text-[--muted-foreground]">Manage {collectionDef?.labelSingular || 'entries'}</p>
      </div>
      <div class="flex gap-2">
        <Button variant="secondary" size="sm" onclick={publish} disabled={publishing}>
          {#if publishing}
            <Loader2 class="h-3.5 w-3.5 animate-spin" />
          {:else}
            Publish
          {/if}
        </Button>
        <Button size="sm" onclick={createNewEntry}>
          <Plus class="h-3.5 w-3.5" /> New {collectionDef?.labelSingular || 'Entry'}
        </Button>
      </div>
    </div>
    
    <div class="mb-4 max-w-xs">
      <Input bind:value={searchQuery} icon={Search} placeholder="Search..." />
    </div>

    {#if fields.length === 0}
      <div class="surface p-8 text-center">
        <p class="text-[14px] text-[--muted-foreground]">No fields defined for this collection</p>
      </div>
    {:else if filteredEntries.length === 0}
      <div class="surface p-8 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Layers class="h-4 w-4 text-[--muted-foreground]" />
        </div>
        <p class="text-[14px] font-medium">No entries yet</p>
        <p class="mt-1 text-[12px] text-[--muted-foreground]">Create your first entry</p>
        <div class="mt-4">
          <Button size="sm" onclick={createNewEntry}>
            <Plus class="h-3.5 w-3.5" /> Create
          </Button>
        </div>
      </div>
    {:else}
      <div class="rounded-xl border border-border/50 bg-card overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border/30 bg-secondary/30">
              {#each fields.slice(0, 4) as field}
                <th class="px-4 py-2.5 text-left text-[11px] font-medium text-[--muted-foreground] uppercase tracking-wide">{field.label}</th>
              {/each}
              <th class="w-24 px-4 py-2.5 text-right text-[11px] font-medium text-[--muted-foreground] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredEntries as entry, index}
              <tr class="border-b border-border/30 last:border-b-0 hover:bg-secondary/20">
                {#each fields.slice(0, 4) as field}
                  <td class="px-4 py-3 text-[13px]">
                    {renderFieldValue(entry, field)}
                  </td>
                {/each}
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button onclick={() => editEntry(entry, index)} class="p-1.5 rounded-md text-[--muted-foreground] hover:bg-secondary hover:text-foreground transition-colors">
                      <Edit class="h-3.5 w-3.5" />
                    </button>
                    <button onclick={() => deleteEntry(index)} class="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </main>
</div>

{#if showEditor}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div class="surface w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scale-in">
      <div class="flex items-center justify-between p-4 border-b border-border/30">
        <h3 class="text-[15px] font-semibold">
          {editingIndex !== null ? 'Edit' : 'New'} {collectionDef?.labelSingular || 'Entry'}
        </h3>
        <button onclick={() => showEditor = false} class="flex h-7 w-7 items-center justify-center rounded-md text-[--muted-foreground] hover:bg-secondary">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
      
      <form onsubmit={(e) => { e.preventDefault(); saveEntry(); }} class="p-4 space-y-4">
        {#each fields as field}
          <div>
            <label for={field.name} class="text-[13px] font-medium block mb-1.5">
              {field.label}
              {#if field.required}<span class="text-red-500">*</span>{/if}
            </label>
            
            {#if field.type === 'textarea'}
              <textarea
                id={field.name}
                bind:value={entryForm[field.name]}
                rows={4}
                class="w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required={field.required}
              ></textarea>
            {:else if field.type === 'markdown'}
              <textarea
                id={field.name}
                bind:value={entryForm[field.name]}
                rows={6}
                class="w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 font-mono"
                required={field.required}
              ></textarea>
            {:else if field.type === 'boolean'}
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={entryForm[field.name]}
                  class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span class="text-[13px] text-[--muted-foreground]">{field.default ? 'Enabled' : 'Disabled'}</span>
              </label>
            {:else if field.type === 'select'}
              <select
                id={field.name}
                bind:value={entryForm[field.name]}
                class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required={field.required}
              >
                <option value="">Select...</option>
                {#if field.options}
                  {#each field.options as option}
                    <option value={option}>{option}</option>
                  {/each}
                {/if}
              </select>
            {:else if field.type === 'date'}
              <input
                type="date"
                id={field.name}
                bind:value={entryForm[field.name]}
                class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required={field.required}
              />
            {:else if field.type === 'image'}
              <input
                type="url"
                id={field.name}
                bind:value={entryForm[field.name]}
                placeholder="https://..."
                class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            {:else if field.type === 'number'}
              <input
                type="number"
                id={field.name}
                bind:value={entryForm[field.name]}
                class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required={field.required}
              />
            {:else}
              <input
                type="text"
                id={field.name}
                bind:value={entryForm[field.name]}
                class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required={field.required}
              />
            {/if}
          </div>
        {/each}
        
        <div class="flex gap-2 pt-2">
          <Button variant="secondary" class="flex-1 h-9" onclick={() => showEditor = false}>Cancel</Button>
          <Button class="flex-1 h-9" type="submit" disabled={saving}>
            {#if saving}
              <Loader2 class="h-3.5 w-3.5 animate-spin" />
            {/if}
            Save Locally
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
