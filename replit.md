# AssetTracker - Personal Asset Management System

## Overview

AssetTracker is a full-stack web application for personal asset management that allows users to photograph, catalog, and track valuable items with AI-powered analysis for automatic categorization and value estimation. The system combines a React frontend with an Express backend, using PostgreSQL for data persistence through Drizzle ORM.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React with TypeScript, built with Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Material Design color scheme
- **State Management**: TanStack Query for server state management
- **File Upload**: Multer for image processing with memory storage

## Key Components

### Frontend Architecture
- **Component Structure**: Organized with reusable UI components in `/client/src/components/ui/`
- **Custom Components**: Business logic components for asset management (AssetCard, PhotoUpload, AssetDetailModal)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for API state, local React state for UI interactions
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Backend Architecture
- **REST API**: Express.js server with structured route handling
- **Data Layer**: Abstract storage interface with in-memory implementation (easily replaceable with database)
- **File Processing**: Image upload handling with validation and size limits
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development Tools**: Hot reload with Vite integration in development

### Database Schema
- **Users Table**: Basic user authentication structure
- **Assets Table**: Comprehensive asset tracking with fields for:
  - Basic info (name, category, estimated value)
  - AI analysis data (confidence scores)
  - Image storage (URL and base64 data)
  - Metadata (purchase date, notes, timestamps)

## Data Flow

1. **Asset Creation**:
   - User uploads image via drag-and-drop or file picker
   - Frontend analyzes image using mock AI service
   - Form populated with suggested values (name, category, estimated value)
   - User can edit suggestions before saving
   - Asset stored with image data and metadata

2. **Asset Management**:
   - Assets displayed in responsive grid/list view
   - Real-time search and filtering by category
   - Sorting options (value, name, date)
   - Click-to-edit functionality with modal interface

3. **Data Persistence**:
   - PostgreSQL database with Drizzle ORM
   - Automatic schema migrations with `npm run db:push`
   - Database storage implementation for persistent data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database adapter
- **drizzle-orm**: Type-safe ORM with Zod integration
- **@tanstack/react-query**: Server state management
- **multer**: File upload handling
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Modern icon library

### Development Dependencies
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized production bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle migrations support schema versioning

### Environment Configuration
- **Development**: Vite dev server with Express API proxy
- **Production**: Compiled Express server serves static frontend
- **Database**: Configured for PostgreSQL via `DATABASE_URL` environment variable

### Replit Integration
- Custom Vite plugins for Replit development environment
- Error overlay for development debugging
- Banner integration for external access

## Changelog
- July 02, 2025. Initial setup
- July 09, 2025. Localized application interface to Japanese
- July 12, 2025. Added PostgreSQL database with persistent data storage

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Japanese (app interface translated to Japanese)