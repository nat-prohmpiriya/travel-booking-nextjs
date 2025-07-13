"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { SocialLoginButtons } from '@/components/social-login-buttons';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
    const [form] = Form.useForm();
    const router = useRouter();
    const { signIn, signInWithGoogle, loading } = useAuth();

    const handleEmailLogin = async (values: { email: string; password: string }) => {
        try {
            await signIn(values.email, values.password);
            message.success('Login successful!');
            router.push('/');
        } catch (error: any) {
            message.error(error.message || 'Login failed. Please try again.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            message.success('Google login successful!');
            router.push('/');
        } catch (error: any) {
            message.error(error.message || 'Google login failed');
        }
    };

    const handleLineLogin = async () => {
        try {
            // TODO: Implement LINE login
            console.log('Login with LINE');
            message.info('LINE login coming soon!');
        } catch (error) {
            message.error('LINE login failed');
        }
    };

    return (
        <AuthLayout
            title="Sign In"
            subtitle="Welcome back! Please sign in to your account"
        >
            <div className="space-y-6">
                {/* Social Login Buttons */}
                <SocialLoginButtons
                    onGoogleLogin={handleGoogleLogin}
                    onLineLogin={handleLineLogin}
                    loading={loading}
                />

                {/* Email/Password Form */}
                <Form
                    form={form}
                    name="signin"
                    onFinish={handleEmailLogin}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Enter your email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Enter your password"
                            size="large"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <div className="flex items-center justify-between mb-6">
                        <Form.Item name="remember" valuePropName="checked" className="!mb-0">
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                        <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500">
                            Forgot password?
                        </Link>
                    </div>

                    <Form.Item className="!mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                            className="!h-12"
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                {/* Sign Up Link */}
                <div className="text-center pt-4">
                    <span className="text-gray-600">Don't have an account? </span>
                    <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                        Sign Up
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
