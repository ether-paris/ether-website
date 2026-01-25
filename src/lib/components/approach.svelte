<script lang="ts">
  interface ApproachStep {
    title: string;
    description: string;
    phase: string;
  }

  interface Props {
    steps: ApproachStep[];
  }

  let { steps }: Props = $props();
</script>

<div class="grid gap-6 md:grid-cols-3">
  {#each steps as item (item.title)}
    <article class="retro-card relative overflow-hidden p-8">
      <span class="absolute right-6 top-6 text-6xl font-bold text-brand/10">
        {item.phase}
      </span>
      <div class="space-y-4">
        <h3 class="font-display text-2xl">{item.title}</h3>
        <p class="text-sm text-muted-foreground">{item.description}</p>
      </div>
    </article>
  {/each}
</div>
