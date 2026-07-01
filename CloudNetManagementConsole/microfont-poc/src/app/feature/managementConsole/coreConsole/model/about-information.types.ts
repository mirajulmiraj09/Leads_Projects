/*
  About page-এর UI-friendly data model.

  Backend field "international" কে page-এ
  "internationalNumber" নামে use করব।
*/
export interface AboutInformation {
  aboutId: number;
  internationalNumber: string;
  localNumber: string;
  mailAddress: string;
  officeAddress: string;
}