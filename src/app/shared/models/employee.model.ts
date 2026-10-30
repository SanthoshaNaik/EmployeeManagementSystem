export interface Employee {
  id?: string | number;
  employeeId?: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  isActive: boolean;
}

export const DEPARTMENTS = [
  'Information Technology',
  'Human Resources',
  'Finance & Accounting',
  'Marketing & Sales',
  'Operations',
  'Quality Assurance'
] as const;