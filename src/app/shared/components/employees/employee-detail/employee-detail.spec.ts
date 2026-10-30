import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EmployeeDetail } from './employee-detail';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';

describe('EmployeeDetail Component', () => {
  let component: EmployeeDetail;
  let fixture: ComponentFixture<EmployeeDetail>;
  let employeeService: EmployeeService;
  let router: Router;

  const mockEmployee: Employee = {
    employeeId: 201,
    employeeCode: 'EMP201',
    fullName: 'Stanley Hudson',
    email: 'stanley.h@company.com',
    department: 'Marketing & Sales',
    designation: 'Sales Representative',
    joiningDate: '2022-02-14',
    isActive: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDetail],
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '201'
              }
            }
          }
        }
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService);
    router = TestBed.inject(Router);
    vi.spyOn(employeeService, 'getEmployeeById').mockReturnValue(of(mockEmployee));

    fixture = TestBed.createComponent(EmployeeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the EmployeeDetail component', () => {
    expect(component).toBeTruthy();
  });

  it('should load employee data based on route id parameter', () => {
    expect(component.employee).toEqual(mockEmployee);
    expect(component.isLoading).toBe(false);
  });

  it('should invoke delete and navigate to /employees on confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteSpy = vi.spyOn(employeeService, 'deleteEmployee').mockReturnValue(of(undefined as unknown as void));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.deleteCurrentEmployee();

    expect(deleteSpy).toHaveBeenCalledWith(201);
    expect(navigateSpy).toHaveBeenCalledWith(['/employees'], expect.anything());
  });
});

