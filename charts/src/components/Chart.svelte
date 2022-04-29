<script lang="ts">
  import type { ApexOptions } from 'apexcharts';
  import currency from 'currency.js';
  import { onMount } from 'svelte';

  export let annotations: ApexAnnotations = undefined;
  export let chart: ApexChart = undefined;
  export let colors: any[] = undefined;
  export let dataLabels: ApexDataLabels = undefined;
  export let fill: ApexFill = undefined;
  export let forecastDataPoints: ApexForecastDataPoints = undefined;
  export let grid: ApexGrid = undefined;
  export let labels: string[] = undefined;
  export let legend: ApexLegend = undefined;
  export let markers: ApexMarkers = undefined;
  export let noData: ApexNoData = undefined;
  export let plotOptions: ApexPlotOptions = undefined;
  export let responsive: ApexResponsive[] = undefined;
  export let series: ApexAxisChartSeries | ApexNonAxisChartSeries = undefined;
  export let states: ApexStates = undefined;
  export let stroke: ApexStroke = undefined;
  export let subtitle: ApexTitleSubtitle = undefined;
  export let theme: ApexTheme = undefined;
  export let title: ApexTitleSubtitle = undefined;
  export let tooltip: ApexTooltip & { displayTotal?: boolean } = undefined;
  export let xaxis: ApexXAxis = undefined;
  export let yaxis: ApexYAxis | ApexYAxis[] = undefined;

  const options: ApexOptions = {};
  if (annotations) options.annotations = annotations;
  if (chart) options.chart = chart;
  if (colors) options.colors = colors;
  if (dataLabels) options.dataLabels = dataLabels;
  if (fill) options.fill = fill;
  if (forecastDataPoints) options.forecastDataPoints = forecastDataPoints;
  if (grid) options.grid = grid;
  if (labels) options.labels = labels;
  if (legend) options.legend = legend;
  if (markers) options.markers = markers;
  if (noData) options.noData = noData;
  if (plotOptions) options.plotOptions = plotOptions;
  if (responsive) options.responsive = responsive;
  if (series) options.series = series;
  if (states) options.states = states;
  if (stroke) options.stroke = stroke;
  if (subtitle) options.subtitle = subtitle;
  if (theme) options.theme = theme;
  if (title) options.title = title;
  if (tooltip) options.tooltip = tooltip;
  $: if (xaxis) options.xaxis = xaxis;
  if (yaxis) options.yaxis = yaxis;

  // https://github.com/apexcharts/apexcharts.js/issues/420#issuecomment-1047056648
  options.tooltip.custom = function ({ series, seriesIndex, dataPointIndex, w }) {
    const hoverXaxis = w.globals.seriesX[seriesIndex][dataPointIndex];
    const hoverIndexes = w.globals.seriesX.map((seriesX: number[]) => {
      return seriesX.findIndex((xData) => xData === hoverXaxis);
    });

    const row = (color: string, key: string, value: string) => `
        <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex;">
            <span class="apexcharts-tooltip-marker" style="background-color: ${color};"></span>
            <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; width: 100%;">
                <div class="apexcharts-tooltip-y-group" style="display: flex; justify-content: space-between;">
                    <span class="apexcharts-tooltip-text-y-label">${key}</span>
                    <span class="apexcharts-tooltip-text-y-value">${value}</span>
                </div>
            </div>
        </div>`;

    const total = hoverIndexes
      .map((hoverIndex: number, seriesEachIndex: number) => series[seriesEachIndex][hoverIndex])
      .reduce((acc: currency, curr: number) => acc.add(curr), currency(0));

    const totalElem = tooltip.displayTotal ? row('white', 'Total', total) : ``;

    const hoverList = hoverIndexes
      .map((hoverIndex: number, seriesEachIndex: number) => {
        if (series[seriesEachIndex][hoverIndex] === 0) return;
        if (hoverIndex < 0) return;
        const color = w.globals.markers.colors[seriesEachIndex];
        const key = w.globals.seriesNames[seriesEachIndex];
        const value = series[seriesEachIndex][hoverIndex];
        return row(color, key, value);
      })
      .join('\n');
    const parsed = new Date(hoverXaxis).toDateString().split(' ').slice(1);
    return `<div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">${
      parsed[1] + ' ' + parsed[0] + ' ' + parsed[2]
    }</div>${totalElem}${hoverList}`;
  };

  let ApexCharts: any = undefined;
  let loaded = false;

  const component = (node: HTMLElement, options: ApexOptions) => {
    if (!loaded) return;
    let myChart = new ApexCharts(node, options);
    myChart.render();
    return {
      update(options: ApexOptions) {
        myChart.updateOptions(options);
      },
      destroy() {
        myChart.destroy();
      }
    };
  };

  onMount(async () => {
    const module = await import('apexcharts');
    ApexCharts = module.default;
    window.ApexCharts = ApexCharts;
    loaded = true;
  });
</script>

{#if loaded}
  <div use:component={options} {...$$restProps} />
{/if}
