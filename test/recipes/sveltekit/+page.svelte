<script>
  import { onMount } from 'svelte';

  // load the element in the browser only (SvelteKit renders on the server first)
  onMount(() => import('tlp-icons/element'));
</script>

<button type="button">
  <tlp-icon name="bell"></tlp-icon> Alerts
</button>
<tlp-icon name="loader-circle" trigger="loop"></tlp-icon>
