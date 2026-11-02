import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../models/employee.model';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let employeeService: EmployeeService;

  const mockEmployees: Employee[] = [
    {
      id: 1,
      EmployeeCode: 'EMP001',
      FullName: 'Alice Smith',
      Email: 'alice@company.com',
      Department: 'Information Technology',
      Designation: 'Tech Lead',
      JoiningDate: '2022-01-01',
      ActiveStatus: true
    },
    {
      id: 2,
      EmployeeCode: 'EMP002',
      FullName: 'Bob Martin',
      Email: 'bob@company.com',
      Department: 'Human Resources',
      Designation: 'Recruiter',
      JoiningDate: '2023-03-15',
      ActiveStatus: false
    },
    {
      id: 3,
      EmployeeCode: 'EMP003',
      FullName: 'Charlie Brown',
      Email: 'charlie@company.com',
      Department: 'Information Technology',
      Designation: 'DevOps Engineer',
      JoiningDate: '2023-06-20',
      ActiveStatus: true
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService);
    vi.spyOn(employeeService, 'getEmployees').mockReturnValue(of(mockEmployees));

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate metrics properly from employee records', () => {
    expect(component.totalEmployees).toBe(3);
    expect(component.activeEmployees).toBe(2);
    expect(component.inactiveEmployees).toBe(1);
    expect(component.departmentCount).toBe(2); // IT and HR
  });

  it('should extract recent employees properly', () => {
    expect(component.recentEmployees.length).toBe(3);
    expect(component.recentEmployees[0].EmployeeCode).toBe('EMP003'); // reversed
  });
});
