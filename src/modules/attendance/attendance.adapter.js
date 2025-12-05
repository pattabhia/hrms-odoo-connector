const { unpackRelational } = require('../common/relational.helper');

class AttendanceAdapter {
  toDTO(record) {
    if (!record) return null;

    const employee = unpackRelational(record.employee_id);

    return {
      id: record.id,
      employeeId: employee.id,
      employeeName: employee.name,
      checkIn: record.check_in,
      checkOut: record.check_out,
      workedHours: record.worked_hours,
      createdAt: record.create_date
    };
  }

  toDTOArray(records) {
    return Array.isArray(records) ? records.map((rec) => this.toDTO(rec)) : [];
  }

  toOdooFormat(data) {
    if (!data) return null;

    return {
      employee_id: data.employeeId,
      check_in: data.checkIn,
      check_out: data.checkOut
    };
  }
}

module.exports = AttendanceAdapter;
