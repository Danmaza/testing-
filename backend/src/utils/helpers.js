// Utility functions for common operations

// Soft delete helper
export const softDelete = async (pool, tableName, id) => {
  const query = `UPDATE ${tableName} SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND is_deleted = 0`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

// Generate unique work order number
export const generateWorkOrderNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO-${year}-${random}`;
};

// Generate unique invoice number
export const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
};

// Calculate invoice totals
export const calculateInvoiceTotal = (subtotalLabor, subtotalParts, fees, taxRate, discount) => {
  const subtotal = parseFloat(subtotalLabor || 0) + parseFloat(subtotalParts || 0) + parseFloat(fees || 0);
  const taxAmount = (subtotal * parseFloat(taxRate || 0)) / 100;
  const total = subtotal + taxAmount - parseFloat(discount || 0);
  return {
    subtotal,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Validate warranty eligibility (1 year OR 15,000 miles)
export const validateWarranty = (originalWorkOrderDate, originalMileage, currentMileage) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const workOrderDate = new Date(originalWorkOrderDate);
  const withinTimeFrame = workOrderDate >= oneYearAgo;
  const withinMileage = (currentMileage - originalMileage) <= 15000;
  
  return withinTimeFrame && withinMileage;
};
