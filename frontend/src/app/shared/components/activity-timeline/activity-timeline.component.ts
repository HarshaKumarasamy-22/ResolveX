import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivityLog } from '../../../core/models/person3.model';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule, TimelineModule, CardModule],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.css'],
})
export class ActivityTimelineComponent implements OnInit, OnChanges {
  @Input() requestId!: number;

  activities: ActivityLog[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    if (this.requestId) {
      this.loadActivity();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['requestId'] && !changes['requestId'].firstChange) {
      this.loadActivity();
    }
  }

  loadActivity(): void {
    this.loading = true;
    this.error = null;
    this.activityService.getActivityLogs(this.requestId).subscribe({
      next: (res) => {
        this.activities = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load activity history for this request.';
        this.loading = false;
      },
    });
  }

  getIconForAction(action: string): string {
    const act = (action || '').toUpperCase();
    switch (act) {
      case 'CREATED':
        return 'pi pi-plus-circle';
      case 'ASSIGNED':
        return 'pi pi-user-plus';
      case 'STATUS_CHANGED':
        return 'pi pi-sync';
      case 'PRIORITY_CHANGED':
        return 'pi pi-exclamation-triangle';
      case 'COMMENTED':
        return 'pi pi-comment';
      case 'RESOLVED':
        return 'pi pi-check-circle';
      case 'CLOSED':
        return 'pi pi-lock';
      case 'REOPENED':
        return 'pi pi-refresh';
      default:
        return 'pi pi-info-circle';
    }
  }

  getMarkerBgClass(action: string): string {
    const act = (action || '').toUpperCase();
    switch (act) {
      case 'CREATED':
        return 'bg-emerald-100 text-emerald-600 border-emerald-300';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-600 border-blue-300';
      case 'STATUS_CHANGED':
        return 'bg-indigo-100 text-indigo-600 border-indigo-300';
      case 'PRIORITY_CHANGED':
        return 'bg-rose-100 text-rose-600 border-rose-300';
      case 'COMMENTED':
        return 'bg-purple-100 text-purple-600 border-purple-300';
      case 'RESOLVED':
        return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'CLOSED':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'REOPENED':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-300';
    }
  }

  getActionTitle(action: string): string {
    const act = (action || '').toUpperCase();
    switch (act) {
      case 'CREATED':
        return 'Request Created';
      case 'ASSIGNED':
        return 'Support Staff Assigned';
      case 'STATUS_CHANGED':
        return 'Status Updated';
      case 'PRIORITY_CHANGED':
        return 'Priority Adjusted';
      case 'COMMENTED':
        return 'Comment Added';
      case 'RESOLVED':
        return 'Request Resolved';
      case 'CLOSED':
        return 'Request Closed';
      case 'REOPENED':
        return 'Request Reopened';
      default:
        return action;
    }
  }
}
