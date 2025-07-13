'use client';
import React from 'react';
import { Layout } from 'antd';

interface AccountLayoutProps {
    children: React.ReactNode;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
    // No hooks needed for simple layout

    return (
        <div>
            {children}
        </div>
    );
};

export default AccountLayout;