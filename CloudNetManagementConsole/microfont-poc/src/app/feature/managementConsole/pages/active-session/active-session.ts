import { Component ,signal} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { GenericButton } from '../../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { ActiveSessionApiService } from '../../coreConsole/service/active-session.service';
import { inject } from '@angular/core';
import { A11yModule } from "@angular/cdk/a11y";
import {CommonModule} from "@angular/common";
import {GenericDataGrid} from "../../../../shared/common-components/generic-component-type/generic-data-grid";
import {ExpansionPanelHeader} from "../../../../shared/common-components/expansion-panel-header/expansion-panel-header";

@Component({
  selector: 'app-active-session',
  imports: [InputTextBox,  A11yModule, CommonModule, GenericDataGrid, ExpansionPanelHeader ],
  templateUrl: './active-session.html',
  styleUrl: './active-session.scss'
})
export class ActiveSession {
isSessionPanelOpen =  signal(true);
  private activeSessionApiService = inject(ActiveSessionApiService);
  filteredUserSessionList: any[] = [];

  sessionDataForm = new FormGroup({
    userId: new FormControl('', Validators.required),
  })



  getActiveSessions(){
    const userId = this.sessionDataForm.get('userId')?.value;
    if (userId) {
      this.activeSessionApiService.getActiveSessions(userId).subscribe((response) => {
        this.filteredUserSessionList = response.Result || [];
        console.log('Active Sessions:', this.filteredUserSessionList);
      });
    }
  }

  onClear(event: any){ 
    console.log('Clear clicked');
    this.sessionDataForm.reset();
    this.filteredUserSessionList = [];
  }
  onRefresh(){
    console.log('Refresh clicked');
    this.getActiveSessions();
  }
  onExit(){
    console.log('Exit clicked');
  }
  
}
