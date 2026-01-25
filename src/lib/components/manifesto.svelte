<script lang="ts">
  interface OfferPhase {
    label: string;
    timeline: string;
  }

  interface Offer {
    title: string;
    description: string;
    phases: OfferPhase[];
  }

  interface Props {
    paragraphs: string[];
    bullets: string[];
    offer: Offer;
  }

  let { paragraphs, bullets, offer }: Props = $props();

  let lead = $derived(paragraphs[0]);
  let rest = $derived(paragraphs.slice(1));
</script>

<div class="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-start">
  <div class="space-y-6">
    {#if lead}
      <p class="font-display text-2xl leading-snug text-foreground md:text-3xl">
        {lead}
      </p>
    {/if}
    {#each rest as paragraph (paragraph)}
      <p class="text-sm text-muted-foreground md:text-base">
        {paragraph}
      </p>
    {/each}
    <div class="divider"></div>
    <ul class="grid gap-3 text-sm text-muted-foreground">
      {#each bullets as bullet (bullet)}
        <li class="flex items-start gap-3">
          <span class="mt-1 h-2 w-2 rounded-full bg-brand" aria-hidden="true"></span>
          {bullet}
        </li>
      {/each}
    </ul>
  </div>
  <div class="retro-card space-y-6 p-8">
    <h3 class="font-display text-xl">{offer.title}</h3>
    <p class="text-sm text-muted-foreground">{offer.description}</p>
    <div class="grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 text-sm">
      {#each offer.phases as phase (phase.label)}
        <span class="uppercase tracking-[0.3em] text-muted-foreground">
          {phase.label}
        </span>
        <span class="font-mono text-sm text-brand text-left">
          {phase.timeline}
        </span>
      {/each}
    </div>
  </div>
</div>
