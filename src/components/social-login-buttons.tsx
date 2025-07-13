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
                className=""
                style={{
                    backgroundColor: '#06C755',
                    borderColor: '#06C755',
                    color: 'white'
                }}
            >
                <span className="flex items-center justify-center gap-2">
                    <img
                        src="/LINE_logo.svg.webp"
                        alt="LINE Icon"
                        className="w-5 h-5"
                    />
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
