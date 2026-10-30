import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Employee, DEPARTMENTS } from '../../../shared/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})


export class EmployeeList implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly departments = DEPARTMENTS;

  employees: Employee[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  deletingEmployeeId: number | null = null;
  selectedEmployee: Employee | null = null;

  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';

  constructor() {
    const navigation = this.router.getCurrentNavigation();

    this.successMessage = navigation?.extras.state?.['successMessage'] || history.state?.successMessage || '';
  }

  ngOnInit(): void {
    this.fetchEmployees();
  }

 
  getEmployeeId(employee: Employee): number | null {
    const rawId = employee.id ?? employee.employeeId;

    if (
      rawId === null ||
      rawId === undefined ||
      String(rawId).trim() === ''
    ) {
      return null;
    }

    const id = Number(rawId);

    return Number.isInteger(id) && id > 0 ? id : null;
  }

  /**
   * Fetch all employees.
   */
  fetchEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.isLoading = false;
        this.cdr.markForCheck();

        console.log('Employees loaded:', data);
      },
      error: (error: Error) => {
        this.errorMessage =
          error.message || 'Failed to load employees from the server.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Open employee details modal.
   */
  openViewModal(employee: Employee): void {
    this.selectedEmployee = employee;
    this.cdr.markForCheck();
  }

  /**
   * Close employee details modal.
   */
  closeViewModal(): void {
    this.selectedEmployee = null;
    this.cdr.markForCheck();
  }

  /**
   * Delete an employee using the actual API ID.
   */
  confirmDelete(employee: Employee): void {
    const id = this.getEmployeeId(employee);

    if (id === null) {
      this.errorMessage =
        'Cannot delete employee because its ID is missing or invalid.';
      console.error('Invalid employee record:', employee);
      this.cdr.markForCheck();
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete employee "${employee.fullName}" (${employee.employeeCode})? This action cannot be undone.`
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
          `Employee "${employee.fullName}" (${employee.employeeCode}) was deleted successfully.`;

        this.deletingEmployeeId = null;
        this.cdr.markForCheck();
      },
      error: (error: Error) => {
        this.errorMessage =
          error.message || 'Failed to delete the employee record.';

        this.deletingEmployeeId = null;
        this.cdr.markForCheck();

        console.error('Delete employee failed:', error);
      }
    });
  }

  /**
   * Dismiss success notification.
   */
  clearSuccessMessage(): void {
    this.successMessage = '';
  }

  /**
   * Dismiss error notification.
   */
  clearErrorMessage(): void {
    this.errorMessage = '';
  }

  /**
   * Search and filter employees.
   */
  get filteredEmployees(): Employee[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.employees.filter(employee => {
      const matchesSearch =
        !query ||
        (employee.fullName ?? '').toLowerCase().includes(query) ||
        (employee.employeeCode ?? '').toLowerCase().includes(query) ||
        (employee.designation ?? '').toLowerCase().includes(query);

      const matchesDepartment =
        !this.selectedDepartment ||
        employee.department === this.selectedDepartment;

      const matchesStatus =
        this.selectedStatus === '' ||
        (this.selectedStatus === 'active' && employee.isActive) ||
        (this.selectedStatus === 'inactive' && !employee.isActive);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }
}
