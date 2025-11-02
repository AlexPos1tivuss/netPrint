# Russian Photo Printing Service (ФотоПринт)

## Overview

ФотоПринт is a comprehensive photo printing e-commerce platform inspired by netprint.ru, designed for the Russian market. The application enables users to order custom photo products (photo albums, prints, and calendars), upload photos, hire professional photographers, and track orders. It features a full-stack architecture with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for Russian market aesthetics

**Design System:**
- Custom theme using "new-york" shadcn style with Roboto font family for excellent Cyrillic support
- Neutral color palette with CSS variables for consistent theming
- Responsive grid layouts optimized for product catalogs and configurators
- Component aliases configured for clean imports (@/components, @/lib, @/hooks)

**Key Features:**
- Protected routes with authentication checks
- Photo upload interface with file validation
- Product configuration wizards (albums, prints, calendars)
- Photographer booking system with calendar and location selection
- User profile and order history dashboard
- Admin panel for order management

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API
- **Database ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: Scrypt for password hashing with salt

**Authentication & Authorization:**
- Session-based authentication using memory store (development) with httpOnly cookies
- Role-based access control (regular users vs. administrators)
- Password hashing using scrypt with random salts for security
- Middleware guards for protected routes (requireAuth, requireAdmin)

**API Structure:**
- RESTful endpoints for CRUD operations
- Authentication endpoints (/api/login, /api/register, /api/logout)
- Photo upload with signed URL generation
- Photographer management endpoints
- Order creation and status tracking
- Admin-only order management endpoints

**Database Schema:**
- **users**: Authentication and user profiles with admin flag
- **photographers**: Professional photographer profiles with pricing and specializations
- **productTypes**: Configurable product catalog (albums, photos, calendars)
- **orders**: Order records with JSON-based product configuration and photo source tracking
- **orderPhotos**: Individual photos associated with orders

### External Dependencies

**Cloud Services:**
- **Google Cloud Storage**: Object storage for user-uploaded photos
  - Signed URL generation for secure direct uploads
  - Private directory structure for photo isolation
  - Temporary signed URLs for downloads (1-hour expiration)
  - Bucket configuration via environment variables

**Database:**
- **Neon Serverless PostgreSQL**: Managed PostgreSQL database
  - WebSocket-based connection pooling
  - Connection string configured via DATABASE_URL environment variable
  - Drizzle ORM for type-safe database queries

**Third-Party Libraries:**
- **Uppy**: File upload UI with AWS S3 compatibility (configured for Google Cloud Storage)
  - Dashboard widget for multi-file selection
  - Progress tracking and validation
- **date-fns**: Date formatting and manipulation with Russian locale support
- **Radix UI**: Headless accessible component primitives for UI consistency
- **Zod**: Schema validation for forms and API requests

**Development Tools:**
- **Replit Integration**: Vite plugins for development banner and cartographer
- **Drizzle Kit**: Database migrations and schema management
- **esbuild**: Production build bundling for server code

**Environment Configuration:**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`: Google Cloud Storage bucket name
- `PRIVATE_OBJECT_DIR`: Object storage directory prefix for photos
- `SESSION_SECRET`: Session encryption key (should be changed in production)

**Asset Management:**
- Generated images stored in `/attached_assets/generated_images/`
- Logo and product images referenced in frontend components
- Public assets served through Vite in development, static serving in production