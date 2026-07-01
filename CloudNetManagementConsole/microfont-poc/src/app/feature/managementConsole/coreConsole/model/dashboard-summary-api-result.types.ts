/*
  ============================================================
  GET /api/Dashboard/GetDashboardSummary Result
  ============================================================

  Backend property name / casing exactly রাখা হয়েছে।
*/
export interface DashboardSummaryApiResult {
  totaL_USER_REG_TILLTODATE?: string | number;

  totaL_USER_REG_TODAY?: string | number;

  totaL_USER_SIGNED_TODAY?: string | number;

  totaL_USER_ACTIVE_TODAY?: string | number;

  totaL_USER_LOCKED_TODAY?: string | number;

  totaL_FDPS_OPENED_TODAY?: string | number;

  totaL_REQS_RECEIVED_TODAY?: string | number;
}