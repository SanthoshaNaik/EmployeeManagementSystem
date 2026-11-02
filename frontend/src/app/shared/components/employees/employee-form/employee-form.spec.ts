
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EmployeeForm } from './employee-form';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';

describe('EmployeeForm Component', () => {

  let component: EmployeeForm;
  let fixture: ComponentFixture<EmployeeForm>;
  let employeeService: EmployeeService;
  let router: Router;

  // Mock employee data
  const mockEmployee: Employee = {
    id: 5,
    EmployeeCode: 'EMP005',
    FullName: 'David Wallace',
    Email: 'david.w@company.com',
    Department: 'Operations',
    Designation: 'CFO',
    JoiningDate: '2020-03-10',
    ActiveStatus: true
  };

  // Mock service
  const employeeServiceMock = {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn()
  };

  // Valid form data
  const validForm = {
    employeeCode: 'EMP006',
    fullName: 'Jim Halpert',
    email: 'jim.h@company.com',
    department: 'Marketing & Sales',
    designation: 'Sales Representative',
    joiningDate: '2023-01-10',
    isActive: true
  };

  // Helper method to fill the form
  function fillForm(data = validForm) {
    component.employeeForm.setValue(data);
  }

  beforeEach(async () => {

    vi.clearAllMocks();

    // Default API responses
    employeeServiceMock.getEmployees.mockReturnValue(of([]));
    employeeServiceMock.getEmployeeById.mockReturnValue(of(mockEmployee));
    employeeServiceMock.createEmployee.mockReturnValue(of(mockEmployee));
    employeeServiceMock.updateEmployee.mockReturnValue(of(mockEmployee));

    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [
        provideRouter([
          { path: 'employees', children: [] }
        ]),
        {
          provide: EmployeeService,
          useValue: employeeServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
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

  afterEach(() => {
    component?.clearErrorMessage();
  });

  // 1. COMPONENT CREATION

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBe(false);
  });

  // 2. FORM VALIDATION

  it('should validate required fields', () => {
    component.employeeForm.reset();

    expect(component.employeeForm.invalid).toBe(true);

    Object.values(component.employeeForm.controls).forEach(control => {
      expect(control.hasError('required')).toBe(true);
    });
  });

  it('should validate employee name', () => {
    const name = component.employeeForm.controls['fullName'];

    name.setValue('John123');
    expect(name.hasError('hasNumbers')).toBe(true);

    name.setValue('Al');
    expect(name.hasError('minlength')).toBe(true);

    name.setValue('John Doe');
    expect(name.valid).toBe(true);
  });

  it('should reject invalid email', () => {
    const email = component.employeeForm.controls['email'];

    email.setValue('invalid-email');
    expect(email.hasError('email')).toBe(true);
  });

  it('should accept valid email', () => {
    const email = component.employeeForm.controls['email'];

    email.setValue('john@company.com');
    expect(email.valid).toBe(true);
  });

  it('should validate employee code', () => {
    const code = component.employeeForm.controls['employeeCode'];

    code.setValue('AB');
    expect(code.hasError('minlength')).toBe(true);

    code.setValue('EMP 01');
    expect(code.hasError('codeSpaces')).toBe(true);

    code.setValue('EMPABC');
    expect(code.hasError('missingDigit')).toBe(true);

    code.setValue('EMP@123');
    expect(code.hasError('pattern')).toBe(true);
  });

  it('should reject duplicate employee codes', () => {
    component.existingEmployees = [
      mockEmployee
    ];

    const code = component.employeeForm.controls['employeeCode'];

    code.setValue('EMP005');

    expect(code.hasError('codeTaken')).toBe(true);
  });

  it('should reject duplicate email addresses', () => {
    component.existingEmployees = [
      mockEmployee
    ];

    const email = component.employeeForm.controls['email'];

    email.setValue('DAVID.W@COMPANY.COM');

    expect(email.hasError('emailTaken')).toBe(true);
  });

  // 3. FORM SUBMISSION VALIDATION

  it('should mark all fields as touched when form is invalid', () => {
    const errorSpy = vi.spyOn(component, 'showErrorPopup');

    component.employeeForm.reset();
    component.onSubmit();

    Object.values(component.employeeForm.controls).forEach(control => {
      expect(control.touched).toBe(true);
    });

    expect(errorSpy).toHaveBeenCalled();
  });

  it('should not submit an invalid form', () => {
    component.employeeForm.reset();
    component.onSubmit();

    expect(employeeService.createEmployee).not.toHaveBeenCalled();
  });

  // 4. CREATE EMPLOYEE

  it('should create an employee successfully', () => {
    const createSpy = vi.spyOn(employeeService, 'createEmployee');
    const navigateSpy = vi.spyOn(router, 'navigate');

    fillForm();
    component.onSubmit();

    expect(createSpy).toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should normalize employee data before saving', () => {
    const createSpy = vi.spyOn(employeeService, 'createEmployee');

    fillForm({
      ...validForm,
      employeeCode: 'emp006',
      fullName: '  Jim Halpert  ',
      email: 'JIM.H@COMPANY.COM',
      designation: '  Sales Representative  '
    });

    component.onSubmit();

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        EmployeeCode: 'EMP006',
        FullName: 'Jim Halpert',
        Email: 'jim.h@company.com',
        Designation: 'Sales Representative'
      })
    );
  });

  it('should handle employee creation failure', () => {
    vi.spyOn(employeeService, 'createEmployee').mockReturnValue(
      throwError(() => new Error('Server error'))
    );

    const errorSpy = vi.spyOn(component, 'showErrorPopup');

    fillForm();
    component.onSubmit();

    expect(component.isSubmitting).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to create employee record.'
    );
  });

  // 5. UPDATE EMPLOYEE

  it('should update an employee successfully', () => {
    component.isEditMode = true;
    component.employeeId = 5;

    const updateSpy = vi.spyOn(employeeService, 'updateEmployee');
    const navigateSpy = vi.spyOn(router, 'navigate');

    fillForm({
      ...validForm,
      employeeCode: 'EMP005',
      fullName: 'David Wallace',
      email: 'david.w@company.com'
    });

    component.onSubmit();

    expect(updateSpy).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        id: 5,
        EmployeeCode: 'EMP005'
      })
    );

    expect(component.isSubmitting).toBe(false);
    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should handle employee update failure', () => {
    component.isEditMode = true;
    component.employeeId = 5;

    vi.spyOn(employeeService, 'updateEmployee').mockReturnValue(
      throwError(() => new Error('Server error'))
    );

    const errorSpy = vi.spyOn(component, 'showErrorPopup');

    fillForm({
      ...validForm,
      employeeCode: 'EMP005',
      fullName: 'David Wallace',
      email: 'david.w@company.com'
    });

    component.onSubmit();

    expect(component.isSubmitting).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to update employee details.'
    );
  });

  // 6. LOAD EMPLOYEE DETAILS

  it('should load employee details successfully', () => {
    const getSpy = vi.spyOn(employeeService, 'getEmployeeById');

    component.loadEmployee('5');

    expect(getSpy).toHaveBeenCalledWith('5');
    expect(component.employeeForm.controls['fullName'].value)
      .toBe('David Wallace');

    expect(component.isLoading).toBe(false);
  });

  it('should handle employee loading failure', () => {
    vi.spyOn(employeeService, 'getEmployeeById').mockReturnValue(
      throwError(() => new Error('Server error'))
    );

    const errorSpy = vi.spyOn(component, 'showErrorPopup');

    component.loadEmployee('5');

    expect(component.isLoading).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      'Unable to load employee details.'
    );
  });

  // 7. CANCEL

  it('should navigate to employee list when cancel is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/employees']);
  });

});
