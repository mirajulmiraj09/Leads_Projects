/*
  ============================================================
  Dashboard UI summary model
  ============================================================

  API response property নামগুলো অনেক বড় এবং inconsistent।
  Page-এর ভিতরে clean property name use করব।
*/
export interface DashboardSummary {
  registeredTillToday: number;
  registeredToday: number;
  signedInToday: number;
  activeUsers: number;
  lockedUsers: number;
  fdrDpsToday: number;
  requestReceivedToday: number;
}