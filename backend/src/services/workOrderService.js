import pool from '../db/pool.js';
import { softDelete, generateWorkOrderNumber } from '../utils/helpers.js';

export const getAllWorkOrders = async (filters = {}) => {
  let query = `
    SELECT wo.*, v.vin, v.make, v.model, v.year,
           c.first_name, c.last_name, c.phone,
           u.full_name as created_by_name
    FROM work_orders wo
    JOIN vehicles v ON wo.vehicle_id = v.id
    JOIN customers c ON wo.customer_id = c.id
    LEFT JOIN users u ON wo.created_by_user_id = u.id
    WHERE wo.is_deleted = 0
  `;
  const params = [];
  
  if (filters.vehicleId) {
    query += ' AND wo.vehicle_id = ?';
    params.push(filters.vehicleId);
  }
  
  if (filters.customerId) {
    query += ' AND wo.customer_id = ?';
    params.push(filters.customerId);
  }
  
  if (filters.status) {
    query += ' AND wo.status = ?';
    params.push(filters.status);
  }
  
  query += ' ORDER BY wo.created_at DESC';
  
  const [workOrders] = await pool.execute(query, params);
  return workOrders;
};

export const getWorkOrderById = async (id) => {
  const [workOrders] = await pool.execute(
    `SELECT wo.*, v.vin, v.make, v.model, v.year, v.color, v.license_plate,
            c.id as customer_id, c.first_name, c.last_name, c.phone, c.email,
            u.full_name as created_by_name
     FROM work_orders wo
     JOIN vehicles v ON wo.vehicle_id = v.id
     JOIN customers c ON wo.customer_id = c.id
     LEFT JOIN users u ON wo.created_by_user_id = u.id
     WHERE wo.id = ? AND wo.is_deleted = 0`,
    [id]
  );
  
  if (workOrders.length === 0) {
    throw new Error('Work order not found');
  }
  
  // Get service lines
  const [serviceLines] = await pool.execute(
    'SELECT * FROM service_lines WHERE work_order_id = ? AND is_deleted = 0',
    [id]
  );
  
  // Get assigned mechanics
  const [mechanics] = await pool.execute(
    `SELECT u.id, u.full_name, u.username
     FROM workorder_mechanics wm
     JOIN users u ON wm.mechanic_user_id = u.id
     WHERE wm.work_order_id = ?`,
    [id]
  );
  
  // Get parts
  const [parts] = await pool.execute(
    `SELECT pu.*, s.name as supplier_name
     FROM parts_used pu
     LEFT JOIN suppliers s ON pu.supplier_id = s.id
     WHERE pu.work_order_id = ? AND pu.is_deleted = 0`,
    [id]
  );
  
  return {
    ...workOrders[0],
    serviceLines,
    mechanics,
    parts
  };
};

export const createWorkOrder = async (workOrderData, userId) => {
  const { vehicleId, customerId, mileage, description } = workOrderData;
  
  // Validate vehicle and customer exist
  const [vehicles] = await pool.execute(
    'SELECT customer_id FROM vehicles WHERE id = ? AND is_deleted = 0',
    [vehicleId]
  );
  
  if (vehicles.length === 0) {
    throw new Error('Vehicle not found');
  }
  
  // Generate unique work order number
  let workOrderNumber;
  let attempts = 0;
  while (attempts < 10) {
    workOrderNumber = generateWorkOrderNumber();
    const [existing] = await pool.execute(
      'SELECT id FROM work_orders WHERE work_order_number = ?',
      [workOrderNumber]
    );
    if (existing.length === 0) break;
    attempts++;
  }
  
  const [result] = await pool.execute(
    `INSERT INTO work_orders (vehicle_id, customer_id, work_order_number, mileage, description, created_by_user_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [vehicleId, customerId, workOrderNumber, mileage, description, userId]
  );
  
  return await getWorkOrderById(result.insertId);
};

export const updateWorkOrder = async (id, workOrderData) => {
  const { status, mileage, description } = workOrderData;
  
  const [result] = await pool.execute(
    `UPDATE work_orders 
     SET status = ?, mileage = ?, description = ?
     WHERE id = ? AND is_deleted = 0`,
    [status, mileage, description, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Work order not found');
  }
  
  return await getWorkOrderById(id);
};

export const updateWorkOrderStatus = async (id, status) => {
  // Validate status transition
  const validStatuses = ['Estimate', 'Active', 'Complete', 'Closed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  
  // If trying to close, validate requirements
  if (status === 'Closed') {
    // Must have at least one service line
    const [serviceLines] = await pool.execute(
      'SELECT COUNT(*) as count FROM service_lines WHERE work_order_id = ? AND is_deleted = 0',
      [id]
    );
    
    if (serviceLines[0].count === 0) {
      throw new Error('Cannot close work order without service lines');
    }
    
    // All service lines must be completed
    const [incompleteLines] = await pool.execute(
      `SELECT COUNT(*) as count FROM service_lines 
       WHERE work_order_id = ? AND status != 'Completed' AND status != 'Cancelled' AND is_deleted = 0`,
      [id]
    );
    
    if (incompleteLines[0].count > 0) {
      throw new Error('Cannot close work order with incomplete service lines');
    }
  }
  
  const [result] = await pool.execute(
    'UPDATE work_orders SET status = ? WHERE id = ? AND is_deleted = 0',
    [status, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Work order not found');
  }
  
  return await getWorkOrderById(id);
};

export const deleteWorkOrder = async (id) => {
  // Check if there's an invoice
  const [invoices] = await pool.execute(
    'SELECT id FROM invoices WHERE work_order_id = ? AND is_deleted = 0',
    [id]
  );
  
  if (invoices.length > 0) {
    throw new Error('Cannot delete work order with an associated invoice');
  }
  
  const deleted = await softDelete(pool, 'work_orders', id);
  
  if (!deleted) {
    throw new Error('Work order not found');
  }
  
  return { message: 'Work order deleted successfully' };
};

export const assignMechanic = async (workOrderId, mechanicUserId) => {
  // Validate mechanic role
  const [users] = await pool.execute(
    'SELECT role FROM users WHERE id = ? AND is_deleted = 0',
    [mechanicUserId]
  );
  
  if (users.length === 0 || users[0].role !== 'Mechanic') {
    throw new Error('User is not a mechanic');
  }
  
  // Check if already assigned
  const [existing] = await pool.execute(
    'SELECT id FROM workorder_mechanics WHERE work_order_id = ? AND mechanic_user_id = ?',
    [workOrderId, mechanicUserId]
  );
  
  if (existing.length > 0) {
    throw new Error('Mechanic already assigned to this work order');
  }
  
  await pool.execute(
    'INSERT INTO workorder_mechanics (work_order_id, mechanic_user_id) VALUES (?, ?)',
    [workOrderId, mechanicUserId]
  );
  
  return { message: 'Mechanic assigned successfully' };
};

export const unassignMechanic = async (workOrderId, mechanicUserId) => {
  const [result] = await pool.execute(
    'DELETE FROM workorder_mechanics WHERE work_order_id = ? AND mechanic_user_id = ?',
    [workOrderId, mechanicUserId]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Mechanic not assigned to this work order');
  }
  
  return { message: 'Mechanic unassigned successfully' };
};
