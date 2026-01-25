<script lang="ts">
  type NavigationItem = {
    label: string;
    href: string;
  };

  interface Props {
    siteName: string;
    motto: string;
    description: string;
    navigation: NavigationItem[];
    socials: NavigationItem[];
    exploreLabel: string;
    socialLabel: string;
    rights: string;
    studiosLine: string;
  }

  let {
    siteName,
    motto,
    description,
    navigation,
    socials,
    exploreLabel,
    socialLabel,
    rights,
    studiosLine
  }: Props = $props();
</script>

<footer class="mt-24 border-t border-black/10 bg-surface/70">
  <div class="container flex flex-col gap-12 py-12 md:flex-row md:items-start md:justify-between">
    <div class="max-w-sm space-y-3">
      <p class="font-display text-2xl leading-tight">
        {siteName} · <span class="text-accent">{motto}</span>
      </p>
      <p class="text-sm text-muted-foreground">{description}</p>
    </div>
    <div class="grid gap-8 text-sm uppercase tracking-[0.3em] md:grid-cols-2">
      <div>
        <p class="mb-3 text-muted-foreground text-black">
          {exploreLabel}
        </p>
        <ul class="space-y-2 text-muted-foreground">
          {#each navigation as item}
            <li>
              <a href={item.href} class="hover:text-foreground">
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      <div>
        <p class="mb-3 text-muted-foreground font-black">
          {socialLabel}
        </p>
        <ul class="space-y-2 text-muted-foreground">
          {#each socials as item}
            <li>
              <a
                href={item.href}
                class="hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
  <div class="border-t border-black/10 bg-surface/80 py-6">
    <div class="container flex flex-col justify-between gap-4 text-xs text-muted-foreground md:flex-row">
      <span>{rights}</span>
      <span>{studiosLine}</span>
    </div>
  </div>
</footer>
