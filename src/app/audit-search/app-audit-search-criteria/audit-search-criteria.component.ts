import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventStatus, EventType } from '../models/audit-record.model';

@Component({
  selector: 'app-audit-search-criteria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './audit-search-criteria.component.html'
})
export class AuditSearchCriteriaComponent {
  @Input() searchForm!: FormGroup;
  @Input() eventTypes!: EventType[];
  @Input() eventStatuses!: EventStatus[];
  @Input() loading = false;

  @Output() searchRequested = new EventEmitter<void>();
  @Output() resetRequested = new EventEmitter<void>();
}
