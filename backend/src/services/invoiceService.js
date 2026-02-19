import pool from '../db/pool.js';
import { softDelete, generateInvoiceNumber, calculateInvoiceTotal } from '../utils/helpers.js';

export const getInvoiceByWorkOrder = async (workOrderId) => {
  const [invoices] = await pool.execute(
    `SELECT i.*, wo.work_order_number, wo.vehicle_id,
            v.vin, v.make, v.model, v.year,
            c.first_name, c.last_name, c.phone, c.email,
            u.full_name as voided_by_name
     FROM invoices i
     JOIN work_orders wo ON i.work_order_id = wo.id
     JOIN vehicles v ON wo.vehicle_id = v.id
     JOIN customers c ON wo.customer_id = c.id
     LEFT JOIN users u ON i.voided_by_user_id = u.id
     WHERE i.work_order_id = ? AND i.is_deleted = 0`,
    [workOrderId]
  );
  
  if (invoices.length === 0) {
    return null;
  }
  
  // Get payments for this invoice
  const [payments] = await pool.execute(
    'SELECT * FROM payments WHERE invoice_id = ? AND is_deleted = 0 ORDER BY created_at',
    [invoices[0].id]
  );
  
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  return {
    ...invoices[0],
    payments,
    totalPaid: parseFloat(totalPaid.toFixed(2)),
    balance: parseFloat((invoices[0].total - totalPaid).toFixed(2))
  };
};

export const getInvoiceById = async (id) => {
  const [invoices] = await pool.execute(
    `SELECT i.*, wo.work_order_number, wo.vehicle_id,
            v.vin, v.make, v.model, v.year,
            c.first_name, c.last_name, c.phone, c.email,
            u.full_name as voided_by_name
     FROM invoices i
     JOIN work_orders wo ON i.work_order_id = wo.id
     JOIN vehicles v ON wo.vehicle_id = v.id
     JOIN customers c ON wo.customer_id = c.id
     LEFT JOIN users u ON i.voided_by_user_id = u.id
     WHERE i.id = ? AND i.is_deleted = 0`,
    [id]
  );
  
  if (invoices.length === 0) {
    throw new Error('Invoice not found');
  }
  
  // Get payments
  const [payments] = await pool.execute(
    'SELECT * FROM payments WHERE invoice_id = ? AND is_deleted = 0 ORDER BY created_at',
    [id]
  );
  
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  return {
    ...invoices[0],
    payments,
    totalPaid: parseFloat(totalPaid.toFixed(2)),
    balance: parseFloat((invoices[0].total - totalPaid).toFixed(2))
  };
};

export const createInvoice = async (workOrderId, invoiceData) => {
  // Check if invoice already exists for this work order
  const existing = await getInvoiceByWorkOrder(workOrderId);
  if (existing) {
    throw new Error('Invoice already exists for this work order');
  }
  
  // Calculate labor subtotal
  const [laborResult] = await pool.execute(
    `SELECT 
       SUM(sl.labor_rate * IFNULL((
         SELECT SUM(TIMESTAMPDIFF(SECOND, lte.start_time, lte.end_time)) / 3600
         FROM labor_time_entries lte
         WHERE lte.service_line_id = sl.id AND lte.end_time IS NOT NULL AND lte.is_deleted = 0
       ), sl.estimated_hours)) as labor_total
     FROM service_lines sl
     WHERE sl.work_order_id = ? AND sl.is_deleted = 0`,
    [workOrderId]
  );
  
  // Calculate parts subtotal
  const [partsResult] = await pool.execute(
    `SELECT SUM(quantity * cost_at_time_of_use) as parts_total
     FROM parts_used
     WHERE work_order_id = ? AND is_deleted = 0`,
    [workOrderId]
  );
  
  const subtotalLabor = parseFloat(laborResult[0].labor_total || 0);
  const subtotalParts = parseFloat(partsResult[0].parts_total || 0);
  const fees = parseFloat(invoiceData.fees || 0);
  const taxRate = parseFloat(invoiceData.taxRate || 0);
  const discount = parseFloat(invoiceData.discount || 0);
  
  const { taxAmount, total } = calculateInvoiceTotal(subtotalLabor, subtotalParts, fees, taxRate, discount);
  
  // Generate unique invoice number
  let invoiceNumber;
  let attempts = 0;
  while (attempts < 10) {
    invoiceNumber = generateInvoiceNumber();
    const [existing] = await pool.execute(
      'SELECT id FROM invoices WHERE invoice_number = ?',
      [invoiceNumber]
    );
    if (existing.length === 0) break;
    attempts++;
  }
  
  const [result] = await pool.execute(
    `INSERT INTO invoices (work_order_id, invoice_number, subtotal_labor, subtotal_parts, fees, tax_rate, tax_amount, discount, total, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Issued')`,
    [workOrderId, invoiceNumber, subtotalLabor, subtotalParts, fees, taxRate, taxAmount, discount, total]
  );
  
  return await getInvoiceById(result.insertId);
};

export const voidInvoice = async (id, userId, reason) => {
  // Check if invoice has payments
  const [payments] = await pool.execute(
    'SELECT COUNT(*) as count FROM payments WHERE invoice_id = ? AND is_deleted = 0',
    [id]
  );
  
  if (payments[0].count > 0) {
    throw new Error('Cannot void invoice with payments. Refund payments first.');
  }
  
  const [result] = await pool.execute(
    `UPDATE invoices 
     SET status = 'Voided', voided_by_user_id = ?, voided_at = NOW(), voided_reason = ?
     WHERE id = ? AND is_deleted = 0 AND status != 'Voided'`,
    [userId, reason, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Invoice not found or already voided');
  }
  
  return await getInvoiceById(id);
};

export const getAllInvoices = async (filters = {}) => {
  let query = `
    SELECT i.*, wo.work_order_number, 
           v.vin, v.make, v.model,
           c.first_name, c.last_name,
           IFNULL((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id AND is_deleted = 0), 0) as total_paid
    FROM invoices i
    JOIN work_orders wo ON i.work_order_id = wo.id
    JOIN vehicles v ON wo.vehicle_id = v.id
    JOIN customers c ON wo.customer_id = c.id
    WHERE i.is_deleted = 0
  `;
  const params = [];
  
  if (filters.status) {
    query += ' AND i.status = ?';
    params.push(filters.status);
  }
  
  query += ' ORDER BY i.created_at DESC';
  
  const [invoices] = await pool.execute(query, params);
  
  return invoices.map(inv => ({
    ...inv,
    balance: parseFloat((inv.total - inv.total_paid).toFixed(2))
  }));
};

// Recalculate invoice (if parts or labor change)
export const recalculateInvoice = async (invoiceId) => {
  const invoice = await getInvoiceById(invoiceId);
  
  if (invoice.status === 'Voided') {
    throw new Error('Cannot recalculate voided invoice');
  }
  
  // Calculate labor subtotal
  const [laborResult] = await pool.execute(
    `SELECT 
       SUM(sl.labor_rate * IFNULL((
         SELECT SUM(TIMESTAMPDIFF(SECOND, lte.start_time, lte.end_time)) / 3600
         FROM labor_time_entries lte
         WHERE lte.service_line_id = sl.id AND lte.end_time IS NOT NULL AND lte.is_deleted = 0
       ), sl.estimated_hours)) as labor_total
     FROM service_lines sl
     WHERE sl.work_order_id = ? AND sl.is_deleted = 0`,
    [invoice.work_order_id]
  );
  
  // Calculate parts subtotal
  const [partsResult] = await pool.execute(
    `SELECT SUM(quantity * cost_at_time_of_use) as parts_total
     FROM parts_used
     WHERE work_order_id = ? AND is_deleted = 0`,
    [invoice.work_order_id]
  );
  
  const subtotalLabor = parseFloat(laborResult[0].labor_total || 0);
  const subtotalParts = parseFloat(partsResult[0].parts_total || 0);
  
  const { taxAmount, total } = calculateInvoiceTotal(
    subtotalLabor, 
    subtotalParts, 
    invoice.fees, 
    invoice.tax_rate, 
    invoice.discount
  );
  
  await pool.execute(
    `UPDATE invoices 
     SET subtotal_labor = ?, subtotal_parts = ?, tax_amount = ?, total = ?
     WHERE id = ?`,
    [subtotalLabor, subtotalParts, taxAmount, total, invoiceId]
  );
  
  return await getInvoiceById(invoiceId);
};
