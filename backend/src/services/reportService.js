import pool from '../db/pool.js';

// Revenue Report
export const getRevenueReport = async (startDate, endDate) => {
  const [result] = await pool.execute(
    `SELECT 
       COUNT(DISTINCT i.id) as total_invoices,
       SUM(i.total) as total_revenue,
       SUM(i.subtotal_labor) as labor_revenue,
       SUM(i.subtotal_parts) as parts_revenue,
       SUM(i.fees) as fees_revenue,
       SUM(i.tax_amount) as tax_collected,
       SUM(i.discount) as total_discounts,
       IFNULL(SUM(p.amount), 0) as total_collected
     FROM invoices i
     LEFT JOIN payments p ON i.id = p.invoice_id AND p.is_deleted = 0
     WHERE i.status != 'Voided' 
     AND i.is_deleted = 0
     AND i.created_at BETWEEN ? AND ?`,
    [startDate, endDate]
  );
  
  // Get breakdown by payment method
  const [paymentBreakdown] = await pool.execute(
    `SELECT 
       p.payment_method,
       COUNT(*) as count,
       SUM(p.amount) as total
     FROM payments p
     JOIN invoices i ON p.invoice_id = i.id
     WHERE p.is_deleted = 0 
     AND i.is_deleted = 0
     AND p.created_at BETWEEN ? AND ?
     GROUP BY p.payment_method`,
    [startDate, endDate]
  );
  
  return {
    summary: result[0],
    paymentBreakdown
  };
};

// Expense Report (parts costs)
export const getExpenseReport = async (startDate, endDate) => {
  const [result] = await pool.execute(
    `SELECT 
       COUNT(*) as total_parts,
       SUM(quantity) as total_quantity,
       SUM(quantity * cost_at_time_of_use) as total_cost
     FROM parts_used
     WHERE is_deleted = 0
     AND created_at BETWEEN ? AND ?`,
    [startDate, endDate]
  );
  
  // Get breakdown by supplier
  const [supplierBreakdown] = await pool.execute(
    `SELECT 
       s.id,
       s.name as supplier_name,
       COUNT(pu.id) as parts_count,
       SUM(pu.quantity * pu.cost_at_time_of_use) as total_cost
     FROM parts_used pu
     LEFT JOIN suppliers s ON pu.supplier_id = s.id
     WHERE pu.is_deleted = 0
     AND pu.created_at BETWEEN ? AND ?
     GROUP BY s.id, s.name
     ORDER BY total_cost DESC`,
    [startDate, endDate]
  );
  
  return {
    summary: result[0],
    supplierBreakdown
  };
};

// Labor Efficiency Report
export const getLaborEfficiencyReport = async (startDate, endDate) => {
  const [mechanicStats] = await pool.execute(
    `SELECT 
       u.id as mechanic_id,
       u.full_name as mechanic_name,
       COUNT(DISTINCT lte.service_line_id) as services_worked,
       COUNT(DISTINCT wo.id) as work_orders,
       SUM(TIMESTAMPDIFF(SECOND, lte.start_time, lte.end_time)) / 3600 as total_hours
     FROM users u
     LEFT JOIN labor_time_entries lte ON u.id = lte.mechanic_user_id AND lte.is_deleted = 0
       AND lte.end_time IS NOT NULL
       AND lte.created_at BETWEEN ? AND ?
     LEFT JOIN service_lines sl ON lte.service_line_id = sl.id
     LEFT JOIN work_orders wo ON sl.work_order_id = wo.id
     WHERE u.role = 'Mechanic' AND u.is_deleted = 0
     GROUP BY u.id, u.full_name
     ORDER BY total_hours DESC`,
    [startDate, endDate]
  );
  
  return mechanicStats;
};

// Service History by VIN
export const getServiceHistoryByVIN = async (vin) => {
  // Get vehicle info
  const [vehicles] = await pool.execute(
    `SELECT v.*, c.first_name, c.last_name, c.phone, c.email
     FROM vehicles v
     JOIN customers c ON v.customer_id = c.id
     WHERE v.vin = ? AND v.is_deleted = 0`,
    [vin]
  );
  
  if (vehicles.length === 0) {
    throw new Error('Vehicle not found');
  }
  
  const vehicle = vehicles[0];
  
  // Get all work orders for this vehicle
  const [workOrders] = await pool.execute(
    `SELECT wo.*, u.full_name as created_by_name
     FROM work_orders wo
     LEFT JOIN users u ON wo.created_by_user_id = u.id
     WHERE wo.vehicle_id = ? AND wo.is_deleted = 0
     ORDER BY wo.created_at DESC`,
    [vehicle.id]
  );
  
  // For each work order, get service lines, parts, and invoice info
  const history = await Promise.all(workOrders.map(async (wo) => {
    const [serviceLines] = await pool.execute(
      'SELECT * FROM service_lines WHERE work_order_id = ? AND is_deleted = 0',
      [wo.id]
    );
    
    const [parts] = await pool.execute(
      `SELECT pu.*, s.name as supplier_name 
       FROM parts_used pu
       LEFT JOIN suppliers s ON pu.supplier_id = s.id
       WHERE pu.work_order_id = ? AND pu.is_deleted = 0`,
      [wo.id]
    );
    
    const [invoices] = await pool.execute(
      `SELECT i.*, 
              IFNULL((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id AND is_deleted = 0), 0) as total_paid
       FROM invoices i
       WHERE i.work_order_id = ? AND i.is_deleted = 0`,
      [wo.id]
    );
    
    return {
      ...wo,
      serviceLines,
      parts,
      invoice: invoices.length > 0 ? {
        ...invoices[0],
        balance: parseFloat((invoices[0].total - invoices[0].total_paid).toFixed(2))
      } : null
    };
  }));
  
  return {
    vehicle,
    history
  };
};

// Dashboard Summary
export const getDashboardSummary = async () => {
  // Active work orders count
  const [activeWO] = await pool.execute(
    `SELECT COUNT(*) as count FROM work_orders 
     WHERE status IN ('Estimate', 'Active') AND is_deleted = 0`
  );
  
  // Outstanding invoices
  const [outstandingInvoices] = await pool.execute(
    `SELECT 
       COUNT(*) as count,
       SUM(i.total - IFNULL((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id AND is_deleted = 0), 0)) as total_outstanding
     FROM invoices i
     WHERE i.status IN ('Issued', 'PartiallyPaid') AND i.is_deleted = 0`
  );
  
  // Today's revenue
  const [todayRevenue] = await pool.execute(
    `SELECT IFNULL(SUM(amount), 0) as total
     FROM payments
     WHERE DATE(created_at) = CURDATE() AND is_deleted = 0`
  );
  
  // This month's revenue
  const [monthRevenue] = await pool.execute(
    `SELECT IFNULL(SUM(amount), 0) as total
     FROM payments
     WHERE YEAR(created_at) = YEAR(CURDATE()) 
     AND MONTH(created_at) = MONTH(CURDATE())
     AND is_deleted = 0`
  );
  
  return {
    activeWorkOrders: activeWO[0].count,
    outstandingInvoices: outstandingInvoices[0].count,
    totalOutstanding: parseFloat(outstandingInvoices[0].total_outstanding || 0),
    todayRevenue: parseFloat(todayRevenue[0].total),
    monthRevenue: parseFloat(monthRevenue[0].total)
  };
};
