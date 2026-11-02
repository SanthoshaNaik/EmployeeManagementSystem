
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  Employee,
  DEPARTMENTS
} from '../../../models/employee.model';

import {
  EmployeeService
} from '../../../../core/services/employee.service';

import {
  SearchPipe
} from '../../../pipes/search.pipe';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SearchPipe
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit, OnDestroy {

  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private searchPipe = new SearchPipe();

  readonly departments = DEPARTMENTS;

  employees: Employee[] = [];

  isLoading = false;

  errorMessage = '';
  successMessage = '';

  deletingEmployeeId: number | null = null;

  selectedEmployee: Employee | null = null;
  employeeToDelete: Employee | null = null;

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

  ngOnDestroy(): void {

    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
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
    return employee.EmployeeId ?? employee.id;
  }

  fetchEmployees(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.employeeService.getEmployees().subscribe({

      next: (response: Employee[]) => {

        console.log('Employee API Response:', response);

        this.employees = Array.isArray(response)
          ? response
          : [];

        console.log('Employees loaded:', this.employees);

        this.isLoading = false;

        this.cdr.markForCheck();

      },

      error: (error) => {

        console.error('Employee API Error:', error);

        this.isLoading = false;

        this.errorMessage =
          'Failed to load employees from the server.';

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

  openDeleteModal(employee: Employee): void {
    this.employeeToDelete = employee;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    if (this.deletingEmployeeId !== null) {
      return;
    }
    this.employeeToDelete = null;
    this.cdr.markForCheck();
  }

  confirmDelete(employee?: Employee): void {
    const target = employee || this.employeeToDelete;
    if (!target) {
      return;
    }

    if (employee) {
      const confirmed = window.confirm(
        `Are you sure you want to delete employee "${employee.FullName}" (${employee.EmployeeCode})?`
      );
      if (!confirmed) {
        return;
      }
    }

    this.executeDelete(target);
  }

  executeDelete(target?: Employee): void {
    const employee = target || this.employeeToDelete;
    if (!employee) {
      return;
    }

    const id = this.getEmployeeId(employee);
    if (!id) {
      this.errorMessage = 'Cannot delete employee because ID is missing.';
      this.employeeToDelete = null;
      this.cdr.markForCheck();
      return;
    }

    const empName = employee.FullName;
    this.deletingEmployeeId = id;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.employees = this.employees.filter(
          item => this.getEmployeeId(item) !== id
        );

        if (
          this.selectedEmployee &&
          this.getEmployeeId(this.selectedEmployee) === id
        ) {
          this.selectedEmployee = null;
        }

        this.employeeToDelete = null;
        this.deletingEmployeeId = null;
        this.successMessage = `Employee "${empName}" was deleted successfully.`;
        this.autoDismissSuccess();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Delete Employee Error:', error);
        this.errorMessage = 'Failed to delete the employee record.';
        this.deletingEmployeeId = null;
        this.employeeToDelete = null;
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
