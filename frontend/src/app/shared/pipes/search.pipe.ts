
import { Pipe, PipeTransform } from '@angular/core';
import { Employee } from '../models/employee.model';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {

  transform(
    employees: Employee[],
    searchTerm: string = '',
    department: string = '',
    status: string = ''
  ): Employee[] {

    if (!employees || !Array.isArray(employees)) {
      return [];
    }

    const query = (searchTerm || '').trim().toLowerCase();
    const selectedDepartment = (department || '').trim();
    const selectedStatus = (status || '').trim().toLowerCase();

    return employees.filter((employee) => {

      const fullName = (employee.FullName || '').toLowerCase();
      const employeeCode = (employee.EmployeeCode || '').toLowerCase();
      const designation = (employee.Designation || '').toLowerCase();

      const departmentValue = employee.Department || '';
      const isActive = employee.ActiveStatus;

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        employeeCode.includes(query) ||
        designation.includes(query);

      const matchesDepartment =
        !selectedDepartment ||
        departmentValue === selectedDepartment;

      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === 'active' && isActive === true) ||
        (selectedStatus === 'inactive' && isActive === false);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }
}
