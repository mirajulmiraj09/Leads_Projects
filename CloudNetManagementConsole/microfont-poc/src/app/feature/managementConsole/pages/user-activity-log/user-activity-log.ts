import { Component ,effect} from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { InputDate } from '../../../../shared/common-components/input-types/input-date/input-date';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivityApiService } from '../../coreConsole/service/activity.service';
import { ActivityLogPayload } from '../../coreConsole/model/activity.model';
import { ExpansionPanelHeader } from "../../../../shared/common-components/expansion-panel-header/expansion-panel-header";
import { signal } from '@angular/core';
import { BUTTON_VISIBILITY,ONCLICK_SAVE,ONCLICK_EXIT,ONCLICK_RESET,ONCLICK_VIEW} from '../../../../shared/constant/button-signals.constant';


@Component({
  selector: 'app-user-activity-log',
  standalone: true,
  imports: [InputTextBox, InputSelectOptionField, GenericDataGrid, InputDate, ExpansionPanelHeader],
  templateUrl: './user-activity-log.html',
  styleUrl: './user-activity-log.scss'
})
export class UserActivityLog {
  isActivityPanelOpen = signal(true);
  isActivityDetailsPanel = signal(true) 

  private router = inject(Router);
  private activityApiService = inject(ActivityApiService);
  data: any[] = []; 

  onclickSave = ONCLICK_SAVE;
  onClickExit = ONCLICK_EXIT;
  onClickReset = ONCLICK_RESET;
  onClickView = ONCLICK_VIEW;


  formGroup = new FormGroup({
    userType: new FormControl(''),
    userId: new FormControl(''),
    startDate: new FormControl('2026-06-16'),
    endDate: new FormControl('2026-06-16')
  });

  // ✅ Dropdown options
  userTypeOptions = [
    { key: 'client', value: 'Admin' },
    { key: 'admin', value: 'Client' }
  ];

  // ✅ Column Config
  columns = ['accessTime', 'userId', 'functionName', 'activityDetails'];

  // ✅ Column Name override

columnNames = {
  activityAt: 'Access Time',
  userName: 'User Name',
  activityType: 'Activity Type',
  comment: 'Activity Details'
};


 constructor() {
    BUTTON_VISIBILITY.set({
      save: true,
      reset: true,
      exit: true,
      view:true,
    });
    effect(() => {
      if (ONCLICK_SAVE()) {
        console.log('✅ Save signal received in UserActivityLog component');
        this.activityResult();
        ONCLICK_SAVE.set(false);
      }
    });
    effect(() => {
      if (ONCLICK_EXIT()) {
        console.log('✅ Exit signal received in UserActivityLog component');
        this.onExit();
        ONCLICK_EXIT.set(false);
      } 
    });
    effect(() => {
      if (ONCLICK_RESET()) {
        console.log('✅ Reset signal received in UserActivityLog component');
        this.formGroup.reset();
        ONCLICK_RESET.set(false);
      } 
    });
    effect(() => {
      if(this.onClickView()){
        console.log('✅ View signal received in UserActivityLog component');
        this.activityResult();
        ONCLICK_VIEW.set(false);
      }
    });
 }
  // ✅ Pagination / Backend handling
  onGridStateChange(event: any) {
    console.log('Grid State', event);
  }

  // ✅ Row click
  onRowDoubleClick(data: any) {
    console.log('Row Double Click:', data);
  }




  activityResult() {

    const formValue = this.formGroup.value;

    const payload: ActivityLogPayload = {
      activityType: '',
      userType: formValue.userType === 'Admin' ? 1 : 2,
      UserID: formValue.userId || '',
      startDate: formValue.startDate || '',
      endTime: formValue.endDate || ''  
    };


    this.activityApiService.searchActivityLog(payload).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        console.log('Activity Log Data:', response.Status);
        this.data = response.Result || [];
        console.log('Data set for grid:', this.data);
      },
      error: (error) => {
        console.error('API Error:', error);
        alert('Failed to fetch activity log. Please try again.');
      }
    });
  }


  onOk() {
    console.log('OK clicked');
    this.activityResult();
    // TODO: form submit logic
    alert('User created successfully ✅');
  }

  // ✅ Refresh button
  onRefresh() {
    console.log('Refresh clicked');

    // Option: Reload page
    window.location.reload();

    // OR: reset form (if exists)
    // this.form.reset();
  }

  // ✅ Exit button
  onExit() {
    console.log('Exit clicked');

    // Navigate to dashboard/home
    this.router.navigate(['management', 'home']);
  }
}
