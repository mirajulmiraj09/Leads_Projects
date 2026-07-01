import { Component, OnInit,effect } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { FundTransferApiService } from '../../coreConsole/service/fund-transfer.service';
import { GlobalResponse,UserPayload } from '../../coreConsole/model/globar.model';
import { FundTransferPayload, TransactionLimit } from '../../coreConsole/model/funs-transfer.model';
import {ReactiveFormsModule} from '@angular/forms';
import { ChargeAndLimitConfig } from '../../coreConsole/model/funs-transfer.model';
import { BUTTON_VISIBILITY, ONCLICK_SAVE ,ONCLICK_RESET,ONCLICK_EXIT} from '../../../../shared/constant/button-signals.constant';

@Component({
  selector: 'app-fund-transfer-limit',
  standalone: true,
  imports: [CommonModule,  InputTextBox, InputSelectOptionField, FormsModule, ReactiveFormsModule],
  templateUrl: './fund-transfer-limit.html',
  styleUrls: ['./fund-transfer-limit.scss']
})
export class FundTransferLimit implements OnInit {

  private router = inject(Router);
  fundApiService = inject(FundTransferApiService);
  onClickSave = ONCLICK_SAVE;
  onClickReset = ONCLICK_RESET;
  onClickExit = ONCLICK_EXIT;

  // ✅ TAB FLAGS
  all = true;
  individual = false;
  global = false;
  showIndividualForm = false;



  myVariable = 'This is a readonly value';

  formGroupConfig: FormGroup = new FormGroup({

    chargE_EVENT_ID: new FormControl(''),
    chargE_RULE_ID: new FormControl(''),

    corP_AMOUNT_PER_TRANS_MIN: new FormControl(''),
    corP_AMT_PER_TRANS: new FormControl(''),
    corP_AMT_PER_TRANS_MIN_OTHER: new FormControl(''),
    corP_AMT_PER_TRANS_MIN_OWN: new FormControl(''),
    corP_AMT_PER_TRANS_OTHER_ACC: new FormControl(''),
    corP_AMT_PER_TRANS_OWN_ACC: new FormControl(''),
    corP_AMT_PER_TRN_MIN_OTHR_BANK: new FormControl(''),
    corP_AMT_PER_TRN_OTHER_BANK_AC: new FormControl(''),
    corP_GLOBAL_MAX_LIMIT: new FormControl(''),
    corP_TRANS_AMT_DAY: new FormControl(''),
    corP_TRANS_PER_DAY: new FormControl(''),
    corP_TRN_AMOUNT_DAY_OTHER_ACC: new FormControl(''),
    corP_TRN_AMOUNT_DAY_OWN_ACC: new FormControl(''),
    corP_TRN_AMT_DAY_OTHER_BANK_AC: new FormControl(''),
    corP_TRN_NO_DAY_OTHER_ACC: new FormControl(''),
    corP_TRN_NO_DAY_OTHER_BANK_AC: new FormControl(''),
    corP_TRN_NO_DAY_OWN_ACC: new FormControl(''),

    fT_ENABLE_FLAG: new FormControl('false'),
    iS_CHARGE_APPLICABLE_TO_PB: new FormControl('false'),

    ibT_CODE: new FormControl(''),

    inD_AMOUNT_PER_TRANS_MIN: new FormControl(''),
    inD_AMT_PER_TRANS: new FormControl(''),
    inD_AMT_PER_TRANS_MIN_OTHER: new FormControl(''),
    inD_AMT_PER_TRANS_MIN_OWN: new FormControl(''),
    inD_AMT_PER_TRANS_OTHER_ACC: new FormControl(''),
    inD_AMT_PER_TRANS_OWN_ACC: new FormControl(''),
    inD_AMT_PER_TRN_MIN_OTHER_BANK: new FormControl(''),
    inD_AMT_PER_TRN_OTHER_BANK_ACC: new FormControl(''),
    inD_GLOBAL_MAX_LIMIT: new FormControl(''),
    inD_TRANS_AMT_PER_DAY: new FormControl(''),
    inD_TRANS_PER_DAY: new FormControl(''),
    inD_TRN_AMOUNT_DAY_OTHER_ACC: new FormControl(''),
    inD_TRN_AMOUNT_DAY_OWN_ACC: new FormControl(''),
    inD_TRN_AMT_DAY_OTHER_BANK_ACC: new FormControl(''),
    inD_TRN_NO_DAY_OTHER_ACC: new FormControl(''),
    inD_TRN_NO_DAY_OTHER_BANK_ACC: new FormControl(''),
    inD_TRN_NO_DAY_OWN_ACC: new FormControl(''),

    merchanT_BANK_ACC: new FormControl(''),
    merchanT_BANK_ACC_BR_ID: new FormControl(''),

    otheR_ACCOUNT_FLAG: new FormControl(''),
    otheR_BANK_ACCOUNT_FLAG: new FormControl(''),

    otheR_BANK_BB_EFT_HEAD: new FormControl(''),
    otheR_BANK_BEFT_ACC_NO: new FormControl(''),
    otheR_BANK_BEFT_BRANCH_ID: new FormControl(''),
    otheR_BANK_BKASH_ACC_NO: new FormControl(''),
    otheR_BANK_BKASH_BR_ID: new FormControl(''),
    otheR_BANK_NPSB_ACC_NO: new FormControl(''),
    otheR_BANK_NPSB_BR_ID: new FormControl(''),
    otheR_BANK_Q_CASH_NPSB_ACC_NO: new FormControl(''),
    otheR_BANK_Q_CASH_NPSB_BR_ID: new FormControl(''),

    owN_ACCOUNT_FLAG: new FormControl(''),

    pB_BRANCH_ID: new FormControl(''),

    q_CASH_CHARGE_RULE_ID: new FormControl(''),

    ssL_MERCHANT_ACC: new FormControl(''),
    ssL_MERCHANT_ACC_BR_ID: new FormControl('')
  });



  formGroupAllTab: FormGroup = new FormGroup({
    transferType: new FormControl('', Validators.required),
    allTxnCount: new FormControl('', Validators.required),
    allMinAmount: new FormControl('', Validators.required),
    allMaxAmount: new FormControl('', Validators.required),
    allDailyAmount: new FormControl('', Validators.required),
  });


  formGroupIndividualTab: FormGroup = new FormGroup({
    transferType: new FormControl('', Validators.required),
    maxAmountPerTrans: new FormControl('', Validators.required),
    maxAmountTransPerDay: new FormControl('', Validators.required),
    maxNumOfTransPerDay: new FormControl('', Validators.required),
    minAmountPerTrans: new FormControl('', Validators.required),
    userId: new FormControl(''),
    customerId: new FormControl(''),
    mobileNumber: new FormControl(''),
  });

  searchTab: FormGroup = new FormGroup({
    searchType: new FormControl('USERID', Validators.required),
    searchValue: new FormControl('', Validators.required),
  });

  // ✅ DROPDOWN OPTIONS
  transferTypeOptions = [
    { key: 'FT', value: 'FT' },
    { key: 'RTGS', value: 'RTGS' },
    { key: 'NPSB', value: 'NPSB' },
    { key: 'OWNBANK', value: 'OWNBANK' },
    { key: 'BKASH', value: 'BKASH' },
  ];


  searchOptions = [
    { key: 'USERID', value: 'User Id' },
    { key: 'CUSTOMERID', value: 'Customer Id' },
    { key: 'MOBILE', value: 'Mobile Number' }
  ];



  // ✅ TRANSFER TYPE AUTO DATA
  transferTypeData: any = {
    FT: {
      minAmount: 100,
      maxAmount: 5000,
      dailyAmount: 20000,
      txnCount: 10
    },
    RTGS: {
      minAmount: 500,
      maxAmount: 10000,
      dailyAmount: 50000,
      txnCount: 20
    },
    NPSB: {
      minAmount: 200,
      maxAmount: 7000,
      dailyAmount: 30000,
      txnCount: 15
    },
    BKASH: {
      minAmount: 50,
      maxAmount: 2000,
      dailyAmount: 10000,
      txnCount: 5
    }
  };


 principalBranchOptions = [
  { key: '0088', value: 'OBU Branch' },
  { key: '0016', value: 'Off-shore Banking Unit 0016' },
  { key: '0059', value: 'Off-shore Banking Unit 0059' },
  { key: '0058', value: 'Off-shore Banking Unit 0058' },
  { key: '0041', value: 'Pahartoli Branch' },
  { key: '0002', value: 'Principal Branch' },
  { key: '5013', value: 'Rabbi vai Br.' },
  { key: '5011', value: 'Rabbi vai Branch' }
];


  searchLabel = 'Enter User Id';

  constructor() { 
   BUTTON_VISIBILITY.set({
        save: true,
        saveNext: false,
        update: false,
        updateNext: false,
        view: false,
        delete: false,
        exit: true,
        reset: true,
      });
      effect(()=>{
        if(this.onClickSave()){
          this.handleSave();
          this.onClickSave.set(false);
        } 
      });
      effect(()=>{
        if(this.onClickReset()){
          this.formGroupIndividualTab.reset();
          this.onClickReset.set(false);
        }
      });
      effect(()=>{
        if(this.onClickExit()){
          this.handleExit();
          this.onClickExit.set(false);
        }
      });

  }

  // ✅ INIT
  ngOnInit(): void {

    this.onTabChange('all');

    // ✅ transfer type change
    this.formGroupAllTab.get('transferType')?.valueChanges.subscribe(value => {
      this.onTransferTypeChange(value);
    });

    this.formGroupIndividualTab.get('searchType')?.valueChanges.subscribe(value => {

      if (value === 'USERID') {
        this.searchLabel = 'Enter User Id';
      }
      else if (value === 'CUSTOMERID') {
        this.searchLabel = 'Enter Customer Id';
      }
      else if (value === 'MOBILE') {
        this.searchLabel = 'Enter Mobile Number';
      }
      else {
        this.searchLabel = 'Enter Value';
      }

    });

  }


  // ✅ TAB CHANGE

  onTabChange(tab: 'all' | 'individual' | 'global' | 'showIndividualForm'): void {

    this.all = false;
    this.individual = false;
    this.global = false;
    this.showIndividualForm = false;

    if (tab === 'all') this.all = true;
    if (tab === 'individual') this.individual = true;
    if (tab === 'global') this.global = true;
    if (tab === 'showIndividualForm') this.showIndividualForm = true;

    console.log('Active Tab:', tab);
  }
  // ✅ TRANSFER TYPE CHANGE
  onTransferTypeChange(type: string | null): void {

    if (!type) return;

    const data = this.transferTypeData[type];
    if (!data) return;

    this.formGroupAllTab.patchValue({
      allMinAmount: String(data.minAmount),
      allMaxAmount: String(data.maxAmount),
      allDailyAmount: String(data.dailyAmount),
      allTxnCount: String(data.txnCount)
    });
  }

  // ✅ USER SEARCH
  onSearch(): void {

    const { searchType, searchValue } = this.searchTab.value;

    const searchPayload: UserPayload = {
      searchFlag: 0,
      userId: '',
      customerId: '',
      mobileNumber: '',
      email: ''
    };

    // Build payload based on search type
    if (searchType === 'USERID') {
      searchPayload.searchFlag = 0;
      searchPayload.userId = searchValue;
      this.formGroupIndividualTab.get('userId')?.setValue(searchValue);
    } else if (searchType === 'CUSTOMERID') {
      searchPayload.searchFlag = 1;
      searchPayload.customerId = searchValue;
      this.formGroupIndividualTab.get('customerId')?.setValue(searchValue);
    } else if (searchType === 'MOBILE') {
      searchPayload.searchFlag = 2;
      searchPayload.mobileNumber = searchValue;
      this.formGroupIndividualTab.get('mobileNumber')?.setValue(searchValue);
    } else if (searchType === 'EMAIL') {
      searchPayload.searchFlag = 3;
      searchPayload.email = searchValue;
    }

    console.log('Payload:', searchPayload);

    // ✅ Call API
    this.fundApiService.searchUser(searchPayload).subscribe({
      next: (res) => {
        if (res.Status === 'OK') {
          this.showIndividualForm = true;
        }
        console.log('Response:', res);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });

  }


  saveAllTab() {

    if (this.formGroupAllTab.invalid) {
      this.formGroupAllTab.markAllAsTouched();
      alert('Form invalid ❌');
      return;
    }

    const formValue = this.formGroupAllTab.value;

    const payload: FundTransferPayload[] = [

      {
        TransferType: formValue.transferType || '',

        // ✅ CORRECT MAPPING
        MinAmountPerTrans: Number(formValue.allMinAmount),
        MaxAmountPerTrans: Number(formValue.allMaxAmount),
        MaxAmountTransPerDay: Number(formValue.allDailyAmount),
        MaxNumOfTransPerDay: Number(formValue.allTxnCount),

        UserId: 'EPSILON'

      }
    ];

    console.log('✅ Payload:', payload);

    this.fundApiService.updateFundTransferLimit(payload).subscribe({
      next: (res) => {
        console.log('✅ API Response:', res);
        alert('✅ All Tab Data Saved Successfully!');
      },
      error: (err) => {
        console.error('❌ Error:', err);
        alert('❌ Failed to Save All Tab Data');
      }
    });
  }

  saveIndividualTab() {
    const formValue = this.formGroupIndividualTab.value;

    const payload = {
      TransferType: formValue.transferType,
      MinAmountPerTrans: Number(formValue.minAmountPerTrans),
      MaxAmountPerTrans: Number(formValue.maxAmountPerTrans),
      MaxAmountTransPerDay: Number(formValue.maxAmountTransPerDay),
      MaxNumOfTransPerDay: Number(formValue.maxNumOfTransPerDay),
    } as TransactionLimit;

    // Add identifier based on search type
    const searchType = this.searchTab.value.searchType;
    const searchValue = this.searchTab.value.searchValue;

    if (searchType === 'USERID') {
      payload.UserId = searchValue;

    } else if (searchType === 'CUSTOMERID') {
      payload.CustomerId = searchValue;

    } else if (searchType === 'MOBILE') {
      payload.MobileNumber = searchValue;
    }

    this.fundApiService.addNewFund(payload).subscribe({
      next: (res) => {
        console.log('✅ API Response:', res);
        console.log('status : ', res.Status);
        alert('✅ Individual Tab Data Saved Successfully!');
      },
      error: (err) => {
        console.error('❌ Error:', err);
        alert('❌ Failed to Save Individual Tab Data');
      }
    });


  }

saveGlobalTab() {

  const formValue = this.formGroupConfig.value;

  const payload: ChargeAndLimitConfig = {

    chargE_EVENT_ID: formValue.chargE_EVENT_ID,
    chargE_RULE_ID: formValue.chargE_RULE_ID,

    // ✅ CORPORATE
    corP_AMOUNT_PER_TRANS_MIN: formValue.corP_AMOUNT_PER_TRANS_MIN,
    corP_AMT_PER_TRANS: formValue.corP_AMT_PER_TRANS,
    corP_AMT_PER_TRANS_MIN_OTHER: formValue.corP_AMT_PER_TRANS_MIN_OTHER,
    corP_AMT_PER_TRANS_MIN_OWN: formValue.corP_AMT_PER_TRANS_MIN_OWN,
    corP_AMT_PER_TRANS_OTHER_ACC: formValue.corP_AMT_PER_TRANS_OTHER_ACC,
    corP_AMT_PER_TRANS_OWN_ACC: formValue.corP_AMT_PER_TRANS_OWN_ACC,
    corP_AMT_PER_TRN_MIN_OTHR_BANK: formValue.corP_AMT_PER_TRN_MIN_OTHR_BANK,
    corP_AMT_PER_TRN_OTHER_BANK_AC: formValue.corP_AMT_PER_TRN_OTHER_BANK_AC,
    corP_GLOBAL_MAX_LIMIT: formValue.corP_GLOBAL_MAX_LIMIT,
    corP_TRANS_AMT_DAY: formValue.corP_TRANS_AMT_DAY,
    corP_TRANS_PER_DAY: formValue.corP_TRANS_PER_DAY,
    corP_TRN_AMOUNT_DAY_OTHER_ACC: formValue.corP_TRN_AMOUNT_DAY_OTHER_ACC,
    corP_TRN_AMOUNT_DAY_OWN_ACC: formValue.corP_TRN_AMOUNT_DAY_OWN_ACC,
    corP_TRN_AMT_DAY_OTHER_BANK_AC: formValue.corP_TRN_AMT_DAY_OTHER_BANK_AC,
    corP_TRN_NO_DAY_OTHER_ACC: formValue.corP_TRN_NO_DAY_OTHER_ACC,
    corP_TRN_NO_DAY_OTHER_BANK_AC: formValue.corP_TRN_NO_DAY_OTHER_BANK_AC,
    corP_TRN_NO_DAY_OWN_ACC: formValue.corP_TRN_NO_DAY_OWN_ACC,

    // ✅ FLAGS
    fT_ENABLE_FLAG: formValue.fT_ENABLE_FLAG ? '1' : '0',
    iS_CHARGE_APPLICABLE_TO_PB: formValue.iS_CHARGE_APPLICABLE_TO_PB ? '1' : '0',

    ibT_CODE: formValue.ibT_CODE,

    // ✅ INDIVIDUAL
    inD_AMOUNT_PER_TRANS_MIN: formValue.inD_AMOUNT_PER_TRANS_MIN,
    inD_AMT_PER_TRANS: formValue.inD_AMT_PER_TRANS,
    inD_AMT_PER_TRANS_MIN_OTHER: formValue.inD_AMT_PER_TRANS_MIN_OTHER,
    inD_AMT_PER_TRANS_MIN_OWN: formValue.inD_AMT_PER_TRANS_MIN_OWN,
    inD_AMT_PER_TRANS_OTHER_ACC: formValue.inD_AMT_PER_TRANS_OTHER_ACC,
    inD_AMT_PER_TRANS_OWN_ACC: formValue.inD_AMT_PER_TRANS_OWN_ACC,
    inD_AMT_PER_TRN_MIN_OTHER_BANK: formValue.inD_AMT_PER_TRN_MIN_OTHER_BANK,
    inD_AMT_PER_TRN_OTHER_BANK_ACC: formValue.inD_AMT_PER_TRN_OTHER_BANK_ACC,
    inD_GLOBAL_MAX_LIMIT: formValue.inD_GLOBAL_MAX_LIMIT,
    inD_TRANS_AMT_PER_DAY: formValue.inD_TRANS_AMT_PER_DAY,
    inD_TRANS_PER_DAY: formValue.inD_TRANS_PER_DAY,
    inD_TRN_AMOUNT_DAY_OTHER_ACC: formValue.inD_TRN_AMOUNT_DAY_OTHER_ACC,
    inD_TRN_AMOUNT_DAY_OWN_ACC: formValue.inD_TRN_AMOUNT_DAY_OWN_ACC,
    inD_TRN_AMT_DAY_OTHER_BANK_ACC: formValue.inD_TRN_AMT_DAY_OTHER_BANK_ACC,
    inD_TRN_NO_DAY_OTHER_ACC: formValue.inD_TRN_NO_DAY_OTHER_ACC,
    inD_TRN_NO_DAY_OTHER_BANK_ACC: formValue.inD_TRN_NO_DAY_OTHER_BANK_ACC,
    inD_TRN_NO_DAY_OWN_ACC: formValue.inD_TRN_NO_DAY_OWN_ACC,

    // ✅ ACCOUNT INFO
    merchanT_BANK_ACC: formValue.merchanT_BANK_ACC,
    merchanT_BANK_ACC_BR_ID: formValue.merchanT_BANK_ACC_BR_ID,

    otheR_ACCOUNT_FLAG: formValue.otheR_ACCOUNT_FLAG,
    otheR_BANK_ACCOUNT_FLAG: formValue.otheR_BANK_ACCOUNT_FLAG,

    otheR_BANK_BB_EFT_HEAD: formValue.otheR_BANK_BB_EFT_HEAD,
    otheR_BANK_BEFT_ACC_NO: formValue.otheR_BANK_BEFT_ACC_NO,
    otheR_BANK_BEFT_BRANCH_ID: formValue.otheR_BANK_BEFT_BRANCH_ID,
    otheR_BANK_BKASH_ACC_NO: formValue.otheR_BANK_BKASH_ACC_NO,
    otheR_BANK_BKASH_BR_ID: formValue.otheR_BANK_BKASH_BR_ID,
    otheR_BANK_NPSB_ACC_NO: formValue.otheR_BANK_NPSB_ACC_NO,
    otheR_BANK_NPSB_BR_ID: formValue.otheR_BANK_NPSB_BR_ID,
    otheR_BANK_Q_CASH_NPSB_ACC_NO: formValue.otheR_BANK_Q_CASH_NPSB_ACC_NO,
    otheR_BANK_Q_CASH_NPSB_BR_ID: formValue.otheR_BANK_Q_CASH_NPSB_BR_ID,

    owN_ACCOUNT_FLAG: formValue.owN_ACCOUNT_FLAG,

    pB_BRANCH_ID: formValue.pB_BRANCH_ID,

    q_CASH_CHARGE_RULE_ID: formValue.q_CASH_CHARGE_RULE_ID,

    ssL_MERCHANT_ACC: formValue.ssL_MERCHANT_ACC,
    ssL_MERCHANT_ACC_BR_ID: formValue.ssL_MERCHANT_ACC_BR_ID
  };

  console.log('✅ Global Payload:', payload);

  // ✅ Call API
  this.fundApiService.updateGlobalFund(payload).subscribe({
    next: (res) => {
      console.log('✅ Response:', res);
      console.log('✅ Status:', res.Status);
      alert('✅ Global Data Saved Successfully!');
    },
    error: (err) => {
      console.error('❌ Error:', err);
      alert('❌ Failed to Save Global Data');
    }
  });

}





  handleSave() {
    if (this.all) {
      this.saveAllTab();
    } else if (this.individual) {
      this.saveIndividualTab();
    } else if (this.global) {
      this.saveGlobalTab();
    }
  }
  handleRefresh() {

    if (this.all) {
      console.log('Refreshing All Tab Data');
    } else if (this.individual) {
      console.log('Refreshing Individual Tab Data');
    } else if (this.global) {
      console.log('Refreshing Global Tab Data');
    }
  }
  handleExit() {
    if (confirm('Are you sure to exit?')) {
      this.router.navigate(['/home']);
    }
  }

}
