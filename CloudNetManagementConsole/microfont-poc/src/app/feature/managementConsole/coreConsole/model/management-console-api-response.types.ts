/*
  Common Management Console API response wrapper.
*/
export interface ManagementConsoleApiResponse<T> {
  Status: string;
  Message: string | null;
  Result: T | null;
}