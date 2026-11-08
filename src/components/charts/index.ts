// Shared entry for the report charts. Import it only from lazily loaded screens:
// it pulls in Recharts (about 100 KB gzipped) and must stay out of the first screen.
export { ChartTable, type ChartTableColumn } from './ChartTable';
export {
  CHART_COLORS,
  DailyChart,
  type DailyChartView,
  type DailySeries,
} from './DailyChart';
