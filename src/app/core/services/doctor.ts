import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { DoctorModel } from '../../shared/models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/doctors';

  getDoctors(): Observable<DoctorModel[]> {
    return this.http.get<DoctorModel[]>(this.apiUrl);
  }

  // POST: Add a new doctor
  addDoctor(doctor: DoctorModel): Observable<DoctorModel> {
    return this.http.post<DoctorModel>(this.apiUrl, doctor);
  }

  // Fetch a doctor by ID
  getDoctorById(id: string): Observable<DoctorModel> {
    return this.http.get<DoctorModel>(`${this.apiUrl}/${id}`);
  }

  // Update an existing doctor
  updateDoctor(id: string, doctor: DoctorModel): Observable<DoctorModel> {
    return this.http.put<DoctorModel>(`${this.apiUrl}/${id}`, doctor);
  }

  // DELETE: Delete a doctor by ID
  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

// Aliases for compatibility
export { DoctorService as doctor, DoctorService as Doctor };
