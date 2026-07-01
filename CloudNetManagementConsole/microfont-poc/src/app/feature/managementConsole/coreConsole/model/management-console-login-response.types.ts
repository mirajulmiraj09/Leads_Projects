/*
  Common API response wrapper.

  Existing Management Console APIs সাধারণত এই ধরনের response দেয়:

  {
    "Status": "OK",
    "Message": null,
    "Result": { ... }
  }
*/
export interface ManagementConsoleApiResponse<T> {
  Status: string;
  Message: string | null;
  Result: T | null;
}

/*
  Login response-এর Result object.

  Token field-এর final exact name Postman response দেখে confirm করব।
  আপাতত common possible token property রাখা হলো যাতে
  response parser flexible থাকে।
*/
export interface ManagementConsoleLoginResult {
  /*
    Real API fields inside Result.
  */
  access_token?: string;
  expires_in?: number;
  issued?: string;
  expires?: string;

  /*
    Future/fallback fields.
  */
  refresh_token?: string;

  AccessToken?: string;
  accessToken?: string;
  Token?: string;
  token?: string;

  RefreshToken?: string;
  refreshToken?: string;

  ExpiresIn?: number;
  expiresIn?: number;

  TokenExpiry?: string | number;
  tokenExpiry?: string | number;

  [key: string]: unknown;
}

/*
  Login endpoint-এর final response type.

  কিছু backend Result-এর ভিতরে direct string token দেয়,
  আবার কিছু backend object দেয়।
  তাই দুই ধরনের result temporarily support করা হলো।
*/
export type ManagementConsoleLoginResponse =
  ManagementConsoleApiResponse<
    ManagementConsoleLoginResult | string
  >;