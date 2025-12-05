const { unpackRelational } = require('../common/relational.helper');

class ExpensesAdapter {
  toDTO(record) {
    if (!record) return null;

    const employee = unpackRelational(record.employee_id);

    return {
      id: record.id,
      name: record.name,
      employeeId: employee.id,
      employeeName: employee.name,
      total: record.total_amount,
      state: record.state,
      paymentState: record.payment_state,
      date: record.date,
      createdAt: record.create_date
    };
  }

  toDTOArray(records) {
    return Array.isArray(records) ? records.map((rec) => this.toDTO(rec)) : [];
  }

  toOdooFormat(data) {
    if (!data) return null;

    return {
      name: data.name,
      employee_id: data.employeeId,
      total_amount: data.total,
      state: data.state,
      payment_state: data.paymentState,
      date: data.date
    };
  }
}

module.exports = ExpensesAdapter;
