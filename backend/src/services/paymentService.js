import pool from '../db/pool.js';
import { softDelete } from '../utils/helpers.js';

export const getPaymentsByInvoice = async (invoiceId) => {
  const [payments] = await pool.execute(
    'SELECT * FROM payments WHERE invoice_id = ? AND is_deleted = 0 ORDER BY created_at',
    [invoiceId]
  );
  return payments;
};

export const createPayment = async (paymentData) => {
  const { invoiceId, amount, paymentMethod, paymentReference, notes } = paymentData;
  
  // Validate payment amount > 0
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  
  // Get invoice details
  const [invoices] = await pool.execute(
    'SELECT id, total, status FROM invoices WHERE id = ? AND is_deleted = 0',
    [invoiceId]
  );
  
  if (invoices.length === 0) {
    throw new Error('Invoice not found');
  }
  
  const invoice = invoices[0];
  
  if (invoice.status === 'Voided') {
    throw new Error('Cannot add payment to voided invoice');
  }
  
  // Calculate total payments so far
  const [paymentResult] = await pool.execute(
    'SELECT IFNULL(SUM(amount), 0) as total_paid FROM payments WHERE invoice_id = ? AND is_deleted = 0',
    [invoiceId]
  );
  
  const totalPaid = parseFloat(paymentResult[0].total_paid);
  const newTotal = totalPaid + parseFloat(amount);
  
  // Validate total payments don't exceed invoice total
  if (newTotal > invoice.total) {
    throw new Error(`Payment amount exceeds invoice balance. Balance: $${(invoice.total - totalPaid).toFixed(2)}`);
  }
  
  // Create payment
  const [result] = await pool.execute(
    `INSERT INTO payments (invoice_id, amount, payment_method, payment_reference, notes) 
     VALUES (?, ?, ?, ?, ?)`,
    [invoiceId, amount, paymentMethod, paymentReference, notes]
  );
  
  // Update invoice status
  let newStatus = 'Issued';
  if (newTotal >= invoice.total) {
    newStatus = 'Paid';
  } else if (newTotal > 0) {
    newStatus = 'PartiallyPaid';
  }
  
  await pool.execute(
    'UPDATE invoices SET status = ? WHERE id = ?',
    [newStatus, invoiceId]
  );
  
  const [payment] = await pool.execute(
    'SELECT * FROM payments WHERE id = ?',
    [result.insertId]
  );
  
  return payment[0];
};

export const deletePayment = async (id) => {
  // Get payment details
  const [payments] = await pool.execute(
    'SELECT invoice_id, amount FROM payments WHERE id = ? AND is_deleted = 0',
    [id]
  );
  
  if (payments.length === 0) {
    throw new Error('Payment not found');
  }
  
  const payment = payments[0];
  
  // Soft delete payment
  const deleted = await softDelete(pool, 'payments', id);
  
  if (!deleted) {
    throw new Error('Payment not found');
  }
  
  // Recalculate invoice status
  const [invoice] = await pool.execute(
    'SELECT id, total FROM invoices WHERE id = ?',
    [payment.invoice_id]
  );
  
  const [paymentResult] = await pool.execute(
    'SELECT IFNULL(SUM(amount), 0) as total_paid FROM payments WHERE invoice_id = ? AND is_deleted = 0',
    [payment.invoice_id]
  );
  
  const totalPaid = parseFloat(paymentResult[0].total_paid);
  let newStatus = 'Issued';
  
  if (totalPaid >= invoice[0].total) {
    newStatus = 'Paid';
  } else if (totalPaid > 0) {
    newStatus = 'PartiallyPaid';
  }
  
  await pool.execute(
    'UPDATE invoices SET status = ? WHERE id = ?',
    [newStatus, payment.invoice_id]
  );
  
  return { message: 'Payment deleted successfully' };
};
