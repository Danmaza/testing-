import pool from '../db/pool.js';
import { softDelete } from '../utils/helpers.js';

// Service Lines
export const getServiceLinesByWorkOrder = async (workOrderId) => {
  const [serviceLines] = await pool.execute(
    `SELECT sl.*, wo.work_order_number
     FROM service_lines sl
     JOIN work_orders wo ON sl.work_order_id = wo.id
     WHERE sl.work_order_id = ? AND sl.is_deleted = 0
     ORDER BY sl.created_at`,
    [workOrderId]
  );
  return serviceLines;
};

export const createServiceLine = async (serviceLineData) => {
  const { workOrderId, description, laborRate, estimatedHours, isWarranty, warrantyReferenceWorkOrderId, notes } = serviceLineData;
  
  // If warranty, validate reference work order and set labor cost to 0
  if (isWarranty) {
    if (!warrantyReferenceWorkOrderId) {
      throw new Error('Warranty service line must reference original work order');
    }
    // Warranty service lines must have $0 cost
    serviceLineData.laborRate = 0;
  }
  
  const [result] = await pool.execute(
    `INSERT INTO service_lines (work_order_id, description, labor_rate, estimated_hours, is_warranty, warranty_reference_work_order_id, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [workOrderId, description, laborRate || 0, estimatedHours || 0, isWarranty || 0, warrantyReferenceWorkOrderId, notes]
  );
  
  const [serviceLine] = await pool.execute(
    'SELECT * FROM service_lines WHERE id = ?',
    [result.insertId]
  );
  
  return serviceLine[0];
};

export const updateServiceLine = async (id, serviceLineData) => {
  const { description, status, laborRate, estimatedHours, notes } = serviceLineData;
  
  const [result] = await pool.execute(
    `UPDATE service_lines 
     SET description = ?, status = ?, labor_rate = ?, estimated_hours = ?, notes = ?
     WHERE id = ? AND is_deleted = 0`,
    [description, status, laborRate, estimatedHours, notes, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Service line not found');
  }
  
  const [serviceLine] = await pool.execute(
    'SELECT * FROM service_lines WHERE id = ?',
    [id]
  );
  
  return serviceLine[0];
};

export const deleteServiceLine = async (id) => {
  const deleted = await softDelete(pool, 'service_lines', id);
  
  if (!deleted) {
    throw new Error('Service line not found');
  }
  
  return { message: 'Service line deleted successfully' };
};

// Labor Time Entries
export const getLaborEntriesByServiceLine = async (serviceLineId) => {
  const [entries] = await pool.execute(
    `SELECT lte.*, u.full_name as mechanic_name, u.username
     FROM labor_time_entries lte
     JOIN users u ON lte.mechanic_user_id = u.id
     WHERE lte.service_line_id = ? AND lte.is_deleted = 0
     ORDER BY lte.start_time DESC`,
    [serviceLineId]
  );
  return entries;
};

export const createLaborEntry = async (laborEntryData) => {
  const { serviceLineId, mechanicUserId, startTime, endTime, notes } = laborEntryData;
  
  // Validate mechanic role
  const [users] = await pool.execute(
    'SELECT role FROM users WHERE id = ? AND is_deleted = 0',
    [mechanicUserId]
  );
  
  if (users.length === 0 || users[0].role !== 'Mechanic') {
    throw new Error('User is not a mechanic');
  }
  
  // Validate end time is after start time if provided
  if (endTime && new Date(endTime) <= new Date(startTime)) {
    throw new Error('End time must be after start time');
  }
  
  const [result] = await pool.execute(
    `INSERT INTO labor_time_entries (service_line_id, mechanic_user_id, start_time, end_time, notes) 
     VALUES (?, ?, ?, ?, ?)`,
    [serviceLineId, mechanicUserId, startTime, endTime, notes]
  );
  
  const [entry] = await pool.execute(
    `SELECT lte.*, u.full_name as mechanic_name 
     FROM labor_time_entries lte
     JOIN users u ON lte.mechanic_user_id = u.id
     WHERE lte.id = ?`,
    [result.insertId]
  );
  
  return entry[0];
};

export const updateLaborEntry = async (id, laborEntryData, mechanicUserId) => {
  const { startTime, endTime, notes } = laborEntryData;
  
  // Validate mechanic can only update their own entries
  const [existing] = await pool.execute(
    'SELECT mechanic_user_id FROM labor_time_entries WHERE id = ? AND is_deleted = 0',
    [id]
  );
  
  if (existing.length === 0) {
    throw new Error('Labor entry not found');
  }
  
  if (existing[0].mechanic_user_id !== mechanicUserId) {
    throw new Error('You can only update your own labor entries');
  }
  
  // Validate end time is after start time if provided
  if (endTime && new Date(endTime) <= new Date(startTime)) {
    throw new Error('End time must be after start time');
  }
  
  const [result] = await pool.execute(
    `UPDATE labor_time_entries 
     SET start_time = ?, end_time = ?, notes = ?
     WHERE id = ? AND is_deleted = 0`,
    [startTime, endTime, notes, id]
  );
  
  const [entry] = await pool.execute(
    `SELECT lte.*, u.full_name as mechanic_name 
     FROM labor_time_entries lte
     JOIN users u ON lte.mechanic_user_id = u.id
     WHERE lte.id = ?`,
    [id]
  );
  
  return entry[0];
};

export const deleteLaborEntry = async (id, mechanicUserId) => {
  // Validate mechanic can only delete their own entries
  const [existing] = await pool.execute(
    'SELECT mechanic_user_id FROM labor_time_entries WHERE id = ? AND is_deleted = 0',
    [id]
  );
  
  if (existing.length === 0) {
    throw new Error('Labor entry not found');
  }
  
  if (existing[0].mechanic_user_id !== mechanicUserId) {
    throw new Error('You can only delete your own labor entries');
  }
  
  const deleted = await softDelete(pool, 'labor_time_entries', id);
  
  if (!deleted) {
    throw new Error('Labor entry not found');
  }
  
  return { message: 'Labor entry deleted successfully' };
};

export const getTotalLaborHours = async (serviceLineId) => {
  const [result] = await pool.execute(
    `SELECT 
       SUM(TIMESTAMPDIFF(SECOND, start_time, end_time)) / 3600 as total_hours
     FROM labor_time_entries 
     WHERE service_line_id = ? AND end_time IS NOT NULL AND is_deleted = 0`,
    [serviceLineId]
  );
  
  return result[0].total_hours || 0;
};
