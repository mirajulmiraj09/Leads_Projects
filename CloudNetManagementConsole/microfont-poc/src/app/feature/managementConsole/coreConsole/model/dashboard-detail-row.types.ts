/*
  ============================================================
  Dashboard detail row
  ============================================================

  KPI অনুযায়ী backend row structure আলাদা হতে পারে।

  Example:
  KPI 11:
  {
    tranS_DATE: '2026-06-25T00:00:00',
    tranS_COUNT: 1,
    tranS_AMOUNT: 100
  }

  KPI 12:
  {
    useR_ID: 'ibnul',
    devicE_COUNT: 30
  }

  তাই generic row type রাখা হলো।
*/
export interface DashboardDetailRow {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined;
}