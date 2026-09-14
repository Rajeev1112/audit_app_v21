import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AuditApiService } from './services/audit-api.service';
import { AuditSearchCriteriaComponent } from './app-audit-search-criteria/audit-search-criteria.component';
import { AuditSearchResultsComponent } from './app-audit-search-results/audit-search-results.component';
import {
  AuditRecord,
  AuditSearchCriteria,
  EventStatus,
  EventType
} from './models/audit-record.model';

type SortKey = 'eventDate' | 'eventTime' | 'userName' | 'eventType' | 'eventStatus' | 'applicationName' | 'businessFunction';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-audit-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuditSearchCriteriaComponent, AuditSearchResultsComponent],
  templateUrl: './app-audit-search.component.html',
  styleUrls: ['./app-audit-search.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppAuditSearchComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly eventTypes: EventType[] = ['Read', 'Print', 'Retrieve'];
  readonly eventStatuses: EventStatus[] = ['Success', 'Failed'];
  readonly Math = Math;
  readonly emptySet = new Set<string>();

  // State Management using BehaviorSubject instead of signals
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly searchedSubject = new BehaviorSubject<boolean>(false);
  private readonly recordsSubject = new BehaviorSubject<AuditRecord[]>([]);
  private readonly selectedRecordSubject = new BehaviorSubject<AuditRecord | null>(null);
  private readonly selectedIdsSubject = new BehaviorSubject<Set<string>>(new Set());
  private readonly sortKeySubject = new BehaviorSubject<SortKey>('eventDate');
  private readonly sortDirectionSubject = new BehaviorSubject<SortDirection>('desc');
  private readonly expandedSectionsSubject = new BehaviorSubject<Set<number>>(new Set([1, 2]));
  private readonly currentPageSubject = new BehaviorSubject<number>(1);
  private readonly pageSizeSubject = new BehaviorSubject<number>(5);

  // Observables for template
  loading$ = this.loadingSubject.asObservable();
  searched$ = this.searchedSubject.asObservable();
  records$ = this.recordsSubject.asObservable();
  selectedRecord$ = this.selectedRecordSubject.asObservable();
  selectedIds$ = this.selectedIdsSubject.asObservable();
  sortKey$ = this.sortKeySubject.asObservable();
  sortDirection$ = this.sortDirectionSubject.asObservable();
  expandedSections$ = this.expandedSectionsSubject.asObservable();
  currentPage$ = this.currentPageSubject.asObservable();
  pageSize$ = this.pageSizeSubject.asObservable();

  readonly pageSizeOptions = [5, 20, 50];

  // Derived observables (replacing computed)
  sortedRecords$: Observable<AuditRecord[]>;
  pageCount$: Observable<number>;
  pagedRecords$: Observable<AuditRecord[]>;
  allVisibleSelected$: Observable<boolean>;

  searchForm = this.fb.group({
    startDate: [this.toInputDate(this.addDays(new Date(), -1)), Validators.required],
    endDate: [this.toInputDate(new Date()), Validators.required],
    applicationName: this.fb.control(
      { value: 'LDSS Unemployment Services Inquiry', disabled: true },
      Validators.required
    ),
    firstName: [''],
    lastName: [''],
    eventType: this.fb.control<EventType | ''>('', { nonNullable: true }),
    eventStatus: this.fb.control<EventStatus | ''>('', { nonNullable: true })
  });

  constructor(
    private fb: FormBuilder,
    private auditApi: AuditApiService
  ) {
    // Initialize derived observables using combineLatest for proper reactivity
    this.sortedRecords$ = combineLatest([
      this.recordsSubject,
      this.sortKeySubject,
      this.sortDirectionSubject
    ]).pipe(
      map(([records, key, direction]) => {
        const dir = direction === 'asc' ? 1 : -1;
        return [...records].sort((a, b) => {
          const av = key === 'eventDate' ? `${a.eventDate} ${a.eventTime}` : String(a[key]);
          const bv = key === 'eventDate' ? `${b.eventDate} ${b.eventTime}` : String(b[key]);
          return av.localeCompare(bv) * dir;
        });
      })
    );

    this.pageCount$ = combineLatest([
      this.sortedRecords$,
      this.pageSizeSubject
    ]).pipe(
      map(([records, pageSize]) => Math.max(1, Math.ceil(records.length / pageSize)))
    );

    this.pagedRecords$ = combineLatest([
      this.sortedRecords$,
      this.currentPageSubject,
      this.pageSizeSubject
    ]).pipe(
      map(([records, currentPage, pageSize]) => {
        const start = (currentPage - 1) * pageSize;
        return records.slice(start, start + pageSize);
      })
    );

    this.allVisibleSelected$ = combineLatest([
      this.pagedRecords$,
      this.selectedIdsSubject
    ]).pipe(
      map(([pagedRecords, selectedIds]) => {
        return pagedRecords.length > 0 &&
          pagedRecords.every(record => selectedIds.has(record.id));
      })
    );
  }

  ngOnInit(): void {
    this.search();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const value = this.searchForm.getRawValue();
    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      this.searchForm.controls.endDate.setErrors({ range: true });
      return;
    }

    const criteria: AuditSearchCriteria = {
      startDate: value.startDate ?? '',
      endDate: value.endDate ?? '',
      applicationName: value.applicationName ?? '',
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      eventType: value.eventType ?? '',
      eventStatus: value.eventStatus ?? ''
    };

    this.loadingSubject.next(true);
    this.auditApi.search(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: records => {
          this.recordsSubject.next(records);
          this.currentPageSubject.next(1);
          this.selectedIdsSubject.next(new Set());
          this.searchedSubject.next(true);
          this.loadingSubject.next(false);
        },
        error: () => this.loadingSubject.next(false)
      });
  }

  reset(): void {
    this.searchForm.reset({
      startDate: this.toInputDate(this.addDays(new Date(), -1)),
      endDate: this.toInputDate(new Date()),
      applicationName: 'LDSS Unemployment Services Inquiry',
      firstName: '',
      lastName: '',
      eventType: '',
      eventStatus: ''
    });
    this.pageSizeSubject.next(5);
    this.currentPageSubject.next(1);
    this.search();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSizeSubject.next(newSize);
    this.currentPageSubject.next(1);
  }

  sortBy(key: SortKey): void {
    if (this.sortKeySubject.value === key) {
      const newDirection = this.sortDirectionSubject.value === 'asc' ? 'desc' : 'asc';
      this.sortDirectionSubject.next(newDirection);
    } else {
      this.sortKeySubject.next(key);
      this.sortDirectionSubject.next(key === 'eventDate' ? 'desc' : 'asc');
    }
  }

  sortIcon(key: SortKey): string {
    if (this.sortKeySubject.value !== key) return '↕';
    return this.sortDirectionSubject.value === 'asc' ? '↑' : '↓';
  }

  toggleRecord(id: string): void {
    const next = new Set(this.selectedIdsSubject.value);
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIdsSubject.next(next);
  }

  toggleVisibleRecords(): void {
    // This needs to access pagedRecords, which is now an Observable
    // So we'll need to handle this differently
    this.pagedRecords$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagedRecords => {
      const next = new Set(this.selectedIdsSubject.value);
      if (this.allVisibleSelectedValue(pagedRecords)) {
        pagedRecords.forEach(record => next.delete(record.id));
      } else {
        pagedRecords.forEach(record => next.add(record.id));
      }
      this.selectedIdsSubject.next(next);
    });
  }

  viewRecord(record: AuditRecord): void {
    this.selectedRecordSubject.next(record);
    this.expandedSectionsSubject.next(new Set([1, 2]));
  }

  closeDetails(): void {
    this.selectedRecordSubject.next(null);
  }

  toggleSection(section: number): void {
    const next = new Set(this.expandedSectionsSubject.value);
    next.has(section) ? next.delete(section) : next.add(section);
    this.expandedSectionsSubject.next(next);
  }

  isSectionExpanded(section: number): boolean {
    return this.expandedSectionsSubject.value.has(section);
  }

  goToPage(page: number): void {
    this.pageCount$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pageCount => {
      if (page >= 1 && page <= pageCount) {
        this.currentPageSubject.next(page);
      }
    });
  }

  pages(): Observable<number[]> {
    return this.pageCount$.pipe(
      map(pageCount => Array.from({ length: pageCount }, (_, index) => index + 1))
    );
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`;
  }

  statusClass(status: EventStatus): string {
    return status === 'Success' ? 'status-success' : 'status-failed';
  }

  // Helper method for allVisibleSelected check
  private allVisibleSelectedValue(pagedRecords: AuditRecord[]): boolean {
    const selectedIds = this.selectedIdsSubject.value;
    return pagedRecords.length > 0 &&
      pagedRecords.every(record => selectedIds.has(record.id));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
