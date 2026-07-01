/*
  Management Console Login API request body

  Important:
  - Property name এবং casing backend payload-এর সঙ্গে exact match হতে হবে।
  - তাই UserName / Password camelCase করা যাবে না।
*/
export interface ManagementConsoleLoginRequest {
  UserName: string;
  Password: string;
  ImeiOrIP: string;
  OTP: string;
  TPIN: string;
}