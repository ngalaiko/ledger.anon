<script lang="ts">
  import { addDays, formatDistanceToNow } from 'date-fns';
  import {
    netWorth,
    savingsRate,
    averageDailyExpense,
    averageDailyExpenseWithoutRent,
    shortRunway,
    shortRunwayWithoutRent,
    longRunway,
    longRunwayWithoutRent,
    fire,
    fireWithoutRent
  } from './data.json';

  const formatNumber = (v: number, fractionDigits?: number) => {
    fractionDigits = fractionDigits ?? 2;
    return v.toLocaleString('en-SE', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
  };

  const now = new Date();
  const stats = [
    { title: 'Net Worth', value: formatNumber(netWorth) },
    { title: 'Average Savings Rate (last year)', value: `${formatNumber(savingsRate, 2)}%` },
    { title: 'Average Daily Expense', value: formatNumber(averageDailyExpense) },
    {
      title: 'Average Daily Expense (without rent)',
      value: formatNumber(averageDailyExpenseWithoutRent)
    },
    {
      title: 'Short Runway',
      value: formatDistanceToNow(addDays(now, shortRunway))
    },
    {
      title: 'Short Runway (without rent)',
      value: formatDistanceToNow(addDays(now, shortRunwayWithoutRent))
    },
    { title: 'Long Runway', value: formatDistanceToNow(addDays(new Date(), longRunway)) },
    {
      title: 'Long Runway (without rent)',
      value: formatDistanceToNow(addDays(now, longRunwayWithoutRent))
    },
    { title: 'Fire', value: formatNumber(fire) },
    { title: 'Fire (without rent)', value: formatNumber(fireWithoutRent) }
  ];
</script>

<div class="grid grid-cols-2 gap-4">
  {#each stats as { title, value }}
    <div class="flex flex-col gap-2">
      <h3 class="font-semibold">{title}</h3>
      <span>{value}</span>
    </div>
  {/each}
</div>
