const Employee = require('./employee.model');

/**
 * Employee Adapter
 * Implements Adapter Pattern to transform data between Odoo and internal formats
 * Handles the impedance mismatch between Odoo's data structure and our DTOs
 */
class EmployeeAdapter {
  /**
   * Convert Odoo employee format to our DTO format
   * @param {Object} odooEmployee - Employee data from Odoo
   * @returns {Employee} Employee DTO
   */
  toDTO(odooEmployee) {
    if (!odooEmployee) {
      return null;
    }

    return new Employee({
      id: odooEmployee.id,
      name: odooEmployee.name,
      email: odooEmployee.work_email || '',
      phone: odooEmployee.work_phone || '',
      mobile: odooEmployee.mobile_phone || '',

      // Odoo relational fields come as [id, name] arrays
      jobTitle: odooEmployee.job_id ? odooEmployee.job_id[1] : null,
      jobId: odooEmployee.job_id ? odooEmployee.job_id[0] : null,

      department: odooEmployee.department_id ? odooEmployee.department_id[1] : null,
      departmentId: odooEmployee.department_id ? odooEmployee.department_id[0] : null,

      manager: odooEmployee.parent_id ? odooEmployee.parent_id[1] : null,
      managerId: odooEmployee.parent_id ? odooEmployee.parent_id[0] : null,

      workLocation: odooEmployee.work_location || '',
      joinDate: odooEmployee.join_date || null,
      active: odooEmployee.active !== undefined ? odooEmployee.active : true,

      createdAt: odooEmployee.create_date || null,
      updatedAt: odooEmployee.write_date || null
    });
  }

  /**
   * Convert our DTO format to Odoo format
   * @param {Object} employeeDTO - Employee data in our format
   * @returns {Object} Employee data in Odoo format
   */
  toOdooFormat(employeeDTO) {
    if (!employeeDTO) {
      return null;
    }

    const odooData = {
      name: employeeDTO.name,
      active: employeeDTO.active !== undefined ? employeeDTO.active : true
    };

    // Only include fields that are provided
    if (employeeDTO.email !== undefined) {
      odooData.work_email = employeeDTO.email;
    }

    if (employeeDTO.phone !== undefined) {
      odooData.work_phone = employeeDTO.phone;
    }

    if (employeeDTO.mobile !== undefined) {
      odooData.mobile_phone = employeeDTO.mobile;
    }

    if (employeeDTO.workLocation !== undefined) {
      odooData.work_location = employeeDTO.workLocation;
    }

    if (employeeDTO.joinDate !== undefined) {
      odooData.join_date = employeeDTO.joinDate;
    }

    // Handle relational fields - Odoo expects just the ID
    if (employeeDTO.jobId !== undefined && employeeDTO.jobId !== null) {
      odooData.job_id = employeeDTO.jobId;
    }

    if (employeeDTO.departmentId !== undefined && employeeDTO.departmentId !== null) {
      odooData.department_id = employeeDTO.departmentId;
    }

    if (employeeDTO.managerId !== undefined && employeeDTO.managerId !== null) {
      odooData.parent_id = employeeDTO.managerId;
    }

    return odooData;
  }

  /**
   * Convert array of Odoo employees to DTOs
   * @param {Array} odooEmployees - Array of Odoo employees
   * @returns {Array} Array of Employee DTOs
   */
  toDTOArray(odooEmployees) {
    if (!Array.isArray(odooEmployees)) {
      return [];
    }

    return odooEmployees.map((emp) => this.toDTO(emp));
  }

  /**
   * Convert array of DTOs to Odoo format
   * @param {Array} employeeDTOs - Array of employee DTOs
   * @returns {Array} Array in Odoo format
   */
  toOdooFormatArray(employeeDTOs) {
    if (!Array.isArray(employeeDTOs)) {
      return [];
    }

    return employeeDTOs.map((emp) => this.toOdooFormat(emp));
  }
}

module.exports = EmployeeAdapter;
