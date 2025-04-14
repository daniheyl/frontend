// src/app/components/task-list/task-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TaskService, Task, Status } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { TaskFormComponent } from '../task-form/task-form.component';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  tasks: Task[] = [];
  statuses: Status[] = [];
  displayedColumns: string[] = ['title', 'description', 'status', 'actions'];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    // Load tasks and statuses in parallel
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });

    this.taskService.getStatuses().subscribe({
      next: (statuses) => {
        this.statuses = statuses;
      },
      error: (err) => {
        console.error('Failed to load statuses:', err);
        if (!this.error) {
          this.error = 'Failed to load statuses.';
        }
      }
    });
  }

  getStatusName(statusId: number): string {
    const status = this.statuses.find(s => s.id === statusId);
    return status ? status.name : 'Unknown';
  }

  openTaskDialog(task?: Task): void {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please log in to modify tasks.';
      return;
    }

    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: {
        task: task ? {...task} : null,
        statuses: this.statuses
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteTask(task: Task): void {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please log in to delete tasks.';
      return;
    }

    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          this.error = 'Failed to delete task. Please try again.';
        }
      });
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}