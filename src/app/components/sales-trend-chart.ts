import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { area, axisBottom, axisLeft, curveMonotoneX, line, max, scaleLinear, scalePoint, select } from 'd3';
import { JewelleryService } from '../services/jewellery.service';

interface DailyRevenuePoint {
  dateKey: string;
  label: string;
  shortDate: string;
  revenue: number;
  count: number;
}

@Component({
  selector: 'app-sales-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl border border-neutral-200 shadow-xs p-3.5 sm:p-4 space-y-2.5">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="font-bold text-neutral-900 text-sm flex items-center">
            <span class="material-icons text-amber-600 text-lg mr-1.5">show_chart</span>
            <span>7-Day Sales Revenue</span>
          </h3>
          <p class="text-[10px] text-neutral-500 mt-0.5">Daily counter billing trend over the past 7 days</p>
        </div>

        <div class="text-right shrink-0">
          <div class="text-xs sm:text-sm font-extrabold text-neutral-950 tabular-nums">
            ₹{{ weeklyTotal() | number:'1.0-0' }}
          </div>
          <span class="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-[9px] font-bold text-amber-800">
            {{ weeklyBillsCount() }} bills / 7d
          </span>
        </div>
      </div>

      <!-- Selected Point Readout Bar -->
      @if (activePoint(); as pt) {
        <div class="flex items-center justify-between bg-neutral-900 text-white px-3 py-1.5 rounded-xl text-[11px]">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span class="font-semibold text-neutral-200">{{ pt.shortDate }} ({{ pt.label }})</span>
          </div>
          <div class="flex items-center space-x-2.5 tabular-nums">
            <span class="text-neutral-400 text-[10px]">{{ pt.count }} {{ pt.count === 1 ? 'bill' : 'bills' }}</span>
            <span class="font-extrabold text-amber-300">₹{{ pt.revenue | number:'1.0-0' }}</span>
          </div>
        </div>
      }

      <!-- D3 SVG Container -->
      <div #chartHost class="w-full h-44 sm:h-48 relative select-none"></div>
    </div>
  `
})
export class SalesTrendChart implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  readonly service = inject(JewelleryService);

  @ViewChild('chartHost') chartHost?: ElementRef<HTMLDivElement>;

  private readonly viewReady = signal<boolean>(false);
  private readonly hoveredIndex = signal<number | null>(null);
  private resizeObserver: ResizeObserver | null = null;

  readonly dailySeries = computed<DailyRevenuePoint[]>(() => {
    const sales = this.service.sales();
    const totalsByDay = new Map<string, { revenue: number; count: number }>();

    for (const sale of sales) {
      const dateKey = sale.date.slice(0, 10);
      const prev = totalsByDay.get(dateKey) ?? { revenue: 0, count: 0 };
      totalsByDay.set(dateKey, {
        revenue: prev.revenue + sale.grandTotal,
        count: prev.count + 1
      });
    }

    const points: DailyRevenuePoint[] = [];
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const agg = totalsByDay.get(dateKey) ?? { revenue: 0, count: 0 };

      points.push({
        dateKey,
        label: offset === 0 ? 'Today' : dayNames[d.getDay()],
        shortDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        revenue: agg.revenue,
        count: agg.count
      });
    }

    return points;
  });

  readonly weeklyTotal = computed(() =>
    this.dailySeries().reduce((sum, p) => sum + p.revenue, 0)
  );

  readonly weeklyBillsCount = computed(() =>
    this.dailySeries().reduce((sum, p) => sum + p.count, 0)
  );

  readonly activePoint = computed<DailyRevenuePoint | null>(() => {
    const series = this.dailySeries();
    if (series.length === 0) return null;
    const idx = this.hoveredIndex();
    if (idx !== null && series[idx]) {
      return series[idx];
    }
    return series[series.length - 1];
  });

  constructor() {
    effect(() => {
      const series = this.dailySeries();
      const ready = this.viewReady();
      this.hoveredIndex();
      this.service.currentTheme();
      if (ready && isPlatformBrowser(this.platformId)) {
        this.renderChart(series);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.viewReady.set(true);
    const hostEl = this.chartHost?.nativeElement;
    if (hostEl && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.renderChart(this.dailySeries());
      });
      this.resizeObserver.observe(hostEl);
    }
  }

  private renderChart(data: DailyRevenuePoint[]) {
    const container = this.chartHost?.nativeElement;
    if (!container) return;

    const theme = this.service.currentTheme();
    const isGoldLuxury = theme === 'gold-luxury';
    const isDark = theme === 'dark';
    const isBlueWhite = theme === 'blue-white';

    const gridColor = isGoldLuxury
      ? 'rgba(251, 191, 36, 0.25)'
      : isDark
        ? '#2e2e36'
        : isBlueWhite
          ? '#dbeafe'
          : '#e5e5e5';
    const axisTextColor = isGoldLuxury ? '#fcd34d' : isDark ? '#a1a1aa' : isBlueWhite ? '#475569' : '#737373';
    const todayTextColor = isGoldLuxury ? '#ffffff' : isDark ? '#fbbf24' : isBlueWhite ? '#1d4ed8' : '#b45309';
    const lineStrokeColor = isGoldLuxury ? '#fde047' : isDark ? '#fbbf24' : isBlueWhite ? '#2563eb' : '#d97706';
    const gradientColor = isBlueWhite ? '#3b82f6' : '#f59e0b';
    const activeDotFill = isGoldLuxury ? '#ffffff' : isDark ? '#fbbf24' : isBlueWhite ? '#1e3a8a' : '#171717';
    const idleDotFill = isGoldLuxury ? '#0d0c09' : isDark ? '#18181b' : '#ffffff';

    const totalWidth = Math.max(container.clientWidth || 320, 260);
    const totalHeight = container.clientHeight || 176;
    const margin = { top: 14, right: 14, bottom: 24, left: 42 };
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

    select(container).selectAll('*').remove();

    const svg = select(container)
      .append('svg')
      .attr('width', totalWidth)
      .attr('height', totalHeight)
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
      .style('overflow', 'visible');

    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'salesTrendAmberGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', gradientColor).attr('stop-opacity', 0.34);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', gradientColor).attr('stop-opacity', 0.02);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const maxRevenue = max(data, d => d.revenue) ?? 0;
    const yMax = maxRevenue > 0 ? maxRevenue * 1.18 : 100000;

    const x = scalePoint<string>()
      .domain(data.map(d => d.dateKey))
      .range([0, width])
      .padding(0.25);

    const y = scaleLinear().domain([0, yMax]).nice().range([height, 0]);

    // Horizontal dashed gridlines
    const yTicks = y.ticks(4);
    g.append('g')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', gridColor)
      .attr('stroke-dasharray', '3,3');

    // Y Axis labels (compact ₹k / ₹L formatting)
    const yAxis = axisLeft(y)
      .ticks(4)
      .tickSize(0)
      .tickPadding(6)
      .tickFormat(val => {
        const n = Number(val);
        if (n === 0) return '₹0';
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
        return `₹${n}`;
      });

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('text').attr('fill', axisTextColor).style('font-size', '10px').style('font-weight', '600');

    // X Axis labels
    const labelMap = new Map(data.map(d => [d.dateKey, d.label]));
    const xAxis = axisBottom(x)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat(key => labelMap.get(key) ?? key);

    const xAxisGroup = g.append('g').attr('transform', `translate(0,${height})`).call(xAxis);
    xAxisGroup.select('.domain').attr('stroke', gridColor);
    xAxisGroup
      .selectAll('text')
      .attr('fill', key => (key === data[data.length - 1]?.dateKey ? todayTextColor : axisTextColor))
      .style('font-size', '10px')
      .style('font-weight', key => (key === data[data.length - 1]?.dateKey ? '700' : '600'));

    // Area fill under curve
    const areaGen = area<DailyRevenuePoint>()
      .x(d => x(d.dateKey) ?? 0)
      .y0(height)
      .y1(d => y(d.revenue))
      .curve(curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#salesTrendAmberGrad)')
      .attr('d', areaGen);

    // Line curve
    const lineGen = line<DailyRevenuePoint>()
      .x(d => x(d.dateKey) ?? 0)
      .y(d => y(d.revenue))
      .curve(curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineStrokeColor)
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('d', lineGen);

    // Interactive Data Dots + Hit Targets
    const selectedIdx = this.hoveredIndex() ?? data.length - 1;
    const pointsGroup = g.append('g');

    pointsGroup
      .selectAll('circle.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.dateKey) ?? 0)
      .attr('cy', d => y(d.revenue))
      .attr('r', (_d, i) => (i === selectedIdx ? 5 : 3.5))
      .attr('fill', (_d, i) => (i === selectedIdx ? activeDotFill : idleDotFill))
      .attr('stroke', lineStrokeColor)
      .attr('stroke-width', (_d, i) => (i === selectedIdx ? 2.5 : 2));

    pointsGroup
      .selectAll('circle.hit')
      .data(data)
      .join('circle')
      .attr('class', 'hit')
      .attr('cx', d => x(d.dateKey) ?? 0)
      .attr('cy', d => y(d.revenue))
      .attr('r', 16)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', (_event, d) => {
        const idx = data.findIndex(item => item.dateKey === d.dateKey);
        if (idx >= 0) this.hoveredIndex.set(idx);
      })
      .on('click', (_event, d) => {
        const idx = data.findIndex(item => item.dateKey === d.dateKey);
        if (idx >= 0) this.hoveredIndex.set(idx);
      });
  }
}
