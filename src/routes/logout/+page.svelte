<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  
  let submitBtn: HTMLButtonElement;
  
  onMount(() => {
    submitBtn?.click();
  });
</script>

<form method="POST" use:enhance>
  <button bind:this={submitBtn} type="submit" class="hidden">Logging out...</button>
</form>