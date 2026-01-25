<script lang="ts">
  interface Props {
    partners: string[];
  }
  let { partners }: Props = $props();
  let items = $derived([...partners, ...partners]);
</script>

<div class="overflow-hidden rounded-full border border-black/5 bg-surface/70 py-4">
  <div class="flex w-[200%] animate-marquee gap-10 whitespace-nowrap text-xs uppercase tracking-[0.4em] text-muted-foreground">
    {#each items as partner, index}
      <span class="inline-flex items-center gap-3">
        {partner}
        <span class="h-1.5 w-1.5 rounded-full bg-accent/70" aria-hidden="true"></span>
      </span>
    {/each}
  </div>
</div>
