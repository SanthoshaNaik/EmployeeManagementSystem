import { SearchPipe } from './search.pipe';
import { Employee } from '../models/employee.model';

describe('SearchPipe', () => {
  let pipe: SearchPipe;

  const mockEmployees: Employee[] = [
    {
      id: 1,
      EmployeeCode: 'EMP001',
      FullName: 'Michael Scott',
      Email: 'michael.s@company.com',
      Department: 'Marketing & Sales',
      Designation: 'Regional Manager',
      JoiningDate: '2020-01-15',
      ActiveStatus: true
    },
    {
      id: 2,
      EmployeeCode: 'EMP002',
      FullName: 'Dwight Schrute',
      Email: 'dwight.s@company.com',
      Department: 'Marketing & Sales',
      Designation: 'Assistant to the Regional Manager',
      JoiningDate: '2021-03-20',
      ActiveStatus: false
    },
    {
      id: 3,
      EmployeeCode: 'EMP003',
      FullName: 'Jim Halpert',
      Email: 'jim.h@company.com',
      Department: 'Information Technology',
      Designation: 'Software Engineer',
      JoiningDate: '2022-07-10',
      ActiveStatus: true
    }
  ];

  beforeEach(() => {
    pipe = new SearchPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return all employees when no search term or filters are provided', () => {
    const result = pipe.transform(mockEmployees, '', '', '');
    expect(result.length).toBe(3);
  });

  it('should filter employees by full name', () => {
    const result = pipe.transform(mockEmployees, 'Michael');
    expect(result.length).toBe(1);
    expect(result[0].FullName).toBe('Michael Scott');
  });

  it('should filter employees by employee code', () => {
    const result = pipe.transform(mockEmployees, 'EMP003');
    expect(result.length).toBe(1);
    expect(result[0].FullName).toBe('Jim Halpert');
  });

  it('should filter employees by designation', () => {
    const result = pipe.transform(mockEmployees, 'Software Engineer');
    expect(result.length).toBe(1);
    expect(result[0].FullName).toBe('Jim Halpert');
  });

  it('should filter employees by department', () => {
    const result = pipe.transform(mockEmployees, '', 'Information Technology', '');
    expect(result.length).toBe(1);
    expect(result[0].FullName).toBe('Jim Halpert');
  });

  it('should filter employees by active status', () => {
    const result = pipe.transform(mockEmployees, '', '', 'active');
    expect(result.length).toBe(2);
  });

  it('should filter employees by inactive status', () => {
    const result = pipe.transform(mockEmployees, '', '', 'inactive');
    expect(result.length).toBe(1);
    expect(result[0].FullName).toBe('Dwight Schrute');
  });

  it('should return empty array when employees list is empty or undefined', () => {
    expect(pipe.transform([] as any, 'test')).toEqual([]);
    expect(pipe.transform(null as any, 'test')).toEqual([]);
  });
});
