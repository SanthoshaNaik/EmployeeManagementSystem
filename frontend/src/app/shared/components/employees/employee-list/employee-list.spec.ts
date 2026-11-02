import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EmployeeList } from './employee-list';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';

describe('EmployeeList Component', () => {
  let component: EmployeeList;
  let fixture: ComponentFixture<EmployeeList>;
  let employeeService: EmployeeService;

  const mockEmployees: Employee[] = [
    {
      id: 101,
      EmployeeCode: 'EMP101',
      FullName: 'Michael Scott',
      Email: 'michael.s@company.com',
      Department: 'Management',
      Designation: 'Regional Manager',
      JoiningDate: '2021-04-01',
      ActiveStatus: true
    },
    {
      id: 102,
      EmployeeCode: 'EMP102',
      FullName: 'Pam Beesly',
      Email: 'pam.b@company.com',
      Department: 'Human Resources',
      Designation: 'Office Administrator',
      JoiningDate: '2022-08-15',
      ActiveStatus: true
    },
    {
      id: 103,
      EmployeeCode: 'EMP103',
      FullName: 'Dwight Schrute',
      Email: 'dwight.s@company.com',
      Department: 'Marketing & Sales',
      Designation: 'Assistant Regional Manager',
      JoiningDate: '2021-06-01',
      ActiveStatus: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeList],
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService);
    // Mock getEmployees response
    vi.spyOn(employeeService, 'getEmployees').mockReturnValue(of(mockEmployees));

    fixture = TestBed.createComponent(EmployeeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the EmployeeList component', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees on initialization', () => {
    expect(component.employees.length).toBe(3);
    expect(component.isLoading).toBe(false);
  });

  it('should search and filter employees by Full Name', () => {
    component.searchTerm = 'Michael';
    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].FullName).toBe('Michael Scott');
  });

  it('should search and filter employees by Employee Code', () => {
    component.searchTerm = 'EMP102';
    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].EmployeeCode).toBe('EMP102');
  });

  it('should filter employees by active/inactive status', () => {
    component.selectedStatus = 'active';
    expect(component.filteredEmployees.length).toBe(2);

    component.selectedStatus = 'inactive';
    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].FullName).toBe('Dwight Schrute');
  });

  it('should delete an employee when user confirms deletion', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteSpy = vi.spyOn(employeeService, 'deleteEmployee').mockReturnValue(of(undefined as unknown as void));

    component.confirmDelete(mockEmployees[0]);

    expect(deleteSpy).toHaveBeenCalledWith(101);
    expect(component.employees.length).toBe(2);
    expect(component.successMessage).toContain('Michael Scott');
  });
});
