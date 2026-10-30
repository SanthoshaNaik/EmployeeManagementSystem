import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { Employee } from '../../shared/models/employee.model';
import { environment } from '../../../environments/environment';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  const mockEmployees: Employee[] = [
    {
      employeeId: 1,
      employeeCode: 'EMP001',
      fullName: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Information Technology',
      designation: 'Senior Software Engineer',
      joiningDate: '2023-01-15',
      isActive: true
    },
    {
      employeeId: 2,
      employeeCode: 'EMP002',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@company.com',
      department: 'Human Resources',
      designation: 'HR Specialist',
      joiningDate: '2023-05-20',
      isActive: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created successfully', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all employees via GET request', () => {
    service.getEmployees().subscribe((employees) => {
      expect(employees.length).toBe(2);
      expect(employees).toEqual(mockEmployees);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEmployees);
  });

  it('should retrieve an employee by ID via GET request', () => {
    const singleEmp = mockEmployees[0];

    service.getEmployeeById(1).subscribe((emp) => {
      expect(emp).toEqual(singleEmp);
      expect(emp.employeeCode).toBe('EMP001');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees/1`);
    expect(req.request.method).toBe('GET');
    req.flush(singleEmp);
  });

  it('should send a POST request to create a new employee', () => {
    const newEmployee: Employee = {
      employeeCode: 'EMP003',
      fullName: 'Alice Walker',
      email: 'alice.w@company.com',
      department: 'Finance & Accounting',
      designation: 'Financial Analyst',
      joiningDate: '2024-02-01',
      isActive: true
    };

    const savedEmployee: Employee = { ...newEmployee, employeeId: 3 };

    service.createEmployee(newEmployee).subscribe((created) => {
      expect(created.employeeId).toBe(3);
      expect(created.fullName).toBe('Alice Walker');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEmployee);
    req.flush(savedEmployee);
  });

  it('should send a PUT request to update an existing employee', () => {
    const updatedData: Employee = { ...mockEmployees[0], designation: 'Lead Architect' };

    service.updateEmployee(1, updatedData).subscribe((emp) => {
      expect(emp.designation).toBe('Lead Architect');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedData);
    req.flush(updatedData);
  });

  it('should send a DELETE request to remove an employee', () => {
    service.deleteEmployee(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/employees/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

