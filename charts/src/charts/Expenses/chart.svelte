<script lang="ts">
  import { startOfMonth } from 'date-fns';

  import { Chart } from '../../components';
  import { series } from './data.json';

  const firstSeries = series[0].data;
  const maxDate = firstSeries.length > 0 ? firstSeries.slice(-1)[0][0] : new Date();

  export let from: Date, to: Date;
</script>

<Chart
  title={{ text: 'Expenses' }}
  colors={[
    'var(--color-red-500)',
    'var(--color-orange-500)',
    'var(--color-amber-500)',
    'var(--color-yellow-500)',
    'var(--color-lime-500)',
    'var(--color-green-500)',
    'var(--color-teal-500)',
    'var(--color-cyan-500)',
    'var(--color-sky-500)',
    'var(--color-blue-500)',
    'var(--color-indigo-500)',
    'var(--color-violet-500)',
    'var(--color-purple-500)',
    'var(--color-fuchsia-500)',
    'var(--color-pink-500)',
    'var(--color-rose-500)'
  ]}
  chart={{
    height: '100%',
    toolbar: { show: false },
    stacked: true,
    stackType: '100%',
    animations: { enabled: false },
    zoom: { enabled: false }
  }}
  markers={{ size: 0 }}
  dataLabels={{ enabled: false }}
  stroke={{ show: false }}
  fill={{ type: 'solid' }}
  {series}
  xaxis={{ type: 'datetime', tooltip: { enabled: false }, min: from.getTime(), max: to.getTime() }}
  yaxis={{ tooltip: { enabled: false } }}
  legend={{ position: 'bottom', horizontalAlign: 'left' }}
  tooltip={{ followCursor: true, displayTotal: true }}
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
