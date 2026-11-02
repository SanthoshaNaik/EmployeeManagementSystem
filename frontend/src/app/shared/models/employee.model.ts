export interface Employee {
  EmployeeId?: number;
  id?: string | number;
  EmployeeCode: string;
  FullName: string;
  Email: string;
  Department: string;
  Designation: string;
  JoiningDate: string;
  ActiveStatus: boolean;
}

export const DEPARTMENTS = [
  'Information Technology',
  'Human Resources',
  'Finance & Accounting',
  'Marketing & Sales',
  'Operations',
  'Quality Assurance'
] as const;

export type Department = (typeof DEPARTMENTS)[number];
