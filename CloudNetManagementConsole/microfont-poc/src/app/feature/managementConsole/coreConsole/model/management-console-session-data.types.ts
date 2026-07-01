/*
  Browser localStorage-এ Management Console-এর
  current authenticated session কীভাবে represent হবে।
*/
export interface ManagementConsoleSessionData {
  accessToken: string;

  /*
    Backend refresh token না দিলে null থাকবে।
  */
  refreshToken: string | null;

  /*
    JavaScript timestamp in milliseconds.
    Example: Date.now() + 3600000
  */
  tokenExpiry: number | null;
}