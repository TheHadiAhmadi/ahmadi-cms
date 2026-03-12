<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Button from '$lib/components/Button.svelte';
  import { Loader2, FileCode, FileJson, CheckCircle, Circle, ArrowLeft } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { toast } from '$lib/stores/toast';
  
  let { data, form } = $props();
  
  let content = $state('');
  let isPublishing = $state(false);
  let publishedMessage = $state('');
  let originalContent = $state('');
  
  $effect(() => {
    content = data.content;
    originalContent = data.content;
  });

  $effect(() => {
    if (form?.success) {
      toast(form.message || 'Published successfully!', 'success');
      originalContent = content;
      publishedMessage = '';
    } else if (form?.message) {
      toast(form.message, 'error');
    }
  });
  
  const hasChanges = $derived(content !== originalContent);
  
  function getFileType(path: string) {
    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'md' || ext === 'markdown') return { type: 'Markdown', icon: FileCode };
    if (ext === 'json') return { type: 'JSON', icon: FileJson };
    return { type: 'File', icon: FileCode };
  }
  
  const fileInfo = $derived(getFileType(data.path));
</script>

<Header 
  title={data.repo} 
  showBack={true}
  backHref="/admin/repo/{data.owner}/{data.repo}"
/>

<main class="mx-auto max-w-4xl px-5 py-6">
  <div class="mb-5 flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h2 class="text-[15px] font-semibold truncate">{data.path.split('/').pop()}</h2>
        <span class="flex-shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-[--muted-foreground]">
          {fileInfo.type}
        </span>
      </div>
      <p class="mt-0.5 text-[12px] text-[--muted-foreground] truncate">{data.path}</p>
    </div>
    
    <form 
      method="POST" 
      action="?/save" 
      use:enhance={() => {
        isPublishing = true;
        return async ({ update }) => {
          await update();
          isPublishing = false;
        };
      }}
    >
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="sha" value={data.sha} />
      <input type="hidden" name="message" value={publishedMessage || `Update ${data.path.split('/').pop()}`} />
      
      <Button disabled={isPublishing || !hasChanges} size="sm">
        {#if isPublishing}
          <Loader2 class="h-3.5 w-3.5 animate-spin" />
        {:else}
          {#if hasChanges}
            <Circle class="h-3.5 w-3.5" />
          {:else}
            <CheckCircle class="h-3.5 w-3.5" />
          {/if}
        {/if}
        {hasChanges ? 'Publish' : 'Published'}
      </Button>
    </form>
  </div>

  <div class="flex flex-col rounded-xl border border-border/50 bg-card">
    <textarea 
      bind:value={content}
      class="min-h-[500px] w-full resize-none border-none bg-transparent p-4 font-mono text-[13px] leading-relaxed focus:outline-none focus:ring-0"
      placeholder="Start typing..."
    ></textarea>
  </div>

  <div class="mt-4 flex items-center gap-3">
    <div class="flex-1">
      <input
        type="text"
        bind:value={publishedMessage}
        placeholder="Add a message..."
        class="h-8 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[12px] transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
      />
    </div>
    <div class="flex items-center gap-2 text-[12px] text-[--muted-foreground]">
      {#if hasChanges}
        <span class="text-amber-600">Unpublished</span>
      {:else}
        <span class="text-green-600">Published</span>
      {/if}
      <span>·</span>
      <span>{(content?.length || 0).toLocaleString()} chars</span>
    </div>
  </div>
</main>