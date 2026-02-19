# A-OK Transmissions API Endpoints

Base URL: `http://localhost:3000` (or your configured backend URL)

## Authentication

All endpoints except `/api/auth/login` require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /api/auth/login
Login to get JWT token.

**Request:**
```json
{
  "username": "owner",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "owner",
    "email": "owner@aok-transmissions.com",
    "fullName": "John Owner",
    "role": "Owner"
  }
}
```

### POST /api/auth/register
Create new user (Owner only).

**Request:**
```json
{
  "username": "newmechanic",
  "password": "securepass123",
  "email": "mechanic@example.com",
  "fullName": "New Mechanic",
  "role": "Mechanic"
}
```

### GET /api/auth/me
Get current user info.

**Response:**
```json
{
  "id": 1,
  "username": "owner",
  "email": "owner@aok-transmissions.com",
  "fullName": "John Owner",
  "role": "Owner"
}
```

## Customers

### GET /api/customers
Get all customers (with optional search).

**Query Parameters:**
- `search` (optional): Search by name, email, or phone

### GET /api/customers/:id
Get customer by ID.

### POST /api/customers
Create new customer (Owner or ServiceAdvisor).

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "555-0199",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "notes": "Prefers email communication"
}
```

### PUT /api/customers/:id
Update customer (Owner or ServiceAdvisor).

### DELETE /api/customers/:id
Soft delete customer (Owner or ServiceAdvisor).

## Vehicles

### GET /api/vehicles
Get all vehicles.

**Query Parameters:**
- `customerId` (optional): Filter by customer
- `search` (optional): Search by VIN, make, model, or license plate

### GET /api/vehicles/:id
Get vehicle by ID.

### POST /api/vehicles
Create new vehicle (Owner or ServiceAdvisor).

**Request:**
```json
{
  "customerId": 1,
  "vin": "1HGBH41JXMN109999",
  "year": 2020,
  "make": "Honda",
  "model": "Accord",
  "color": "Silver",
  "licensePlate": "ABC1234",
  "notes": ""
}
```

### PUT /api/vehicles/:id
Update vehicle (Owner or ServiceAdvisor).

### DELETE /api/vehicles/:id
Soft delete vehicle (Owner or ServiceAdvisor).

## Work Orders

### GET /api/workorders
Get all work orders.

**Query Parameters:**
- `vehicleId` (optional): Filter by vehicle
- `customerId` (optional): Filter by customer
- `status` (optional): Filter by status

### GET /api/workorders/:id
Get work order by ID (includes service lines, mechanics, and parts).

### POST /api/workorders
Create new work order (Owner or ServiceAdvisor).

**Request:**
```json
{
  "vehicleId": 1,
  "customerId": 1,
  "mileage": 50000,
  "description": "Customer reports transmission slipping"
}
```

### PUT /api/workorders/:id
Update work order (Owner or ServiceAdvisor).

### PATCH /api/workorders/:id/status
Update work order status (Owner or ServiceAdvisor).

**Request:**
```json
{
  "status": "Active"
}
```

**Valid statuses:** Estimate, Active, Complete, Closed, Cancelled

### DELETE /api/workorders/:id
Soft delete work order (Owner or ServiceAdvisor).

### POST /api/workorders/:id/mechanics
Assign mechanic to work order (Owner or ServiceAdvisor).

**Request:**
```json
{
  "mechanicUserId": 3
}
```

### DELETE /api/workorders/:id/mechanics/:mechanicId
Unassign mechanic from work order (Owner or ServiceAdvisor).

## Service Lines

### GET /api/servicelines?workOrderId=:id
Get service lines for a work order.

### POST /api/servicelines
Create service line (Owner or ServiceAdvisor).

**Request:**
```json
{
  "workOrderId": 1,
  "description": "Transmission fluid change",
  "laborRate": 95.00,
  "estimatedHours": 1.5,
  "isWarranty": 0,
  "warrantyReferenceWorkOrderId": null,
  "notes": ""
}
```

### PUT /api/servicelines/:id
Update service line (Owner or ServiceAdvisor).

**Request:**
```json
{
  "description": "Transmission fluid change",
  "status": "Completed",
  "laborRate": 95.00,
  "estimatedHours": 1.5,
  "notes": ""
}
```

**Valid statuses:** Pending, InProgress, Completed, Cancelled

### DELETE /api/servicelines/:id
Soft delete service line (Owner or ServiceAdvisor).

## Labor Time Entries

### GET /api/servicelines/:id/labor
Get labor entries for a service line.

### POST /api/servicelines/:id/labor
Create labor entry (Any authenticated user).

**Request:**
```json
{
  "mechanicUserId": 3,
  "startTime": "2024-01-15T08:00:00",
  "endTime": "2024-01-15T09:30:00",
  "notes": ""
}
```

### PUT /api/servicelines/labor/:laborId
Update labor entry (Own entries only).

### DELETE /api/servicelines/labor/:laborId
Delete labor entry (Own entries only).

## Parts & Suppliers

### GET /api/parts?workOrderId=:id
Get parts for a work order.

### POST /api/parts
Add part to work order (Owner or ServiceAdvisor).

**Request:**
```json
{
  "workOrderId": 1,
  "serviceLineId": 1,
  "partNumber": "ATF-DW1",
  "description": "Automatic Transmission Fluid - 5 quarts",
  "supplierId": 1,
  "quantity": 5.00,
  "costAtTimeOfUse": 45.00,
  "notes": ""
}
```

### PUT /api/parts/:id
Update part (Owner or ServiceAdvisor).

### DELETE /api/parts/:id
Delete part (Owner or ServiceAdvisor).

### GET /api/parts/suppliers
Get all suppliers.

### POST /api/parts/suppliers
Create supplier (Owner or ServiceAdvisor).

**Request:**
```json
{
  "name": "AutoZone",
  "contactName": "Bill Smith",
  "email": "billing@autozone.com",
  "phone": "555-1001",
  "address": "1000 Parts Blvd",
  "notes": ""
}
```

### PUT /api/parts/suppliers/:id
Update supplier (Owner or ServiceAdvisor).

### DELETE /api/parts/suppliers/:id
Delete supplier (Owner or ServiceAdvisor).

## Invoices

### GET /api/invoices
Get all invoices.

**Query Parameters:**
- `status` (optional): Filter by status

### GET /api/invoices/:id
Get invoice by ID (includes payments).

### GET /api/invoices/workorder/:workOrderId
Get invoice for a work order.

### POST /api/invoices
Create invoice for work order (Owner or ServiceAdvisor).

**Request:**
```json
{
  "workOrderId": 1,
  "fees": 10.00,
  "taxRate": 8.50,
  "discount": 0.00
}
```

**Note:** Labor and parts subtotals are calculated automatically.

### PUT /api/invoices/:id/recalculate
Recalculate invoice totals (Owner or ServiceAdvisor).

### POST /api/invoices/:id/void
Void an invoice (Owner only).

**Request:**
```json
{
  "reason": "Customer requested cancellation"
}
```

## Payments

### GET /api/invoices/:id/payments
Get payments for an invoice.

### POST /api/invoices/:id/payments
Record payment (Owner or ServiceAdvisor).

**Request:**
```json
{
  "amount": 303.80,
  "paymentMethod": "CreditCard",
  "paymentReference": "VISA-****1234",
  "notes": ""
}
```

**Valid payment methods:** Cash, Check, CreditCard, DebitCard, Other

### DELETE /api/invoices/payments/:paymentId
Delete payment (Owner only).

## Reports

### GET /api/reports/revenue?startDate=&endDate=
Get revenue report (Owner or ServiceAdvisor).

**Query Parameters:**
- `startDate`: ISO date (e.g., 2024-01-01)
- `endDate`: ISO date (e.g., 2024-12-31)

### GET /api/reports/expenses?startDate=&endDate=
Get expense report (Owner or ServiceAdvisor).

### GET /api/reports/labor?startDate=&endDate=
Get labor efficiency report (Owner or ServiceAdvisor).

### GET /api/reports/service-history/:vin
Get service history for a vehicle by VIN.

### GET /api/reports/dashboard
Get dashboard summary (all authenticated users).

**Response:**
```json
{
  "activeWorkOrders": 5,
  "outstandingInvoices": 3,
  "totalOutstanding": 1250.50,
  "todayRevenue": 450.00,
  "monthRevenue": 12500.00
}
```

## Health Check

### GET /health
Check API and database health (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate entry)
- 500: Internal Server Error

## Role-Based Access Control (RBAC)

- **Owner**: Full access to all endpoints, including void invoice and user management
- **ServiceAdvisor**: Can manage customers, vehicles, work orders, service lines, parts, invoices, and payments
- **Mechanic**: Can view work orders, add/edit their own labor entries

Owner-only actions:
- Void invoice
- Delete payments
- Create new users
