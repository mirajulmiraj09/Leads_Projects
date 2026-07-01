/*
  Backend GET /api/About/getDetail Result object.
*/
export interface AboutApiResult {
  aboutId: number;
  international: string;
  localNumber: string;
  mailAddress: string;
  officeAddress: string;
}