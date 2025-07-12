"use client";

import React, { useState } from 'react';
import { Form, Input, Button, message, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';

export default function ForgotPasswordPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const router = useRouter();

    const handleResetPassword = async (values: any) => {
        setLoading(true);
        try {
            // TODO: Implement Firebase password reset
            console.log('Reset password for:', values.email);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

            setSentEmail(values.email);
            setEmailSent(true);
            message.success('Password reset email sent!');
        } catch (error) {
            message.error('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <AuthLayout
                title="Check Your Email"
                subtitle="We've sent password reset instructions to your email"
            >
                <div className="text-center space-y-6">
                    <Result
                        status="success"
                        title="Email Sent!"
                        subTitle={
                            <div className="space-y-2">
                                <p>We've sent a password reset link to:</p>
                                <p className="font-medium text-blue-600">{sentEmail}</p>
                                <p className="text-gray-500 text-sm">
                                    Please check your email and follow the instructions to reset your password.
                                </p>
                            </div>
                        }
                    />

                    <div className="space-y-3">
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={() => {
                                setEmailSent(false);
                                form.resetFields();
                            }}
                        >
                            Try Another Email
                        </Button>

                        <Button
                            type="default"
                            size="large"
                            block
                            onClick={() => router.push('/auth/login')}
                            icon={<ArrowLeftOutlined />}
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
            title="Forgot Password"
            subtitle="Enter your email address and we'll send you a link to reset your password"
        >
            <div className="space-y-6">
                <Form
                    form={form}
                    name="forgot-password"
                    onFinish={handleResetPassword}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please enter your email address' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Enter your email address"
                            size="large"
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
                            Send Reset Link
                        </Button>
                    </Form.Item>
                </Form>

                {/* Back to Sign In */}
                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="text-blue-600 hover:text-blue-500 inline-flex items-center gap-2"
                    >
                        <ArrowLeftOutlined />
                        Back to Sign In
                    </Link>
                </div>

                {/* Help Text */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-2">
                        <p className="font-medium">Need help?</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Check your spam/junk folder if you don't see the email</li>
                            <li>Make sure you entered the correct email address</li>
                            <li>The reset link will expire in 24 hours</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
