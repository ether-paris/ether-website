<script lang="ts">
  import { cn } from '$utils/cn';
  
  interface Props {
    id?: string;
    eyebrow?: string;
    title?: string;
    description?: string;
    class?: string;
    children: import('svelte').Snippet;
  }

  let { 
    id, 
    eyebrow, 
    title, 
    description, 
    class: className, 
    children 
  }: Props = $props();
</script>

<section
  {id}
  class={cn("container space-y-10 py-16 md:py-24", className)}
>
  {#if eyebrow || title || description}
    <div class="max-w-2xl space-y-5">
      {#if eyebrow}
        <p class="section-heading">{eyebrow}</p>
      {/if}
      {#if title}
        <h2 class="font-display text-3xl md:text-4xl">{title}</h2>
      {/if}
      {#if description}
        <p class="text-base text-muted-foreground md:text-lg">
          {description}
        </p>
      {/if}
    </div>
  {/if}
  {@render children()}
</section>
