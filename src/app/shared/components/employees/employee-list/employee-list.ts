import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Employee, DEPARTMENTS } from '../../../models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { SearchPipe } from '../../../pipes/search.pipe';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchPipe],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit {
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private searchPipe = new SearchPipe();

  readonly departments = DEPARTMENTS;

  employees: Employee[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  deletingEmployeeId: any = null;
  selectedEmployee: Employee | null = null;

  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';

  private successTimer: ReturnType<typeof setTimeout> | null = null;
  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const navigation = this.router.getCurrentNavigation();

    this.successMessage =
      navigation?.extras.state?.['successMessage'] ||
      history.state?.successMessage ||
      '';
  }

  ngOnInit(): void {
    this.fetchEmployees();

    if (this.successMessage) {
      this.autoDismissSuccess();
    }
  }

  private autoDismissSuccess(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    this.successTimer = setTimeout(() => {
      this.successMessage = '';
      this.successTimer = null;
      this.cdr.markForCheck();
    }, 4000);
  }

  private autoDismissError(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }

    this.errorTimer = setTimeout(() => {
      this.errorMessage = '';
      this.errorTimer = null;
      this.cdr.markForCheck();
    }, 5000);
  }

  getEmployeeId(employee: Employee): any {
    return employee.id ?? employee.employeeId;
  }

  fetchEmployees(): void {
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load employees from the server.';
        this.autoDismissError();
        this.cdr.markForCheck();
      }
    });
  }

  openViewModal(employee: Employee): void {
    this.selectedEmployee = employee;
    this.cdr.markForCheck();
  }

  closeViewModal(): void {
    this.selectedEmployee = null;
    this.cdr.markForCheck();
  }

  confirmDelete(employee: Employee): void {
    const id = this.getEmployeeId(employee);

    if (id == null || id === '') {
      this.errorMessage = 'Cannot delete employee because ID is missing.';
      this.cdr.markForCheck();
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete employee "${employee.fullName}" (${employee.employeeCode})?`
    );

    if (!confirmed) {
      return;
    }

    this.deletingEmployeeId = id;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.employees = this.employees.filter(
          e => this.getEmployeeId(e) !== id
        );

        if (
          this.selectedEmployee &&
          this.getEmployeeId(this.selectedEmployee) === id
        ) {
          this.selectedEmployee = null;
        }

        this.successMessage =
          `Employee "${employee.fullName}" was deleted successfully.`;

        this.deletingEmployeeId = null;
        this.autoDismissSuccess();
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to delete the employee record.';
        this.deletingEmployeeId = null;
        this.autoDismissError();
        this.cdr.markForCheck();
      }
    });
  }

  clearSuccessMessage(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }

    this.successMessage = '';
    this.cdr.markForCheck();
  }

  clearErrorMessage(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }

    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  get filteredEmployees(): Employee[] {
    return this.searchPipe.transform(
      this.employees,
      this.searchTerm,
      this.selectedDepartment,
      this.selectedStatus
    );
  }
}
