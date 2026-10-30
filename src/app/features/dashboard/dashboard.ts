import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Employee } from '../../shared/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  employees: Employee[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Unable to retrieve employee metrics.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get activeEmployees(): number {
    return this.employees.filter(e => e.isActive).length;
  }

  get inactiveEmployees(): number {
    return this.employees.filter(e => !e.isActive).length;
  }

  get departmentCount(): number {
    return new Set(this.employees.map(e => e.department)).size;
  }

  get recentEmployees(): Employee[] {
    return this.employees.slice(-4).reverse();
  }
}
