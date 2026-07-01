import { Component, signal,OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputTextArea } from '../../../../shared/common-components/input-types/input-text-area/input-text-area';
import { GenericButton } from '../../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationApiService } from '../../coreConsole/service/notification.service';
import { inject } from '@angular/core';
import { UserPayload } from '../../coreConsole/model/globar.model';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    InputTextBox,
    InputTextArea,
    InputSelectOptionField,
    GenericButton,
    CommonModule, ReactiveFormsModule,
    ExpansionPanelHeader
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.scss'
})
export class Notification implements OnInit {

  isNotificationListOpen = signal(true);

  private notificationApiService = inject(NotificationApiService);
  userInfoFlag = false;
  userInfo: any = null;
  
  notificationForm = new FormGroup({
    BroadcastType: new FormControl('', Validators.required),
    notificationType: new FormControl('', Validators.required),
    subject: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  searchForm = new FormGroup({
    searchType: new FormControl(''),
    searchValue: new FormControl('')
  });

  ngOnInit() {
    this.notificationForm.get('BroadcastType')?.valueChanges.subscribe(value => {

      if (value === 'Individual') {
        // ✅ add validation
        this.searchForm.get('searchType')?.setValidators(Validators.required);
        this.searchForm.get('searchValue')?.setValidators(Validators.required);
      } else {
        // ✅ remove validation
        this.searchForm.get('searchType')?.clearValidators();
        this.searchForm.get('searchValue')?.clearValidators();

        // ✅ clear values
        this.searchForm.patchValue({
          searchType: '',
          searchValue: ''
        });
      }

      this.searchForm.get('searchType')?.updateValueAndValidity();
      this.searchForm.get('searchValue')?.updateValueAndValidity();
    });
  }

  // ✅ getter for UI control
  get isIndividual(): boolean {
    return this.notificationForm.get('BroadcastType')?.value === 'Individual';
  }

  searchTypeOptions = [
    { key: 'User Id', value: 'UserId' },
    { key: 'Customer Id', value: 'CustomerId' },
    { key: 'Mobile Number', value: 'MobileNumber' },
    { key: 'Email', value: 'Email' }
  ];
  onSearch() {
    const searchform = this.searchForm.value;

    const payload: UserPayload = {
      searchFlag: searchform.searchType === 'User Id' ? 0:
                  searchform.searchType === 'Customer Id' ? 1 :
                  searchform.searchType === 'MobileNumber' ? 2 :
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
    this.notificationApiService.getUser(payload).subscribe({
      next: (response) => {
        console.log('✅ User Information:', response);
        if(response.Status === 'OK') {
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
    const payload = {
      CustomerId: this.userInfo?.regCustUser?.customerId || '',
      NotifiDesc: this.notificationForm.get('description')?.value || '',
      NotifiTitle: this.notificationForm.get('subject')?.value || ''
    }
    this.notificationApiService.createNotification(payload).subscribe({
      next: (response) => {
        console.log('✅ Notification created successfully:', response); 
        alert('Notification created successfully!');
      },
      error: (error) => {
        console.error('❌ Error creating notification:', error);
        alert('Failed to create notification. Please try again.');
      }
    });
  }

  onRefresh() {
    console.log('Refresh clicked');
    this.notificationForm.reset();
    this.searchForm.reset();
    this.userInfoFlag = false;
    this.userInfo = null;
  }

  onExit() {
    console.log('Exit clicked');
  }
}