import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { DoctorModel } from '../../../shared/models/doctor.model';
import { DoctorService } from '../../../core/services/doctor';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.css'
})
export class DoctorList implements OnInit {
  private doctorService = inject(DoctorService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  successMessage = '';
  errorMessage = '';
  isLoading = false;
  deletingDoctorId: string | null = null;
  selectedDoctor: DoctorModel | null = null;

  doctors: DoctorModel[] = [];

  searchText = '';
  selectedSpecialization = '';
  selectedStatus = '';

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    this.successMessage =
      navigation?.extras.state?.['successMessage'] ||
      history.state?.successMessage ||
      '';
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load doctors:', error);
        this.errorMessage =
          'Unable to load doctors. Please check whether the API is running.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  viewDoctor(doctor: DoctorModel): void {
    this.selectedDoctor = doctor;
    this.cdr.markForCheck();
  }

  closeViewModal(): void {
    this.selectedDoctor = null;
    this.cdr.markForCheck();
  }

  deleteDoctor(doctor: DoctorModel): void {
    if (!doctor.id) return;

    const confirmed = window.confirm(`Are you sure you want to delete Dr. ${doctor.name}?`);
    if (!confirmed) return;

    this.deletingDoctorId = doctor.id;
    this.cdr.markForCheck();

    this.doctorService.deleteDoctor(doctor.id).subscribe({
      next: () => {
        this.doctors = this.doctors.filter(d => d.id !== doctor.id);
        this.successMessage = `Doctor "${doctor.name}" was successfully deleted.`;
        this.deletingDoctorId = null;
        if (this.selectedDoctor?.id === doctor.id) {
          this.selectedDoctor = null;
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to delete doctor:', error);
        this.errorMessage = 'Unable to delete doctor. Please try again.';
        this.deletingDoctorId = null;
        this.cdr.markForCheck();
      }
    });
  }

  get specializations(): string[] {
    return [
      ...new Set(
        this.doctors.map(doctor => doctor.specialization)
      )
    ];
  }

  get filteredDoctors(): DoctorModel[] {
    const search = this.searchText.trim().toLowerCase();

    return this.doctors.filter(doctor => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(search) ||
        doctor.email.toLowerCase().includes(search) ||
        doctor.specialization.toLowerCase().includes(search);

      const matchesSpecialization =
        !this.selectedSpecialization ||
        doctor.specialization === this.selectedSpecialization;

      const matchesStatus =
        !this.selectedStatus ||
        doctor.status === this.selectedStatus;

      return (
        matchesSearch &&
        matchesSpecialization &&
        matchesStatus
      );
    });
  }
}
