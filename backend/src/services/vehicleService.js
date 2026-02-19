import pool from '../db/pool.js';
import { softDelete } from '../utils/helpers.js';

export const getAllVehicles = async (customerId = null) => {
  let query = `
    SELECT v.*, c.first_name, c.last_name, c.phone 
    FROM vehicles v
    JOIN customers c ON v.customer_id = c.id
    WHERE v.is_deleted = 0
  `;
  const params = [];
  
  if (customerId) {
    query += ' AND v.customer_id = ?';
    params.push(customerId);
  }
  
  query += ' ORDER BY c.last_name, v.year DESC';
  
  const [vehicles] = await pool.execute(query, params);
  return vehicles;
};

export const getVehicleById = async (id) => {
  const [vehicles] = await pool.execute(
    `SELECT v.*, c.first_name, c.last_name, c.phone, c.email
     FROM vehicles v
     JOIN customers c ON v.customer_id = c.id
     WHERE v.id = ? AND v.is_deleted = 0`,
    [id]
  );
  
  if (vehicles.length === 0) {
    throw new Error('Vehicle not found');
  }
  
  return vehicles[0];
};

export const createVehicle = async (vehicleData) => {
  const { customerId, vin, year, make, model, color, licensePlate, notes } = vehicleData;
  
  // Validate VIN is unique
  const [existing] = await pool.execute(
    'SELECT id FROM vehicles WHERE vin = ? AND is_deleted = 0',
    [vin]
  );
  
  if (existing.length > 0) {
    throw new Error('VIN already exists');
  }
  
  // Validate customer exists
  const [customers] = await pool.execute(
    'SELECT id FROM customers WHERE id = ? AND is_deleted = 0',
    [customerId]
  );
  
  if (customers.length === 0) {
    throw new Error('Customer not found');
  }
  
  const [result] = await pool.execute(
    `INSERT INTO vehicles (customer_id, vin, year, make, model, color, license_plate, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [customerId, vin, year, make, model, color, licensePlate, notes]
  );
  
  return await getVehicleById(result.insertId);
};

export const updateVehicle = async (id, vehicleData) => {
  const { customerId, vin, year, make, model, color, licensePlate, notes } = vehicleData;
  
  // Validate VIN is unique (excluding current vehicle)
  const [existing] = await pool.execute(
    'SELECT id FROM vehicles WHERE vin = ? AND id != ? AND is_deleted = 0',
    [vin, id]
  );
  
  if (existing.length > 0) {
    throw new Error('VIN already exists');
  }
  
  const [result] = await pool.execute(
    `UPDATE vehicles 
     SET customer_id = ?, vin = ?, year = ?, make = ?, model = ?, 
         color = ?, license_plate = ?, notes = ?
     WHERE id = ? AND is_deleted = 0`,
    [customerId, vin, year, make, model, color, licensePlate, notes, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Vehicle not found');
  }
  
  return await getVehicleById(id);
};

export const deleteVehicle = async (id) => {
  // Check for associated work orders
  const [workOrders] = await pool.execute(
    'SELECT COUNT(*) as count FROM work_orders WHERE vehicle_id = ? AND is_deleted = 0',
    [id]
  );
  
  if (workOrders[0].count > 0) {
    throw new Error('Cannot delete vehicle with associated work orders');
  }
  
  const deleted = await softDelete(pool, 'vehicles', id);
  
  if (!deleted) {
    throw new Error('Vehicle not found');
  }
  
  return { message: 'Vehicle deleted successfully' };
};

export const searchVehicles = async (searchTerm) => {
  const searchPattern = `%${searchTerm}%`;
  const [vehicles] = await pool.execute(
    `SELECT v.*, c.first_name, c.last_name, c.phone 
     FROM vehicles v
     JOIN customers c ON v.customer_id = c.id
     WHERE (v.vin LIKE ? OR v.make LIKE ? OR v.model LIKE ? OR v.license_plate LIKE ?) 
     AND v.is_deleted = 0 
     ORDER BY c.last_name, v.year DESC`,
    [searchPattern, searchPattern, searchPattern, searchPattern]
  );
  return vehicles;
};
