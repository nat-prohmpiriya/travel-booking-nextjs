"use client";

import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';

export default function ResetPasswordPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleResetPassword = async (values: any) => {
        setLoading(true);
        try {
            // TODO: Implement Firebase password reset with token
            console.log('Reset password with token:', token, 'New password:', values.password);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

            message.success('Password reset successfully!');
            router.push('/auth/signin');
        } catch (error) {
            message.error('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Check if token exists
    if (!token) {
        return (
            <AuthLayout
                title="Invalid Reset Link"
                subtitle="The password reset link is invalid or has expired"
            >
                <div className="text-center space-y-6">
                    <div className="text-red-500 text-lg">⚠️</div>
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            This password reset link is invalid or has expired.
                        </p>
                        <p className="text-sm text-gray-500">
                            Please request a new password reset link.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={() => router.push('/auth/forgot-password')}
                        >
                            Request New Reset Link
                        </Button>

                        <Button
                            type="default"
                            size="large"
                            block
                            onClick={() => router.push('/auth/signin')}
                        >
                            Back to Sign In
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter your new password below"
        >
            <div className="space-y-6">
                <Form
                    form={form}
                    name="reset-password"
                    onFinish={handleResetPassword}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="password"
                        label="New Password"
                        rules={[
                            { required: true, message: 'Please enter your new password' },
                            { min: 6, message: 'Password must be at least 6 characters' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                            }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Enter your new password"
                            size="large"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your new password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirm your new password"
                            size="large"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item className="!mb-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                            className="!h-12"
                        >
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>

                {/* Password Requirements */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-2">
                        <p className="font-medium">Password Requirements:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>At least 6 characters long</li>
                            <li>At least one uppercase letter (A-Z)</li>
                            <li>At least one lowercase letter (a-z)</li>
                            <li>At least one number (0-9)</li>
                        </ul>
                    </div>
                </div>

                {/* Back to Sign In */}
                <div className="text-center">
                    <Link
                        href="/auth/signin"
                        className="text-blue-600 hover:text-blue-500"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
