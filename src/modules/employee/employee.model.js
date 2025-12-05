/**
 * Employee Model
 * Defines the structure and types for Employee data
 * This is our internal representation (DTO)
 */

class Employee {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.mobile = data.mobile || '';
    this.jobTitle = data.jobTitle || null;
    this.jobId = data.jobId || null;
    this.department = data.department || null;
    this.departmentId = data.departmentId || null;
    this.manager = data.manager || null;
    this.managerId = data.managerId || null;
    this.workLocation = data.workLocation || '';
    this.joinDate = data.joinDate || null;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Validate employee data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    }

    if (this.email && !this._isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (this.phone && !this._isValidPhone(this.phone)) {
      errors.push('Invalid phone format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   * @private
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   * @private
   * @param {string} phone - Phone to validate
   * @returns {boolean} Validation result
   */
  _isValidPhone(phone) {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Convert to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      mobile: this.mobile,
      jobTitle: this.jobTitle,
      jobId: this.jobId,
      department: this.department,
      departmentId: this.departmentId,
      manager: this.manager,
      managerId: this.managerId,
      workLocation: this.workLocation,
      joinDate: this.joinDate,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Employee;
