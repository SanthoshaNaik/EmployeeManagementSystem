/**
 * Employee Data Model
 * Represents the Employee entity exchanged between Angular and the ASP.NET Core Web API.
 */
export interface Employee {
  id?: number;
  employeeId?: number;       // Auto-generated primary key (identity)
  employeeCode: string;      // Unique employee identification code (e.g. EMP001)
  fullName: string;          // Employee's full name
  email: string;             // Corporate email address
  department: string;        // Department (e.g., Information Technology, Human Resources)
  designation: string;       // Job title / role (e.g., Software Engineer, HR Manager)
  joiningDate: string;       // Date of joining formatted as YYYY-MM-DD
  isActive: boolean;         // Current active employment status
}

/**
 * Standard department options for form selection and filtering
 */
export const DEPARTMENTS = [
  'Information Technology',
  'Human Resources',
  'Finance & Accounting',
  'Marketing & Sales',
  'Operations',
  'Quality Assurance'
] as const;

