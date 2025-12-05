const { unpackRelational } = require('../common/relational.helper');

class InvoicesAdapter {
  toDTO(record) {
    if (!record) return null;

    const customer = unpackRelational(record.partner_id);

    return {
      id: record.id,
      name: record.name,
      customerId: customer.id,
      customerName: customer.name,
      invoiceDate: record.invoice_date,
      dueDate: record.invoice_date_due,
      amountTotal: record.amount_total,
      paymentState: record.payment_state,
      state: record.state,
      moveType: record.move_type
    };
  }

  toDTOArray(records) {
    return Array.isArray(records) ? records.map((rec) => this.toDTO(rec)) : [];
  }

  toOdooFormat(data) {
    if (!data) return null;

    return {
      name: data.name,
      partner_id: data.customerId,
      invoice_date: data.invoiceDate,
      invoice_date_due: data.dueDate,
      amount_total: data.amountTotal,
      payment_state: data.paymentState,
      state: data.state,
      move_type: data.moveType
    };
  }
}

module.exports = InvoicesAdapter;
