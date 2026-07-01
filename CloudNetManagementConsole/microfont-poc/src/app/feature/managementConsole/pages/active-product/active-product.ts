import { Component, signal, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { InputTextArea } from '../../../../shared/common-components/input-types/input-text-area/input-text-area';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid';
import { ActiveProductApiService } from "../../coreConsole/service/active-product.api.service";
import { GlobalResponse } from '../../coreConsole/model/globar.model';
import { ProductPayload } from '../../coreConsole/model/product.model';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { BUTTON_VISIBILITY } from '../../../../shared/constant/button-signals.constant';


@Component({
  selector: 'app-active-products',
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

  isPanelOpen = signal(false);
  isTransactionPanelOpen = signal(true);
  isProductListOpen = signal(true);

  // ✅ UI states (NEW - safe to add)
  isLoading = signal(false);
  hasData = signal(true);
  errorMessage = signal('');

  private api = inject(ActiveProductApiService);

  // ✅ GRID DATA
  filteredProductList: any[] = [];

  // ✅ selected product id for edit
  selectedProductId: number;

  


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

  // ✅ STATIC dropdown (recommended here)
  productTypeOptions = [
    { key: 'CASA', value: 'CASA' },
    { key: 'DPS', value: 'DPS' },
    { key: 'FDR', value: 'FDR' },
  ];
  ngOnInit() {

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

  this.loadProducts(0); // ✅ NEW default load

  this.productForm.get('filterProductType')?.valueChanges.subscribe(value => {
    const typeId = this.getTypeId(value);
    this.loadProducts(typeId);
  });
}

  // ✅ LOAD PRODUCTS FROM API
  loadProducts(typeId: number) {

    this.isLoading.set(true);         // ✅ NEW
    this.hasData.set(true);           // ✅ NEW
    this.errorMessage.set('');        // ✅ NEW

    this.api.getActiveProductsList(typeId).subscribe({
      next: (res: GlobalResponse) => {

        this.isLoading.set(false);    // ✅ NEW

        if (res.Status?.toUpperCase() === 'OK') {

          const result = res.Result || [];

          // ✅ NEW (Data check)
          if (!result.length) {
            this.filteredProductList = [];
            this.hasData.set(false);
            return;
          }

          // ✅ YOUR EXISTING LOGIC (UNCHANGED)
          this.filteredProductList = result.map((item: any) => ({
            productId: item.productid,
            productName: item.title,
            productCode: item.productcode?.toString() || '',
            productType: this.mapType(item.typeid),
            webUrl: item.weburl || '',
            description: item.shortdesc,
            details: item.longdesc
          }));

        } else {
          console.error(res.Message);
          this.hasData.set(false);            // ✅ NEW
          this.errorMessage.set(res.Message || 'Error'); // ✅ NEW
        }
      },

      // ✅ NEW (Error handling)
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
    return '';
  }

  // ✅ REVERSE TYPE
  getTypeId(type: string | null | undefined): number {
    if (type === 'CASA') return 1002;
    if (type === 'DPS') return 1003;
    if (type === 'FDR') return 1004;
    return 0;
  }

  // ✅ EDIT
  onEdit(event: any) {

    const row = typeof event === 'string' ? JSON.parse(event) : event;

    this.selectedProductId = Number(row.productId);

    this.productForm.patchValue({
      productName: row.productName,
      productCode: row.productCode,
      productType: row.productType,
      webUrl: row.webUrl,
      description: row.description,
      details: row.details
    });
  }

  // ✅ DELETE (UI only)
  onDelete(product: any): void {

    const row = typeof product === 'string' ? JSON.parse(product) : product;

    if (confirm(`Are you sure you want to delete "${row.productName}"?`)) {

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
      this.api.saveProduct(payload).subscribe({
        next: () => {
          this.loadProducts(this.getTypeId(row.productType));
        }
      });
    }

  }

  // ✅ ✅ ✅ MAIN LOGIC (ADD + EDIT in one)
  onSave() {

    if (this.productForm.invalid) {
      alert('Form invalid ❌');
      return;
    }

    const formValue = this.productForm.value;

    const payload: ProductPayload = {
      Productid: this.selectedProductId,
      Title: formValue.productName || '',
      Shortdesc: formValue.description || '',
      Longdesc: formValue.details || '',
      Productcode: Number(formValue.productCode),
      Typeid: this.getTypeId(formValue.productType),
      Weburl: formValue.webUrl || null,
      Remark: 'Add',
      changeType: 'EDT'
    };

    this.api.saveProduct(payload).subscribe({
      next: () => {
        this.loadProducts(this.getTypeId(formValue.productType));
        this.productForm.reset();
      },
      error: (err) => console.error(err)
    });
  }


}