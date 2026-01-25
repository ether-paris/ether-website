<script lang="ts">
  import { cn } from '$utils/cn';
  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

  type Variant = 'solid' | 'ghost';
  type Size = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: Variant;
    size?: Size;
    href?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let { 
    class: className, 
    variant = 'solid', 
    size = 'md', 
    href,
    children, 
    ...props 
  }: Props = $props();

  const sizesMap = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-7 py-4 text-base'
  };

  const classes = $derived(cn(
    'focus-ring inline-flex items-center justify-center rounded-full font-medium uppercase tracking-[0.2em] transition-all duration-300',
    variant === 'solid' &&
      'bg-brand text-white shadow-retro hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0',
    variant === 'ghost' &&
      'border border-black/10 bg-surface/60 text-foreground backdrop-blur-md hover:border-black/20',
    sizesMap[size],
    // anchor tags don't support disabled attribute directly in styles usually without data-disabled, but we keep it
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none',
    className
  ));
</script>

{#if href}
  <a
    {href}
    class={classes}
    {...props}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class={classes}
    {...props}
  >
    {@render children?.()}
  </button>
{/if}
