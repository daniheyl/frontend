// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from "./components/task-list/task-list.component";
import { HeaderComponent } from "./components/header/header.component";
import { RouterModule } from '@angular/router';
import { LoginComponent } from "./components/login/login.component";
import { Router } from 'express';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    HeaderComponent,
    CommonModule,
    RouterModule,
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'task-manager';
}