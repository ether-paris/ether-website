<script>
  import { toast } from '$lib/stores/toast.ts';
  import { fade, fly } from 'svelte/transition';
</script>

{#if $toast.visible}
  <div
    in:fly={{ y: 20, duration: 300 }}
    out:fade
    class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform"
  >
    <div
      class="flex items-center gap-3 rounded-full border border-red-200/20 bg-red-900/90 px-6 py-3 text-sm text-white shadow-retro backdrop-blur-md"
    >
      <div class="h-2 w-2 rounded-full bg-red-500"></div>
      {$toast.message}
    </div>
  </div>
{/if}
