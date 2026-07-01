import { Component, signal, effect } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { GenericButton } from '../../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { ResetPasswordApiService } from '../../coreConsole/service/reset-password.service';
import { inject } from '@angular/core';
import { UserPayload } from '../../coreConsole/model/globar.model';
import { CommonModule } from '@angular/common';
import { BUTTON_VISIBILITY, ONCLICK_SAVE, ONCLICK_RESET, ONCLICK_EXIT } from '../../../../shared/constant/button-signals.constant';

@Component({
  selector: 'app-reset-user-password',
  imports: [
    InputTextBox,
    InputSelectOptionField,
    CommonModule,
    ExpansionPanelHeader,
  
  ],
  templateUrl: './reset-user-password.html',
  styleUrl: './reset-user-password.scss'
})
export class ResetUserPassword {

  isUserInfoPanelOpen = signal(true);
  isSearchPanelOpen = signal(true);
  isSearchGrid = signal(true);

  onClickSave = ONCLICK_SAVE;
  onClickReset = ONCLICK_RESET;
  onClickExit = ONCLICK_EXIT;
  constructor() {
    BUTTON_VISIBILITY.set({
      save: true,
      reset: true,
      exit: true
    });
    effect(() => {
      if (this.onClickSave()) {
        console.log('✅ Save signal received in ResetUserPassword component');
        this.onSave();
        ONCLICK_SAVE.set(false);
      }
    });
    effect(() => {

      if (this.onClickReset()) {
        console.log('✅ Reset signal received in ResetUserPassword component');
        this.onRefresh();
        ONCLICK_RESET.set(false);
      }
    });
    effect(() => {
      if (this.onClickExit()) {

        console.log('✅ Exit signal received in ResetUserPassword component');
        this.onExit();

        ONCLICK_EXIT.set(false);
      }



    });
  }

  resetpasswordService = inject(ResetPasswordApiService);

  userInfo: any = null;
  userInfoFlag = false;


  resetPasswordForm = new FormGroup({
    searchType: new FormControl('', Validators.required),
    searchValue: new FormControl('', Validators.required)
  })

  searchTypeOptions = [
    { key: 'User Id', value: 'userId' },
    { key: 'Customer Id', value: 'customerId' },
    { key: 'Mobile Number', value: 'mobileNumber' },
    { key: 'Email', value: 'email' }
  ];

  onResetPassword() {
    const searchform = this.resetPasswordForm.value;

    const payload: UserPayload = {
      searchFlag: searchform.searchType === 'User Id' ? 0 :
        searchform.searchType === 'Customer Id' ? 1 :
          searchform.searchType === 'Mobile Number' ? 2 :
            searchform.searchType === 'Email' ? 3 : -1,

      userId: searchform.searchType === 'User Id'
        ? searchform.searchValue || ''
        : '',

      customerId: searchform.searchType === 'Customer Id'
        ? searchform.searchValue || ''
        : '',

      mobileNumber: searchform.searchType === 'Mobile Number'
        ? searchform.searchValue || ''
        : '',

      email: searchform.searchType === 'Email'
        ? searchform.searchValue || ''
        : ''
    };
    this.resetpasswordService.getUser(payload).subscribe({
      next: (response) => {
        console.log('✅ User Information:', response);
        if (response.Status === 'OK') {
          this.userInfo = response.Result;
          this.userInfoFlag = true;
        }
      },
      error: (error) => {
        console.error('❌ Error fetching user information:', error);
      }
    });
  }

  onSave() {
    console.log('Save clicked');
  }
  onRefresh() {
    console.log('Refresh clicked');
  }
  onExit() {
    console.log('Exit clicked');
  }

}
