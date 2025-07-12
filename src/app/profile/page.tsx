"use client";

import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Typography, 
    Button, 
    Form, 
    Input, 
    Select, 
    Upload, 
    Avatar, 
    Row, 
    Col, 
    Divider, 
    Switch,
    message,
    Modal,
    Alert,
    Breadcrumb,
    Tabs
} from 'antd';
import { 
    UserOutlined,
    EditOutlined,
    CameraOutlined,
    SafetyCertificateOutlined,
    BellOutlined,
    GlobalOutlined,
    HomeOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface UserProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    preferences: {
        currency: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
            marketing: boolean;
        };
    };
}

export default function ProfilePage() {
    const { user, userProfile, logout } = useAuth();
    const router = useRouter();
    
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
    const [profileData, setProfileData] = useState<UserProfileData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        preferences: {
            currency: 'THB',
            language: 'en',
            timezone: 'Asia/Bangkok',
            notifications: {
                email: true,
                sms: false,
                push: true,
                marketing: false
            }
        }
    });

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        // Initialize form with user data
        const userData = {
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: userProfile?.phone || '',
            dateOfBirth: userProfile?.dateOfBirth || '',
            gender: userProfile?.gender || '',
            nationality: userProfile?.nationality || '',
            ...profileData
        };

        setProfileData(userData);
        form.setFieldsValue(userData);
    }, [user, userProfile, form, router, profileData]);

    const handleProfileUpdate = async (values: any) => {
        setLoading(true);
        try {
            // Simulate API call to update profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setProfileData({ ...profileData, ...values });
            message.success('Profile updated successfully!');
        } catch (error) {
            message.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (values: any) => {
        setLoading(true);
        try {
            // Simulate password change
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            message.success('Password changed successfully!');
            setPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            message.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (file: any) => {
        try {
            // Simulate avatar upload
            message.success('Profile picture updated successfully!');
        } catch (error) {
            message.error('Failed to upload profile picture');
        }
        return false; // Prevent default upload
    };

    const handleDeleteAccount = () => {
        Modal.confirm({
            title: 'Delete Account',
            content: 'Are you sure you want to delete your account? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await logout();
                    message.success('Account deleted successfully');
                    router.push('/');
                } catch (error) {
                    message.error('Failed to delete account');
                }
            }
        });
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link href="/">
                                <HomeOutlined /> Home
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>My Profile</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <Row gutter={24}>
                    {/* Profile Header */}
                    <Col span={24}>
                        <Card className="mb-6">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <Avatar 
                                        size={100} 
                                        src={user.photoURL} 
                                        icon={<UserOutlined />}
                                    />
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={handleAvatarUpload}
                                        accept="image/*"
                                    >
                                        <Button 
                                            icon={<CameraOutlined />} 
                                            shape="circle" 
                                            size="small"
                                            className="absolute bottom-0 right-0"
                                        />
                                    </Upload>
                                </div>
                                <div className="flex-1">
                                    <Title level={2} className="!mb-2">
                                        {user.displayName || 'User'}
                                    </Title>
                                    <Text className="text-gray-600 block mb-2">{user.email}</Text>
                                    <Text className="text-gray-500">
                                        Member since {dayjs(user.metadata.creationTime).format('MMM YYYY')}
                                    </Text>
                                </div>
                                <div>
                                    <Button 
                                        type="primary" 
                                        icon={<EditOutlined />}
                                        onClick={() => setPasswordModalVisible(true)}
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Profile Content */}
                    <Col span={24}>
                        <Card>
                            <Tabs defaultActiveKey="personal" size="large">
                                {/* Personal Information */}
                                <TabPane tab="Personal Information" key="personal">
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={handleProfileUpdate}
                                        requiredMark={false}
                                    >
                                        <Row gutter={24}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="firstName"
                                                    label="First Name"
                                                    rules={[{ required: true, message: 'Please enter first name' }]}
                                                >
                                                    <Input prefix={<UserOutlined />} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="lastName"
                                                    label="Last Name"
                                                    rules={[{ required: true, message: 'Please enter last name' }]}
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={24}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="email"
                                                    label="Email Address"
                                                    rules={[
                                                        { required: true, message: 'Please enter email' },
                                                        { type: 'email', message: 'Please enter valid email' }
                                                    ]}
                                                >
                                                    <Input prefix={<MailOutlined />} disabled />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="phone"
                                                    label="Phone Number"
                                                >
                                                    <Input prefix={<PhoneOutlined />} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={24}>
                                            <Col xs={24} sm={8}>
                                                <Form.Item
                                                    name="dateOfBirth"
                                                    label="Date of Birth"
                                                >
                                                    <Input type="date" prefix={<CalendarOutlined />} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <Form.Item
                                                    name="gender"
                                                    label="Gender"
                                                >
                                                    <Select placeholder="Select gender">
                                                        <Option value="male">Male</Option>
                                                        <Option value="female">Female</Option>
                                                        <Option value="other">Other</Option>
                                                        <Option value="prefer-not-to-say">Prefer not to say</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <Form.Item
                                                    name="nationality"
                                                    label="Nationality"
                                                >
                                                    <Select placeholder="Select nationality" showSearch>
                                                        <Option value="TH">Thai</Option>
                                                        <Option value="US">American</Option>
                                                        <Option value="GB">British</Option>
                                                        <Option value="JP">Japanese</Option>
                                                        <Option value="SG">Singaporean</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Divider orientation="left">Address</Divider>

                                        <Form.Item
                                            name={['address', 'street']}
                                            label="Street Address"
                                        >
                                            <Input prefix={<EnvironmentOutlined />} />
                                        </Form.Item>

                                        <Row gutter={24}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name={['address', 'city']}
                                                    label="City"
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name={['address', 'state']}
                                                    label="State/Province"
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={24}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name={['address', 'postalCode']}
                                                    label="Postal Code"
                                                >
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name={['address', 'country']}
                                                    label="Country"
                                                >
                                                    <Select placeholder="Select country" showSearch>
                                                        <Option value="TH">Thailand</Option>
                                                        <Option value="US">United States</Option>
                                                        <Option value="GB">United Kingdom</Option>
                                                        <Option value="JP">Japan</Option>
                                                        <Option value="SG">Singapore</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" loading={loading}>
                                                Update Profile
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>

                                {/* Preferences */}
                                <TabPane tab="Preferences" key="preferences">
                                    <Form
                                        layout="vertical"
                                        initialValues={profileData.preferences}
                                        onFinish={(values) => handleProfileUpdate({ preferences: values })}
                                    >
                                        <Row gutter={24}>
                                            <Col xs={24} sm={8}>
                                                <Form.Item
                                                    name="currency"
                                                    label="Preferred Currency"
                                                >
                                                    <Select>
                                                        <Option value="THB">Thai Baht (THB)</Option>
                                                        <Option value="USD">US Dollar (USD)</Option>
                                                        <Option value="EUR">Euro (EUR)</Option>
                                                        <Option value="GBP">British Pound (GBP)</Option>
                                                        <Option value="JPY">Japanese Yen (JPY)</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <Form.Item
                                                    name="language"
                                                    label="Language"
                                                >
                                                    <Select>
                                                        <Option value="en">English</Option>
                                                        <Option value="th">ไทย</Option>
                                                        <Option value="ja">日本語</Option>
                                                        <Option value="zh">中文</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <Form.Item
                                                    name="timezone"
                                                    label="Timezone"
                                                >
                                                    <Select>
                                                        <Option value="Asia/Bangkok">Bangkok (GMT+7)</Option>
                                                        <Option value="America/New_York">New York (GMT-5)</Option>
                                                        <Option value="Europe/London">London (GMT+0)</Option>
                                                        <Option value="Asia/Tokyo">Tokyo (GMT+9)</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Divider orientation="left">Notifications</Divider>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Text className="block font-medium">Email Notifications</Text>
                                                    <Text className="text-gray-500">Receive booking confirmations and updates</Text>
                                                </div>
                                                <Form.Item name={['notifications', 'email']} valuePropName="checked" className="!mb-0">
                                                    <Switch />
                                                </Form.Item>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Text className="block font-medium">SMS Notifications</Text>
                                                    <Text className="text-gray-500">Receive important alerts via SMS</Text>
                                                </div>
                                                <Form.Item name={['notifications', 'sms']} valuePropName="checked" className="!mb-0">
                                                    <Switch />
                                                </Form.Item>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Text className="block font-medium">Push Notifications</Text>
                                                    <Text className="text-gray-500">Receive push notifications on your device</Text>
                                                </div>
                                                <Form.Item name={['notifications', 'push']} valuePropName="checked" className="!mb-0">
                                                    <Switch />
                                                </Form.Item>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Text className="block font-medium">Marketing Communications</Text>
                                                    <Text className="text-gray-500">Receive special offers and promotions</Text>
                                                </div>
                                                <Form.Item name={['notifications', 'marketing']} valuePropName="checked" className="!mb-0">
                                                    <Switch />
                                                </Form.Item>
                                            </div>
                                        </div>

                                        <Form.Item className="mt-6">
                                            <Button type="primary" htmlType="submit" loading={loading}>
                                                Save Preferences
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>

                                {/* Security */}
                                <TabPane tab="Security" key="security">
                                    <div className="space-y-6">
                                        <Alert
                                            message="Account Security"
                                            description="Keep your account secure by regularly updating your password and enabling two-factor authentication."
                                            type="info"
                                            showIcon
                                        />

                                        <Card size="small" className="bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Text className="block font-medium">Password</Text>
                                                    <Text className="text-gray-500">Last changed 30 days ago</Text>
                                                </div>
                                                <Button 
                                                    icon={<SafetyCertificateOutlined />}
                                                    onClick={() => setPasswordModalVisible(true)}
                                                >
                                                    Change Password
                                                </Button>
                                            </div>
                                        </Card>

                                        <Card size="small" className="bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Text className="block font-medium">Two-Factor Authentication</Text>
                                                    <Text className="text-gray-500">Add an extra layer of security</Text>
                                                </div>
                                                <Button disabled>
                                                    Enable 2FA (Coming Soon)
                                                </Button>
                                            </div>
                                        </Card>

                                        <Card size="small" className="bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <Text className="block font-medium">Login History</Text>
                                                    <Text className="text-gray-500">View recent account activity</Text>
                                                </div>
                                                <Button disabled>
                                                    View History (Coming Soon)
                                                </Button>
                                            </div>
                                        </Card>

                                        <Divider />

                                        <Alert
                                            message="Danger Zone"
                                            description="This action cannot be undone. Please be certain."
                                            type="error"
                                            showIcon
                                        />

                                        <Button 
                                            type="primary" 
                                            danger 
                                            onClick={handleDeleteAccount}
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Change Password Modal */}
            <Modal
                title="Change Password"
                open={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Current Password"
                        rules={[{ required: true, message: 'Please enter current password' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: 'Please enter new password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Please confirm new password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item className="!mb-0">
                        <div className="flex justify-end space-x-2">
                            <Button onClick={() => setPasswordModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Change Password
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}