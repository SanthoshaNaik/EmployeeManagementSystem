
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  Observable,
  catchError,
  throwError
} from 'rxjs';

import { Employee } from '../../shared/models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/employees';

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getEmployeeById(id: number | string): Observable<Employee> {
    const validId = this.validateId(id);

    return this.http
      .get<Employee>(`${this.apiUrl}/${validId}`)
      .pipe(catchError(this.handleError));
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(
      this.apiUrl,
      employee
    ).pipe(catchError(this.handleError));
  }

  updateEmployee(
    id: number | string,
    employee: Employee
  ): Observable<Employee> {
    const validId = this.validateId(id);

    return this.http
      .put<Employee>(`${this.apiUrl}/${validId}`, employee)
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: number | string): Observable<void> {
    const validId = this.validateId(id);

    return this.http
      .delete<void>(`${this.apiUrl}/${validId}`)
      .pipe(catchError(this.handleError));
  }

  private validateId(id: number | string): number {
    const validId = Number(id);

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === '' ||
      !Number.isInteger(validId) ||
      validId <= 0
    ) {
      throw new Error(
        `Invalid employee ID: ${String(id)}. A valid numeric ID is required.`
      );
    }

    return validId;
  }

  private handleError = (
    error: HttpErrorResponse
  ): Observable<never> => {
    let message = 'An unexpected error occurred.';

    if (error.status === 0) {
      message = 'Cannot connect to the API at localhost:3000.';
    } else if (error.status === 404) {
      message = 'Employee not found. Check the employee ID and API URL.';
    } else if (error.status === 400) {
      message = 'Invalid employee data. Please check the submitted fields.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    console.error('Employee API error:', error);

    return throwError(() => new Error(message));
  };
}
