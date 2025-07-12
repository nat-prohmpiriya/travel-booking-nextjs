"use client";

import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
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

const { Header } = Layout;

export const Navbar: React.FC = () => {
    const router = useRouter();

    // TODO: Replace with actual auth state
    const isLoggedIn = false;
    const user: { name?: string; avatar?: string } | null = null;

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
        // TODO: Implement login
        router.push('/auth/login');
    };

    const handleUserMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case 'profile':
                router.push('/profile');
                break;
            case 'settings':
                router.push('/settings');
                break;
            case 'logout':
                // TODO: Implement logout
                console.log('Logout');
                break;
        }
    };

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
                                src={user?.avatar || undefined}
                                icon={<UserOutlined />}
                                className="mr-2"
                            />
                            <span className="text-gray-700">{user?.name || 'User'}</span>
                        </div>
                    </Dropdown>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button
                            type="text"
                            onClick={() => router.push('/auth/register')}
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
