import { Component, signal, OnInit, inject, effect } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { InputTextArea } from '../../../../shared/common-components/input-types/input-text-area/input-text-area';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid';
import { ActiveProductApiService } from "../../coreConsole/service/active-product.api.service";
import { GlobalResponse } from '../../coreConsole/model/globar.model';
import { ProductPayload } from '../../coreConsole/model/product.model';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { BUTTON_VISIBILITY,ONCLICK_SAVE,ONCLICK_RESET ,ONCLICK_EXIT} from '../../../../shared/constant/button-signals.constant';

@Component({
  selector: 'app-active-products',
  standalone: true,
  imports: [
    InputTextBox,
    InputSelectOptionField,
    InputTextArea,
    ReactiveFormsModule,
    GenericDataGrid,
    ExpansionPanelHeader
  ],
  templateUrl: './active-product.html',
  styleUrl: './active-product.scss'
})
export class ActiveProduct implements OnInit {

  // ✅ PANEL SIGNALS
  isTransactionPanelOpen = signal(true);
  isProductListOpen = signal(true);
  isDetailsPanelOpen = signal(true); // ✅ NEW for modal expansion

  // ✅ UI STATES
  isLoading = signal(false);
  hasData = signal(true);
  errorMessage = signal('');
  onClickSave = ONCLICK_SAVE; // ✅ NEW signal for Save button click
  onClickReset = ONCLICK_RESET; // ✅ NEW signal for Reset button click
  onClickExit = ONCLICK_EXIT; // ✅ NEW signal for Exit button click

  // ✅ MODAL STATES
  productDetailsModalOpen = signal(false);
  selectedProductDetails: any = null;

  private api = inject(ActiveProductApiService);

  // ✅ GRID DATA
  filteredProductList: any[] = [];

  selectedProductId!: number;

  // ✅ FORM
  productForm = new FormGroup({
    productName: new FormControl('', Validators.required),
    productCode: new FormControl('', Validators.required),
    productType: new FormControl('', Validators.required),
    webUrl: new FormControl(''),
    description: new FormControl('', Validators.required),
    details: new FormControl('', Validators.required),
    filterProductType: new FormControl('')
  });

  // ✅ TYPE OPTIONS
  productTypeOptions = [
    { key: 'CASA', value: 'CASA' },
    { key: 'DPS', value: 'DPS' },
    { key: 'FDR', value: 'FDR' },
  ];
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
          this.onSave();
          this.onClickSave.set(false);
        } 
      });
      effect(()=>{
        if(this.onClickReset()){
          this.productForm.reset();
          this.onClickReset.set(false);
        }
      });
      effect(()=>{
        if(this.onClickExit()){
          this.onExit();
          this.onClickExit.set(false);
        }
      });

  }

  ngOnInit() {

    this.loadProducts(0);

    this.productForm.get('filterProductType')?.valueChanges.subscribe(value => {
      this.loadProducts(this.getTypeId(value));
    });
  }
  

  // ✅ LOAD DATA
  loadProducts(typeId: number) {

    this.isLoading.set(true);
    this.hasData.set(true);
    this.errorMessage.set('');

    this.api.getActiveProductsList(typeId).subscribe({
      next: (res: GlobalResponse) => {

        this.isLoading.set(false);

        if (res.Status?.toUpperCase() === 'OK') {

          const result = res.Result || [];

          if (!result.length) {
            this.filteredProductList = [];
            this.hasData.set(false);
            return;
          }

          // ✅ IMPORTANT FIX (keep original API object)
          this.filteredProductList = result.map((item: any) => ({
            productId: item.productid,
            productName: item.title,
            productCode: item.productcode?.toString(),
            productType: this.mapType(item.typeid),
            webUrl: item.weburl || '',
            description: item.shortdesc,
            details: item.longdesc,

            // ✅ keep full object (VERY IMPORTANT)
            originalData: item
          }));

        } else {
          this.hasData.set(false);
          this.errorMessage.set(res.Message || 'Error');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.hasData.set(false);
        this.errorMessage.set('Server error ❌');
      }
    });
  }

  // ✅ TYPE MAP
  mapType(typeId: number): string {
    if (typeId === 1002) return 'CASA';
    if (typeId === 1003) return 'DPS';
    if (typeId === 1004) return 'FDR';
    return '-';
  }

  getTypeId(type: string | null | undefined): number {
    if (type === 'CASA') return 1002;
    if (type === 'DPS') return 1003;
    if (type === 'FDR') return 1004;
    return 0;
  }

  getTypeName(typeId: number): string {
    return this.mapType(typeId);
  }

  // ✅ EDIT
  onEdit(event: any) {
    const row = typeof event === 'string' ? JSON.parse(event) : event;

    this.selectedProductId = Number(row.productId);

    this.productForm.patchValue(row);
  }

  // ✅ DELETE
  onDelete(event: any) {

    const row = typeof event === 'string' ? JSON.parse(event) : event;

    if (confirm(`Delete "${row.productName}" ?`)) {

      const payload: ProductPayload = {
        Productid: Number(row.productId),
        Title: row.productName,
        Shortdesc: row.description,
        Longdesc: row.details,
        Productcode: Number(row.productCode),
        Typeid: this.getTypeId(row.productType),
        Weburl: row.webUrl || null,
        Remark: 'Delete',
        changeType: 'DEL'
      };

      this.api.saveProduct(payload).subscribe(() => {
        this.loadProducts(this.getTypeId(row.productType));
      });
    }
  }

  // ✅ ✅ DETAILS (FINAL FIX)
  onDetails(event: any) {

    const row = typeof event === 'string' ? JSON.parse(event) : event;

    // ✅ GET FULL API OBJECT
    this.selectedProductDetails = row.originalData;

    // ✅ OPEN MODAL
    this.productDetailsModalOpen.set(true);
  }

  closeModal() {
    this.productDetailsModalOpen.set(false);
    this.selectedProductDetails = null;
  }

  // ✅ SAVE
  onSave() {
    alert('Save button clicked!');
    if (this.productForm.invalid) return;

    const formValue = this.productForm.value;

    const payload: ProductPayload = {
      Productid: this.selectedProductId || 0,
      Title: formValue.productName || '',
      Shortdesc: formValue.description || '',
      Longdesc: formValue.details || '',
      Productcode: Number(formValue.productCode),
      Typeid: this.getTypeId(formValue.productType),
      Weburl: formValue.webUrl || null,
      Remark: 'Add',
      changeType: 'EDT'
    };

    this.api.saveProduct(payload).subscribe(() => {
      this.loadProducts(this.getTypeId(formValue.productType));
      this.productForm.reset();
    });
  }
  
 onExit() {
  window.history.back();
}

}
