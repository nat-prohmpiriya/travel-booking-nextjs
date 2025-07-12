# Travel Booking App - Copilot Instructions

## Tech Stack
- Next.js 15 + TypeScript + React 19
- Ant Design + Tailwind CSS
- Zustand (state management)
- Firebase (auth, Firestore, storage) as backend service
- PWA enabled (offline support, installable)
- mock image use Unsplash

## PWA Requirements
- Service Worker for offline caching
- App manifest for installability
- Offline fallback pages
- Background sync for bookings
- Push notifications for booking updates

## Code Style
- Functional components with hooks only
- TypeScript interfaces for all data
- Ant Design components first, Tailwind for spacing
- File naming: kebab-case for files, PascalCase for components

## Folder Structure
```
src/
├── app/           # Next.js pages
├── components/    # React components
├── stores/        # Zustand stores  
├── services/      # Firebase services
├── types/         # TypeScript types
└── hooks/         # Custom hooks
```

## Zustand Pattern
```typescript
interface StoreState {
  data: Type[];
  isLoading: boolean;
  actions: () => void;
}

export const useStore = create<StoreState>((set) => ({
  // state and actions
}));
```

## Component Pattern
```typescript
interface Props {
  // props here
}

export const ComponentName: React.FC<Props> = ({ }) => {
  // hooks first
  // handlers second  
  // return JSX with Ant Design
};
```

Always use error handling, loading states, and responsive design.