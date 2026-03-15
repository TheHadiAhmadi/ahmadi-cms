<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { pendingChanges, pendingChangesCount } from '$lib/stores/pending';
  import { publishChanges } from '$lib/client/localSave';
  import { toast } from '$lib/stores/toast';
  import { Cloud, Upload, Loader2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let { repo }: { repo: string } = $props();
  let publishing = $state(false);
  let showDropdown = $state(false);

  onMount(() => {
    pendingChanges.load(repo);
  });

  async function handlePublish() {
    publishing = true;
    const result = await publishChanges(repo);
    publishing = false;
    
    if (result.success) {
      toast('Published successfully!', 'success');
      await pendingChanges.refresh(repo);
    } else {
      toast(result.error || 'Failed to publish', 'error');
    }
  }

  function getChangeTypeLabel(type: string) {
    switch (type) {
      case 'collection': return 'Collection';
      case 'page': return 'Pages';
      case 'setting': return 'Settings';
      case 'edit': return 'Edit';
      case 'upload': return 'Upload';
      case 'delete': return 'Delete';
      default: return type;
    }
  }

  function getChangePathLabel(change: any) {
    if (change.collectionSlug) return change.collectionSlug;
    return change.path.split('/').pop() || change.path;
  }
</script>

<div class="relative">
  <button 
    onclick={() => showDropdown = !showDropdown}
    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors hover:bg-secondary/50"
  >
    <Cloud class="h-3.5 w-3.5 text-amber-500" />
    <span>{$pendingChangesCount}</span>
    {#if $pendingChangesCount > 0}
      <span class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
    {/if}
  </button>

  {#if showDropdown}
    <div class="absolute right-0 top-full mt-1 w-64 rounded-lg border border-border/50 bg-card shadow-lg z-50">
      <div class="p-2 border-b border-border/30">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium text-[--muted-foreground]">PENDING CHANGES</span>
          <span class="text-[10px] text-[--muted-foreground]">{$pendingChangesCount}</span>
        </div>
      </div>
      
      <div class="max-h-48 overflow-y-auto">
        {#if $pendingChanges.length === 0}
          <div class="p-3 text-center text-[12px] text-[--muted-foreground]">
            No pending changes
          </div>
        {:else}
          {#each $pendingChanges as change}
            <div class="flex items-center gap-2 px-2.5 py-2 hover:bg-secondary/30 text-[12px]">
              <Upload class="h-3 w-3 text-amber-500" />
              <span class="flex-1 truncate">{getChangePathLabel(change)}</span>
              <span class="text-[10px] text-[--muted-foreground]">{getChangeTypeLabel(change.type)}</span>
            </div>
          {/each}
        {/if}
      </div>

      {#if $pendingChanges.length > 0}
        <div class="p-2 border-t border-border/30">
          <Button 
            size="sm" 
            class="w-full justify-center" 
            onclick={handlePublish}
            disabled={publishing}
          >
            {#if publishing}
              <Loader2 class="h-3 w-3 animate-spin" />
              Publishing...
            {:else}
              <Upload class="h-3 w-3" />
              Publish to GitHub
            {/if}
          </Button>
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if showDropdown}
  <button 
    class="fixed inset-0 z-40" 
    onclick={() => showDropdown = false}
    aria-label="Close dropdown"
  ></button>
{/if}
