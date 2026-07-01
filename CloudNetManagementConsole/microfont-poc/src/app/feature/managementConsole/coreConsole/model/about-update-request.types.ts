/*
  POST /api/About/editDetail request body.

  Important:
  - Backend GET response-এর real property name "international"।
  - তাই এখানে internationalNumber না লিখে international ব্যবহার করছি।
  - aboutId রাখা হয়েছে কারণ backend record identify করতে চাইতে পারে।
*/
export interface AboutUpdateRequest {
  aboutId: number;
  international: string;
  localNumber: string;
  mailAddress: string;
  officeAddress: string;
}