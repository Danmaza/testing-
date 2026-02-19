# A-OK Transmissions – Digital Business Application

A full-stack web application for managing a transmission shop's operations including customers, vehicles, work orders, service lines, parts, invoices, and payments.

## Tech Stack

### Backend
- **Node.js + Express** - RESTful API server
- **MySQL 8.0+** - Database (AWS RDS compatible)
- **mysql2** - MySQL client with connection pooling
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Build tool and dev server
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Axios** - HTTP client

## Features

### 1. Authentication & RBAC
- JWT-based authentication
- Three user roles: **Owner**, **ServiceAdvisor**, **Mechanic**
- Backend enforces role-based permissions
- Owner-only actions: void invoices, delete payments, create users

### 2. Customer & Vehicle Management
- CRUD operations for customers
- CRUD operations for vehicles
- VIN uniqueness enforced
- Customers can have multiple vehicles
- Soft deletes with referential integrity

### 3. Work Orders
- Create work orders for vehicles
- Status tracking: Estimate → Active → Complete → Closed → Cancelled
- Mileage tracking per work order
- Cannot close work order without completed service lines
- Assign multiple mechanics to work orders

### 4. Service Lines & Labor
- Service lines belong to work orders
- Track labor time entries (start/end times)
- Mechanics can log their own time
- Warranty support (1 year OR 15,000 miles)

### 5. Parts & Suppliers
- Track parts used on work orders
- No inventory management (simple tracking only)
- Link parts to suppliers
- Cost captured at time of use

### 6. Invoices & Payments
- One invoice per work order
- Auto-calculate totals: labor + parts + fees + tax - discounts
- Payment validation (must be > 0, cannot exceed invoice total)
- Track payment methods
- Owner can void invoices (if no payments)
- Warranty service lines must have $0 cost

### 7. Reporting
- Revenue report (by date range)
- Expense report (parts costs)
- Labor efficiency report (hours per mechanic)
- Service history lookup by VIN
- Dashboard with key metrics

## Project Structure

```
/backend
  /src
    /db          - Database connection pool
    /middleware  - Auth, RBAC, error handling
    /routes      - API route definitions
    /services    - Business logic layer
    /utils       - Helper functions
    server.js    - Express app entry point
  /sql
    schema.sql   - Database schema
    seed.sql     - Sample data with default users
  /docs
    endpoints.md - API documentation
  package.json
  .env.example

/frontend
  /src
    /api         - Axios instance
    /components  - Reusable Vue components
    /pages       - Page-level components
    /stores      - Pinia stores
    /router      - Vue Router setup
    /assets      - CSS and static files
    main.js      - Vue app entry point
    App.vue      - Root component
  package.json
  .env.example
  vite.config.js
  index.html

README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+ (local or AWS RDS)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your database credentials:
   ```env
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=aok_transmissions
   DB_PORT=3306
   PORT=3000
   JWT_SECRET=your-random-secret-string
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Create database and run schema:**
   ```bash
   # Connect to your MySQL instance
   mysql -h your-host -u your-user -p

   # Create database
   CREATE DATABASE aok_transmissions;
   USE aok_transmissions;

   # Run schema
   source sql/schema.sql;

   # Run seed data (optional - includes default users)
   source sql/seed.sql;
   ```

5. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Verify backend is running:**
   ```bash
   curl http://localhost:3000/health
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_ROOT_API=http://localhost:3000
   ```

4. **Start the frontend dev server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to `http://localhost:5173`

### Default User Credentials

After running `seed.sql`, you can login with these accounts:

| Username   | Password     | Role           |
|------------|--------------|----------------|
| owner      | password123  | Owner          |
| advisor1   | password123  | ServiceAdvisor |
| mechanic1  | password123  | Mechanic       |
| mechanic2  | password123  | Mechanic       |

**⚠️ IMPORTANT:** Change these passwords in production!

## Core Workflow Demo

1. **Login** as owner/advisor1 (password123)

2. **Create Customer:**
   - Navigate to Customers
   - Click "New Customer"
   - Fill in customer details
   - Save

3. **Add Vehicle:**
   - Navigate to Vehicles
   - Click "New Vehicle"
   - Select customer
   - Enter VIN, year, make, model
   - Save

4. **Create Work Order:**
   - Navigate to Work Orders
   - Click "New Work Order"
   - Select vehicle
   - Enter mileage and description
   - Save

5. **View Work Order Details:**
   - Click "View" on the work order
   - See service lines, parts, and assigned mechanics

6. **Generate Invoice:**
   - (Use API or add UI for invoice generation)
   - POST to `/api/invoices` with workOrderId

7. **Record Payment:**
   - (Use API or add UI for payment recording)
   - POST to `/api/invoices/:id/payments`

## API Documentation

See [`/backend/docs/endpoints.md`](./backend/docs/endpoints.md) for complete API documentation.

**Base URL:** `http://localhost:3000`

**Health Check:** `GET /health`

**Authentication:** All endpoints (except login) require JWT token in header:
```
Authorization: Bearer <your-token>
```

## Database Schema

The database uses MySQL with the following key tables:

- **users** - Authentication and RBAC
- **customers** - Customer information
- **vehicles** - Vehicle records (unique VIN)
- **work_orders** - Work order management
- **service_lines** - Services performed
- **labor_time_entries** - Mechanic time tracking
- **parts_used** - Parts tracking (no inventory)
- **suppliers** - Supplier information
- **invoices** - Invoice generation and tracking
- **payments** - Payment records

All tables support soft deletes with `is_deleted` and `deleted_at` columns.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- RBAC enforcement at API level
- SQL injection protection (parameterized queries)
- CORS configuration
- Input validation
- Error handling without exposing sensitive data

## Development Notes

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload on changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement
```

### Build for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Backend won't start
- Check database credentials in `.env`
- Verify MySQL is running and accessible
- Ensure database and tables exist
- Check PORT is not already in use

### Frontend can't connect to backend
- Verify backend is running on correct port
- Check `VITE_ROOT_API` in frontend `.env`
- Check CORS settings in backend

### Database connection errors
- Verify DB_HOST, DB_USER, DB_PASSWORD in `.env`
- Check MySQL server is running
- Verify database exists: `SHOW DATABASES;`
- Check user permissions

### Login fails
- Verify users exist in database
- Check JWT_SECRET is set in backend `.env`
- Verify password hashing matches (use seed.sql passwords)

## TODO: Required Information

Throughout the codebase, you'll find comments like:
```javascript
// TODO: REQUIRED INFO HERE (fill this in): <description>
```

These indicate where you need to provide environment-specific information like:
- Database credentials
- API URLs
- JWT secrets
- etc.

## License

ISC

## Support

For issues or questions, please refer to the API documentation and this README.

