import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
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

  get maxDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

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
    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        this.validateFullName.bind(this)
      ]
    ],
    email: ['', [Validators.required, this.validateEmail.bind(this)]],
    
    department: ['', [Validators.required]],

    designation: [
      '',
      [
        Validators.required,
        this.validateDesignation.bind(this)
      ]
    ],

    joiningDate: [
      '',
      [
        Validators.required,
        this.validateJoiningDate.bind(this)
      ]
    ],
    isActive: [true, [Validators.required]]
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
          employeeCode: employee.EmployeeCode,
          fullName: employee.FullName,
          email: employee.Email,
          department: employee.Department,
          designation: employee.Designation,
          joiningDate: employee.JoiningDate,
          isActive: employee.ActiveStatus
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
      const codeVal = emp.EmployeeCode;
      if (!codeVal) return false;
      const sameCode =
        codeVal.trim().toUpperCase() === code.toUpperCase();
      if (!sameCode) return false;

      // Allow keeping current code in edit mode
      if (this.isEditMode && this.employeeId) {
        const empId = emp.EmployeeId ?? emp.id ?? emp.EmployeeCode;
        return String(empId) !== String(this.employeeId);
      }

      return true;
    });

    if (isDuplicate) {
      return { codeTaken: true };
    }

    return null;
  }

  validateFullName(control: AbstractControl) {
    const rawValue = control.value;

    if (!rawValue) {
      return null;
    }

    const valueStr = String(rawValue);

    // 1. Cannot start with a space
    if (/^\s/.test(valueStr)) {
      return { leadingSpace: true };
    }

    // 2. Cannot end with a space
    if (/\s$/.test(valueStr)) {
      return { trailingSpace: true };
    }

    // 3. Only a single space between words (no multiple consecutive spaces)
    if (/\s{2,}/.test(valueStr)) {
      return { multipleSpaces: true };
    }

    const name = valueStr.trim();

    // 4. Do not accept numerics (numbers)
    if (/\d/.test(name)) {
      return { hasNumbers: true };
    }

    // 5. Only allow letters, spaces, hyphens, and dots
    if (!/^[A-Za-z\s.'-]+$/.test(name)) {
      return { invalidCharacters: true };
    }

    // 6. Must start with a capital letter
    if (!/^[A-Z]/.test(name)) {
      return { mustStartWithCapital: true };
    }

    // 7. Each word must start with a capital letter (e.g. Santhosha Naraayana Naik)
    const words = name.split(/\s+/).filter(Boolean);
    const hasUncapitalizedWord = words.some(w => !/^[A-Z]/.test(w));
    if (hasUncapitalizedWord) {
      return { capitalizeWords: true };
    }

    return null;
  }

  validateDesignation(control: AbstractControl) {
    const rawValue = control.value;

    if (!rawValue) {
      return null;
    }

    const valueStr = String(rawValue);

    // 1. Cannot start with a space
    if (/^\s/.test(valueStr)) {
      return { leadingSpace: true };
    }

    // 2. Cannot end with a space
    if (/\s$/.test(valueStr)) {
      return { trailingSpace: true };
    }

    // 3. Only a single space between words (no multiple consecutive spaces)
    if (/\s{2,}/.test(valueStr)) {
      return { multipleSpaces: true };
    }

    const designation = valueStr.trim();

    // 4. Do not accept numerics (numbers)
    if (/\d/.test(designation)) {
      return { hasNumbers: true };
    }

    // 5. Only allow letters, spaces, hyphens, and dots
    if (!/^[A-Za-z\s.'-]+$/.test(designation)) {
      return { invalidCharacters: true };
    }

    // 6. Must start with a capital letter
    if (!/^[A-Z]/.test(designation)) {
      return { mustStartWithCapital: true };
    }

    // 7. Each word must start with a capital letter (e.g. Senior Software Engineer)
    const words = designation.split(/\s+/).filter(Boolean);
    const hasUncapitalizedWord = words.some(w => !/^[A-Z]/.test(w));
    if (hasUncapitalizedWord) {
      return { capitalizeWords: true };
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
      const emailVal = emp.Email;
      if (!emailVal) {
        return false;
      }

      const sameEmail =
        emailVal.trim().toLowerCase() === email.toLowerCase();

      if (!sameEmail) {
        return false;
      }

      // When editing, ignore the current employee's email
      if (this.isEditMode && this.employeeId) {
        const empId = emp.EmployeeId ?? emp.id ?? emp.EmployeeCode;
        return String(empId) !== String(this.employeeId);
      }

      return true;
    });

    if (isDuplicate) {
      return { emailTaken: true, email: true };
    }

    return null;
  }

  validateJoiningDate(control: AbstractControl) {
    const value = control.value;

    if (!value) {
      return null;
    }

    const todayStr = this.maxDate;
    const inputDate = String(value).split('T')[0];

    if (inputDate > todayStr) {
      return { futureDate: true };
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
      EmployeeCode: formValues.employeeCode.trim().toUpperCase(),
      FullName: formValues.fullName.trim(),
      Email: formValues.email.trim().toLowerCase(),
      Department: formValues.department,
      Designation: formValues.designation.trim(),
      JoiningDate: formValues.joiningDate,
      ActiveStatus: this.isEditMode
        ? (formValues.isActive === true || formValues.isActive === 'true')
        : true
    };

    if (this.isEditMode && this.employeeId) {
      payload.EmployeeId = Number(this.employeeId);
      payload.id = this.employeeId;

      this.employeeService
        .updateEmployee(this.employeeId, payload)
        .subscribe({
          next: () => {
            this.isSubmitting = false;

            this.router.navigate(['/employees'], {
              state: {
                successMessage: `Employee "${payload.FullName}" (${payload.EmployeeCode}) was successfully updated!`
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
              successMessage: `Employee "${payload.FullName}" (${payload.EmployeeCode}) was successfully added!`
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
