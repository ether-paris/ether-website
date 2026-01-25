<script lang="ts">
  interface StudioLocation {
    city: string;
    timezone: string;
    focus: string;
  }

  interface Props {
    locations: StudioLocation[];
    onsiteLabel: string;
  }

  let { locations, onsiteLabel }: Props = $props();
</script>

<div class="grid gap-6 lg:grid-cols-3">
  {#each locations as studio (studio.city)}
    <article class="retro-card space-y-4 p-6">
      <header class="flex items-baseline justify-between">
        <h3 class="font-display text-2xl">{studio.city}</h3>
        <span class="font-mono text-sm text-muted-foreground">
          {studio.timezone}
        </span>
      </header>
      <p class="text-sm text-muted-foreground">{studio.focus}</p>
      <div class="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {onsiteLabel}
      </div>
    </article>
  {/each}
</div>
