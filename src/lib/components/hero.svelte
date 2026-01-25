<script lang="ts">
  import Button from './button.svelte';

  type Highlight = {
    label: string;
    value: string;
    detail: string;
  };

  interface Props {
    eyebrow: string;
    heading: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    highlights: Highlight[];
    imageAlt: string;
  }

  let {
    eyebrow,
    heading,
    description,
    primaryCta,
    secondaryCta,
    highlights,
    imageAlt
  }: Props = $props();
</script>

<section class="relative isolate overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-surface via-brand-light/20 to-surface px-6 py-16 shadow-retro md:px-12 md:py-20">
  <div
    class="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
    aria-hidden="true"
  ></div>
  <div class="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
    <div class="space-y-8">
      <p class="section-heading">{eyebrow}</p>
      <h1 class="font-display text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
        {heading}
      </h1>
      <p class="max-w-xl text-base text-muted-foreground md:text-lg">
        {description}
      </p>
      <div class="flex flex-wrap items-center gap-4">
        <Button href={primaryCta.href}>{primaryCta.label}</Button>
        <Button variant="ghost" href={secondaryCta.href}>{secondaryCta.label}</Button>
      </div>
      <dl class="grid gap-6 pt-4 sm:grid-cols-3">
        {#each highlights as item}
          <div class="rounded-3xl border border-black/5 bg-surface/60 p-5 backdrop-blur-sm">
            <dt class="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {item.label}
            </dt>
            <dd class="mt-3 font-display text-3xl text-brand">
              {item.value}
            </dd>
            <p class="mt-2 text-xs text-muted-foreground">
              {item.detail}
            </p>
          </div>
        {/each}
      </dl>
    </div>
    <div class="relative">
      <img
        src="https://img.ether.paris/ether-website/assets/ether.png?width=1000"
        alt={imageAlt}
        width={900}
        height={1125}
        class="h-full w-full object-cover rounded-3xl shadow-lg shadow-black/10 "
      />
    </div>
  </div>
</section>
