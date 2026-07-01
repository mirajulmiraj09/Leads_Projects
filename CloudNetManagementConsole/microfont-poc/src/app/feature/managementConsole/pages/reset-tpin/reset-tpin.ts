import { Component ,signal} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import {InputSelectOptionField} from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { GenericButton } from '../../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { ResetTPinApiSErvice } from '../../coreConsole/service/reset-tpin.service';
import { inject } from '@angular/core';
import { GlobalResponse, UserPayload } from '../../coreConsole/model/globar.model';
import { CommonModule } from '@angular/common';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';

@Component({
  selector: 'app-reset-tpin',
   imports: [
    InputTextBox,
    InputSelectOptionField,
    CommonModule,
    ExpansionPanelHeader
  ],
  templateUrl: './reset-tpin.html',
  styleUrl: './reset-tpin.scss'
})
export class ResetTPin {

  isTpinPanelOpen = signal(true);
isUserInfoPanelOpen = signal(true);


  private resetTPinService = inject(ResetTPinApiSErvice);

  userInfo:any = null;
  userInfoFlag = false;


  resetTPinForm = new FormGroup({
    searchType: new FormControl('', Validators.required),
    searchValue: new FormControl('', Validators.required)
  })

  searchTypeOptions = [
    { key: 'User Id', value: 'userId' },
    { key: 'Customer Id', value: 'customerId' },
    { key: 'Mobile Number', value: 'mobileNumber' },
    { key: 'Email', value: 'email' }
  ];
  
  onResetTPin() {
    const searchform = this.resetTPinForm.value;
    
        const payload: UserPayload = {
          searchFlag: searchform.searchType === 'User Id' ? 0:
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
        this.resetTPinService.getUser(payload).subscribe({
          next: (response) => {
            console.log('✅ User Information:', response);
            if(response.Status === 'OK') {
              this.userInfo = response.Result;
              this.userInfoFlag = true;
              console.log('User Id name:', this.userInfo.regCustUser.userId);
            }
          },
          error: (error) => {
            console.error('❌ Error fetching user information:', error);
          }
        });
  }

  onSave(){
    this.resetTPinService.getResetTPin(this.userInfo.regCustUser.userId).subscribe({
      next: (response) => {
        if(response.Status === 'OK') {
          alert('T-Pin reset successfully');
          console.log('✅ T-Pin reset successfully:', response);
        }
      },
      error: (error) => {
        console.error('❌ Error resetting T-Pin:', error);
      }
    });
  }
  onRefresh() {
    console.log('Refresh clicked');
  }
  onExit() {
    console.log('Exit clicked');
  }

}
