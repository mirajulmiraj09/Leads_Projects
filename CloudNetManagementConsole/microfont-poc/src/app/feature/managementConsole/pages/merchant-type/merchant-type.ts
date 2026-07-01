import { Component, inject,signal,effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { FormGroup, FormControl } from '@angular/forms';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid/generic-data-grid';
import { MerchantTypeApiService } from '../../coreConsole/service/merchant-type.service';
import { MerchantTypeModel }  from '../../coreConsole/model/merchant-type.model';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { BUTTON_VISIBILITY,ONCLICK_SAVE,ONCLICK_RESET,ONCLICK_EXIT} from '../../../../shared/constant/button-signals.constant';


@Component({
  selector: 'app-merchant-type',
  standalone: true,
  imports: [ CommonModule, InputTextBox, GenericDataGrid, ExpansionPanelHeader],
  templateUrl: './merchant-type.html',
  styleUrl: './merchant-type.scss'
})
export class MerchantType {
  isMerchantInputOpen = signal(true);
  merchantPanel=signal(true);
  merchantPanelGrid=signal(true);
  
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
      if(this.onClickSave()){
        console.log('✅ Save signal received in MerchantType component');
        this.onSave();
        ONCLICK_SAVE.set(false);
      }
    });
    effect(() => {
      if(this.onClickReset()){
        console.log('✅ Reset signal received in MerchantType component');
        this.resetForm();
        ONCLICK_RESET.set(false);
      }
    });
    effect(() => {
      if(this.onClickExit()){
        console.log('✅ Exit signal received in MerchantType component');
        this.onExit();
        ONCLICK_EXIT.set(false);
      }
    });
    
  }
       
  private merchantTypeApiService = inject(MerchantTypeApiService);


  merchantTypeGrid: any[] = [];
  selectedId: number | null = null;

  searchForm: FormGroup = new FormGroup({
    merchantType: new FormControl('')
  });

  ngOnInit() {
    this.loadMerchantTypes();
  }

  // ✅ LOAD
  loadMerchantTypes() {
    this.merchantTypeApiService.getMerchantTypes().subscribe({
      next: (response) => {
        if (response.Status === 'OK') {
          this.merchantTypeGrid = response.Result ?? [];
        }
      },
      error: (error) => console.error(error)
    });
  }

 

  // ✅ EDIT
  editMerchantType(event: any) {
    const data = typeof event === 'string' ? JSON.parse(event) : event;
    console.log('Editing Merchant Type:', data);

    this.selectedId = data.id;
    console.log('Selected Merchant Type ID:', this.selectedId);
    setTimeout(() => {
      this.searchForm.patchValue({
        merchantType: data.name
      });
    });
  }

  // ✅ DELETE
  deleteMerchantType(event: any) {
    const data = typeof event === 'string' ? JSON.parse(event) : event;

    if (!confirm('Are you sure you want to delete this item?')) return;

    const payload: MerchantTypeModel = {
      typeName: data.name,
      EDT: data.id.toString(),     // ✅ must send ID here
      changeStatus: 'Deleted'
    };

    this.merchantTypeApiService
      .addOrEditOrChangeStatusOfMerchantType(payload)
      .subscribe({
        next: (res: any) => {
          if (res.Status === 'OK') {
            alert('Deleted successfully');
            this.loadMerchantTypes();
          }
        },
        error: (err) => console.error(err)
      });
  }

  // ✅ SAVE (CREATE + UPDATE)
  onSave() {

    const typeName = this.searchForm.value.merchantType;

    if (!typeName) {
      alert('Merchant Type is required');
      return;
    }

    const payload: MerchantTypeModel = {
      typeName: typeName,
      EDT: this.selectedId ? this.selectedId.toString() : '0',
      changeStatus: this.selectedId ? 'Updated' : 'Created'
    };

    this.merchantTypeApiService
      .addOrEditOrChangeStatusOfMerchantType(payload)
      .subscribe({
        next: (res: any) => {
          if (res.Status === 'OK') {

            alert(this.selectedId ? 'Updated successfully' : 'Saved successfully');

            this.resetForm();
            this.loadMerchantTypes();
          }
        },
        error: (err) => console.error(err)
      });
  }

  // ✅ RESET
  resetForm() {
    this.searchForm.reset();
    this.selectedId = null;
  }

  onRefresh() {
    this.resetForm();
    this.loadMerchantTypes();
  }

  onExit() {
    alert('Exit function called!');
  }
}