import pool from '../db/pool.js';
import { softDelete } from '../utils/helpers.js';

// Parts Used
export const getPartsByWorkOrder = async (workOrderId) => {
  const [parts] = await pool.execute(
    `SELECT pu.*, s.name as supplier_name, sl.description as service_line_description
     FROM parts_used pu
     LEFT JOIN suppliers s ON pu.supplier_id = s.id
     LEFT JOIN service_lines sl ON pu.service_line_id = sl.id
     WHERE pu.work_order_id = ? AND pu.is_deleted = 0
     ORDER BY pu.created_at`,
    [workOrderId]
  );
  return parts;
};

export const createPart = async (partData) => {
  const { workOrderId, serviceLineId, partNumber, description, supplierId, quantity, costAtTimeOfUse, notes } = partData;
  
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  if (costAtTimeOfUse < 0) {
    throw new Error('Cost cannot be negative');
  }
  
  const [result] = await pool.execute(
    `INSERT INTO parts_used (work_order_id, service_line_id, part_number, description, supplier_id, quantity, cost_at_time_of_use, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [workOrderId, serviceLineId, partNumber, description, supplierId, quantity, costAtTimeOfUse, notes]
  );
  
  const [part] = await pool.execute(
    `SELECT pu.*, s.name as supplier_name 
     FROM parts_used pu
     LEFT JOIN suppliers s ON pu.supplier_id = s.id
     WHERE pu.id = ?`,
    [result.insertId]
  );
  
  return part[0];
};

export const updatePart = async (id, partData) => {
  const { partNumber, description, supplierId, quantity, costAtTimeOfUse, notes } = partData;
  
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  if (costAtTimeOfUse < 0) {
    throw new Error('Cost cannot be negative');
  }
  
  const [result] = await pool.execute(
    `UPDATE parts_used 
     SET part_number = ?, description = ?, supplier_id = ?, quantity = ?, cost_at_time_of_use = ?, notes = ?
     WHERE id = ? AND is_deleted = 0`,
    [partNumber, description, supplierId, quantity, costAtTimeOfUse, notes, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Part not found');
  }
  
  const [part] = await pool.execute(
    `SELECT pu.*, s.name as supplier_name 
     FROM parts_used pu
     LEFT JOIN suppliers s ON pu.supplier_id = s.id
     WHERE pu.id = ?`,
    [id]
  );
  
  return part[0];
};

export const deletePart = async (id) => {
  const deleted = await softDelete(pool, 'parts_used', id);
  
  if (!deleted) {
    throw new Error('Part not found');
  }
  
  return { message: 'Part deleted successfully' };
};

// Suppliers
export const getAllSuppliers = async () => {
  const [suppliers] = await pool.execute(
    'SELECT * FROM suppliers WHERE is_deleted = 0 ORDER BY name'
  );
  return suppliers;
};

export const getSupplierById = async (id) => {
  const [suppliers] = await pool.execute(
    'SELECT * FROM suppliers WHERE id = ? AND is_deleted = 0',
    [id]
  );
  
  if (suppliers.length === 0) {
    throw new Error('Supplier not found');
  }
  
  return suppliers[0];
};

export const createSupplier = async (supplierData) => {
  const { name, contactName, email, phone, address, notes } = supplierData;
  
  const [result] = await pool.execute(
    `INSERT INTO suppliers (name, contact_name, email, phone, address, notes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, contactName, email, phone, address, notes]
  );
  
  return await getSupplierById(result.insertId);
};

export const updateSupplier = async (id, supplierData) => {
  const { name, contactName, email, phone, address, notes } = supplierData;
  
  const [result] = await pool.execute(
    `UPDATE suppliers 
     SET name = ?, contact_name = ?, email = ?, phone = ?, address = ?, notes = ?
     WHERE id = ? AND is_deleted = 0`,
    [name, contactName, email, phone, address, notes, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Supplier not found');
  }
  
  return await getSupplierById(id);
};

export const deleteSupplier = async (id) => {
  const deleted = await softDelete(pool, 'suppliers', id);
  
  if (!deleted) {
    throw new Error('Supplier not found');
  }
  
  return { message: 'Supplier deleted successfully' };
};
