<script lang="ts">
  interface CaseStudy {
    title: string;
    sector: string;
    summary: string;
    metrics: string[];
    image: string;
  }

  interface Props {
    studies: CaseStudy[];
  }

  let { studies }: Props = $props();
</script>

<div class="grid gap-8 lg:grid-cols-3">
  {#each studies as project (project.title)}
    <article class="retro-card overflow-hidden">
      <div class="relative aspect-[4/5] overflow-hidden rounded-t-[2.5rem]">
        <img
          src={project.image}
          alt={project.title}
          width={800}
          height={1000}
          class="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.05]"
        />
        <div class="absolute right-5 top-5 rounded-full bg-surface/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {project.sector}
        </div>
      </div>
      <div class="space-y-5 p-8">
        <h3 class="font-display text-2xl">{project.title}</h3>
        <p class="text-sm text-muted-foreground">{project.summary}</p>
        <ul class="space-y-2 text-sm text-muted-foreground/80">
          {#each project.metrics as metric (metric)}
            <li class="flex items-center gap-3">
              <span class="h-2 w-8 rounded-full bg-accent/80" aria-hidden="true"></span>
              <span>{metric}</span>
            </li>
          {/each}
        </ul>
      </div>
    </article>
  {/each}
</div>
