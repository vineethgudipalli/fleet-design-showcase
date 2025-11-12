# Fleet Design Showcase

A modern, simplified prototype showcase application built with React, TypeScript, and Tailwind CSS. Features clean architecture with Context API, custom hooks, and focused components.

**Original Figma Design**: https://www.figma.com/design/H5q9UKbQHaKdKCB9GEFPBV/Fleet-Design-Showcase

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## ✨ Recent Improvements

This application has been **completely restructured** with:

-   ✅ **52% reduction** in main App.tsx complexity (524 → 250 lines)
-   ✅ **Context-based state management** (AuthContext + PrototypeContext)
-   ✅ **Custom hooks** for business logic (usePrototypeFilter)
-   ✅ **Focused components** with single responsibilities
-   ✅ **Zero prop drilling** through component trees
-   ✅ **100% TypeScript** with no errors

## 📁 Project Structure

```
src/
├── App.tsx                    # Main orchestration layer
├── contexts/                  # State management
│   ├── AuthContext.tsx       # User authentication
│   └── PrototypeContext.tsx  # Prototype CRUD
├── hooks/                     # Business logic
│   └── usePrototypeFilter.ts # Filtering & sorting
├── components/
│   ├── AppHeader.tsx         # Application header
│   ├── FigmaAuth.tsx         # Figma OAuth integration
│   ├── FigmaFileInfo.tsx     # File metadata viewer
│   └── ... (other components)
└── styles/
    └── globals.css            # Tailwind config
```

## 🎯 Architecture

### Context-Based State Management

```tsx
// Authentication
import { useAuth } from "./contexts/AuthContext";
const { user, isAuthenticated, login, logout } = useAuth();

// Prototypes
import { usePrototypes } from "./contexts/PrototypeContext";
const { prototypes, addPrototype, toggleReaction } = usePrototypes();

// Filtering
import { usePrototypeFilter } from "./hooks/usePrototypeFilter";
const filtered = usePrototypeFilter({ prototypes, searchQuery, experience });
```

### Key Features

-   **No Prop Drilling**: Contexts provide global state
-   **Clean Separation**: State, logic, and UI are independent
-   **Type Safe**: Full TypeScript coverage
-   **Performance**: Memoized filtering and selective updates

## 📚 Documentation

-   **[SUMMARY.md](SUMMARY.md)** - Overview of improvements
-   **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Detailed architecture guide
-   **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Code examples and patterns
-   **[ARCHITECTURE.md](ARCHITECTURE.md)** - Visual diagrams and flow

## 🛠️ Tech Stack

-   **React 18** - UI framework
-   **TypeScript** - Type safety
-   **Tailwind CSS** - Styling
-   **Motion** - Animations
-   **Radix UI** - Accessible components
-   **Vite** - Build tool

## 🎨 Design System

### Colors

```css
--primary: #0d99ff         /* Figma Blue */
--bg-main: #1e1e1e         /* Dark background */
--bg-secondary: #2c2c2c    /* Cards */
--bg-border: #3e3e3e       /* Borders */
```

### Components

All components follow the Fleet Design Showcase design patterns with:

-   Dark theme throughout
-   Smooth animations
-   Accessible interfaces
-   Mobile responsive

## 🔧 Development

### Adding New Features

1. **Need global state?** → Add to Context

```tsx
// src/contexts/MyContext.tsx
export function MyProvider({ children }) { ... }
export function useMyContext() { ... }
```

2. **Need business logic?** → Create a Hook

```tsx
// src/hooks/useMyLogic.ts
export function useMyLogic() { ... }
```

3. **Need UI?** → Create a Component

```tsx
// src/components/MyComponent.tsx
export function MyComponent() { ... }
```

### Best Practices

-   ✅ Use contexts for global state
-   ✅ Keep components small and focused
-   ✅ Extract complex logic to hooks
-   ✅ Follow TypeScript types
-   ❌ Don't prop drill
-   ❌ Don't mix concerns

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📦 Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Follow the existing architecture patterns
2. Use contexts for state, hooks for logic, components for UI
3. Keep App.tsx minimal (orchestration only)
4. Add TypeScript types for everything
5. Check QUICK_REFERENCE.md for code examples

## 📄 License

This project is part of the Fleet Design Showcase.

---

**Need help?** Check the documentation files:

-   Quick examples: `QUICK_REFERENCE.md`
-   Architecture details: `IMPROVEMENTS.md`
-   Visual diagrams: `ARCHITECTURE.md`
