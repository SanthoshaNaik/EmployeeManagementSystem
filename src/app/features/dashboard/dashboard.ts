import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DoctorService } from '../../core/services/doctor';
import { DoctorModel } from '../../shared/models/doctor.model';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private doctorService = inject(DoctorService);
  private cdr = inject(ChangeDetectorRef);

  doctors: DoctorModel[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
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
        console.error('Failed to load dashboard statistics:', error);
        this.errorMessage = 'Unable to load live statistics.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get totalDoctors(): number {
    return this.doctors.length;
  }

  get availableDoctors(): number {
    return this.doctors.filter(d => d.status === 'Available').length;
  }

  get specializationsCount(): number {
    return new Set(this.doctors.map(d => d.specialization)).size;
  }

  get onLeaveDoctors(): number {
    return this.doctors.filter(d => d.status === 'On Leave').length;
  }

  get recentDoctors(): DoctorModel[] {
    return this.doctors.slice(-4).reverse();
  }
}
