"use client";

import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    BookOutlined,
    LoginOutlined,
    LogoutOutlined,
    SettingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation'

const { Header } = Layout;

export const Navbar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, userProfile, loading, logout } = useAuth();

    const isLoggedIn = !!user;
    const displayName = userProfile?.name || user?.displayName || 'User';

    const menuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link href="/">Home</Link>,
        },
        {
            key: 'bookings',
            icon: <BookOutlined />,
            label: <Link href="/bookings">My Bookings</Link>,
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
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

    const handleUserMenuClick = async ({ key }: { key: string }) => {
        switch (key) {
            case 'profile':
                router.push('/profile');
                break;
            case 'settings':
                router.push('/settings');
                break;
            case 'logout':
                try {
                    await logout();
                    message.success('Logged out successfully');
                    router.push('/');
                } catch (error) {
                    message.error('Failed to logout');
                }
                break;
        }
    };
    // if path is /admin don't show navbar
    if (pathname.startsWith('/admin')) {
        return null;
    }
    return (
        <Header className="!bg-white bg-white shadow-sm border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center">
                <Link href="/" className="flex items-center mr-8">
                    <div className="text-2xl font-bold text-blue-600">
                        TravelBook
                    </div>
                </Link>

                <Menu
                    mode="horizontal"
                    items={menuItems}
                    className="border-none bg-transparent flex-1"
                    style={{ minWidth: 0 }}
                />
            </div>

            <div className="flex items-center gap-4">
                {isLoggedIn ? (
                    <Dropdown
                        menu={{
                            items: userMenuItems,
                            onClick: handleUserMenuClick
                        }}
                        placement="bottomRight"
                        arrow
                    >
                        <div className="flex items-center cursor-pointer">
                            <Avatar
                                src={user?.photoURL || undefined}
                                icon={<UserOutlined />}
                                className=""
                            />
                            <span className="ml-4 text-gray-700">{displayName}</span>
                        </div>
                    </Dropdown>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button
                            type="text"
                            onClick={() => router.push('/auth/signup')}
                        >
                            Sign Up
                        </Button>
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            onClick={handleLogin}
                        >
                            Login
                        </Button>
                    </div>
                )}
            </div>
        </Header>
    );
};
