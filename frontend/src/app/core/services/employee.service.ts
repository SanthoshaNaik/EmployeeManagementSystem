import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee } from '../../shared/models/employee.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employees`;

  private mapEmployee(data: any): Employee {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const employeeId = data.EmployeeId ?? data.employeeId;
    const id = data.id ?? data.Id ?? employeeId;
    const rawDate = data.JoiningDate ?? data.joiningDate ?? '';
    const joiningDate = rawDate ? String(rawDate).split('T')[0] : '';
    const active = data.ActiveStatus !== undefined
      ? Boolean(data.ActiveStatus)
      : (data.activeStatus !== undefined ? Boolean(data.activeStatus) : true);

    const employee: Employee = {
      EmployeeCode: data.EmployeeCode ?? data.employeeCode ?? '',
      FullName: data.FullName ?? data.fullName ?? '',
      Email: data.Email ?? data.email ?? '',
      Department: data.Department ?? data.department ?? '',
      Designation: data.Designation ?? data.designation ?? '',
      JoiningDate: joiningDate,
      ActiveStatus: active
    };

    if (employeeId !== undefined) {
      employee.EmployeeId = employeeId;
    }
    if (id !== undefined) {
      employee.id = id;
    }

    return employee;
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(response => {
        if (!Array.isArray(response)) {
          return [];
        }
        return response.map(emp => this.mapEmployee(emp));
      })
    );
  }

  getEmployeeById(id: number | string): Observable<Employee> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(data => this.mapEmployee(data))
    );
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<any>(this.apiUrl, employee).pipe(
      map(data => this.mapEmployee(data))
    );
  }

  updateEmployee(id: number | string, employee: Employee): Observable<Employee> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee).pipe(
      map(data => this.mapEmployee(data))
    );
  }

  deleteEmployee(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
