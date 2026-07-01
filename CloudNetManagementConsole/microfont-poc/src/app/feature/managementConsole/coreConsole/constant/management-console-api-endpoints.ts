import { environment } from '../../../../../environments/environment';

/*
  Management Console API endpoints

*/
export const MANAGEMENT_CONSOLE_API_ENDPOINTS = {
  /*
    Authentication
  */
  login: `${environment.managementConsoleApiBaseUrl}/api/Login/Login`,
  //logout: `${environment.managementConsoleApiBaseUrl}/api/Logout/Logout`,

  //About
aboutGetDetail:`${environment.managementConsoleApiBaseUrl}/api/About/getDetail`,
} as const;