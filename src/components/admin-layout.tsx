"use client";

import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Avatar,
    Dropdown,
    Typography,
    Button,
    Breadcrumb,
    message
} from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    UserOutlined,
    StarOutlined,
    DollarOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { LuHotel } from 'react-icons/lu';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Wait for auth state to load
        if (loading) return;

        // Check if user is admin (you can implement proper role checking here)
        if (!user) {
            router.push('/auth/signin');
            return;
        }

        // For now, we'll allow any logged-in user to access admin
        // In production, you should check user role from database
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await signOut();
            message.success('Logged out successfully');
            router.push('/');
        } catch (error) {
            message.error('Failed to logout');
        }
    };

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: <Link href="/admin">Dashboard</Link>
        },
        {
            key: '/admin/hotels',
            icon: <LuHotel />,
            label: <Link href="/admin/hotels">Hotels</Link>
        },
        {
            key: '/admin/bookings',
            icon: <BookOutlined />,
            label: <Link href="/admin/bookings">Bookings</Link>
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: <Link href="/admin/users">Users</Link>
        },
        {
            key: '/admin/reviews',
            icon: <StarOutlined />,
            label: <Link href="/admin/reviews">Reviews</Link>
        },
        {
            key: '/admin/finance',
            icon: <DollarOutlined />,
            label: <Link href="/admin/finance">Finance</Link>
        },
        {
            key: '/admin/settings',
            icon: <SettingOutlined />,
            label: <Link href="/admin/settings">Settings</Link>
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile'
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings'
        },
        {
            type: 'divider' as const
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout
        }
    ];

    const getBreadcrumbs = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const breadcrumbs = [
            {
                title: <Link href="/admin">Admin</Link>
            }
        ];

        if (pathSegments.length > 1) {
            const currentPage = pathSegments[1];
            const pageNames: Record<string, string> = {
                'hotels': 'Hotels',
                'bookings': 'Bookings',
                'users': 'Users',
                'reviews': 'Reviews',
                'finance': 'Finance',
                'settings': 'Settings'
            };

            if (pageNames[currentPage]) {
                breadcrumbs.push({
                    title: <span>{pageNames[currentPage]}</span>
                });
            }
        }

        return breadcrumbs;
    };

    // Show loading while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Layout className="min-h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{ background: '#fff' }}

            >
                {/* Logo */}
                <div className="p-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <GlobalOutlined className="text-white text-lg" />
                        </div>
                        {!collapsed && (
                            <div>
                                <Title level={5} className="!mb-0 text-gray-800">
                                    <Link href="/admin">
                                        Admin Panel
                                    </Link>
                                </Title>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    className="border-r-0 mt-4"
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header
                    className="px-4 flex items-center justify-between mb-2"
                    style={{
                        background: '#fff',
                        boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div className="flex items-center">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="mr-4"
                        />

                        <Breadcrumb items={getBreadcrumbs()} />
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            className="flex items-center justify-center"
                        />

                        {/* User Menu */}
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                        >
                            <div className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                                <Avatar
                                    src={user.photoURL}
                                    icon={<UserOutlined />}
                                    className="mr-2"
                                />
                                <div className="text-left">
                                    <Text className="block text-sm font-medium">
                                        {user.displayName || 'Admin'}
                                    </Text>
                                    <Text className="block text-xs text-gray-500">
                                        Administrator
                                    </Text>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Main Content */}
                <Content className="bg-gray-50">
                    <div className="p-6">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout >
    );
}