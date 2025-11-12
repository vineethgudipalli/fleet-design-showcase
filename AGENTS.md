# Fleet Design Showcase - Agent Context

## Project Overview

This is a **Shopify-inspired clone application** designed as a showcase platform for teams to display and manage their Figma prototypes and videos. The application serves as a collaborative platform for design teams to share, review, and get feedback on prototypes.

### Key Characteristics

-   **Fleet management focus** - Specifically designed for fleet management design prototypes
-   **Professional interface** with Figma-inspired dark aesthetic
-   **Collaborative commenting functionality** built-in
-   **Prototypes are the star** - dedicated full pages rather than side panels
-   **LinkedIn-style reaction system** with three reaction types: heart, like, idea
-   **Simplified import flow** where users can add prototypes via URL

## Application Architecture

### Tech Stack

-   **React** with TypeScript
-   **Tailwind CSS v4.0** for styling
-   **Motion/React** for animations (formerly Framer Motion)
-   **Shadcn/ui** components
-   **Lucide React** for icons

### Design System

-   **Primary Color**: Figma blue `#0d99ff` with white text for optimal legibility
-   **Dark Theme**: Figma-inspired dark aesthetic throughout
-   **Background Colors**:
    -   Main: `#1e1e1e`
    -   Secondary: `#2c2c2c`
    -   Borders: `#3e3e3e`

## Authentication System

### Figma OAuth 2.0 Implementation

-   **OAuth Flow**: Authorization Code flow with PKCE
-   **Redirect URI**: `http://localhost:3000/auth/figma/callback` (development)
-   **Scopes**: `current_user:read`, `file_content:read`, `file_metadata:read`
-   **Component**: `FigmaAuthDirect.tsx` handles OAuth callback and token exchange
-   **Proxy Server**: Node.js Express server on port 3001 for secure token exchange
-   **State Management**: `AuthContext.tsx` manages user authentication state
-   **Storage**: localStorage for persistence (`figma_access_token`, `figma_user`, `fleet_user`)

### Figma API Integration

**Official API Specification**: https://github.com/figma/rest-api-spec/blob/main/openapi/openapi.yaml

**Key Endpoints Used**:

-   `GET /v1/me` - Fetch authenticated user information
-   `GET /v1/files/:file_key` - Fetch file metadata and structure
-   `GET /v1/images/:file_key` - Generate thumbnail images for nodes
-   `POST /oauth/token` - Exchange authorization code for access token

**Service**: `src/services/figmaApi.ts`

-   Uses `@figma/rest-api-spec` TypeScript types
-   Token-based authentication via `Authorization` header
-   Parses Figma URLs to extract `fileKey` and `nodeId`
-   Fetches file metadata, thumbnails, and author information
-   Generates embed URLs using `embed.figma.com` format

**Author Attribution**:

-   Imported prototypes display the **Figma file owner's** username/email as author
-   Fetched from `/v1/me` endpoint during import
-   Not the person importing, but the original file creator

**Important Notes**:

-   Figma API requires authentication token for most operations
-   File access respects Figma's permission model (403 errors for unauthorized files)
-   Thumbnail generation has fallback strategies: nodeId → first frame → document root
-   Embed URLs use `https://embed.figma.com/proto/{fileKey}?node-id={nodeId}` format

## User Interface Structure

### Main Navigation

**Customer Journey Experience Tabs** (horizontal navigation):

-   All
-   Discover
-   Onboard
-   Shop
-   Core OS
-   Applications
-   Growth
-   Support

### Filtering System

**Single Personas Filter Dropdown** with 11 personas (alphabetical order):

1. Asset Manager
2. Compliance Manager
3. Dispatcher
4. Driver
5. Fleet Manager
6. IT Administrator
7. Maintenance Manager
8. Owner/Operator
9. Safety Manager
10. Sustainability Manager
11. Technician

### Search & Sort

-   **Unified Search Bar**: Central search functionality
-   **Sort Options**: Latest, Views, Alphabetical, Most loved, Trending
-   **Centered Layout**: Hero section with search prominently displayed

## Core Components

### FullscreenPrototypeModal (`/components/FullscreenPrototypeModal.tsx`)

-   **True Fullscreen**: Covers entire viewport
-   **Split Layout**: 3/4 prototype viewer + 1/4 details sidebar
-   **Close Button**: Top-right corner positioning
-   **Compact Sidebar**: No h4 headings (except Comments), streamlined sections
-   **Scrollable Content**: Overflow scroll for sidebar content

### ReactionButton (`/components/ReactionButton.tsx`)

**Standalone component with:**

-   Individual ID prop
-   Icon support (regular and 3D states)
-   Count state management
-   Size variants (sm, lg)
-   Configurable styling (selectedColor, selectedBgColor)
-   Click handler
-   Custom className support

### PrototypeReactions (`/components/PrototypeReactions.tsx`)

-   **Three Reaction Types**: heart, like, idea
-   **Interactive Animations**: Motion-based feedback
-   **State Management**: User reaction tracking and counts
-   **Uses ReactionButton**: Modular approach

## Key Features

### Prototype Management

-   **URL-based Import**: Users add prototypes via URLs (Figma import hidden)
-   **Grid Display**: Responsive prototype grid layout
-   **Fullscreen Viewing**: Immersive prototype experience
-   **Comments System**: Collaborative feedback functionality

### User Experience

-   **Responsive Design**: Mobile-first approach
-   **Motion Design**: Smooth animations throughout
-   **Accessibility**: Screen reader compliant
-   **Loading States**: Smooth transitions and feedback

## File Structure Notes

### Protected Files

-   `/components/figma/ImageWithFallback.tsx` - System protected, do not modify

### Important Conventions

-   **No Font Classes**: Don't use Tailwind font size, weight, or line-height classes unless specifically requested
-   **Consistent Styling**: Use Figma blue `#0d99ff` for primary actions
-   **Dark Theme**: All components follow dark theme conventions

## Development Guidelines

### Styling Rules

1. **No Typography Overrides**: Default typography from `globals.css` should be preserved
2. **Color Consistency**: Use defined color variables from CSS custom properties
3. **Motion**: Use `motion/react` for animations, not the old `framer-motion`
4. **Components**: Prefer component composition over inline complexity

### State Management

-   **Local State**: React useState for component-specific state
-   **Prototype Data**: Centralized in `PrototypeContext.tsx` with localStorage persistence
-   **User Authentication**: Managed via `AuthContext.tsx` with `fleet_user` localStorage key
-   **Filter State**: Managed in App.tsx and passed to filtering hook

### Type System (`src/types/index.ts`)

**Enums**:

-   `Experience` - Customer journey stages (All, Discover, Onboard, Shop, CoreOS, Applications, Growth, Support)
-   `Persona` - User roles (11 personas: Fleet Manager, Driver, Technician, etc.)
-   `SortOption` - Sorting methods (Latest, Views, Alphabetical, MostLoved, Trending)

**Constants**:

-   `EXPERIENCE_LABELS` - UI display names for experiences
-   `PERSONA_LABELS` - UI display names for personas
-   `SORT_LABELS` - UI display names for sort options
-   `EXPERIENCES` - Array of all experience enum values
-   `PERSONAS` - Array of all persona enum values

**Usage**: Import from `src/types` for consistent type safety across the application

## Recent Architectural Changes

### Modal System

-   **Fullscreen Implementation**: True viewport coverage with override classes
-   **Accessibility**: Proper DialogTitle and DialogDescription for screen readers
-   **Responsive**: Mobile and desktop optimized

### Component Extraction

-   **ReactionButton**: Extracted from inline button for reusability
-   **Modular Design**: Each component has clear responsibilities
-   **Props Interface**: Well-defined TypeScript interfaces

## Current State

The application features a complete authentication system with Figma OAuth, prototype import and display, fullscreen modal viewing, reaction system, commenting functionality, and advanced filtering. The interface is optimized for design team collaboration with a focus on prototype showcase and feedback collection.

### Implemented Features

✅ **Authentication**

-   Figma OAuth 2.0 with token exchange via proxy server
-   Persistent login across sessions via localStorage
-   User profile with avatar and initials
-   Secure logout clearing all auth data

✅ **Prototype Management**

-   Import from Figma URLs with automatic metadata fetching
-   Author attribution showing original file owner
-   Thumbnail generation with multi-strategy fallbacks
-   Multi-select for experiences (7 categories) and personas (11 types)
-   localStorage persistence across browser sessions

✅ **Filtering & Search**

-   Experience-based filtering (supports arrays for multi-category prototypes)
-   Persona-based filtering
-   Text search across title, description, author, and tags
-   Multiple sort options (Latest, Views, Alphabetical, Most loved, Trending)

✅ **Interaction Features**

-   Three reaction types (heart, like, idea) with custom 3D icons
-   Commenting system with author attribution
-   View count tracking
-   Authentication-based feature access (view-only for unauthenticated users)

✅ **UI/UX**

-   Figma-inspired dark theme
-   Responsive design (mobile, tablet, desktop)
-   Motion animations for smooth transitions
-   Empty states with contextual messaging
-   Fullscreen prototype viewer with split layout

### Next Development Areas

-   Real-time collaboration features
-   Prototype version history
-   Team workspaces and sharing
-   Advanced analytics and insights
-   Export and reporting capabilities
