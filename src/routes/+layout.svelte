<script>
  import '../app.css';
  import "@fontsource/inter";
  import "@fontsource/space-grotesk";
  import "@fontsource/playfair-display";
  import "@fontsource/ibm-plex-mono";
  import Toast from '$lib/components/toast.svelte';
</script>

<style>
  :global(:root) {
    --font-neue: "Space Grotesk", sans-serif;
    --font-display: "Playfair Display", serif;
    --font-mono: "IBM Plex Mono", monospace;
  }
</style>

<div class="grain-overlay antialiased">
    <slot />
    <Toast />
</div>
