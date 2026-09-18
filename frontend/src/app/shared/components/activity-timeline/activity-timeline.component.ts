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
  styleUrls: ['./activity-timeline.component.css']
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
        this.activities = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load activity logs';
        this.loading = false;
      }
    });
  }

  getIconForAction(action: string): string {
    switch(action) {
      case 'CREATED': return 'pi pi-plus-circle text-green-500';
      case 'ASSIGNED': return 'pi pi-user-plus text-blue-500';
      case 'STATUS_CHANGED': return 'pi pi-sync text-orange-500';
      case 'PRIORITY_CHANGED': return 'pi pi-exclamation-triangle text-red-500';
      case 'COMMENTED': return 'pi pi-comment text-purple-500';
      case 'RESOLVED': return 'pi pi-check-circle text-green-600';
      case 'CLOSED': return 'pi pi-lock text-gray-500';
      case 'REOPENED': return 'pi pi-refresh text-yellow-500';
      default: return 'pi pi-info-circle text-gray-400';
    }
  }
}
