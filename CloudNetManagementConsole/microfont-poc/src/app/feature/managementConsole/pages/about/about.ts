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
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import {
  BUTTON_VISIBILITY,
  ONCLICK_EXIT,
  ONCLICK_VIEW,
} from '../../../../shared/constant/button-signals.constant';
import { LoaderService } from '../../../../shared/services/loader.service';

import { MANAGEMENT_CONSOLE_ABSOLUTE_ROUTES } from '../../coreConsole/constant/management-console-route-constants';
import { AboutInformation } from '../../coreConsole/model/about-information.types';
import { ManagementConsoleAboutApi } from '../../coreConsole/service/management-console-about-api';

/*
  About page:
  - Page open হলে GET API call হবে
  - Navbar View click হলে API আবার call হবে
  - Navbar Exit click হলে Console home-এ যাবে
  - Fields read-only থাকবে
*/
@Component({
  selector: 'management-console-about',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    InputTextBox,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly aboutApi = inject(
    ManagementConsoleAboutApi,
  );
  private readonly loaderService = inject(LoaderService);

  /*
    ============================================================
    PAGE STATE
    ============================================================
  */
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly aboutInformation =
    signal<AboutInformation | null>(null);

  /*
    ============================================================
    READ-ONLY FORM
    ------------------------------------------------------------
    Shared InputTextBox directly use হবে।
    Wrapper use করা হচ্ছে না।
    ============================================================
  */
  readonly aboutForm =
    this.formBuilder.nonNullable.group({
      internationalNumber: [''],
      localNumber: [''],
      mailAddress: [''],
      officeAddress: [''],
    });

  constructor() {
    /*
      Navbar button action listener.

      View button:
      ONCLICK_VIEW = true
      → About API reload

      Exit button:
      ONCLICK_EXIT = true
      → Console home route
    */
    effect(() => {
      if (ONCLICK_VIEW()) {
        ONCLICK_VIEW.set(false);
        this.loadAboutDetails();
      }

      if (ONCLICK_EXIT()) {
        ONCLICK_EXIT.set(false);
        this.exitToHome();
      }
    });
  }

  ngOnInit(): void {
    this.configureNavbarButtons();
    this.clearAboutNavbarSignals();

    /*
      Page open হওয়ার সঙ্গে সঙ্গেই API call।
    */
    this.loadAboutDetails();
  }

  ngOnDestroy(): void {
    /*
      About page থেকে অন্য page-এ গেলে
      About-specific navbar button যেন থেকে না যায়।
    */
    this.clearAboutNavbarSignals();

    BUTTON_VISIBILITY.set({
      save: false,
      saveNext: false,
      update: false,
      updateNext: false,
      view: false,
      delete: false,
      exit: false,
      reset: false,
      customAction: false,
    });
  }

  /*
    ============================================================
    NAVBAR BUTTON CONFIGURATION
    ============================================================
  */
  private configureNavbarButtons(): void {
    BUTTON_VISIBILITY.set({
      save: false,
      saveNext: false,
      update: false,
      updateNext: false,

      /*
        View = Reload About API data
      */
      view: true,

      /*
        কোনো delete/update endpoint দেওয়া হয়নি।
      */
      delete: false,

      /*
        Exit = Management Console Home
      */
      exit: true,

      /*
        Read-only page, reset প্রয়োজন নেই।
      */
      reset: false,

      customAction: false,
    });
  }

  private clearAboutNavbarSignals(): void {
    ONCLICK_VIEW.set(false);
    ONCLICK_EXIT.set(false);
  }

  /*
    ============================================================
    LOAD ABOUT DETAILS
    ============================================================
  */
  loadAboutDetails(): void {
    /*
      API request চলার সময় বারবার View click হলেও
      duplicate API call হবে না।
    */
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    /*
      Existing Microfont POC shared global loader।
    */
    this.loaderService.show();

    this.aboutApi
      .getAboutDetails()
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loaderService.hide();
        }),
      )
      .subscribe({
        next: (aboutInformation) => {
          this.aboutInformation.set(
            aboutInformation,
          );

          this.aboutForm.patchValue(
            {
              internationalNumber:
                aboutInformation.internationalNumber,

              localNumber:
                aboutInformation.localNumber,

              mailAddress:
                aboutInformation.mailAddress,

              officeAddress:
                aboutInformation.officeAddress,
            },
            {
              emitEvent: false,
            },
          );
        },

        error: (error: unknown) => {
          console.error(
            '[Management Console About Load Error]',
            error,
          );

          this.errorMessage.set(
            this.getErrorMessage(error),
          );
        },
      });
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

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Unable to load About information.';
  }
}