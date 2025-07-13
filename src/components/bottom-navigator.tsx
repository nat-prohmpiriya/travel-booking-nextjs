'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from 'antd';
import {
  HomeOutlined,
  HomeFilled,
  CalendarOutlined,
  CalendarFilled,
  HeartOutlined,
  HeartFilled,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
  requireAuth?: boolean;
}

interface BottomNavigatorProps {
  className?: string;
}

const BottomNavigator: React.FC<BottomNavigatorProps> = ({ className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Navigation items configuration
  const navItems: NavItem[] = [
    {
      key: 'home',
      icon: <HomeOutlined style={{ fontSize: '20px' }} />,
      activeIcon: <HomeFilled style={{ fontSize: '20px' }} />,
      label: 'Home',
      path: '/',
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined style={{ fontSize: '20px' }} />,
      activeIcon: <CalendarFilled style={{ fontSize: '20px' }} />,
      label: 'Bookings',
      path: '/account/bookings',
      badge: bookingCount,
      requireAuth: true,
    },
    {
      key: 'favorites',
      icon: <HeartOutlined style={{ fontSize: '20px' }} />,
      activeIcon: <HeartFilled style={{ fontSize: '20px' }} />,
      label: 'Favorites',
      path: '/favorites',
      badge: favoritesCount,
      requireAuth: true,
    },
    {
      key: 'profile',
      icon: <UserOutlined style={{ fontSize: '20px' }} />,
      activeIcon: <UserOutlined style={{ fontSize: '20px', fontWeight: 'bold' }} />,
      label: 'Profile',
      path: user ? '/account' : '/auth/signin',
    },
  ];

  // Routes where bottom navigation should be hidden
  const hiddenRoutes: string[] = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/admin',
    '/booking/payment',
    '/offline',
  ];

  // Route prefixes where bottom navigation should be hidden
  const hiddenRoutePrefixes: string[] = [
    '/admin/',
    '/booking/confirmation/',
  ];

  // Check if current route should hide bottom navigation
  const shouldHideNavigation = (): boolean => {
    // Check exact routes
    if (hiddenRoutes.includes(pathname)) {
      return true;
    }

    // Check route prefixes
    return hiddenRoutePrefixes.some(prefix => pathname.startsWith(prefix));
  };

  // Get active navigation key based on current pathname
  const getActiveKey = (): string => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/account/bookings')) return 'bookings';
    if (pathname.startsWith('/favorites')) return 'favorites';
    if (pathname.startsWith('/account') || pathname.startsWith('/auth')) return 'profile';
    return 'home';
  };

  // Handle navigation item click
  const handleNavigation = (item: NavItem): void => {
    // If item requires auth and user is not logged in, redirect to signin
    if (item.requireAuth && !user) {
      router.push('/auth/signin');
      return;
    }

    router.push(item.path);
  };

  // Mock function to fetch booking count
  useEffect(() => {
    const fetchBookingCount = async (): Promise<void> => {
      if (user) {
        // TODO: Replace with actual API call
        setBookingCount(3);
      } else {
        setBookingCount(0);
      }
    };

    fetchBookingCount();
  }, [user]);

  // Mock function to fetch favorites count
  useEffect(() => {
    const fetchFavoritesCount = async (): Promise<void> => {
      if (user) {
        // TODO: Replace with actual API call
        setFavoritesCount(5);
      } else {
        setFavoritesCount(0);
      }
    };

    fetchFavoritesCount();
  }, [user]);

  // Prevent hydration issues
  if (!isClient) {
    return null;
  }

  // Don't render if should be hidden
  if (shouldHideNavigation()) {
    return null;
  }

  const activeKey: string = getActiveKey();

  return (
    <div className="h-16 block lg:hidden w-full">
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg w-full">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item: NavItem) => {
            const isActive: boolean = activeKey === item.key;
            const showBadge: boolean = Boolean(item.badge && item.badge > 0 && user);

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item)}
                className={`
                  flex flex-col items-center justify-center
                  min-w-0 flex-1 py-1 px-1
                  transition-all duration-200 ease-in-out
                  hover:bg-gray-50 active:bg-gray-100
                  rounded-lg
                  ${isActive ? 'transform scale-105' : ''}
                `}
                aria-label={item.label}
              >
                <div className="relative mb-1">
                  <Badge
                    count={showBadge ? item.badge : 0}
                    size="small"
                    offset={[6, -6]}
                    style={{
                      backgroundColor: '#ff4d4f',
                      fontSize: '10px',
                      minWidth: '16px',
                      height: '16px',
                      lineHeight: '16px',
                    }}
                  >
                    <div
                      className={`
                        transition-colors duration-200
                        ${isActive ? 'text-blue-500' : 'text-gray-500'}
                      `}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </div>
                  </Badge>
                </div>

                <span
                  className={`
                    text-xs font-medium leading-none
                    transition-colors duration-200
                    ${isActive ? 'text-blue-500' : 'text-gray-500'}
                  `}
                  style={{ fontSize: '10px' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavigator;