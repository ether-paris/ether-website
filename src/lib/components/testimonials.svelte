<script lang="ts">
  interface Testimonial {
    quote: string;
    author: string;
    role: string;
  }

  interface Props {
    testimonials: Testimonial[];
  }

  let { testimonials }: Props = $props();
</script>

<div class="grid gap-6 lg:grid-cols-3">
  {#each testimonials as testimonial (testimonial.author)}
    <figure class="retro-card flex h-full flex-col justify-between gap-6 p-8">
      <blockquote class="text-base leading-relaxed text-muted-foreground">
        “{testimonial.quote}”
      </blockquote>
      <figcaption class="space-y-1 text-sm">
        <div class="font-semibold text-foreground">{testimonial.author}</div>
        <div class="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {testimonial.role}
        </div>
      </figcaption>
    </figure>
  {/each}
</div>
