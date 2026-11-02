import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Employee } from '../../../models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css'
})
export class EmployeeDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  employee: Employee | null = null;
  isLoading = true;
  errorMessage = '';
  actionErrorMessage = '';
  showDeleteModal = false;
  isDeleting = false;
  private actionErrorTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.fetchEmployee(id);
    } else {
      this.errorMessage = 'Employee ID was not provided in the route.';
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  fetchEmployee(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.employeeService.getEmployeeById(id).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to retrieve employee details.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    if (this.isDeleting) return;
    this.showDeleteModal = false;
    this.cdr.markForCheck();
  }

  deleteCurrentEmployee(): void {
    const empName = this.employee?.FullName;
    const confirmed = window.confirm(
      `Are you sure you want to delete employee "${empName}"?`
    );

    if (!confirmed) return;

    this.executeDelete();
  }

  executeDelete(): void {
    const id = this.employee?.EmployeeId ?? this.employee?.id ?? this.employee?.EmployeeCode;

    if (!id) return;

    const empName = this.employee?.FullName;
    this.isDeleting = true;
    this.cdr.markForCheck();

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.router.navigate(['/employees'], {
          state: {
            successMessage: `Employee "${empName}" was successfully deleted.`
          }
        });
      },
      error: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.actionErrorMessage = 'Failed to delete employee.';

        if (this.actionErrorTimer) {
          clearTimeout(this.actionErrorTimer);
        }

        this.actionErrorTimer = setTimeout(() => {
          this.actionErrorMessage = '';
          this.actionErrorTimer = null;
          this.cdr.markForCheck();
        }, 5000);

        this.cdr.markForCheck();
      }
    });
  }

  clearActionError(): void {
    if (this.actionErrorTimer) {
      clearTimeout(this.actionErrorTimer);
      this.actionErrorTimer = null;
    }

    this.actionErrorMessage = '';
  }
}
