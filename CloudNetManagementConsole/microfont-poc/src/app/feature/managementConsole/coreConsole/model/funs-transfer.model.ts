export interface FundTransferPayload {
    MaxAmountPerTrans: number;
    MaxAmountTransPerDay: number;
    MaxNumOfTransPerDay: number;
    MinAmountPerTrans: number;
    TransferType: string;
    UserId: string;
}


type Identifier =
  | { UserId: string; CustomerId?: never; MobileNumber?: never }
  | { CustomerId: string; UserId?: never; MobileNumber?: never }
  | { MobileNumber: string; UserId?: never; CustomerId?: never };

export type TransactionLimit = {
  MaxAmountPerTrans: number;
  MaxAmountTransPerDay: number;
  MaxNumOfTransPerDay: number;
  MinAmountPerTrans: number;
  TransferType: string;
} & Identifier;


export interface ChargeAndLimitConfig {

  chargE_EVENT_ID: string;
  chargE_RULE_ID: string;

  corP_AMOUNT_PER_TRANS_MIN: string;
  corP_AMT_PER_TRANS: string;
  corP_AMT_PER_TRANS_MIN_OTHER: string;
  corP_AMT_PER_TRANS_MIN_OWN: string;
  corP_AMT_PER_TRANS_OTHER_ACC: string;
  corP_AMT_PER_TRANS_OWN_ACC: string;
  corP_AMT_PER_TRN_MIN_OTHR_BANK: string;
  corP_AMT_PER_TRN_OTHER_BANK_AC: string;
  corP_GLOBAL_MAX_LIMIT: string;
  corP_TRANS_AMT_DAY: string;
  corP_TRANS_PER_DAY: string;
  corP_TRN_AMOUNT_DAY_OTHER_ACC: string;
  corP_TRN_AMOUNT_DAY_OWN_ACC: string;
  corP_TRN_AMT_DAY_OTHER_BANK_AC: string;
  corP_TRN_NO_DAY_OTHER_ACC: string;
  corP_TRN_NO_DAY_OTHER_BANK_AC: string;
  corP_TRN_NO_DAY_OWN_ACC: string;

  fT_ENABLE_FLAG: string;
  iS_CHARGE_APPLICABLE_TO_PB: string;

  ibT_CODE: string;

  inD_AMOUNT_PER_TRANS_MIN: string;
  inD_AMT_PER_TRANS: string;
  inD_AMT_PER_TRANS_MIN_OTHER: string;
  inD_AMT_PER_TRANS_MIN_OWN: string;
  inD_AMT_PER_TRANS_OTHER_ACC: string;
  inD_AMT_PER_TRANS_OWN_ACC: string;
  inD_AMT_PER_TRN_MIN_OTHER_BANK: string;
  inD_AMT_PER_TRN_OTHER_BANK_ACC: string;
  inD_GLOBAL_MAX_LIMIT: string;
  inD_TRANS_AMT_PER_DAY: string;
  inD_TRANS_PER_DAY: string;
  inD_TRN_AMOUNT_DAY_OTHER_ACC: string;
  inD_TRN_AMOUNT_DAY_OWN_ACC: string;
  inD_TRN_AMT_DAY_OTHER_BANK_ACC: string;
  inD_TRN_NO_DAY_OTHER_ACC: string;
  inD_TRN_NO_DAY_OTHER_BANK_ACC: string;
  inD_TRN_NO_DAY_OWN_ACC: string;

  merchanT_BANK_ACC: string;
  merchanT_BANK_ACC_BR_ID: string;

  otheR_ACCOUNT_FLAG: string;
  otheR_BANK_ACCOUNT_FLAG: string;

  otheR_BANK_BB_EFT_HEAD: string;
  otheR_BANK_BEFT_ACC_NO: string;
  otheR_BANK_BEFT_BRANCH_ID: string;
  otheR_BANK_BKASH_ACC_NO: string;
  otheR_BANK_BKASH_BR_ID: string;
  otheR_BANK_NPSB_ACC_NO: string;
  otheR_BANK_NPSB_BR_ID: string;
  otheR_BANK_Q_CASH_NPSB_ACC_NO: string;
  otheR_BANK_Q_CASH_NPSB_BR_ID: string;

  owN_ACCOUNT_FLAG: string;

  pB_BRANCH_ID: string;

  q_CASH_CHARGE_RULE_ID: string;

  ssL_MERCHANT_ACC: string;
  ssL_MERCHANT_ACC_BR_ID: string;
}