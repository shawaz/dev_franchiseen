# Loading System Documentation

## Overview
This document describes the comprehensive loading system implemented for the Franchiseen Next.js application, featuring stone and yellow themed loading components.

## Components

### 1. MainLoader (`components/ui/MainLoader.tsx`)
The primary loading component with full customization options.

**Features:**
- Animated logo with glow effect
- Dual-ring spinner animation
- Progress bar (optional)
- Customizable messages
- Stone and yellow theme
- Full-screen or inline display

**Props:**
```typescript
interface MainLoaderProps {
  message?: string;        // Default: "Loading..."
  showProgress?: boolean;  // Default: false
  fullScreen?: boolean;    // Default: true
}
```

**Usage:**
```tsx
import MainLoader from '@/components/ui/MainLoader';

// Full screen with progress
<MainLoader message="Loading your dashboard..." showProgress={true} />

// Inline loader
<MainLoader message="Saving..." fullScreen={false} />
```

### 2. Spinner (`components/Spinner.tsx`)
Enhanced spinner component with size and color options.

**Props:**
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';           // Default: 'md'
  color?: 'yellow' | 'stone' | 'white'; // Default: 'yellow'
}
```

**Usage:**
```tsx
import Spinner from '@/components/Spinner';

<Spinner size="lg" color="yellow" />
```

### 3. CompactLoader (`components/ui/CompactLoader.tsx`)
Lightweight loader for inline use in components.

**Usage:**
```tsx
import CompactLoader from '@/components/ui/CompactLoader';

<CompactLoader message="Processing..." size="sm" />
```

### 4. ButtonLoader (`components/ui/ButtonLoader.tsx`)
Specialized loader for button states.

**Usage:**
```tsx
import ButtonLoader from '@/components/ui/ButtonLoader';

<button disabled={loading}>
  {loading ? (
    <ButtonLoader message="Saving..." size="sm" color="white" />
  ) : (
    'Save Changes'
  )}
</button>
```

### 5. FullScreenLoader (`components/ui/FullScreenLoader.tsx`)
Wrapper around MainLoader for full-screen loading states.

**Usage:**
```tsx
import FullScreenLoader from '@/components/ui/FullScreenLoader';

<FullScreenLoader message="Initializing..." showProgress={true} />
```

## Next.js Loading Pages

### Route-Specific Loading Pages
The following loading pages are automatically shown by Next.js during navigation:

1. **Root Loading** (`app/loading.tsx`)
   - Shows during initial app load

2. **Platform Loading** (`app/(platform)/loading.tsx`)
   - Shows when navigating to platform routes
   - Message: "Loading your dashboard..."

3. **Marketing Loading** (`app/(marketing)/loading.tsx`)
   - Shows when navigating to marketing pages
   - Message: "Loading content..."

4. **Create Franchise Loading** (`app/(platform)/create/loading.tsx`)
   - Shows when accessing franchise creation
   - Message: "Preparing franchise creation..."
   - Includes progress bar

5. **Account Loading** (`app/(platform)/account/loading.tsx`)
   - Shows when loading account pages
   - Message: "Loading your account..."

6. **Brand Loading** (`app/(platform)/[brandSlug]/loading.tsx`)
   - Shows when loading brand-specific pages
   - Message: "Loading brand details..."

## Theme Colors

### Stone Theme
- **Light Mode:** stone-50, stone-200, stone-600, stone-800
- **Dark Mode:** stone-900, stone-700, stone-400, stone-200

### Yellow Accents
- **Primary:** yellow-500, yellow-400
- **Gradient:** from-yellow-400 to-yellow-500

## Import Shortcuts

Use the centralized export for easy imports:

```tsx
import { 
  MainLoader, 
  FullScreenLoader, 
  CompactLoader, 
  ButtonLoader, 
  Spinner 
} from '@/components/ui/loaders';
```

## Best Practices

1. **Use MainLoader** for full-page loading states
2. **Use CompactLoader** for section-specific loading
3. **Use ButtonLoader** for form submissions and actions
4. **Use Spinner** for simple loading indicators
5. **Always provide meaningful messages** to improve UX
6. **Use progress bars** for long-running operations
7. **Match the theme** with stone and yellow colors

## Animation Details

- **Spinner:** Dual-ring animation with reverse rotation
- **Logo:** Pulsing glow effect with drop shadow
- **Progress:** Smooth gradient animation
- **Dots:** Animated loading dots (...) 
- **Timing:** Optimized for smooth 60fps animations
