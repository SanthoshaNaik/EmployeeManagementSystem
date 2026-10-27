import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor';
import { DoctorModel } from '../../../shared/models/doctor.model';

@Component({
  imports: [RouterLink],
  selector: 'app-doctor-detail',
  styleUrl: './doctor-detail.css',
  templateUrl: './doctor-detail.html',
})
export class DoctorDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private doctorService = inject(DoctorService);
  private cdr = inject(ChangeDetectorRef);

  doctor: DoctorModel | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDoctor(id);
    } else {
      this.errorMessage = 'Doctor ID was not provided.';
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  loadDoctor(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.doctorService.getDoctorById(id).subscribe({
      next: (doctorData) => {
        this.doctor = doctorData;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load doctor details:', error);
        this.errorMessage = 'Doctor could not be found or loaded.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteDoctor(): void {
    if (!this.doctor?.id) return;

    const doctorName = this.doctor.name;
    const confirmed = window.confirm(`Are you sure you want to delete Dr. ${doctorName}?`);
    if (!confirmed) return;

    this.doctorService.deleteDoctor(this.doctor.id).subscribe({
      next: () => {
        this.router.navigate(['/doctors'], {
          state: { successMessage: `Doctor "${doctorName}" was successfully deleted.` }
        });
      },
      error: (error) => {
        console.error('Failed to delete doctor:', error);
        this.errorMessage = 'Failed to delete doctor. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }
}
