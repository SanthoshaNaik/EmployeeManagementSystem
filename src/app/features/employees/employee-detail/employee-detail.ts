import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Employee } from '../../../shared/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.fetchEmployee(Number(id));
    } else {
      this.errorMessage = 'Employee ID was not provided in the route.';
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  fetchEmployee(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.employeeService.getEmployeeById(id).subscribe({
      next: (data: Employee) => {
        this.employee = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Unable to retrieve employee details.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteCurrentEmployee(): void {
    if (!this.employee?.employeeId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete employee "${this.employee.fullName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    this.employeeService.deleteEmployee(this.employee.employeeId).subscribe({
      next: () => {
        this.router.navigate(['/employees'], {
          state: {
            successMessage: `Employee "${this.employee?.fullName}" was successfully deleted.`
          }
        });
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Failed to delete employee.';
        this.cdr.markForCheck();
      }
    });
  }
}

