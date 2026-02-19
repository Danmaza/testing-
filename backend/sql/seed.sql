-- A-OK Transmissions Seed Data
-- Run this after schema.sql

-- Insert Users
-- Password for all users: 'password123' (hashed with bcrypt)
INSERT INTO users (username, password_hash, email, full_name, role) VALUES
('owner', '$2b$10$rKZvVQJ7z7eZYm6WYQx8YeYxJkBqLZXvUvKHKb5KQnYvVZJ7z7eZY', 'owner@aok-transmissions.com', 'John Owner', 'Owner'),
('advisor1', '$2b$10$rKZvVQJ7z7eZYm6WYQx8YeYxJkBqLZXvUvKHKb5KQnYvVZJ7z7eZY', 'advisor@aok-transmissions.com', 'Sarah Advisor', 'ServiceAdvisor'),
('mechanic1', '$2b$10$rKZvVQJ7z7eZYm6WYQx8YeYxJkBqLZXvUvKHKb5KQnYvVZJ7z7eZY', 'mike@aok-transmissions.com', 'Mike Mechanic', 'Mechanic'),
('mechanic2', '$2b$10$rKZvVQJ7z7eZYm6WYQx8YeYxJkBqLZXvUvKHKb5KQnYvVZJ7z7eZY', 'tom@aok-transmissions.com', 'Tom Technician', 'Mechanic');

-- Insert Customers
INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code) VALUES
('Robert', 'Johnson', 'robert.johnson@email.com', '555-0101', '123 Main St', 'Springfield', 'IL', '62701'),
('Mary', 'Williams', 'mary.williams@email.com', '555-0102', '456 Oak Ave', 'Springfield', 'IL', '62702'),
('James', 'Brown', 'james.brown@email.com', '555-0103', '789 Elm St', 'Springfield', 'IL', '62703'),
('Patricia', 'Davis', 'patricia.davis@email.com', '555-0104', '321 Pine Rd', 'Springfield', 'IL', '62704');

-- Insert Vehicles
INSERT INTO vehicles (customer_id, vin, year, make, model, color, license_plate) VALUES
(1, '1HGBH41JXMN109186', 2020, 'Honda', 'Accord', 'Silver', 'ABC1234'),
(1, '1G1ZD5ST5JF123456', 2018, 'Chevrolet', 'Malibu', 'Black', 'XYZ5678'),
(2, '3VWDP7AJ5DM456789', 2019, 'Volkswagen', 'Passat', 'White', 'DEF9012'),
(3, '1FTFW1ET5EFC78901', 2021, 'Ford', 'F-150', 'Blue', 'GHI3456'),
(4, '5YJSA1E14HF234567', 2017, 'Tesla', 'Model S', 'Red', 'JKL7890');

-- Insert Suppliers
INSERT INTO suppliers (name, contact_name, email, phone, address) VALUES
('AutoZone', 'Bill Smith', 'billing@autozone.com', '555-1001', '1000 Parts Blvd'),
('NAPA Auto Parts', 'Jane Doe', 'sales@napaonline.com', '555-1002', '2000 Supply Way'),
('OEM Direct', 'Tom Anderson', 'orders@oemdirect.com', '555-1003', '3000 Factory Ln');

-- Insert Work Orders
INSERT INTO work_orders (vehicle_id, customer_id, work_order_number, status, mileage, description, created_by_user_id) VALUES
(1, 1, 'WO-2024-001', 'Complete', 45000, 'Transmission fluid change and inspection', 2),
(2, 1, 'WO-2024-002', 'Active', 72000, 'Transmission rebuild - slipping in 3rd gear', 2),
(3, 2, 'WO-2024-003', 'Estimate', 55000, 'Diagnostic for rough shifting', 2),
(4, 3, 'WO-2024-004', 'Closed', 38000, 'Routine transmission service', 2);

-- Insert Service Lines
INSERT INTO service_lines (work_order_id, description, status, labor_rate, estimated_hours) VALUES
(1, 'Transmission fluid change', 'Completed', 95.00, 1.5),
(1, 'Multi-point transmission inspection', 'Completed', 95.00, 0.5),
(2, 'Transmission removal and disassembly', 'Completed', 110.00, 4.0),
(2, 'Transmission rebuild with new clutch packs', 'InProgress', 110.00, 8.0),
(2, 'Transmission installation and testing', 'Pending', 110.00, 3.0),
(3, 'Transmission diagnostic scan', 'Pending', 95.00, 1.0),
(4, 'Transmission filter replacement', 'Completed', 95.00, 2.0);

-- Insert Work Order Mechanics assignments
INSERT INTO workorder_mechanics (work_order_id, mechanic_user_id) VALUES
(1, 3),
(2, 3),
(2, 4),
(4, 4);

-- Insert Labor Time Entries
INSERT INTO labor_time_entries (service_line_id, mechanic_user_id, start_time, end_time) VALUES
(1, 3, '2024-01-15 08:00:00', '2024-01-15 09:30:00'),
(2, 3, '2024-01-15 09:30:00', '2024-01-15 10:00:00'),
(3, 3, '2024-01-20 08:00:00', '2024-01-20 12:00:00'),
(4, 3, '2024-01-21 08:00:00', '2024-01-21 12:00:00'),
(4, 4, '2024-01-21 13:00:00', '2024-01-21 17:00:00'),
(7, 4, '2024-01-18 08:00:00', '2024-01-18 10:00:00');

-- Insert Parts Used
INSERT INTO parts_used (work_order_id, service_line_id, part_number, description, supplier_id, quantity, cost_at_time_of_use) VALUES
(1, 1, 'ATF-DW1', 'Automatic Transmission Fluid - 5 quarts', 1, 5.00, 45.00),
(1, 1, 'TF-100', 'Transmission Filter Kit', 1, 1.00, 35.00),
(2, 3, 'TP-500', 'Transmission Pan Gasket', 2, 1.00, 25.00),
(2, 4, 'CP-200', 'Clutch Pack Set', 3, 1.00, 450.00),
(2, 4, 'TS-300', 'Transmission Seal Kit', 3, 1.00, 120.00),
(4, 7, 'ATF-SYNTH', 'Synthetic Transmission Fluid - 6 quarts', 2, 6.00, 72.00),
(4, 7, 'TF-150', 'Heavy Duty Transmission Filter', 2, 1.00, 42.00);

-- Insert Invoices
INSERT INTO invoices (work_order_id, invoice_number, subtotal_labor, subtotal_parts, fees, tax_rate, tax_amount, discount, total, status) VALUES
(1, 'INV-2024-001', 190.00, 80.00, 10.00, 8.50, 23.80, 0.00, 303.80, 'Paid'),
(4, 'INV-2024-004', 190.00, 114.00, 10.00, 8.50, 26.64, 0.00, 340.64, 'Paid');

-- Insert Payments
INSERT INTO payments (invoice_id, amount, payment_method, payment_reference) VALUES
(1, 303.80, 'CreditCard', 'VISA-****1234'),
(2, 340.64, 'Cash', NULL);

-- Notes:
-- Work Order 2 (WO-2024-002) is Active and has no invoice yet (work in progress)
-- Work Order 3 (WO-2024-003) is still an Estimate
-- Default password for all users is 'password123' - change this in production!
-- In production, use proper bcrypt hashing: bcrypt.hash('password123', 10)
