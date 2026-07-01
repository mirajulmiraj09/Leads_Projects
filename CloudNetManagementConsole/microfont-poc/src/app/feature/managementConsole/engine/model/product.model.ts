export interface ProductPayload {
  Productid: number;
  Title: string;
  Shortdesc: string;
  Longdesc: string;
  Productcode: number;
  Typeid: number;
  Weburl: string | null;
  Remark: string;
  changeType: string;
}