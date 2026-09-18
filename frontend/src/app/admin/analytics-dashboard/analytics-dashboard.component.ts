import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import {
  AnalyticsSummary,
  CategoryCount,
  StatusCount,
  PriorityCount,
  DepartmentCount,
  LocationCount,
} from '../../core/models/person3.model';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css'],
})
export class AnalyticsDashboardComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;

  summary: AnalyticsSummary = {
    total_requests: 0,
    pending_requests: 0,
    assigned_requests: 0,
    in_progress_requests: 0,
    resolved_requests: 0,
    closed_requests: 0,
    high_critical_requests: 0,
  };

  categoryChartData: any;
  categoryChartOptions: any;

  statusChartData: any;
  statusChartOptions: any;

  priorityChartData: any;
  priorityChartOptions: any;

  departmentChartData: any;
  departmentChartOptions: any;

  locationChartData: any;
  locationChartOptions: any;

  topLocations: LocationCount[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      summary: this.analyticsService.getSummary(),
      categories: this.analyticsService.getByCategory(),
      statuses: this.analyticsService.getByStatus(),
      priorities: this.analyticsService.getByPriority(),
      departments: this.analyticsService.getByDepartment(),
      locations: this.analyticsService.getByLocation(),
    }).subscribe({
      next: (res) => {
        this.summary = res.summary.data || this.summary;
        this.setupCategoryChart(res.categories.data || []);
        this.setupStatusChart(res.statuses.data || []);
        this.setupPriorityChart(res.priorities.data || []);
        this.setupDepartmentChart(res.departments.data || []);
        this.setupLocationChart(res.locations.data || []);
        this.topLocations = res.locations.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load university analytics data. Please ensure the backend is running.';
        this.loading = false;
      },
    });
  }

  setupCategoryChart(data: CategoryCount[]): void {
    const palette = ['#2563eb', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#64748b'];
    this.categoryChartData = {
      labels: data.map((d) => d.category || 'General'),
      datasets: [
        {
          data: data.map((d) => parseInt(String(d.count), 10)),
          backgroundColor: palette.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }

  setupStatusChart(data: StatusCount[]): void {
    const statusColors: Record<string, string> = {
      Pending: '#f59e0b',
      Assigned: '#0284c7',
      'In Progress': '#6366f1',
      Resolved: '#10b981',
      Closed: '#64748b',
    };

    this.statusChartData = {
      labels: data.map((d) => d.status),
      datasets: [
        {
          label: 'Requests by Status',
          data: data.map((d) => parseInt(String(d.count), 10)),
          backgroundColor: data.map((d) => statusColors[d.status] || '#3b82f6'),
          borderRadius: 8,
        },
      ],
    };
  }

  setupPriorityChart(data: PriorityCount[]): void {
    const priorityColors: Record<string, string> = {
      Low: '#10b981',
      Medium: '#3b82f6',
      High: '#f97316',
      Urgent: '#ef4444',
      Critical: '#dc2626',
    };

    this.priorityChartData = {
      labels: data.map((d) => d.priority),
      datasets: [
        {
          data: data.map((d) => parseInt(String(d.count), 10)),
          backgroundColor: data.map((d) => priorityColors[d.priority] || '#64748b'),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }

  setupDepartmentChart(data: DepartmentCount[]): void {
    this.departmentChartData = {
      labels: data.map((d) => {
        const dept = d.department || 'Unspecified';
        // Shorten long faculty names if needed for clean chart display
        return dept
          .replace('Faculty of Computing & Software Engineering', 'FCSE')
          .replace('Faculty of Engineering & Technology', 'FET')
          .replace('Faculty of Business & Management', 'FBM')
          .replace('Faculty of Design & Digital Media', 'FDDM')
          .replace('Student Affairs & Support Services', 'SASS');
      }),
      datasets: [
        {
          label: 'Requests by Division',
          data: data.map((d) => parseInt(String(d.count), 10)),
          backgroundColor: ['#3b82f6', '#14b8a6', '#f59e0b', '#a855f7', '#ec4899'],
          borderRadius: 6,
        },
      ],
    };
  }

  setupLocationChart(data: LocationCount[]): void {
    const top5 = data.slice(0, 6);
    this.locationChartData = {
      labels: top5.map((d) => d.location || 'Campus'),
      datasets: [
        {
          label: 'Requests by Building / Facility',
          data: top5.map((d) => parseInt(String(d.count), 10)),
          backgroundColor: '#0284c7',
          borderRadius: 6,
        },
      ],
    };
  }

  initChartOptions(): void {
    this.categoryChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 11 } },
        },
      },
    };

    this.statusChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
        },
        x: {
          grid: { display: false },
        },
      },
    };

    this.priorityChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 11 } },
        },
      },
    };

    this.departmentChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
        },
        y: {
          grid: { display: false },
        },
      },
    };

    this.locationChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
        },
        x: {
          grid: { display: false },
        },
      },
    };
  }
}
