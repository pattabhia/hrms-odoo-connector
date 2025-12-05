const { unpackRelational } = require('../common/relational.helper');

class PayrollAdapter {
  toDTO(record) {
    if (!record) return null;

    const employee = unpackRelational(record.employee_id);

    return {
      id: record.id,
      number: record.number,
      employeeId: employee.id,
      employeeName: employee.name,
      dateFrom: record.date_from,
      dateTo: record.date_to,
      state: record.state,
      total: record.amount_total,
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
      date_from: data.dateFrom,
      date_to: data.dateTo,
      state: data.state
    };
  }
}

module.exports = PayrollAdapter;
