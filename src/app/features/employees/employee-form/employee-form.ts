import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Employee, DEPARTMENTS } from '../../../shared/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';

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

  // Department dropdown options
  readonly departments = DEPARTMENTS;

  // Mode and identifiers
  isEditMode = false;
  employeeId: number | null = null;

  // Component UI state
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Reactive Form definition
  employeeForm: FormGroup = this.fb.group({
    employeeCode: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z0-9_-]+$/)
      ]
    ],
    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    department: [
      '',
      [Validators.required]
    ],
    designation: [
      '',
      [Validators.required]
    ],
    joiningDate: [
      '',
      [Validators.required]
    ],
    isActive: [true]
  });

  ngOnInit(): void {
    // Check if an :id route parameter is present
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.employeeId = Number(idParam);
      this.loadEmployeeData(this.employeeId);
    } else {
      // Set default joining date to today for convenience
      const today = new Date().toISOString().split('T')[0];
      this.employeeForm.patchValue({ joiningDate: today });
    }
  }

  /**
   * Loads existing employee details from the API when editing.
   */
  loadEmployeeData(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
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
      error: (error: Error) => {
        this.errorMessage = error.message || 'Unable to load employee details.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Helper function to check if a specific form control is invalid and touched.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  /**
   * Handles form submission for both creation and update operations.
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // If form has validation errors, highlight all invalid fields
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting || this.isLoading) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const formValues = this.employeeForm.getRawValue();

    const payload: Employee = {
      employeeCode: formValues.employeeCode.trim().toUpperCase(),
      fullName: formValues.fullName.trim(),
      email: formValues.email.trim().toLowerCase(),
      department: formValues.department,
      designation: formValues.designation.trim(),
      joiningDate: formValues.joiningDate,
      isActive: Boolean(formValues.isActive)
    };

    if (this.isEditMode && this.employeeId) {
      // Update operation: PUT /api/employees/{id}
      payload.employeeId = this.employeeId;

      this.employeeService.updateEmployee(this.employeeId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/employees'], {
            state: {
              successMessage: `Employee "${payload.fullName}" (${payload.employeeCode}) was successfully updated!`
            }
          });
        },
        error: (error: Error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to update employee details.';
          this.cdr.markForCheck();
        }
      });
    } else {
      // Creation operation: POST /api/employees
      this.employeeService.createEmployee(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/employees'], {
            state: {
              successMessage: `Employee "${payload.fullName}" (${payload.employeeCode}) was successfully added!`
            }
          });
        },
        error: (error: Error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to create employee record.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  /**
   * Cancels editing and navigates back to the employee list.
   */
  cancel(): void {
    this.router.navigate(['/employees']);
  }
}

