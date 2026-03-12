<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  }
  
  let { 
    variant = 'primary',
    size = 'md',
    class: className = '',
    disabled = false,
    type = 'button',
    onclick,
    children
  }: Props = $props();
  
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variantClasses: Record<string, string> = {
    primary: "gradient-bg text-white shadow-lg shadow-primary/25 hover:opacity-90",
    secondary: "bg-secondary text-foreground ring-1 ring-border hover:bg-accent",
    ghost: "text-[--muted-foreground] hover:bg-secondary hover:text-foreground",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
  };
  
  const sizeClasses: Record<string, string> = {
    sm: "h-8 px-2.5 text-[12px] rounded-lg",
    md: "h-9 px-3.5 text-[13px] rounded-lg",
    lg: "h-10 px-5 text-[14px] rounded-lg"
  };
</script>

<button
  {type}
  {disabled}
  onclick={onclick}
  class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
>
  {@render children()}
</button>