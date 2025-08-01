"use client";

import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message, Badge, Drawer, Spin } from 'antd';
import {
    BellOutlined,
    UserOutlined,
    BookOutlined,
    LoginOutlined,
    LogoutOutlined,
    SettingOutlined,
    HomeOutlined,
    ShopOutlined,
    CalendarOutlined,
    CarOutlined,
    EditOutlined,
    MenuOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation'
import { auth } from 'firebase-admin';

const { Header } = Layout;

export const Navbar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, userProfile, loading: authLoading, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isLoggedIn = !!user;
    const displayName = userProfile?.displayName || 'User';

    // Main navigation menu items
    const mainMenuItems = [
        {
            key: 'hotels',
            icon: <HomeOutlined />,
            label: 'Hotels',
            href: '/',
            available: true
        },
        {
            key: 'restaurants',
            icon: <ShopOutlined />,
            label: 'Restaurants',
            href: '#',
            available: false
        },
        {
            key: 'events',
            icon: <CalendarOutlined />,
            label: 'Events',
            href: '#',
            available: false
        },
        {
            key: 'flights',
            icon: <CarOutlined />,
            label: 'Flights',
            href: '#',
            available: false
        },
        {
            key: 'diary',
            icon: <EditOutlined />,
            label: "Travel Diary",
            href: '/diary',
            available: true
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link href="/account/profile">Profile</Link>,
        },
        {
            key: 'bookings',
            icon: <BookOutlined />,
            label: <Link href="/account/bookings">My Bookings</Link>,
        },
        {
            key: 'diary',
            icon: <BookOutlined />,
            label: <Link href="/account/diary">My Travel Diary</Link>,
        },
        {
            key: 'notifications',
            icon: <BellOutlined />,
            label: <Link href="/account/notifications">My Notifications</Link>,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link href="/account/settings">Settings</Link>,
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
        },
    ];

    const handleLogin = () => {
        router.push('/auth/signin');
    };

    const handleMainMenuClick = ({ key }: { key: string }) => {
        const menuItem = mainMenuItems.find(item => item.key === key);
        if (menuItem?.available && menuItem.href !== '#') {
            router.push(menuItem.href);
            setMobileMenuOpen(false);
        } else if (!menuItem?.available) {
            message.info('This feature is coming soon!');
        }
    };

    const handleUserMenuClick = async ({ key }: { key: string }) => {
        switch (key) {
            case 'profile':
                router.push('/account/profile');
                break;
            case 'settings':
                router.push('/account/settings');
                break;
            case 'logout':
                try {
                    await signOut();
                    message.success('Logged out successfully');
                    router.push('/');
                } catch (error) {
                    message.error('Failed to logout');
                }
                break;
        }
    };

    // Get current active menu key
    const getActiveKey = () => {
        if (pathname === '/') return 'hotels';
        if (pathname.startsWith('/diary')) return 'diary';
        return '';
    };
    // if path is /admin don't show navbar
    if (pathname.startsWith('/admin')) {
        return null;
    }
    return (
        <Header className="!bg-white bg-white shadow-sm border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center mr-8">
                    <div className="text-2xl font-bold text-blue-600">
                        TravelBook
                    </div>
                </Link>

                <div className="flex items-center gap-4 hidden lg:block">
                    {
                        mainMenuItems.map(item => (
                            <Button disabled={!item.available} key={item.key} color="default" variant="link" onClick={() => router.push(item.href)} className={`flex items-center ${pathname === item.href ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}>
                                <span className='flex items-center text-sm'>
                                    <span className='mr-2'>{item.icon}</span>
                                    {item.label}
                                </span>
                            </Button>
                        ))
                    }
                </div>


                {/* Mobile Menu Button */}
                <div className="block lg:hidden ml-4">
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuOpen(true)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {authLoading
                    ? <Spin size="small" />
                    : isLoggedIn ? (
                        <Dropdown
                            menu={{
                                items: userMenuItems,
                                onClick: handleUserMenuClick
                            }}
                            placement="bottomRight"
                            arrow
                        >
                            <div className="flex items-center cursor-pointer px-2 py-1">
                                <Avatar
                                    src={userProfile?.photoURL || undefined}
                                    icon={<UserOutlined />}
                                    className=""
                                />
                                <span className="ml-2 text-gray-700 hidden sm:block">{displayName}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                type="text"
                                onClick={() => router.push('/auth/signup')}
                                className="hidden sm:inline-flex"
                            >
                                Sign Up
                            </Button>
                            <Button
                                type="primary"
                                icon={<LoginOutlined />}
                                onClick={handleLogin}
                                size="middle"
                            >
                                <span className="hidden sm:inline">Login</span>
                            </Button>
                        </div>
                    )}
            </div>

            {/* Mobile Navigation Drawer */}

            <Drawer
                title={
                    <div className="text-2xl font-bold text-blue-600">
                        TravelBook
                    </div>
                }
                placement="left"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                width={280}
                className="lg:hidden"
            >
                <Menu
                    mode="vertical"
                    selectedKeys={[getActiveKey()]}
                    onClick={handleMainMenuClick}
                    className="border-none"
                    items={mainMenuItems.map(item => ({
                        key: item.key,
                        icon: item.icon,
                        label: item.label,
                        className: !item.available ? 'opacity-60' : '',
                        style: {
                            cursor: item.available ? 'pointer' : 'default',
                            marginBottom: '8px'
                        }
                    }))}
                />

                {!isLoggedIn && (
                    <div className="mt-8 space-y-2">
                        <Button
                            type="default"
                            block
                            onClick={() => {
                                router.push('/auth/signup');
                                setMobileMenuOpen(false);
                            }}
                        >
                            Sign Up
                        </Button>
                        <Button
                            type="primary"
                            block
                            icon={<LoginOutlined />}
                            onClick={() => {
                                handleLogin();
                                setMobileMenuOpen(false);
                            }}
                        >
                            Login
                        </Button>
                    </div>
                )}
            </Drawer>
        </Header>
    );
};
