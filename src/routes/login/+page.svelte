<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { enhance } from '$app/forms';
  
  let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
  <div class="absolute inset-0 -z-10 overflow-hidden">
    <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-3xl"></div>
  </div>
  
  <div class="w-full max-w-sm">
    <div class="surface p-10 text-center">
      <div class="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-primary/30">
        <svg class="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      
      <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p class="mt-2 text-[14px] text-[--muted-foreground]">Sign in to manage your sites</p>
    </div>
    
    <div class="surface mt-5 p-6">
      <form method="POST" use:enhance class="space-y-4">
        <div>
          <label for="username" class="text-[13px] font-medium mb-1.5 block">Username</label>
          <input 
            type="text" 
            name="username" 
            id="username" 
            required 
            class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] transition-all focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="Enter username"
          />
        </div>
        
        <div>
          <label for="password" class="text-[13px] font-medium mb-1.5 block">Password</label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            required 
            class="h-9 w-full rounded-lg border border-border/60 bg-transparent px-3 text-[13px] transition-all focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="Enter password"
          />
        </div>

        {#if form?.message}
          <p class="text-center text-[13px] font-medium text-red-500">{form.message}</p>
        {/if}

        <Button type="submit" class="w-full h-9">
          Continue
        </Button>
      </form>
    </div>
  </div>
</div>