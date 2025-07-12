"use client";

import React from 'react';
import { Button, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

interface Props {
    onGoogleLogin?: () => void;
    onLineLogin?: () => void;
    loading?: boolean;
}

export const SocialLoginButtons: React.FC<Props> = ({
    onGoogleLogin,
    onLineLogin,
    loading = false
}) => {
    return (
        <div className="space-y-3">
            <Button
                type="default"
                size="large"
                block
                icon={<GoogleOutlined />}
                onClick={onGoogleLogin}
                loading={loading}
                className="!h-12 !border-gray-300 hover:!border-blue-400"
            >
                Continue with Google
            </Button>

            <Button
                type="default"
                size="large"
                block
                onClick={onLineLogin}
                loading={loading}
                className="!h-12 !bg-green-500 !border-green-500 !text-white hover:!bg-green-600 hover:!border-green-600"
                style={{
                    backgroundColor: '#06C755',
                    borderColor: '#06C755',
                    color: 'white'
                }}
            >
                <span className="flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.630.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771z" />
                    </svg>
                    Continue with LINE
                </span>
            </Button>

            <div className="relative">
                <Divider className="!my-6">
                    <span className="bg-white px-4 text-gray-500 text-sm">or</span>
                </Divider>
            </div>
        </div>
    );
};
