import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AnalyticsSummary, CategoryCount, StatusCount, PriorityCount } from '../../core/models/person3.model';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  loading: boolean = true;
  error: string | null = null;

  summary!: AnalyticsSummary;
  
  categoryChartData: any;
  categoryChartOptions: any;

  statusChartData: any;
  statusChartOptions: any;

  priorityChartData: any;
  priorityChartOptions: any;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalytics();
    this.initChartOptions();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      summary: this.analyticsService.getSummary(),
      categories: this.analyticsService.getByCategory(),
      statuses: this.analyticsService.getByStatus(),
      priorities: this.analyticsService.getByPriority()
    }).subscribe({
      next: (res) => {
        this.summary = res.summary.data;
        this.setupCategoryChart(res.categories.data);
        this.setupStatusChart(res.statuses.data);
        this.setupPriorityChart(res.priorities.data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load analytics data';
        this.loading = false;
      }
    });
  }

  setupCategoryChart(data: CategoryCount[]): void {
    this.categoryChartData = {
      labels: data.map(d => d.category || 'Unknown'),
      datasets: [
        {
          data: data.map(d => parseInt(d.count, 10)),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#4DD0E1', '#9575CD']
        }
      ]
    };
  }

  setupStatusChart(data: StatusCount[]): void {
    this.statusChartData = {
      labels: data.map(d => d.status),
      datasets: [
        {
          label: 'Requests by Status',
          data: data.map(d => parseInt(d.count, 10)),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }
      ]
    };
  }

  setupPriorityChart(data: PriorityCount[]): void {
    this.priorityChartData = {
      labels: data.map(d => d.priority),
      datasets: [
        {
          data: data.map(d => parseInt(d.count, 10)),
          backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#10b981'],
          hoverBackgroundColor: ['#f87171', '#fb923c', '#60a5fa', '#34d399']
        }
      ]
    };
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.categoryChartOptions = {
      plugins: { legend: { labels: { color: textColor } } }
    };

    this.statusChartOptions = {
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        y: { beginAtZero: true }
      }
    };

    this.priorityChartOptions = {
      plugins: { legend: { labels: { color: textColor } } }
    };
  }
}
