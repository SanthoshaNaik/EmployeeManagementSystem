import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { DoctorModel } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../core/services/doctor';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './doctor-form.html',
  styleUrl: './doctor-form.css'
})
export class DoctorForm implements OnInit {

  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  doctorId: string | null = null;
  isEditMode = false;

  isSubmitting = false;
  isLoadingDoctor = false;

  successMessage = '';
  errorMessage = '';

  availableDayOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  doctorForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    specialization: ['', Validators.required],
    qualification: ['', Validators.required],
    experience: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/)
      ]
    ],
    consultationFee: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/)
      ]
    ],
    availableDays: this.fb.nonNullable.control<string[]>([], [
      Validators.required,
      Validators.minLength(1)
    ]),
    workingHours: ['', Validators.required],
    status: ['Available' as DoctorModel['status'], Validators.required]
  });

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.doctorId !== null;

    if (this.isEditMode && this.doctorId) {
      this.loadDoctor(this.doctorId);
    }
  }

  // Load existing doctor details for editing
  loadDoctor(id: string): void {
    this.isLoadingDoctor = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.doctorService.getDoctorById(id)
      .pipe(
        finalize(() => {
          this.isLoadingDoctor = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (doctorData) => {
          this.doctorForm.patchValue({
            name: doctorData.name,
            email: doctorData.email,
            phone: doctorData.phone,
            specialization: doctorData.specialization,
            qualification: doctorData.qualification,
            experience: doctorData.experience,
            consultationFee: doctorData.consultationFee,
            availableDays: doctorData.availableDays || [],
            workingHours: doctorData.workingHours,
            status: doctorData.status
          });
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load doctor:', error);
          this.errorMessage = 'Unable to load doctor details. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  // Add a new doctor or update an existing doctor
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting || this.isLoadingDoctor) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const rawValue = this.doctorForm.getRawValue();
    const doctorData: DoctorModel = {
      ...rawValue,
      experience: Number(rawValue.experience),
      consultationFee: Number(rawValue.consultationFee),
      id: this.doctorId || undefined
    };

    if (this.isEditMode && this.doctorId) {
      this.doctorService.updateDoctor(this.doctorId, doctorData)
        .pipe(finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: () => {
            this.router.navigate(['/doctors'], {
              state: { successMessage: `Doctor "${doctorData.name}" updated successfully!` }
            });
          },
          error: (error) => {
            console.error('Failed to update doctor:', error);
            this.errorMessage = 'Unable to update doctor. Please try again.';
            this.cdr.markForCheck();
          }
        });
    } else {
      this.doctorService.addDoctor(doctorData)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => {
            this.successMessage = `Doctor "${doctorData.name}" added successfully!`;
            this.errorMessage = '';

            this.doctorForm.reset({
              name: '',
              email: '',
              phone: '',
              specialization: '',
              qualification: '',
              experience: 0,
              consultationFee: 0,
              availableDays: [],
              workingHours: '',
              status: 'Available'
            });
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Failed to add doctor:', error);
            this.errorMessage = 'Unable to add doctor. Please try again.';
            this.cdr.markForCheck();
          }
        });
    }
  }

  // Navigate back to the doctor list
  viewDoctors(): void {
    this.router.navigate(['/doctors']);
  }

  // Select or deselect available days
  toggleAvailableDay(day: string, checked: boolean): void {
    const control = this.doctorForm.controls.availableDays;
    const selectedDays = control.value;

    if (checked && !selectedDays.includes(day)) {
      control.setValue([...selectedDays, day]);
    } else if (!checked) {
      control.setValue(
        selectedDays.filter(selectedDay => selectedDay !== day)
      );
    }

    control.markAsTouched();
    control.updateValueAndValidity();
    this.cdr.markForCheck();
  }
}
