<script lang="ts">
  import { startOfMonth } from 'date-fns';

  import { Chart } from '../../components';
  import { series, max, min } from './data.json';

  const firstSeries = series[0].data;
  const maxDate = firstSeries.length > 0 ? firstSeries.slice(-1)[0][0] : new Date();

  export let from: Date, to: Date;
</script>

<Chart
  title={{ text: 'Cash flow' }}
  chart={{
    height: '100%',
    toolbar: { show: false },
    stacked: true,
    animations: { enabled: false },
    zoom: { enabled: false }
  }}
  {series}
  xaxis={{ type: 'datetime', tooltip: { enabled: false }, min: from.getTime(), max: to.getTime() }}
  colors={[
    'var(--color-red-500)',
    'var(--color-green-500)',
    'var(--color-yellow-500)',
    'var(--color-blue-500)'
  ]}
  legend={{ show: false }}
  tooltip={{ followCursor: true }}
  yaxis={[
    { seriesName: 'Delta', max, min, show: false },
    { seriesName: 'Delta', max, min, show: false },
    { seriesName: 'Delta', max, min, tooltip: { enabled: false } },
    { seriesName: 'Savings Rate', opposite: true, max: 100, min: -100, tooltip: { enabled: false } }
  ]}
  annotations={{
    xaxis: [
      {
        x: startOfMonth(new Date()).getTime(),
        x2: maxDate,
        strokeDashArray: 0,
        borderColor: '#775DD0',
        label: {
          borderColor: '#775DD0',
          style: {
            color: '#fff',
            background: '#775DD0'
          },
          text: 'Future'
        }
      }
    ]
  }}
/>
