import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputDate } from '../../../../shared/common-components/input-types/input-date/input-date';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { ReactiveFormsModule } from '@angular/forms';
export interface NewsEventType {
  id: number;
  title: string;
  url: string;
  date: Date;
}

@Component({
  selector: 'app-news-event',
  imports: [
    InputTextBox,
    InputDate,
    GenericDataGrid,
    ExpansionPanelHeader,
    ReactiveFormsModule 
  ],
  templateUrl: './news-event.html',
  styleUrl: './news-event.scss'
})
export class NewsEvent {


  constructor(private router: Router) { }

  // ✅ NEW (UI STATES - industry level)
  isNewsPanelOpen = signal(true);
  isNewsListOpen = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');

  // ✅ NEW computed helper (no logic removed)
  hasData = () => this.newsEventList && this.newsEventList.length > 0;

  currentId: number | null = null;

  newsEventForm = new FormGroup({
    title: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required),
    date: new FormControl<Date | null>(null, Validators.required)
  });

  newsEventList: NewsEventType[] = [
    {
      id: 1,
      title: 'News Event 1',
      url: 'https://example.com/news1',
      date: new Date('2024-01-01')
    },
    {
      id: 2,
      title: 'News Event 2',
      url: 'https://example.com/news2',
      date: new Date('2024-02-01')
    },
    {
      id: 3,
      title: 'News Event 3',
      url: 'https://example.com/news3',
      date: new Date('2024-03-01')
    }
  ];

  // ✅ EXISTING (UNCHANGED)
  onEdit(event: any) {

    const row = typeof event === 'string' ? JSON.parse(event) : event;

    console.log('Editing:', row);

    this.newsEventForm.patchValue({
      title: row.title,
      url: row.url,
      date: row.date ? new Date(row.date) : null
    });

    this.currentId = row.id;
  }

  // ✅ EXISTING (UNCHANGED) + small UX enhancement
  onDelete(event: string) {
    const row = JSON.parse(event);
    console.log('Deleting:', row);

    if (confirm('Are you sure you want to delete?')) {

      this.isLoading.set(true); // ✅ NEW UX

      this.newsEventList = this.newsEventList.filter(item => item.id !== row.id);

      this.isLoading.set(false); // ✅ NEW UX
    }
  }

  // ✅ EXISTING (UNCHANGED) + safe enhancements
  onSave() {

    if (this.newsEventForm.invalid) {
      alert('Form is invalid');
      return;
    }

    this.isLoading.set(true); // ✅ NEW UX

    const formValue = this.newsEventForm.value;

    const idToUse = this.currentId !== null
      ? this.currentId
      : Date.now();

    const data: NewsEventType = {
      id: idToUse,
      title: formValue.title!,
      url: formValue.url!,
      date: formValue.date!
    };

    if (this.currentId !== null) {

      // ✅ UPDATE
      this.newsEventList = this.newsEventList.map(item =>
        item.id === this.currentId ? data : item
      );

      console.log('✅ Updated:', data);

    } else {

      // ✅ ADD
      this.newsEventList = [...this.newsEventList, data];

      console.log('✅ Added:', data);
    }

    // ✅ NEW safety reset
    setTimeout(() => this.isLoading.set(false), 300);

    // ✅ EXISTING RESET
    this.newsEventForm.reset();
    this.currentId = null;
  }
}