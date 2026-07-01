import { Component,signal } from '@angular/core';
import { InputTextBox } from './../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { GenericButton } from '../../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { InputDate } from '../../../../shared/common-components/input-types/input-date/input-date';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequestQueueApiService } from '../../coreConsole/service/request-queue.service';
import {inject} from '@angular/core';
import {GlobalResponse} from '../../coreConsole/model/globar.model';
import {ActiveSessionRequest} from '../../coreConsole/model/activity.model';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';


@Component({
  selector: 'app-request-queue',
  imports: [ InputTextBox, InputSelectOptionField, InputDate, GenericDataGrid, CommonModule, ExpansionPanelHeader],
  templateUrl: './request-queue.html',
  styleUrl: './request-queue.scss'
})
export class RequestQueue {
  isRequestPanelOpen= signal(true);
  isRequestGridOpen= signal(true);

  requestQueueApiService = inject(RequestQueueApiService);

  requestForm = new FormGroup({
    userId: new FormControl(''),
    branchName: new FormControl(''),
    requestType: new FormControl(''),
    status: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl('')
  });


branchOptions = [
  { key: '8888', value: '8888:Head Office_OBU' },
  { key: '8001', value: '8001:Head office (Islamic)' },
  { key: '5008', value: '5008:Afsana Apu Branch' },
  { key: '5009', value: '5009:Afsana Apu Brnach' },
  { key: '0030', value: '0030:Aganagar' }
];

 requestTypeOptions = [
  { key: 'ORDERCHEQUE', value: 'Cheque Book Request' },
  { key: 'STOP_CHEQUE', value: 'Stop Cheque Request' },
  { key: 'STATEMENT', value: 'Statement Request' },
  { key: 'ADDRESS_CHANGE', value: 'Address Change Request' },
  { key: 'COMPLAIN', value: 'Complain Request' },
  { key: 'LOST_CARD', value: 'Lost Card Request' }
];

statusOptions = [
  { key: 'PENDING', value: 'Pending' },
  { key: 'IN_PROGRESS', value: 'In Progress' },
  { key: 'PROCESSED', value: 'Processed' },
  { key: 'DELIVERED', value: 'Delivered' },
  { key: 'DECLINED', value: 'Declined' }
];

  requestQueueData :any[] = [];

  

  getRequestQueue() {
    if (this.requestForm.valid) {
      const formValue = this.requestForm.value;

      const requestPayload: ActiveSessionRequest = {
        userId: formValue.userId ?? '',
        branchId: formValue.branchName ? parseInt(formValue.branchName) : 0,
        requestType: formValue.requestType || '',
        statusType: formValue.status || '',
        startDate: formValue.startDate ? new Date(formValue.startDate).toISOString() : '',
        endTime: formValue.endDate ? new Date(formValue.endDate).toISOString() : ''
      };
      this.requestQueueApiService.getRequestQueue(requestPayload).subscribe((response: GlobalResponse)=> {
       if(response.Status === 'OK'){
        console.log('Request Queue Data:', response.Result);
         this.requestQueueData = response.Result || [];
       }
      });
    }
  }

  onEdit(event: any) {
    console.log('Edit clicked for:', event);
  }
  onClear(event: any) {
    console.log('Clear clicked for:', event);
  }

//  markTouched(fieldName: string) {
//   const control = this.requestForm.get(fieldName);
//   if (control) {
//     control.markAsTouched();
//   }
// }


  onRefresh() {
    console.log('Refresh clicked');


  }
  onExit() {
    console.log('Exit clicked');
  }
}
