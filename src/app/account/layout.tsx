'use client';

import React from 'react';
import { Col, Row } from 'antd';
import { UserOutlined, BookOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {

    const router = useRouter();
    const listMenu = [
        {
            key: 'profile',
            icon: <UserOutlined style={{ fontSize: '16px' }} />,
            href: "/account/profile",
        },
        {
            key: 'bookings',
            icon: <BookOutlined style={{ fontSize: '16px' }} />,
            href: "/account/bookings",
        },
        {
            key: 'diary',
            icon: <BookOutlined style={{ fontSize: '16px' }} />,
            href: "/account/diary",
        },
        {
            key: 'notifications',
            icon: <BellOutlined style={{ fontSize: '16px' }} />,
            href: "/account/notifications",
        },
        {
            key: 'settings',
            icon: <SettingOutlined style={{ fontSize: '16px' }} />,
            href: "/account/settings",
        },
    ];

    const handlerClick = (href: string) => {
        router.push(href);
    };

    return (
        <Row className="min-h-screen bg-gray-50 p-4" justify={'center'} gutter={[16, 16]}>
            <Col sm={24} md={20} lg={20} className="">
                <Row>
                    <Col xs={0} sm={4} md={4} lg={6}>
                        {/* Sidebar Menu */}
                        <div className='bg-white shadow-lg rounded-lg overflow-y-auto'>
                            {listMenu.map((item) => (
                                <div
                                    key={item.key}
                                    className="p-4 hover:bg-gray-100 rounded cursor-pointer"
                                    onClick={() => handlerClick(item.href)}
                                >
                                    {item.icon}
                                    <span className='ml-2'>{item.key}</span>
                                </div>
                            ))}
                        </div>
                    </Col>

                    {/* Main content */}
                    <Col xs={24} sm={20} md={16} lg={18} className="p-4 w-3/4">
                        {children}
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}