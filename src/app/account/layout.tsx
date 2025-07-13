'use client';
import React from 'react';
import { Col, Row } from 'antd';
import { UserOutlined, BookOutlined, BellOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {

    const router = useRouter();
    const listMenu = [
        {
            key: 'profile',
            icon: <UserOutlined size={16} />,
            href: "/account/profile",
        },
        {
            key: 'bookings',
            icon: <BookOutlined size={16} />,
            href: "/account/bookings",
        },
        {
            key: 'diary',
            icon: <BookOutlined size={16} />,
            href: "/account/diary",
        },
        {
            key: 'notifications',
            icon: <BellOutlined size={16} />,
            href: "/account/notifications",
        },
        {
            key: 'settings',
            icon: <SettingOutlined size={16} />,
            href: "/account/settings",
        },
    ];

    const handlerClick = (href: string) => {
        router.push(href);
    };

    return (
        <Row className="min-h-screen bg-gray-50 p-4" justify={'center'} gutter={[16, 16]}>
            <Col sm={24} md={20} lg={20} className="mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Sidebar Menu */}
                    <div className='bg-white shadow-lg rounded-lg  w-1/4 overflow-y-auto'>
                        {listMenu.map((item) => (
                            <div key={item.key} className="p-4 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handlerClick(item.href)}>
                                {item.icon}
                                <span className='ml-2'>{item.key}</span>
                            </div>
                        ))}
                    </div>

                    {/* Main content */}
                    <div className="p-4 w-3/4">
                        {children}
                    </div>
                </div>
            </Col>
        </Row>
    );
}