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
  imports: [
    CommonModule, 
    FormsModule, 
    ToastModule, 
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
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
        this.comments = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load comments';
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
      }
    });
  }

  addComment(): void {
    if (!this.newMessage.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Comment cannot be empty' });
      return;
    }

    this.submitting = true;
    this.commentsService.addComment(this.requestId, this.newMessage).subscribe({
      next: (res) => {
        this.comments.push(res.data);
        this.newMessage = '';
        this.submitting = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Comment added' });
      },
      error: (err) => {
        this.submitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add comment' });
      }
    });
  }
}
