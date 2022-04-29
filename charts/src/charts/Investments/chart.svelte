<script lang="ts">
  import { Chart } from '../../components';
  import { roiSeries, absoluteSeries } from './data.json';

  export let from: Date, to: Date;

  const charts = [
    { title: 'Relative', series: roiSeries },
    { title: 'Absolute', series: absoluteSeries }
  ];
</script>

<div class="h-full flex">
  {#each charts as { title, series }}
    <Chart
      title={{ text: title, align: 'center' }}
      class="w-1/2"
      colors={[
        'var(--color-red-500)',
        'var(--color-orange-500)',
        'var(--color-yellow-500)',
        'var(--color-lime-500)',
        'var(--color-green-500)',
        'var(--color-blue-500)',
        'var(--color-purple-500)',
        'var(--color-fuchsia-500)',
        'var(--color-pink-500)'
      ]}
      chart={{
        id: `roi-${title}`,
        group: 'roi',
        height: '100%',
        type: 'line',
        toolbar: { show: false },
        animations: { enabled: false },
        zoom: { enabled: false }
      }}
      markers={{ size: 0 }}
      dataLabels={{ enabled: false }}
      stroke={{ width: 2, curve: 'straight' }}
      {series}
      xaxis={{
        type: 'datetime',
        tooltip: { enabled: false },
        min: from.getTime(),
        max: to.getTime()
      }}
      yaxis={{ tooltip: { enabled: false } }}
      legend={{ show: false }}
      tooltip={{ followCursor: true }}
    />
  {/each}
</div>
