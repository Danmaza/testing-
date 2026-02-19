# A-OK Transmissions Frontend

Vue 3 + Vite frontend for A-OK Transmissions management system.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env to set VITE_ROOT_API to your backend URL
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173`

5. **Login:**
   Use default credentials:
   - Username: `owner`
   - Password: `password123`

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

- `VITE_ROOT_API` - Backend API base URL (e.g., http://localhost:3000)

## Features

- **Authentication** - JWT-based login with role-based access
- **Dashboard** - Key metrics and quick actions
- **Customers** - Manage customer information
- **Vehicles** - Track customer vehicles (VIN required)
- **Work Orders** - Create and manage work orders
- **Invoices** - View and manage invoices
- **Reports** - Revenue, expenses, labor, and service history

## Tech Stack

- Vue 3 (Composition API)
- Vite
- Vue Router (with auth guards)
- Pinia (state management)
- Axios (API client)

## Project Structure

```
/src
  /api         - Axios instance with interceptors
  /pages       - Page components
  /stores      - Pinia stores for state management
  /router      - Vue Router configuration
  /assets      - CSS and static files
  App.vue      - Root component
  main.js      - App entry point
```

## UI Design

Simple, clean interface optimized for shop environment:
- Large, readable buttons and text
- Clean forms with clear labels
- Simple tables for data display
- Minimal styling, focus on usability
