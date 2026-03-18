# S-Printer - Photo Printing Service

## Overview

S-Printer (s-printer.by) is a Russian-language photo printing e-commerce platform that allows users to order custom photo products including photo albums, printed photos, and calendars. Users can upload their own photos or book professional photographers for photo sessions. The platform includes customer-facing ordering flows and an admin dashboard for order management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Brand

- **Logo**: S-Printer logo from `attached_assets/sprinter-logo.svg`
- **Primary Color**: #42CC55 (green, HSL 128 58% 43%)
- **Color Scheme**: White/grey backgrounds with #42CC55 accent

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx (development) and esbuild (production)
- **API Design**: RESTful JSON API with `/api` prefix
- **Authentication**: Passport.js with local strategy, session-based auth using express-session with memory store

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts` contains all table definitions and Zod validation schemas
- **Session Storage**: In-memory store (memorystore)

### File Storage
- **Object Storage**: Google Cloud Storage via Replit's object storage sidecar
- **Upload Flow**: Signed URL generation for direct client uploads
- **File paths**: Stored in `.private/photos/` directory within the bucket

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
  - Product name for photos is **"photos"** (was "prints", fixed via seed migration)
- **orders**: Customer orders with JSONB product configuration
- **orderPhotos**: Links uploaded photos to orders

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | home-page.tsx | Landing page (redirects logged-in users to /catalog) |
| `/auth` | auth-page.tsx | Login and registration |
| `/catalog` | catalog-page.tsx | Product catalog |
| `/product/:type` | product-config-page.tsx | Product configuration (photoalbum, photos, calendar) |
| `/upload` | upload-photos-page.tsx | Photo upload |
| `/photographer` | photographer-selection-page.tsx | Photographer booking |
| `/profile` | profile-page.tsx | User order history |
| `/admin` | admin-dashboard-page.tsx | Admin order management |

## Admin Credentials
- Username: `admin`
- Password: `admin123`

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless Postgres, configured via `DATABASE_URL` environment variable

### Object Storage
- **Google Cloud Storage**: Accessed through Replit's sidecar service at `http://127.0.0.1:1106`
- **Bucket ID**: `DEFAULT_OBJECT_STORAGE_BUCKET_ID` environment variable
- **Private dir**: `PRIVATE_OBJECT_DIR` environment variable

## Key Files

- `server/seed.ts` - Database seeding (runs on startup, includes product name fix)
- `server/object-storage.ts` - Object storage utilities for signed URL generation
- `server/routes.ts` - All API routes
- `client/src/index.css` - Theme CSS variables (primary color = green #42CC55)
- `attached_assets/sprinter-logo.svg` - Brand logo
