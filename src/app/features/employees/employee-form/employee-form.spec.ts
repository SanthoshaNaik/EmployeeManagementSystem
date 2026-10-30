import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EmployeeForm } from './employee-form';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';

describe('EmployeeForm Component', () => {
  let component: EmployeeForm;
  let fixture: ComponentFixture<EmployeeForm>;
  let employeeService: EmployeeService;
  let router: Router;

  const mockEmployee: Employee = {
    employeeId: 5,
    employeeCode: 'EMP005',
    fullName: 'David Wallace',
    email: 'david.w@company.com',
    department: 'Operations',
    designation: 'CFO',
    joiningDate: '2020-03-10',
    isActive: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
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
                get: (key: string) => null // default add mode
              }
            }
          }
        }
      ]
    }).compileComponents();

    employeeService = TestBed.inject(EmployeeService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(EmployeeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the EmployeeForm component', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBe(false);
  });

  it('should mark form as invalid when required fields are empty', () => {
    component.employeeForm.controls['employeeCode'].setValue('');
    component.employeeForm.controls['fullName'].setValue('');
    component.employeeForm.controls['email'].setValue('');
    component.employeeForm.controls['department'].setValue('');
    component.employeeForm.controls['designation'].setValue('');
    component.employeeForm.controls['joiningDate'].setValue('');

    expect(component.employeeForm.valid).toBe(false);
    expect(component.employeeForm.controls['employeeCode'].hasError('required')).toBe(true);
    expect(component.employeeForm.controls['fullName'].hasError('required')).toBe(true);
    expect(component.employeeForm.controls['email'].hasError('required')).toBe(true);
  });

  it('should validate email format correctly', () => {
    const emailControl = component.employeeForm.controls['email'];

    emailControl.setValue('invalid-email-address');
    expect(emailControl.hasError('email')).toBe(true);

    emailControl.setValue('valid.employee@company.com');
    expect(emailControl.hasError('email')).toBe(false);
  });

  it('should call createEmployee on service when submitting valid form in Add mode', () => {
    const createSpy = vi.spyOn(employeeService, 'createEmployee').mockReturnValue(of({ ...mockEmployee, employeeId: 6 }));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.employeeForm.setValue({
      employeeCode: 'EMP006',
      fullName: 'Jim Halpert',
      email: 'jim.h@company.com',
      department: 'Marketing & Sales',
      designation: 'Sales Representative',
      joiningDate: '2023-01-10',
      isActive: true
    });

    component.onSubmit();

    expect(createSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/employees'], expect.anything());
  });

  it('should call updateEmployee on service when submitting valid form in Edit mode', () => {
    component.isEditMode = true;
    component.employeeId = 5;

    const updateSpy = vi.spyOn(employeeService, 'updateEmployee').mockReturnValue(of(mockEmployee));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.employeeForm.setValue({
      employeeCode: 'EMP005',
      fullName: 'David Wallace',
      email: 'david.w@company.com',
      department: 'Operations',
      designation: 'Chief Financial Officer',
      joiningDate: '2020-03-10',
      isActive: true
    });

    component.onSubmit();

    expect(updateSpy).toHaveBeenCalledWith(5, expect.objectContaining({
      employeeId: 5,
      fullName: 'David Wallace'
    }));
    expect(navigateSpy).toHaveBeenCalledWith(['/employees'], expect.anything());
  });
});

