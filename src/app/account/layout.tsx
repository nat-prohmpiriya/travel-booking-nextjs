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
        <Row
            justify="center"
            gutter={[16, 16]}
            style={{
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                padding: '16px'
            }}
        >
            <Col sm={24} md={20} lg={20}>
                <Row gutter={[16, 16]}>
                    <Col xs={0} sm={0} md={6} lg={6}>
                        {/* Sidebar Menu */}
                        <div style={{
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            {listMenu.map((item) => (
                                <div
                                    key={item.key}
                                    style={{
                                        padding: '16px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    onClick={() => handlerClick(item.href)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {item.icon}
                                        <span style={{ fontSize: '14px', fontWeight: 500 }}>
                                            {item.key}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>

                    {/* Main content */}
                    <Col xs={24} sm={18} md={18} lg={18}>
                        <div style={{
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            padding: '24px'
                        }}>
                            {children}
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}