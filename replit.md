# SchoolAPI Documentation

## Overview

SchoolAPI is a full-stack application for managing school systems. It is built with a React frontend and an Express.js backend, using a PostgreSQL database with Drizzle ORM for data persistence. The system supports management of schools, classes, students, teachers, subjects, and various educational entities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a classic client-server architecture:

1. **Frontend**: React-based SPA (Single Page Application) with modern UI components from Radix UI and styled with Tailwind CSS
2. **Backend**: Express.js RESTful API with modular controllers and middleware
3. **Database**: PostgreSQL with Drizzle ORM for schema management and querying
4. **Authentication**: JWT-based authentication system with refresh token support

The application is structured to provide a complete school management system with user roles, permissions, and multiple schools/establishments management capabilities.

## Key Components

### Backend (Server)

1. **API Routes (`server/routes/`)**: Organized by resource type (apprenants, auth, classes, etc.)
2. **Controllers (`server/controllers/`)**: Business logic implementation for each API endpoint
3. **Middleware (`server/middlewares/`)**: Reusable components for authentication, error handling, validation, and rate limiting
4. **Storage (`server/storage.ts`)**: Interface for database operations
5. **Database Connection (`server/db.ts`)**: Establishes connection to PostgreSQL using Drizzle ORM
6. **Swagger Documentation (`server/swagger.ts`)**: API documentation

### Frontend (Client)

1. **Pages (`client/src/pages/`)**: Main application views
2. **Components (`client/src/components/`)**: UI components, primarily using Shadcn/UI components
3. **Hooks (`client/src/hooks/`)**: Custom React hooks for shared behaviors
4. **API Utilities (`client/src/lib/`)**: Functions for interacting with the backend
5. **UI Components (`client/src/components/ui/`)**: Base UI components using Radix UI primitives

### Shared

1. **Database Schema (`shared/schema.ts`)**: Defines the PostgreSQL tables and relationships using Drizzle ORM
2. **Validators (`shared/validators.ts`)**: Zod schemas for validation across frontend and backend

## Data Flow

1. **User Authentication**:
   - User submits credentials via the login form
   - Backend validates credentials and issues a JWT token and refresh token
   - Frontend stores tokens in localStorage
   - Authorized API requests include the JWT token in their headers

2. **Data Operations**:
   - Frontend components make requests to the backend API endpoints
   - Backend validates the request through middleware (authentication, validation)
   - Controllers interact with the storage layer to perform database operations
   - Responses are formatted and returned to the frontend
   - React Query is used for state management and caching

3. **Error Handling**:
   - Global error handling middleware on the backend
   - Error responses propagated to the frontend
   - Toast notifications for user feedback

## External Dependencies

### Backend Dependencies
- Express.js for API routing
- Drizzle ORM for database operations
- bcryptjs for password hashing
- jsonwebtoken for authentication
- winston for logging
- zod for validation
- swagger-jsdoc and swagger-ui-express for API documentation

### Frontend Dependencies
- React for UI
- React Query for data fetching
- Radix UI for accessible UI primitives
- Tailwind CSS for styling
- Shadcn UI component collection
- React Hook Form for form management

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Frontend: Vite builds the React application into static assets
   - Backend: esbuild compiles the TypeScript server code
   
2. **Runtime Configuration**:
   - Production environment uses the compiled server code
   - Serves static frontend assets from the build directory
   - Environment variables manage configuration differences between environments

3. **Database**: 
   - Uses Neon Serverless PostgreSQL for data storage
   - Connection is established through the DATABASE_URL environment variable

4. **DevOps Considerations**:
   - Logging is configured differently for development vs production
   - Error handling is more verbose in development
   - Rate limiting protects API endpoints from abuse

## Getting Started

1. **Prerequisites**:
   - Node.js environment
   - PostgreSQL database (or Neon Serverless PostgreSQL)
   - DATABASE_URL environment variable

2. **Development**:
   - Run `npm run dev` to start the development server
   - The backend API will be available at `/api/v1/`
   - The frontend will be served on port 5000

3. **Database Setup**:
   - Run `npm run db:push` to synchronize the database schema
   - Ensure the DATABASE_URL is properly configured

4. **Production**:
   - Build the application with `npm run build`
   - Start the production server with `npm run start`