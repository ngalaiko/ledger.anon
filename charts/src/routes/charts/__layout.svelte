<script lang="ts" context="module">
  import { writable, type Writable, type Readable } from 'svelte/store';
  import { addYears } from 'date-fns';
  export async function load() {
    const from = writable(addYears(new Date(), -1));
    const to = writable(new Date());
    return {
      props: { from, to },
      stuff: {
        from: from as Readable<Date>,
        to: to as Readable<Date>
      }
    };
  }
</script>

<script lang="ts">
  import { intlFormat } from 'date-fns';

  import { DateRangeSlider } from '../../components';
  import { series } from '../../charts/NetWorth/data.json';

  const firstSeries = series[0].data;
  const maxDate = firstSeries.length > 0 ? firstSeries.slice(-1)[0][0] : new Date();
  const minDate = new Date(2018, 2, 23);
  const oneDay = 1000 * 60 * 60 * 24;

  export let from: Writable<Date>, to: Writable<Date>;
  const initialValues = [$from.getTime(), $to.getTime()] as [number, number];
  $: value = initialValues;
  $: {
    $from = new Date(value[0]);
    $to = new Date(value[1]);
  }
</script>

<main class="h-full flex flex-col">
  <div class="flex justify-center">
    <slot name="slider">
      <DateRangeSlider
        class="w-1/2"
        bind:value
        min={minDate.getTime()}
        max={maxDate}
        step={oneDay}
        formatter={(value) =>
          intlFormat(value, { month: 'short', year: 'numeric', day: 'numeric' })}
      />
    </slot>
  </div>

  <div class="h-full">
    <slot />
  </div>
</main>
