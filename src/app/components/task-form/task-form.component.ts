// src/app/components/task-form/task-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule,
  FormsModule 
} from '@angular/forms';
import { 
  MAT_DIALOG_DATA, 
  MatDialogRef, 
  MatDialogModule 
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar'; // Added for error feedback

import { TaskService, Task, Status } from '../../services/task.service';



@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private dialogRef = inject(MatDialogRef<TaskFormComponent>);
  private snackBar = inject(MatSnackBar); // For error messages
  protected data: {task?: Task, statuses: Status[]} = inject(MAT_DIALOG_DATA);

  taskForm!: FormGroup;
  isEditMode = false;
  isLoading = false; // Added loading state
  
  ngOnInit(): void {
    this.isEditMode = !!this.data.task;
    
    this.taskForm = this.fb.group({
      title: [this.data.task?.title || '', [
        Validators.required,
        Validators.maxLength(100) // Added length validation
      ]],
      description: [this.data.task?.description || '', [
        Validators.required,
        Validators.maxLength(500)
      ]],
      status: [this.data.task?.status || this.data.statuses[0]?.id, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      // Highlight errors to user
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const taskData = this.taskForm.value;
    
    const operation = this.isEditMode 
      ? this.taskService.updateTask({ 
          ...this.data.task!, 
          ...taskData 
        })
      : this.taskService.createTask(taskData);

    operation.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Task operation failed:', err);
        
        // Show user-friendly error message
        this.snackBar.open(
          err.error?.message || 'Failed to save task. Please try again.',
          'Close', 
          { duration: 5000 }
        );
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
}