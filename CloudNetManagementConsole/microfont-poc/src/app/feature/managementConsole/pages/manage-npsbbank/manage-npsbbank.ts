import { Component, OnInit ,signal} from '@angular/core';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid/generic-data-grid';
import { inject } from '@angular/core';
import { ManageNPSBBankService } from '../../coreConsole/service/manage-nspbbank';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';

@Component({
  selector: 'app-manage-npsbbank',
  standalone: true,
  imports: [ExpansionPanelHeader, GenericDataGrid],
  templateUrl: './manage-npsbbank.html',
  styleUrl: './manage-npsbbank.scss'
})
export class ManageNPSBBank implements OnInit {
  isNpsbBankPanelOpen= signal(true);
  

  nspbBankService = inject(ManageNPSBBankService);

  nspbBankData: any[] = [];

  // ✅ Load data
  ngOnInit() {
    this.loadData();

    // ✅ Listen button click from grid
    window.addEventListener('bankStatusClick', (event: any) => {
      const bankCode = event.detail;
      this.toggleBankStatus(bankCode);
    });
  }

  // ✅ API call
  loadData() {
    this.nspbBankService.getAllNPSBBankData().subscribe({
      next: (res) => {
        if (res.Status === 'OK') {
          this.nspbBankData = res.Result || [];
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  // ✅ Toggle status
  toggleBankStatus(bankCode: string) {

    const row = this.nspbBankData.find(x => x.bankCode === bankCode);

    if (!row) return;

    const currentState = row.isEnabled;

    this.nspbBankService.bankStateChange(bankCode, !currentState).subscribe({
      next: (res) => {  
        console.log('API Response for status change:', currentState);
        if (res.Status === 'OK') {

          // ✅ update UI instantly
          row.isEnabled = !row.isEnabled;

          console.log('Status updated:', bankCode, !currentState);
        } else {
          alert(`${res.Status}: ${res.Message}`);
        }
      },
      error: (err) => {
        console.error('Status change error:', err);
      }
    });
  }

  // ✅ Custom column rendering
  cellRenderFunctions = {
    isEnabled: (value: any, row: any) => {

      const statusText = value ? 'Enable' : 'Disable';
      const statusColor = value ? 'green' : 'red';
      const buttonLabel = value ? 'Disable' : 'Enable';
      const buttonColor = value ? '#ef4444' : '#16a34a';

      return `
        <div style="display:flex; flex-direction:column; gap:6px">

          <div>
            Status :
            <span style="color:${statusColor}; font-weight:400;">
              ${statusText}
            </span>
          </div>

          <button
            style="
              background:${buttonColor};
              color:white;
              padding:5px 5px;
              border:none;
              border-radius:5px;
              cursor:pointer;
              font-size:12px;
              width:70px;
              display:inline-block;
            "
            onclick="window.dispatchEvent(new CustomEvent('bankStatusClick', { detail: '${row.bankCode}' }))"
          >
            ${buttonLabel}
          </button>

        </div>
      `;
    }
  };

}