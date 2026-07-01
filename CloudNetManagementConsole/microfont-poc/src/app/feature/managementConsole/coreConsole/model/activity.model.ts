export interface ActivityLogPayload {
  activityType: 'LOGIN' | 'LOGOUT' | 'TRANSFER' | string;
  userType: 1 | 2;  
  UserID: string;
  startDate: string;
  endTime: string;
}

export interface ActiveSessionRequest {
  branchId: number;
  userId: string;
  requestType: string;
  startDate: string;
  endTime: string;
  statusType: string;
}