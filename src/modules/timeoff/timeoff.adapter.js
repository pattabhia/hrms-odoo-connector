const { unpackRelational } = require('../common/relational.helper');

class TimeOffAdapter {
  toDTO(record) {
    if (!record) return null;

    const employee = unpackRelational(record.employee_id);
    const type = unpackRelational(record.holiday_status_id);

    return {
      id: record.id,
      employeeId: employee.id,
      employeeName: employee.name,
      typeId: type.id,
      typeName: type.name,
      dateFrom: record.date_from,
      dateTo: record.date_to,
      days: record.number_of_days,
      state: record.state,
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
      holiday_status_id: data.typeId,
      date_from: data.dateFrom,
      date_to: data.dateTo,
      number_of_days: data.days,
      state: data.state
    };
  }
}

module.exports = TimeOffAdapter;
