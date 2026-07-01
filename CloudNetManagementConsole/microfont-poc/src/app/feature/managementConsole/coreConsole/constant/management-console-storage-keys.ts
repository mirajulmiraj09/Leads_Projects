/*
  Management Console localStorage keys

  Important:
  - Existing Microfont POC / Keycloak token key use করা যাবে না।
  - Management Console-এর token আলাদা key-তে থাকবে।
  - এতে Keycloak token এবং Console API token conflict করবে না।
*/
export const MANAGEMENT_CONSOLE_STORAGE_KEYS = {
  /*
    Login API থেকে পাওয়া main access token
  */
  accessToken: 'management_console_access_token',

  /*
    API যদি future-এ refresh token দেয়, তখন use হবে।
    এখন না দিলেও key ready রাখা হলো।
  */
  refreshToken: 'management_console_refresh_token',

  /*
    Token expiry timestamp থাকলে এখানে রাখব।
    API response দেখে পরে exact value save করব।
  */
  tokenExpiry: 'management_console_token_expiry',
} as const;