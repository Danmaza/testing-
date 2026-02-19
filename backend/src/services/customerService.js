import pool from '../db/pool.js';
import { softDelete } from '../utils/helpers.js';

export const getAllCustomers = async () => {
  const [customers] = await pool.execute(
    'SELECT * FROM customers WHERE is_deleted = 0 ORDER BY last_name, first_name'
  );
  return customers;
};

export const getCustomerById = async (id) => {
  const [customers] = await pool.execute(
    'SELECT * FROM customers WHERE id = ? AND is_deleted = 0',
    [id]
  );
  
  if (customers.length === 0) {
    throw new Error('Customer not found');
  }
  
  return customers[0];
};

export const createCustomer = async (customerData) => {
  const { firstName, lastName, email, phone, address, city, state, zipCode, notes } = customerData;
  
  const [result] = await pool.execute(
    `INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, phone, address, city, state, zipCode, notes]
  );
  
  return await getCustomerById(result.insertId);
};

export const updateCustomer = async (id, customerData) => {
  const { firstName, lastName, email, phone, address, city, state, zipCode, notes } = customerData;
  
  const [result] = await pool.execute(
    `UPDATE customers 
     SET first_name = ?, last_name = ?, email = ?, phone = ?, 
         address = ?, city = ?, state = ?, zip_code = ?, notes = ?
     WHERE id = ? AND is_deleted = 0`,
    [firstName, lastName, email, phone, address, city, state, zipCode, notes, id]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Customer not found');
  }
  
  return await getCustomerById(id);
};

export const deleteCustomer = async (id) => {
  // Check for associated vehicles
  const [vehicles] = await pool.execute(
    'SELECT COUNT(*) as count FROM vehicles WHERE customer_id = ? AND is_deleted = 0',
    [id]
  );
  
  if (vehicles[0].count > 0) {
    throw new Error('Cannot delete customer with associated vehicles');
  }
  
  const deleted = await softDelete(pool, 'customers', id);
  
  if (!deleted) {
    throw new Error('Customer not found');
  }
  
  return { message: 'Customer deleted successfully' };
};

export const searchCustomers = async (searchTerm) => {
  const searchPattern = `%${searchTerm}%`;
  const [customers] = await pool.execute(
    `SELECT * FROM customers 
     WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?) 
     AND is_deleted = 0 
     ORDER BY last_name, first_name`,
    [searchPattern, searchPattern, searchPattern, searchPattern]
  );
  return customers;
};
