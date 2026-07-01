import {
  Component,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  finalize,
  switchMap,
} from 'rxjs';

import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';

import {
  ButtonUtils,
  FormGroupSignal,
  ONCLICK_EXIT,
  ONCLICK_RESET,
  ONCLICK_SAVE,
  ONCLICK_UPDATE,
} from '../../../../shared/constant/button-signals.constant';

import { LoaderService } from '../../../../shared/services/loader.service';

import { MANAGEMENT_CONSOLE_ABSOLUTE_ROUTES } from '../../coreConsole/constant/management-console-route-constants';
import { ContactInformation } from '../../coreConsole/model/contact-information.types';
import { ContactUpdateRequest } from '../../coreConsole/model/contact-update-request.types';
import { ManagementConsoleContactApi } from '../../coreConsole/service/management-console-contact-api';

/*
  ============================================================
  Contact Page
  ============================================================

  Flow:
  1. Page open → GET contact details
  2. Top form → blank + disabled
  3. Navbar Update → bottom details auto-fill + editable
  4. Navbar Save → editContactDetails API call
  5. Save success → GET API আবার call
  6. Bottom details refreshed
  7. Top form আবার blank + disabled
*/
@Component({
  selector: 'management-console-contact',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    InputTextBox,
    ExpansionPanelHeader,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly contactApi = inject(
    ManagementConsoleContactApi,
  );

  private readonly loaderService = inject(
    LoaderService,
  );

  /*
    ============================================================
    EXPANSION PANEL STATE
    ============================================================
  */
  readonly contactInformationPanelOpen = signal(true);
  readonly contactDetailsPanelOpen = signal(true);

  /*
    ============================================================
    PAGE STATE
    ============================================================
  */
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly isEditMode = signal(false);

  readonly errorMessage = signal('');

  /*
    নিচের Contact Details section-এর API data।
  */
  readonly contactInformation =
    signal<ContactInformation | null>(null);

  /*
    ============================================================
    EDIT FORM
    ============================================================

    Important:
    contactEmailAddress API value plain email নাও হতে পারে।

    Example:
    "shadhin.care@jamunabank.com.bd or JBPLC 24/7 call center 16742"

    তাই এখানে Validators.email ব্যবহার করা হয়নি।
    নাহলে valid backend value হলেও Save button invalid হয়ে যেত।
  */
  readonly contactForm =
    this.formBuilder.nonNullable.group({
      callCenterHotlineNumber: [
        '',
        [Validators.required],
      ],

      emailAddress: [
        '',
        [Validators.required],
      ],
    });

  constructor() {
    /*
      ==========================================================
      NAVBAR BUTTON LISTENER
      ==========================================================

      Update click → edit mode
      Save click   → edit API call
      Reset click  → blank + disabled state
      Exit click   → Console home
    */
    effect(() => {
      if (ONCLICK_UPDATE()) {
        ONCLICK_UPDATE.set(false);
        this.startEdit();
      }

      if (ONCLICK_SAVE()) {
        ONCLICK_SAVE.set(false);
        this.saveContactDetails();
      }

      if (ONCLICK_RESET()) {
        ONCLICK_RESET.set(false);
        this.resetEditForm();
      }

      if (ONCLICK_EXIT()) {
        ONCLICK_EXIT.set(false);
        this.exitToHome();
      }
    });
  }

  ngOnInit(): void {
    /*
      Existing navbar Save button যেন form valid/invalid state জানে।
    */
    FormGroupSignal.set(this.contactForm);

    /*
      Initial state:
      - top input empty + disabled
      - Update / Reset navbar button visible
    */
    this.resetEditForm();

    /*
      Page open GET API call।
    */
    this.loadContactDetails();
  }

  ngOnDestroy(): void {
    /*
      Contact page-specific navbar configuration clear করা।
    */
    ButtonUtils.resetAllButtons();
    ButtonUtils.resetAllClickSignals();
  }

  /*
    ============================================================
    NAVBAR BUTTON CONFIGURATION
    ============================================================
  */

  /*
    View mode:
    top form blank + disabled
  */
  private configureViewModeButtons(): void {
    ButtonUtils.resetAllButtons();
    ButtonUtils.resetAllClickSignals();

    FormGroupSignal.set(this.contactForm);

    ButtonUtils.setPageButtons({
      update: true,
      reset: true,

      /*
        Exit চাইলে true করো।
        এখন About screenshot-এর মতো false রাখা হলো।
      */
      exit: false,
    });
  }

  /*
    Edit mode:
    Save + Reset visible
  */
  private configureEditModeButtons(): void {
    ButtonUtils.resetAllButtons();
    ButtonUtils.resetAllClickSignals();

    FormGroupSignal.set(this.contactForm);

    ButtonUtils.setPageButtons({
      save: true,
      reset: true,
      exit: false,
    });
  }

  /*
    ============================================================
    LOAD CONTACT DETAILS
    ============================================================
  */
  loadContactDetails(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.loaderService.show();

    this.contactApi
      .getContactDetails()
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loaderService.hide();
        }),
      )
      .subscribe({
        next: (contactInformation) => {
          this.contactInformation.set(
            contactInformation,
          );
        },

        error: (error: unknown) => {
          console.error(
            '[Contact GET Error]',
            error,
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to load Contact information.',
            ),
          );
        },
      });
  }

  /*
    ============================================================
    UPDATE
    ------------------------------------------------------------
    Bottom details → top fields auto-fill + editable
    ============================================================
  */
  private startEdit(): void {
    const details = this.contactInformation();

    if (!details) {
      this.errorMessage.set(
        'Contact details are not available yet.',
      );

      return;
    }

    if (this.loading()) {
      return;
    }

    this.errorMessage.set('');
    this.submitted.set(false);

    this.contactForm.patchValue(
      {
        callCenterHotlineNumber:
          details.callCenterHotlineNumber,

        emailAddress:
          details.emailAddress,
      },
      {
        emitEvent: false,
      },
    );

    this.contactForm.enable({
      emitEvent: false,
    });

    this.isEditMode.set(true);

    this.configureEditModeButtons();
  }

  /*
    ============================================================
    SAVE
    ============================================================
  */
  private saveContactDetails(): void {
    if (!this.isEditMode()) {
      return;
    }

    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();

      this.errorMessage.set(
        'Please complete all required fields before saving.',
      );

      return;
    }

    const payload = this.createUpdatePayload();

    this.loading.set(true);
    this.loaderService.show();

    /*
      Edit API success হলে আবার GET API call হবে।
      এতে নিচের Contact Details latest backend data দেখাবে।
    */
    this.contactApi
      .updateContactDetails(payload)
      .pipe(
        switchMap(() =>
          this.contactApi.getContactDetails(),
        ),

        finalize(() => {
          this.loading.set(false);
          this.loaderService.hide();
        }),
      )
      .subscribe({
        next: (updatedDetails) => {
          this.contactInformation.set(
            updatedDetails,
          );

          /*
            Successful save-এর পর:
            - top form clear
            - form disabled
            - navbar আবার Update mode
          */
          this.resetEditForm();
        },

        error: (error: unknown) => {
          console.error(
            '[Contact Save Error]',
            error,
          );

          /*
            Example:
            "Only Head office users are allowed for this feature."

            Save fail হলে form editable থাকবে,
            তাই user input হারাবে না।
          */
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to update Contact information.',
            ),
          );
        },
      });
  }

  /*
    ============================================================
    RESET
    ============================================================
  */
  private resetEditForm(): void {
    this.submitted.set(false);
    this.isEditMode.set(false);

    this.contactForm.reset(
      {
        callCenterHotlineNumber: '',
        emailAddress: '',
      },
      {
        emitEvent: false,
      },
    );

    this.contactForm.disable({
      emitEvent: false,
    });

    this.configureViewModeButtons();
  }

  /*
    ============================================================
    PAYLOAD MAPPING
    ============================================================
  */
  private createUpdatePayload(): ContactUpdateRequest {
    const formValue =
      this.contactForm.getRawValue();

    return {
      /*
        Backend field names GET Result-এর মতো রাখা হলো।
      */
      callCenterHotLine:
        formValue.callCenterHotlineNumber.trim(),

      contactEmailAddress:
        formValue.emailAddress.trim(),
    };
  }

  /*
    ============================================================
    EXIT
    ============================================================
  */
  private exitToHome(): void {
    this.router.navigateByUrl(
      MANAGEMENT_CONSOLE_ABSOLUTE_ROUTES.home,
    );
  }

  /*
    ============================================================
    ERROR MESSAGE HELPER
    ============================================================
  */
  private getErrorMessage(
    error: unknown,
    fallbackMessage: string,
  ): string {
    if (
      error &&
      typeof error === 'object' &&
      'error' in error
    ) {
      const httpError = error as {
        error?: {
          Message?: unknown;
          message?: unknown;
        };
      };

      const apiMessage =
        httpError.error?.Message ??
        httpError.error?.message;

      if (
        typeof apiMessage === 'string' &&
        apiMessage.trim()
      ) {
        return apiMessage.trim();
      }
    }

    if (
      error instanceof Error &&
      error.message.trim()
    ) {
      return error.message.trim();
    }

    return fallbackMessage;
  }
}