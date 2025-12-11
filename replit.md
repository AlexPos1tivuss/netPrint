# netPrint - Photo Printing Service

## Overview

netPrint is a Russian-language photo printing e-commerce platform that allows users to order custom photo products including photo albums, printed photos, and calendars. Users can upload their own photos or book professional photographers for photo sessions. The platform includes customer-facing ordering flows and an admin dashboard for order management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with React plugin
- **Animations**: Framer Motion for page transitions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx (development) and esbuild (production)
- **API Design**: RESTful JSON API with `/api` prefix
- **Authentication**: Passport.js with local strategy, session-based auth using express-session with memory store

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts` contains all table definitions and Zod validation schemas
- **Session Storage**: In-memory store (memorystore) - suitable for development, consider Redis for production

### File Storage
- **Object Storage**: Google Cloud Storage via Replit's object storage sidecar
- **Upload Flow**: Signed URL generation for direct client uploads
- **File Upload UI**: Uppy library for dashboard-style file uploads

### Key Design Patterns
- **Shared Types**: The `shared/` directory contains schema definitions used by both frontend and backend
- **Path Aliases**: TypeScript path aliases (`@/` for client, `@shared/` for shared code)
- **Protected Routes**: Client-side route protection with redirect to auth page
- **Admin Authorization**: Server-side middleware checks for admin privileges

### Database Schema
The application uses these main entities:
- **users**: Authentication with username/password, admin flag
- **photographers**: Professional photographer profiles with hourly rates
- **productTypes**: Configurable product catalog (photoalbum, photos, calendar)
- **orders**: Customer orders with JSONB product configuration
- **orderPhotos**: Links uploaded photos to orders

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless Postgres, configured via `DATABASE_URL` environment variable
- **Connection**: Uses WebSocket connections for serverless compatibility

### Object Storage
- **Google Cloud Storage**: Accessed through Replit's sidecar service at `http://127.0.0.1:1106`
- **Bucket**: Configured via `DEFAULT_OBJECT_STORAGE_BUCKET_ID` environment variable
- **Private Directory**: Configured via `PRIVATE_OBJECT_DIR` environment variable

### Authentication
- **Session Secret**: Configured via `SESSION_SECRET` environment variable (has fallback for development)

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **Hot Module Replacement**: Vite HMR with WebSocket server integration