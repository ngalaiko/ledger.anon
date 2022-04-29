<script lang="ts" context="module">
  export async function load({ stuff }) {
    return {
      props: { from: stuff.from, to: stuff.to }
    };
  }
</script>

<script lang="ts">
  import { Expenses } from '../../charts';
  import type { Readable } from 'svelte/store';

  export let to: Readable<Date>;
  export let from: Readable<Date>;
</script>

<Expenses from={$from} to={$to} />
