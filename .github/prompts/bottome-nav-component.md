# Claude Code Prompt: Bottom Navigator Component

## 🎯 Task
สร้าง responsive bottom navigation bar สำหรับ travel booking app

## 📋 Requirements

### 1. Component Structure
```
src/components/bottom-navigator.tsx
```

### 2. Features
- แสดงเฉพาะ mobile/tablet (hidden บน desktop)
- 4 main tabs: Home, Bookings, Favorites, Profile
- Active state indicators
- Badge notifications สำหรับ bookings
- Smooth animations

### 3. Design Specs
- **Height**: 60px + safe area
- **Background**: White with shadow
- **Active Color**: #1890ff (Ant Design blue)
- **Inactive Color**: #8c8c8c
- **Icons**: Ant Design icons
- **Typography**: 10px labels

### 4. Technical Requirements
- TypeScript + React FC
- Ant Design components
- Tailwind CSS for layout
- Next.js router integration
- Show/hide based on route
- PWA safe area support

### 5. Responsive Behavior
- **Mobile**: Fixed bottom position
- **Tablet**: Show แบบ landscape
- **Desktop**: Hidden (ใช้ main navbar)
- **PWA**: Support safe area insets

### 6. Navigation Items
```typescript
interface NavItem {
  key: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}
```

### 7. Hide Conditions
- Login/Register pages
- Admin pages  
- Checkout flow
- Error pages

## 🎨 Visual Design
- Fixed position bottom
- Subtle shadow/border top
- Icon + label layout
- Active tab highlighted
- Badge อยู่มุมขวาบนของ icon

## 🔧 Integration
- Import ใน layout.tsx
- Conditional rendering based on route
- State management สำหรับ badge count
- เชื่อมกับ existing auth context

Create complete working component with TypeScript interfaces and proper responsive design.