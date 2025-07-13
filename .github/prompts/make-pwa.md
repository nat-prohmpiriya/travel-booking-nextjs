
## 🎯 Task: Create PWA Configuration for Travel Booking App

Create a complete Progressive Web App (PWA) setup for our Next.js 15 travel booking application. The app should be installable, work offline, and support push notifications.

### Required Files to Create:

1. **`public/manifest.json`** - App manifest for installability
2. **`public/sw.js`** - Service worker for offline functionality  
3. **`src/app/offline/page.tsx`** - Offline fallback page
4. **`src/hooks/use-pwa.ts`** - PWA utilities hook
5. **`src/components/install-prompt.tsx`** - Install app component
6. **Update `src/app/layout.tsx`** - Add PWA meta tags and register service worker

### PWA Requirements:

- **Installable**: Users can install app on mobile/desktop
- **Offline Support**: Basic navigation works without internet
- **Background Sync**: Queue booking requests when offline
- **Push Notifications**: Booking confirmations and updates
- **App Icons**: All required sizes (72x72 to 512x512)
- **Responsive**: Works on mobile and desktop

### Technical Specs:

- **Framework**: Next.js 15 + TypeScript + React 19
- **UI**: Ant Design + Tailwind CSS
- **Cache Strategy**: Cache First for static assets, Network First for API
- **Offline Fallback**: Show friendly offline page for navigation
- **Background Sync**: For booking submissions when offline
- **Push API**: Firebase Cloud Messaging integration

### App Details:
- **Name**: "Travel Booking"
- **Short Name**: "WebCustomer" 
- **Theme Color**: "#1890ff" (Ant Design blue)
- **Background**: "#ffffff"
- **Start URL**: "/"
- **Display**: "standalone"

### Key Features to Implement:

1. **Service Worker Registration**: Auto-register in layout.tsx
2. **Install Banner**: Show install prompt for eligible users
3. **Offline Detection**: Show network status to users
4. **Cache Management**: Cache static assets and API responses
5. **Background Sync**: Queue failed requests for retry
6. **Push Subscription**: Handle FCM token registration

### File Structure Expected:
```
public/
├── manifest.json
├── sw.js
├── favicon.ico
└── icons/
    ├── apple-icon-180.png
    ├── icon-192x192.png
    └── icon-512x512.png

src/
├── app/
│   ├── layout.tsx (update)
│   └── offline/
│       └── page.tsx
├── hooks/
│   └── use-pwa.ts
└── components/
    └── install-prompt.tsx
```

### Code Requirements:

- Use TypeScript with proper interfaces
- Follow Next.js 15 app router conventions
- Use Ant Design components for UI
- Include error handling and loading states
- Add proper SEO meta tags for PWA
- Ensure accessibility compliance

### Testing Checklist:

- [ ] App installs on mobile Chrome/Safari
- [ ] Works offline (shows offline page)
- [ ] Service worker caches resources
- [ ] Push notifications work
- [ ] Install prompt appears appropriately
- [ ] Icons display correctly in all contexts
- [ ] App manifest validates (Chrome DevTools)

Create all files with proper implementation and ensure they work together seamlessly. Include comments explaining key PWA concepts for future maintenance.