<script lang="ts">
  import '../app.css';
  import { formatRelative } from 'date-fns';
  import locale from 'date-fns/locale/en-GB/index.js';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const unixBuildTime = __BUILD_TIME__;
  const buildTime = new Date(unixBuildTime * 1000);

  const navigation = [
    { title: 'Overview', pathname: '/' },
    { title: 'Cash flow', pathname: '/charts/cash-flow/' },
    { title: 'Expenses', pathname: '/charts/expenses/' },
    { title: 'Investments', pathname: '/charts/investments/' },
    { title: 'Net Worth', pathname: '/charts/net-worth/' }
  ];
</script>

<svelte:head>
  <title>Personal Finances</title>
</svelte:head>

<div class="h-full flex flex-col gap-1 bg-gray-50">
  <nav>
    <ul class="flex bg-gray-200">
      {#each navigation as { title, pathname }}
        <li
          class={`cursor-pointer p-2 text-gray-700 ${
            $page.url.pathname === pathname ? 'bg-gray-50 ' : ''
          }`}
          on:click|preventDefault={() => goto(pathname)}
        >
          <a href={pathname}>
            {title}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <slot />

  <footer class="flex justify-center opacity-50 text-sm">
    <p class="p-1">last updated {formatRelative(buildTime, new Date(), { locale })}</p>
  </footer>
</div>
