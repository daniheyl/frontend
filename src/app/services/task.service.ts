// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: number;
}

export interface Status {
  id: number;
  name: string;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  addtask(newtask: Task) {
    throw new Error('Method not implemented.');
  }
  private tasksUrl = 'http://localhost:8000/api/tasks/';
  private statusesUrl = 'http://localhost:8000/api/statuses/';

  constructor(private http: HttpClient) { }

  // Task methods
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksUrl);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.tasksUrl}${id}/`);
  }

  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.tasksUrl}${task.id}/`, task);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.tasksUrl}${id}/`);
  }

  // Status methods
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(this.statusesUrl);
  }
}