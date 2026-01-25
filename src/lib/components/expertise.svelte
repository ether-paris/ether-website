<script lang="ts">
  interface Service {
    title: string;
    description: string;
    deliverables: string[];
  }

  interface Props {
    services: Service[];
  }

  let { services }: Props = $props();
</script>

<div class="grid gap-6 lg:grid-cols-3">
  {#each services as service (service.title)}
    <article class="retro-card flex flex-col gap-6 p-8">
      <div class="space-y-3">
        <h3 class="font-display text-2xl">{service.title}</h3>
        <p class="text-sm text-muted-foreground">{service.description}</p>
      </div>
      <ul class="space-y-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {#each service.deliverables as item (item)}
          <li class="flex items-center gap-2 text-muted-foreground/80">
            <span class="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true"></span>
            {item}
          </li>
        {/each}
      </ul>
    </article>
  {/each}
</div>
