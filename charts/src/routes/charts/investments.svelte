<script lang="ts" context="module">
  export async function load({ stuff }) {
    return {
      props: { from: stuff.from, to: stuff.to }
    };
  }
</script>

<script lang="ts">
  import { Investments } from '../../charts';
  import type { Readable } from 'svelte/store';

  export let to: Readable<Date>;
  export let from: Readable<Date>;
</script>

<Investments from={$from} to={$to} />
