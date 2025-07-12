"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined, MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { SocialLoginButtons } from '@/components/social-login-buttons';
import { authService, SignUpData } from '@/services/auth';

export default function SignUpPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleEmailSignUp = async (values: SignUpData & { confirmPassword: string; agreeToTerms: boolean }) => {
        setLoading(true);
        try {
            const { confirmPassword, agreeToTerms, ...signUpData } = values;
            await authService.signUp(signUpData);
            message.success('Account created successfully!');
            router.push('/');
        } catch (error: any) {
            const errorMessage = error?.message || 'Sign up failed. Please try again.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        try {
            await authService.signInWithGoogle();
            message.success('Google sign up successful!');
            router.push('/');
        } catch (error: any) {
            const errorMessage = error?.message || 'Google sign up failed';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLineSignUp = async () => {
        try {
            // TODO: Implement LINE signup
            console.log('Sign up with LINE');
            message.info('LINE sign up coming soon!');
        } catch (error) {
            message.error('LINE sign up failed');
        }
    };

    return (
        <AuthLayout
            title="Sign Up"
            subtitle="Create your account to start booking amazing stays"
        >
            <div className="space-y-6">
                {/* Social Login Buttons */}
                <SocialLoginButtons
                    onGoogleLogin={handleGoogleSignUp}
                    onLineLogin={handleLineSignUp}
                    loading={loading}
                />

                {/* Email/Password Form */}
                <Form
                    form={form}
                    name="signup"
                    onFinish={handleEmailSignUp}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[
                            { required: true, message: 'Please enter your full name' },
                            { min: 2, message: 'Name must be at least 2 characters' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Enter your full name"
                            size="large"
                        />
                    </Form.Item>

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

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
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
                            placeholder="Confirm your password"
                            size="large"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="agreeToTerms"
                        valuePropName="checked"
                        rules={[
                            { required: true, message: 'Please agree to the terms and conditions' }
                        ]}
                        className="!mb-6"
                    >
                        <Checkbox>
                            I agree to the{' '}
                            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                                Privacy Policy
                            </Link>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item className="!mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                            className="!h-12"
                        >
                            Create Account
                        </Button>
                    </Form.Item>
                </Form>

                {/* Sign In Link */}
                <div className="text-center pt-4">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                        Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
