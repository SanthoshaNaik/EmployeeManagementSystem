import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Employee, DEPARTMENTS } from '../../../models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeForm implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  departments = DEPARTMENTS;

  isEditMode = false;
  employeeId: any = null;
  existingEmployees: Employee[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  employeeForm: FormGroup = this.fb.group({
    employeeCode: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        this.validateEmployeeCode.bind(this)
      ]
    ],
    fullName: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.required, this.validateEmail.bind(this)]],
    department: ['', [Validators.required]],
    designation: ['', [Validators.required]],
    joiningDate: ['', [Validators.required]],
    isActive: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // Load existing employees to check for duplicate codes and emails
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.existingEmployees = data || [];
        this.employeeForm.get('employeeCode')?.updateValueAndValidity();
        this.employeeForm.get('email')?.updateValueAndValidity();
        this.cdr.markForCheck();
      }
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.employeeId = id;
      this.loadEmployee(id);
    }
  }

  loadEmployee(id: string): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee: Employee) => {
        this.employeeForm.patchValue({
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          joiningDate: employee.joiningDate,
          isActive: employee.isActive
        });

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.showErrorPopup('Unable to load employee details.');
        this.cdr.markForCheck();
      }
    });
  }

  validateEmployeeCode(control: AbstractControl) {
    const value = control.value;

    if (!value) {
      return null;
    }

    const code = String(value).trim();

    // Disallow spaces
    if (value.includes(' ')) {
      return { codeSpaces: true };
    }

    // Must contain at least one digit (e.g. EMP001, EMP1)
    if (!/\d/.test(code)) {
      return { missingDigit: true };
    }

    // Only allow letters, numbers, hyphens, and underscores
    const pattern = /^[A-Za-z0-9_-]+$/;
    if (!pattern.test(code)) {
      return { pattern: true };
    }

    // Unique Employee Code check (no duplicate code)
    const isDuplicate = this.existingEmployees.some((emp) => {
      if (!emp.employeeCode) return false;
      const sameCode =
        emp.employeeCode.trim().toUpperCase() === code.toUpperCase();
      if (!sameCode) return false;

      // Allow keeping current code in edit mode
      if (this.isEditMode && this.employeeId) {
        const empId = emp.id ?? emp.employeeId;
        return String(empId) !== String(this.employeeId);
      }

      return true;
    });

    if (isDuplicate) {
      return { codeTaken: true };
    }

    return null;
  }

  validateEmail(control: AbstractControl) {
    const value = control.value;

    if (!value) {
      return null;
    }

    const email = String(value).trim();

    // Check for spaces
    if (value.includes(' ')) {
      return { emailSpaces: true, email: true };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return { invalidEmailFormat: true, email: true };
    }

    // Check for duplicate emails
    const isDuplicate = this.existingEmployees.some(emp => {
      if (!emp.email) {
        return false;
      }

      const sameEmail =
        emp.email.trim().toLowerCase() === email.toLowerCase();

      if (!sameEmail) {
        return false;
      }

      // When editing, ignore the current employee's email
      if (this.isEditMode && this.employeeId) {
        const empId = emp.id ?? emp.employeeId;
        return String(empId) !== String(this.employeeId);
      }

      return true;
    });

    if (isDuplicate) {
      return { emailTaken: true, email: true };
    }

    return null;
  }

  showErrorPopup(msg: string): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }

    this.errorMessage = msg;

    this.errorTimer = setTimeout(() => {
      this.errorMessage = '';
      this.errorTimer = null;
    }, 5000);
  }

  clearErrorMessage(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }

    this.errorMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.touched || field.dirty)
    );
  }

  onSubmit(): void {
    this.clearErrorMessage();

    // Highlight all invalid fields
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      this.showErrorPopup(
        'All fields are mandatory. Please fill in all required fields before submitting.'
      );

      return;
    }

    if (this.isSubmitting || this.isLoading) {
      return;
    }

    this.isSubmitting = true;

    const formValues = this.employeeForm.value;

    const payload: Employee = {
      employeeCode: formValues.employeeCode.trim().toUpperCase(),
      fullName: formValues.fullName.trim(),
      email: formValues.email.trim().toLowerCase(),
      department: formValues.department,
      designation: formValues.designation.trim(),
      joiningDate: formValues.joiningDate,
      isActive:
        formValues.isActive === true ||
        formValues.isActive === 'true'
    };

    if (this.isEditMode && this.employeeId) {
      payload.employeeId = Number(this.employeeId);

      this.employeeService
        .updateEmployee(this.employeeId, payload)
        .subscribe({
          next: () => {
            this.isSubmitting = false;

            this.router.navigate(['/employees'], {
              state: {
                successMessage: `Employee "${payload.fullName}" (${payload.employeeCode}) was successfully updated!`
              }
            });
          },
          error: () => {
            this.isSubmitting = false;
            this.showErrorPopup('Failed to update employee details.');
          }
        });
    } else {
      this.employeeService.createEmployee(payload).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.router.navigate(['/employees'], {
            state: {
              successMessage: `Employee "${payload.fullName}" (${payload.employeeCode}) was successfully added!`
            }
          });
        },
        error: () => {
          this.isSubmitting = false;
          this.showErrorPopup('Failed to create employee record.');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
