import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import {
  Observable,
  catchError,
  finalize,
  forkJoin,
  of,
} from 'rxjs';

import { CommonBarChart } from '../../../../shared/common-components/charts/common-bar-chart/common-bar-chart';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';

import { GenericButton } from '../../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid/generic-data-grid';
import { GenericModal } from '../../../../shared/common-components/generic-component-type/generic-modal/generic-modal';
import { GenericSwitch } from '../../../../shared/common-components/generic-component-type/generic-switch/generic-switch';

import { InputDate } from '../../../../shared/common-components/input-types/input-date/input-date';

import {
  ButtonUtils,
  FormGroupSignal,
  ONCLICK_RESET,
} from '../../../../shared/constant/button-signals.constant';

import { LoaderService } from '../../../../shared/services/loader.service';

import { DashboardChartPoint } from '../../coreConsole/model/dashboard-chart-point.types';
import { DashboardDetailRow } from '../../coreConsole/model/dashboard-detail-row.types';
import { DashboardKpi } from '../../coreConsole/model/dashboard-kpi.types';
import { DashboardMetricCard } from '../../coreConsole/model/dashboard-metric-card.types';
import { DashboardSummaryApiResult } from '../../coreConsole/model/dashboard-summary-api-result.types';
import { DashboardSummary } from '../../coreConsole/model/dashboard-summary.types';

import { ManagementConsoleDashboardApi } from '../../coreConsole/service/management-console-dashboard-api';

/*
  ============================================================
  Dashboard Page
  ============================================================

  Initial API call flow:
  1. GetDashboardSummary
  2. KPI 5
  3. KPI 6
  4. KPI 8
  5. KPI 9
  6. KPI 10
  7. KPI 11
  8. KPI 12
  9. KPI 16

  Current Date:
  - Page open → today
  - Search → selected date
  - Navbar Reset → today again
*/
@Component({
  selector: 'management-console-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,

    InputDate,
    GenericButton,
    GenericSwitch,
    GenericDataGrid,
    GenericModal,
    CommonBarChart,
    ExpansionPanelHeader,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);

  private readonly dashboardApi = inject(
    ManagementConsoleDashboardApi,
  );

  private readonly loaderService = inject(
    LoaderService,
  );

  /*
    ============================================================
    INITIAL DASHBOARD KPI LIST
    ------------------------------------------------------------
    Exactly these 8 details APIs + 1 Summary API = 9 calls.
    ============================================================
  */
  private readonly initialDashboardKpis: readonly DashboardKpi[] = [
    5,
    6,
    8,
    9,
    10,
    11,
    12,
    16,
  ];

  /*
    ============================================================
    PAGE FORMS
    ============================================================
  */
  readonly filterForm = this.formBuilder.group({
    /*
      Page open হওয়ার সময় browser-এর current local date।
    */
    pDATE: [new Date()],
  });

  readonly todayTransactionForm = this.formBuilder.group({
    isSuccessful: [true],
  });

  /*
    ============================================================
    PAGE STATE
    ============================================================
  */
  readonly loading = signal(false);

  readonly todayTransactionLoading = signal(false);

  readonly modalLoading = signal(false);

  readonly errorMessage = signal('');

  /*
    ============================================================
    EXPANSION PANEL STATE
    ============================================================
  */
  readonly mobileTopupPanelOpen = signal(true);

  readonly mfsSendMoneyPanelOpen = signal(true);

  readonly billsPayPanelOpen = signal(true);

  readonly todayTransactionPanelOpen = signal(true);

  readonly lastThirtyDaysPanelOpen = signal(true);

  readonly topUserPanelOpen = signal(true);

  readonly largeDevicePanelOpen = signal(true);

  readonly changedPasswordPanelOpen = signal(true);

  readonly metricModalPanelOpen = signal(true);

  /*
    ============================================================
    DASHBOARD SUMMARY
    ============================================================
  */
  readonly summary = signal<DashboardSummary>({
    registeredTillToday: 0,
    registeredToday: 0,
    signedInToday: 0,
    activeUsers: 0,
    lockedUsers: 0,
    fdrDpsToday: 0,
    requestReceivedToday: 0,
  });

  /*
    Initial KPI response cache।

    KPI 5, 8, 9, 10, 16 এখন backend call হবে,
    কিন্তু exact visual section mapping তুমি দাওনি।
    তাই future use-এর জন্য cache রাখা হচ্ছে।
  */
  readonly initialDetailCache = signal<
    Partial<Record<DashboardKpi, DashboardDetailRow[]>>
  >({});

  /*
    ============================================================
    METRIC CARD DATA
    ============================================================
  */
  readonly metricCards = computed<DashboardMetricCard[]>(() => {
    const summary = this.summary();

    return [
      {
        key: 'registeredTillToday',
        label: 'Registered Till Today',
        value: summary.registeredTillToday,
      },

      {
        key: 'registeredToday',
        label: 'Registered Today',
        value: summary.registeredToday,

        /*
          Registered Today card click:
          KPI 2.1
        */
        detailKpi: 2.1,
        modalTitle: 'Registered Today',
      },

      {
        key: 'signedInToday',
        label: 'Signed-in Today',
        value: summary.signedInToday,
      },

      {
        key: 'activeUsers',
        label: 'Active Users',
        value: summary.activeUsers,
      },

      {
        key: 'lockedUsers',
        label: 'Locked Users',
        value: summary.lockedUsers,

        /*
          Locked User card click:
          KPI 7.1
        */
        detailKpi: 7.1,
        modalTitle: 'Locked User',
      },

      {
        key: 'fdrDpsToday',
        label: 'FDR/DPS Today',
        value: summary.fdrDpsToday,

        /*
          FDR/DPS card click:
          KPI 14.1
        */
        detailKpi: 14.1,
        modalTitle: 'FDR/DPS Today',
      },

      {
        key: 'requestReceivedToday',
        label: 'Req. Received Today',
        value: summary.requestReceivedToday,
      },
    ];
  });

  /*
    ============================================================
    TODAY'S TRANSACTION
    ============================================================
  */
  readonly todayTransactionStatus = signal<
    'Successful' | 'Failed'
  >('Successful');

  readonly todayTransactionRows = signal<
    DashboardDetailRow[]
  >([]);

  readonly todayTransactionColumns = signal<string[]>(
    [],
  );

  readonly todayTransactionColumnNames = signal<
    Record<string, string>
  >({});

  /*
    ============================================================
    LAST 30 DAYS CHART
    ============================================================
  */
  readonly chartRows = signal<DashboardChartPoint[]>([]);

  readonly chartData = computed(() => {
    const rows = this.chartRows();

    return {
      monthly: {
        categories: rows.map((row) => row.label),

        series: [
          {
            name: 'Total Transaction',
            data: rows.map(
              (row) => row.transactionCount,
            ),
          },

          {
            name: 'Total Amount',
            data: rows.map(
              (row) => row.transactionAmount,
            ),
          },
        ],
      },
    };
  });

  /*
    ============================================================
    LARGE DEVICE GRID
    ============================================================
  */
  readonly largeDeviceRows = signal<
    DashboardDetailRow[]
  >([]);

  readonly largeDeviceColumns = [
    'userId',
    'totalDevice',
  ];

  readonly largeDeviceColumnNames: Record<string, string> =
    {
      userId: 'User ID',
      totalDevice: 'Total Device',
    };

  /*
    ============================================================
    TOP USER / CHANGED PASSWORD
    ------------------------------------------------------------
    API/KPI mapping এখনো দেওয়া হয়নি।
    তাই screenshot-এর মতো empty generic data-grid থাকবে।
    ============================================================
  */
  readonly topUserRows = signal<DashboardDetailRow[]>([]);

  readonly topUserColumns = [
    'userId',
    'totalTransaction',
    'totalAmount',
  ];

  readonly topUserColumnNames: Record<string, string> =
    {
      userId: 'User ID',
      totalTransaction: 'Total Transaction',
      totalAmount: 'Total Amount',
    };

  readonly changedPasswordRows = signal<
    DashboardDetailRow[]
  >([]);

  readonly changedPasswordColumns = [
    'userId',
    'totalPasswordChanged',
  ];

  readonly changedPasswordColumnNames: Record<
    string,
    string
  > = {
    userId: 'User ID',
    totalPasswordChanged: 'Total Password Changed',
  };

  /*
    ============================================================
    METRIC DETAIL MODAL
    ============================================================
  */
  readonly detailModalVisible = signal(false);

  readonly detailModalTitle = signal('');

  readonly detailModalRows = signal<
    DashboardDetailRow[]
  >([]);

  readonly detailModalColumns = signal<string[]>(
    [],
  );

  readonly detailModalColumnNames = signal<
    Record<string, string>
  >({});

  constructor() {
    /*
      Navbar-এ শুধু Reset button থাকবে।
      Reset click করলে current date সেট হবে এবং 9 API reload হবে।
    */
    effect(() => {
      if (ONCLICK_RESET()) {
        ONCLICK_RESET.set(false);
        this.resetDashboard();
      }
    });
  }

  ngOnInit(): void {
    FormGroupSignal.set(this.filterForm);

    this.configureNavbarButtons();

    /*
      Initial page load:
      today date দিয়ে 9টি API call হবে।
    */
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    /*
      Dashboard page থেকে বের হলে page-specific navbar state clean হবে।
    */
    ButtonUtils.resetAll();
  }

  /*
    ============================================================
    NAVBAR BUTTON CONFIGURATION
    ============================================================
  */
  private configureNavbarButtons(): void {
    ButtonUtils.resetAllButtons();
    ButtonUtils.resetAllClickSignals();

    FormGroupSignal.set(this.filterForm);

    /*
      Dashboard page-এর জন্য শুধু Reset button visible।
    */
    ButtonUtils.setPageButtons({
      reset: true,
    });
  }

  /*
    ============================================================
    DASHBOARD INITIAL LOAD
    ============================================================
  */
  loadDashboard(): void {
    if (this.loading()) {
      return;
    }

    const selectedDate = this.getSelectedDate();

    this.loading.set(true);
    this.errorMessage.set('');

    /*
      Search/Reset হওয়ার পর Today Transaction আবার
      Successful state থেকে শুরু হবে।
    */
    this.todayTransactionForm.patchValue(
      {
        isSuccessful: true,
      },
      {
        emitEvent: false,
      },
    );

    this.todayTransactionStatus.set('Successful');

    this.loaderService.show();

    const apiErrors: string[] = [];

    /*
      ==========================================================
      Exactly 9 initial API calls
      ==========================================================
    */
    forkJoin({
      summary: this.getSafeDashboardSummary(
        selectedDate,
        apiErrors,
      ),

      kpi5: this.getSafeDashboardDetails(
        5,
        selectedDate,
        apiErrors,
      ),

      kpi6: this.getSafeDashboardDetails(
        6,
        selectedDate,
        apiErrors,
      ),

      kpi8: this.getSafeDashboardDetails(
        8,
        selectedDate,
        apiErrors,
      ),

      kpi9: this.getSafeDashboardDetails(
        9,
        selectedDate,
        apiErrors,
      ),

      kpi10: this.getSafeDashboardDetails(
        10,
        selectedDate,
        apiErrors,
      ),

      kpi11: this.getSafeDashboardDetails(
        11,
        selectedDate,
        apiErrors,
      ),

      kpi12: this.getSafeDashboardDetails(
        12,
        selectedDate,
        apiErrors,
      ),

      kpi16: this.getSafeDashboardDetails(
        16,
        selectedDate,
        apiErrors,
      ),
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loaderService.hide();
        }),
      )
      .subscribe({
        next: (result) => {
          this.summary.set(
            this.mapDashboardSummary(result.summary),
          );

          /*
            Initial response cache।
          */
          this.initialDetailCache.set({
            5: result.kpi5,
            6: result.kpi6,
            8: result.kpi8,
            9: result.kpi9,
            10: result.kpi10,
            11: result.kpi11,
            12: result.kpi12,
            16: result.kpi16,
          });

          /*
            KPI 6:
            Today's Successful Transaction
          */
          this.setTodayTransactionRows(result.kpi6);

          /*
            KPI 11:
            Last 30 Days Transaction chart
          */
          this.chartRows.set(
            this.mapRowsToChartPoints(result.kpi11),
          );

          /*
            KPI 12:
            Users with Large Number of Devices
          */
          this.largeDeviceRows.set(
            this.mapLargeDeviceRows(result.kpi12),
          );

          /*
            কোনো initial API fail হলেও page break হবে না।
            First API error top alert-এ দেখানো হবে।
          */
          if (apiErrors.length) {
            this.errorMessage.set(apiErrors[0]);
          }
        },

        error: (error: unknown) => {
          /*
            Normally এখানে আসবে না।
            কারণ প্রতিটি API safe catchError দিয়ে handle হচ্ছে।
          */
          console.error(
            '[Dashboard Initial Load Error]',
            error,
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to load Dashboard information.',
            ),
          );
        },
      });
  }

  /*
    ============================================================
    SEARCH
    ============================================================
  */
  searchByDate(): void {
    this.loadDashboard();
  }

  /*
    ============================================================
    NAVBAR RESET
    ============================================================
  */
  private resetDashboard(): void {
    /*
      Reset click হলে আজকের date বসবে।
    */
    this.filterForm.patchValue(
      {
        pDATE: new Date(),
      },
      {
        emitEvent: false,
      },
    );

    /*
      আজকের date দিয়ে আবার সব 9 API call হবে।
    */
    this.loadDashboard();
  }

  /*
    ============================================================
    TODAY TRANSACTION SWITCH
    ============================================================
  */
  onTodayTransactionStatusChanged(
    isSuccessful: boolean,
  ): void {
    if (this.todayTransactionLoading()) {
      return;
    }

    this.todayTransactionForm.patchValue(
      {
        isSuccessful,
      },
      {
        emitEvent: false,
      },
    );

    this.todayTransactionStatus.set(
      isSuccessful
        ? 'Successful'
        : 'Failed',
    );

    /*
      Successful → KPI 6
      Failed     → KPI 13
    */
    this.loadTodayTransactionDetails(
      isSuccessful,
    );
  }

  private loadTodayTransactionDetails(
    isSuccessful: boolean,
  ): void {
    const selectedDate = this.getSelectedDate();

    const targetKpi: DashboardKpi = isSuccessful
      ? 6
      : 13;

    this.todayTransactionLoading.set(true);
    this.errorMessage.set('');

    this.dashboardApi
      .getDashboardDetails(
        targetKpi,
        selectedDate,
        '',
      )
      .pipe(
        finalize(() => {
          this.todayTransactionLoading.set(false);
        }),
      )
      .subscribe({
        next: (rows) => {
          this.setTodayTransactionRows(rows);
        },

        error: (error: unknown) => {
          console.error(
            '[Today Transaction Load Error]',
            error,
          );

          this.setTodayTransactionRows([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to load Today’s Transaction.',
            ),
          );
        },
      });
  }

  /*
    ============================================================
    KPI CARD MODAL
    ============================================================
  */
  openMetricDetails(
    card: DashboardMetricCard,
  ): void {
    if (!card.detailKpi || this.modalLoading()) {
      return;
    }

    this.detailModalTitle.set(
      card.modalTitle || card.label,
    );

    this.detailModalRows.set([]);
    this.detailModalColumns.set([]);
    this.detailModalColumnNames.set({});

    this.metricModalPanelOpen.set(true);
    this.detailModalVisible.set(true);
    this.modalLoading.set(true);

    const selectedDate = this.getSelectedDate();

    this.dashboardApi
      .getDashboardDetails(
        card.detailKpi,
        selectedDate,
        '',
      )
      .pipe(
        finalize(() => {
          this.modalLoading.set(false);
        }),
      )
      .subscribe({
        next: (rows) => {
          this.setModalRows(rows);
        },

        error: (error: unknown) => {
          console.error(
            '[Dashboard Metric Modal Error]',
            error,
          );

          this.setModalRows([]);

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              `Unable to load ${card.label} details.`,
            ),
          );
        },
      });
  }

  closeMetricModal(): void {
    this.detailModalVisible.set(false);
  }

  /*
    ============================================================
    API SAFE LOADERS
    ============================================================
  */
  private getSafeDashboardSummary(
    selectedDate: string,
    apiErrors: string[],
  ): Observable<DashboardSummaryApiResult> {
    return this.dashboardApi
      .getDashboardSummary(selectedDate)
      .pipe(
        catchError((error: unknown) => {
          apiErrors.push(
            this.getErrorMessage(
              error,
              'Unable to load Dashboard summary.',
            ),
          );

          return of({});
        }),
      );
  }

  private getSafeDashboardDetails(
    kpi: DashboardKpi,
    selectedDate: string,
    apiErrors: string[],
  ): Observable<DashboardDetailRow[]> {
    return this.dashboardApi
      .getDashboardDetails(
        kpi,
        selectedDate,
        '',
      )
      .pipe(
        catchError((error: unknown) => {
          apiErrors.push(
            this.getErrorMessage(
              error,
              `Unable to load KPI ${kpi} details.`,
            ),
          );

          /*
            একটি KPI fail হলেও dashboard page crash করবে না।
          */
          return of([]);
        }),
      );
  }

  /*
    ============================================================
    SUMMARY MAPPING
    ============================================================
  */
  private mapDashboardSummary(
    response: DashboardSummaryApiResult,
  ): DashboardSummary {
    return {
      registeredTillToday: this.toNumber(
        response.totaL_USER_REG_TILLTODATE,
      ),

      registeredToday: this.toNumber(
        response.totaL_USER_REG_TODAY,
      ),

      signedInToday: this.toNumber(
        response.totaL_USER_SIGNED_TODAY,
      ),

      activeUsers: this.toNumber(
        response.totaL_USER_ACTIVE_TODAY,
      ),

      lockedUsers: this.toNumber(
        response.totaL_USER_LOCKED_TODAY,
      ),

      fdrDpsToday: this.toNumber(
        response.totaL_FDPS_OPENED_TODAY,
      ),

      requestReceivedToday: this.toNumber(
        response.totaL_REQS_RECEIVED_TODAY,
      ),
    };
  }

  /*
    ============================================================
    TODAY TRANSACTION GRID
    ============================================================
  */
  private setTodayTransactionRows(
    rows: DashboardDetailRow[],
  ): void {
    this.todayTransactionRows.set(rows);

    const schema = this.createGridSchema(rows);

    this.todayTransactionColumns.set(
      schema.columns,
    );

    this.todayTransactionColumnNames.set(
      schema.columnNames,
    );
  }

  /*
    ============================================================
    MODAL GRID
    ============================================================
  */
  private setModalRows(
    rows: DashboardDetailRow[],
  ): void {
    this.detailModalRows.set(rows);

    const schema = this.createGridSchema(rows);

    this.detailModalColumns.set(
      schema.columns,
    );

    this.detailModalColumnNames.set(
      schema.columnNames,
    );
  }

  /*
    ============================================================
    KPI 12 LARGE DEVICE MAPPING
    ============================================================
  */
  private mapLargeDeviceRows(
    rows: DashboardDetailRow[],
  ): DashboardDetailRow[] {
    return rows.map((row) => {
      return {
        userId: this.toText(
          row['useR_ID'] ??
            row['userId'] ??
            row['USER_ID'],
        ),

        totalDevice: this.toNumber(
          row['devicE_COUNT'] ??
            row['deviceCount'] ??
            row['totalDevice'],
        ),
      };
    });
  }

  /*
    ============================================================
    KPI 11 CHART MAPPING
    ============================================================
  */
  private mapRowsToChartPoints(
    rows: DashboardDetailRow[],
  ): DashboardChartPoint[] {
    return rows.map((row) => {
      return {
        label: this.formatChartDate(
          this.toText(
            row['tranS_DATE'] ??
              row['transactionDate'] ??
              row['date'],
          ),
        ),

        transactionCount: this.toNumber(
          row['tranS_COUNT'] ??
            row['transactionCount'] ??
            row['count'],
        ),

        transactionAmount: this.toNumber(
          row['tranS_AMOUNT'] ??
            row['transactionAmount'] ??
            row['amount'],
        ),
      };
    });
  }

  /*
    ============================================================
    DYNAMIC DATA GRID COLUMN GENERATOR
    ============================================================
  */
  private createGridSchema(
    rows: DashboardDetailRow[],
  ): {
    columns: string[];
    columnNames: Record<string, string>;
  } {
    if (!rows.length) {
      return {
        columns: [],
        columnNames: {},
      };
    }

    const allColumns = Array.from(
      new Set(
        rows.flatMap((row) => Object.keys(row)),
      ),
    )
      .filter((column) => {
        return rows.some((row) => {
          const value = row[column];

          return (
            value !== null &&
            value !== undefined &&
            value !== ''
          );
        });
      })
      .slice(0, 14);

    const columnNames = allColumns.reduce<
      Record<string, string>
    >((result, column) => {
      result[column] =
        this.getPreferredColumnName(column);

      return result;
    }, {});

    return {
      columns: allColumns,
      columnNames,
    };
  }

  private getPreferredColumnName(
    columnName: string,
  ): string {
    const knownNames: Record<string, string> = {
      tranS_DATE: 'Transaction Date',
      tranS_COUNT: 'Transaction Count',
      tranS_AMOUNT: 'Transaction Amount',

      useR_ID: 'User ID',
      devicE_COUNT: 'Total Device',

      userId: 'User ID',
      totalDevice: 'Total Device',
      totalTransaction: 'Total Transaction',
      totalAmount: 'Total Amount',
      totalPasswordChanged:
        'Total Password Changed',
    };

    return (
      knownNames[columnName] ||
      this.humanizeColumnName(columnName)
    );
  }

  private humanizeColumnName(
    columnName: string,
  ): string {
    return columnName
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (value) =>
        value.toUpperCase(),
      );
  }

  /*
    ============================================================
    DATE HANDLING
    ============================================================

    InputDate first Date object দিতে পারে।
    পরে component YYYY-MM-DD string রাখতেও পারে।
    দুই format-ই এখানে support করা হয়েছে।
  */
  private getSelectedDate(): string {
    const rawDate =
      this.filterForm.controls.pDATE.value as unknown;

    if (
      rawDate instanceof Date &&
      !Number.isNaN(rawDate.getTime())
    ) {
      return this.formatDateForApi(rawDate);
    }

    if (
      typeof rawDate === 'string' &&
      rawDate.trim()
    ) {
      const dateText = rawDate.trim();

      /*
        InputDate সাধারণত YYYY-MM-DD রাখে।
      */
      const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(
        dateText,
      );

      if (isoMatch) {
        const [, year, month, day] = isoMatch;

        return `${month}/${day}/${year}`;
      }

      /*
        User manually DD/MM/YYYY লিখলে।
      */
      const dmyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(
        dateText,
      );

      if (dmyMatch) {
        const [, day, month, year] = dmyMatch;

        return `${month}/${day}/${year}`;
      }

      const parsedDate = new Date(dateText);

      if (!Number.isNaN(parsedDate.getTime())) {
        return this.formatDateForApi(parsedDate);
      }
    }

    /*
      Invalid/blank date হলে current local date।
    */
    return this.formatDateForApi(new Date());
  }

  private formatDateForApi(date: Date): string {
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    const year = date.getFullYear();

    /*
      Backend required format:
      MM/DD/YYYY
    */
    return `${month}/${day}/${year}`;
  }

  private formatChartDate(
    value: string,
  ): string {
    if (!value) {
      return '-';
    }

    /*
      API example:
      2026-06-25T00:00:00
    */
    const dateOnly = value.slice(0, 10);

    const date = new Date(
      `${dateOnly}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  }

  /*
    ============================================================
    COMMON HELPERS
    ============================================================
  */
  formatMetricValue(value: number): string {
    return new Intl.NumberFormat('en-US').format(
      value,
    );
  }

  private toNumber(
    value: unknown,
  ): number {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : 0;
  }

  private toText(
    value: unknown,
  ): string {
    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    return String(value);
  }

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