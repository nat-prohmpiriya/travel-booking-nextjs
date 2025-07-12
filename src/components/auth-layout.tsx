"use client";

import React from 'react';
import { Card, Typography } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Text } = Typography;

interface Props {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export const AuthLayout: React.FC<Props> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            TravelBook
                        </div>
                    </Link>
                    <Title level={2} className="!mt-6 !mb-2">
                        {title}
                    </Title>
                    {subtitle && (
                        <Text className="text-gray-600">
                            {subtitle}
                        </Text>
                    )}
                </div>

                {/* Auth Card */}
                <Card className="shadow-lg border-0">
                    {children}
                </Card>

                {/* Back to Home */}
                <div className="text-center">
                    <Link href="/" className="text-blue-600 hover:text-blue-500">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};
