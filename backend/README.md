# A-OK Transmissions Backend

Express.js API server for A-OK Transmissions management system.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database:**
   ```bash
   # Connect to MySQL
   mysql -u root -p

   # Run these commands:
   CREATE DATABASE aok_transmissions;
   USE aok_transmissions;
   source sql/schema.sql;
   source sql/seed.sql;
   ```

4. **Start server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

## Environment Variables

See `.env.example` for all required variables. Key variables:

- `DB_HOST` - MySQL host (e.g., localhost or AWS RDS endpoint)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (e.g., aok_transmissions)
- `JWT_SECRET` - Secret for JWT signing (generate with: `openssl rand -base64 32`)
- `PORT` - Server port (default: 3000)

## API Documentation

See `/docs/endpoints.md` for complete API documentation.

## Default Users

After running seed.sql:
- **owner** / password123 (Owner role)
- **advisor1** / password123 (ServiceAdvisor role)
- **mechanic1** / password123 (Mechanic role)

## Project Structure

```
/src
  /db          - Database connection pool
  /middleware  - Auth, RBAC, error handling
  /routes      - API route definitions
  /services    - Business logic
  /utils       - Helper functions
  server.js    - Main entry point

/sql
  schema.sql   - Database schema
  seed.sql     - Sample data

/docs
  endpoints.md - API documentation
```
