import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsService } from '../../../core/services/comments.service';
import { Comment } from '../../../core/models/person3.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule],
  providers: [MessageService],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit, OnChanges {
  @Input() requestId!: number;

  comments: Comment[] = [];
  newMessage: string = '';
  loading: boolean = false;
  submitting: boolean = false;
  error: string | null = null;

  constructor(
    private commentsService: CommentsService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.requestId) {
      this.loadComments();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['requestId'] && !changes['requestId'].firstChange) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.loading = true;
    this.error = null;
    this.commentsService.getComments(this.requestId).subscribe({
      next: (res) => {
        this.comments = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load comments for this request.';
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
      },
    });
  }

  addComment(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please enter a comment message before submitting.',
      });
      return;
    }

    this.submitting = true;
    this.commentsService.addComment(this.requestId, trimmed).subscribe({
      next: (res) => {
        this.comments.push(res.data);
        this.newMessage = '';
        this.submitting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Comment Posted',
          detail: 'Your comment has been added to the request history.',
        });
      },
      error: (err) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to post comment.',
        });
      },
    });
  }

  getRoleBadgeClass(role: string): string {
    const r = (role || '').toLowerCase();
    if (r.includes('admin')) {
      return 'bg-purple-100 text-purple-700 border border-purple-200';
    }
    if (r.includes('lecturer')) {
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
    if (r.includes('support')) {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }
    if (r.includes('student')) {
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}
