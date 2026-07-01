import { DashboardKpi } from './dashboard-kpi.types';

/*
  Dashboard-এর উপরের metric card-এর UI model।
*/
export interface DashboardMetricCard {
  key: string;
  label: string;
  value: number;

  /*
    detailKpi থাকলে card click করা যাবে।
    না থাকলে card শুধু display করবে।
  */
  detailKpi?: DashboardKpi;

  /*
    Modal heading আলাদা দরকার হলে use হবে।
  */
  modalTitle?: string;
}