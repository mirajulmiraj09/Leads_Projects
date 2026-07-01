export interface GlobalResponse {
  Status: string;
  Message: string;
  Result: any[];
}

export interface UserPayload {
    searchFlag: number;
    userId: string;
    customerId: string;
    mobileNumber: string;
    email: string;
}