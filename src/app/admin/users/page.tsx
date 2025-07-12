"use client";

import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Button, 
    Input, 
    Space, 
    Tag, 
    Avatar, 
    Modal,
    message,
    Dropdown,
    Typography,
    Row,
    Col,
    Card,
    Statistic,
    Select,
    DatePicker,
    Switch,
    Tooltip
} from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    MoreOutlined,
    EditOutlined,
    EyeOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    CrownOutlined,
    BanOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { userService, UserProfile } from '@/services/userService';
import { bookingService } from '@/services/bookingService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface UserTableData extends UserProfile {
    key: string;
    bookingCount?: number;
    totalSpent?: number;
    lastBooking?: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<UserTableData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserTableData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<UserTableData | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchText, statusFilter, roleFilter, dateFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const usersData = await userService.getAllUsers();
            
            // Get booking data for each user
            const usersWithBookingData: UserTableData[] = await Promise.all(
                usersData.map(async (user) => {
                    try {
                        const userBookings = await bookingService.getUserBookings(user.uid);
                        const bookingCount = userBookings.length;
                        const totalSpent = userBookings.reduce((sum, booking) => sum + booking.pricing.total, 0);
                        const lastBooking = userBookings.length > 0 
                            ? dayjs(userBookings[0].createdAt.toDate()).format('DD/MM/YYYY')
                            : undefined;

                        return {
                            ...user,
                            key: user.uid,
                            bookingCount,
                            totalSpent,
                            lastBooking
                        };
                    } catch (error) {
                        // If user has no bookings or error occurred
                        return {
                            ...user,
                            key: user.uid,
                            bookingCount: 0,
                            totalSpent: 0
                        };
                    }
                })
            );

            setUsers(usersWithBookingData);
        } catch (error) {
            console.error('Error loading users:', error);
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchText) {
            filtered = filtered.filter(user =>
                user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase()) ||
                (user.phone && user.phone.includes(searchText))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') {
                filtered = filtered.filter(user => user.isActive !== false);
            } else if (statusFilter === 'inactive') {
                filtered = filtered.filter(user => user.isActive === false);
            }
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Date filter (registration date)
        if (dateFilter && dateFilter.length === 2) {
            filtered = filtered.filter(user => {
                const registrationDate = dayjs(user.createdAt.toDate());
                return registrationDate.isAfter(dateFilter[0]) && registrationDate.isBefore(dateFilter[1]);
            });
        }

        setFilteredUsers(filtered);
    };

    const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
        try {
            await userService.updateUserStatus(userId, !currentStatus);
            message.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            message.error('Failed to update user status');
        }
    };

    const getRoleColor = (role?: string) => {
        switch (role) {
            case 'admin': return 'red';
            case 'partner': return 'blue';
            case 'user': return 'green';
            default: return 'default';
        }
    };

    const getRoleIcon = (role?: string) => {
        switch (role) {
            case 'admin': return <CrownOutlined />;
            case 'partner': return <UserOutlined />;
            default: return <UserOutlined />;
        }
    };

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (record: UserTableData) => (
                <div className="flex items-center">
                    <Avatar 
                        src={record.photoURL} 
                        icon={<UserOutlined />}
                        className="mr-3"
                    />
                    <div>
                        <Text className="font-medium">
                            {record.firstName} {record.lastName}
                        </Text>
                        <div className="text-gray-500 text-sm">
                            {record.email}
                        </div>
                        {record.phone && (
                            <div className="text-gray-500 text-sm">
                                {record.phone}
                            </div>
                        )}
                    </div>
                </div>
            ),
            width: 250
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag 
                    color={getRoleColor(role)} 
                    icon={getRoleIcon(role)}
                >
                    {(role || 'user').charAt(0).toUpperCase() + (role || 'user').slice(1)}
                </Tag>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: UserTableData) => (
                <div className="flex items-center">
                    <Tag 
                        color={record.isActive !== false ? 'green' : 'red'}
                        icon={record.isActive !== false ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    >
                        {record.isActive !== false ? 'Active' : 'Inactive'}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Bookings',
            dataIndex: 'bookingCount',
            key: 'bookingCount',
            render: (count: number) => (
                <div className="text-center">
                    <Text className="font-medium">{count || 0}</Text>
                </div>
            )
        },
        {
            title: 'Total Spent',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            render: (amount: number) => (
                <Text className="font-medium text-green-600">
                    ฿{(amount || 0).toLocaleString()}
                </Text>
            )
        },
        {
            title: 'Last Booking',
            dataIndex: 'lastBooking',
            key: 'lastBooking',
            render: (date: string) => (
                <Text className="text-gray-500">
                    {date || 'Never'}
                </Text>
            )
        },
        {
            title: 'Registered',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: any) => (
                <Text className="text-gray-500">
                    {dayjs(date.toDate()).format('DD/MM/YYYY')}
                </Text>
            )
        },
        {
            title: 'Active',
            key: 'toggle',
            render: (record: UserTableData) => (
                <Switch
                    checked={record.isActive !== false}
                    onChange={() => handleStatusToggle(record.uid, record.isActive !== false)}
                    size="small"
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: UserTableData) => {
                const menuItems = [
                    {
                        key: 'view',
                        icon: <EyeOutlined />,
                        label: 'View Details',
                        onClick: () => {
                            setSelectedUser(record);
                            setDetailModalVisible(true);
                        }
                    },
                    {
                        key: 'bookings',
                        icon: <CalendarOutlined />,
                        label: 'View Bookings',
                        onClick: () => {
                            // Navigate to user's bookings
                            message.info('Booking history feature coming soon');
                        }
                    },
                    {
                        type: 'divider' as const
                    },
                    {
                        key: 'email',
                        icon: <MailOutlined />,
                        label: 'Send Email',
                        onClick: () => {
                            message.info('Email feature coming soon');
                        }
                    },
                    {
                        key: 'ban',
                        icon: <BanOutlined />,
                        label: record.isActive !== false ? 'Deactivate User' : 'Activate User',
                        onClick: () => handleStatusToggle(record.uid, record.isActive !== false)
                    }
                ];

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button icon={<MoreOutlined />} />
                    </Dropdown>
                );
            }
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[]) => {
            setSelectedRowKeys(selectedKeys);
        }
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive !== false).length,
        newThisMonth: users.filter(u => {
            const createdAt = dayjs(u.createdAt.toDate());
            const startOfMonth = dayjs().startOf('month');
            return createdAt.isAfter(startOfMonth);
        }).length,
        totalBookings: users.reduce((sum, u) => sum + (u.bookingCount || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-2">User Management</Title>
                    <Text className="text-gray-600">
                        Manage user accounts, roles, and access permissions
                    </Text>
                </div>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.total}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Active Users"
                            value={stats.active}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="New This Month"
                            value={stats.newThisMonth}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Bookings"
                            value={stats.totalBookings}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Search
                            placeholder="Search by name, email, or phone..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={4} md={3}>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: '100%' }}
                            placeholder="Status"
                        >
                            <Option value="all">All Status</Option>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={4} md={3}>
                        <Select
                            value={roleFilter}
                            onChange={setRoleFilter}
                            style={{ width: '100%' }}
                            placeholder="Role"
                        >
                            <Option value="all">All Roles</Option>
                            <Option value="admin">Admin</Option>
                            <Option value="partner">Partner</Option>
                            <Option value="user">User</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <RangePicker
                            placeholder={['Registration from', 'Registration to']}
                            value={dateFilter}
                            onChange={setDateFilter}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        {selectedRowKeys.length > 0 && (
                            <Space>
                                <Text>{selectedRowKeys.length} selected</Text>
                                <Button size="small">
                                    Bulk Actions
                                </Button>
                            </Space>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Users Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={{
                        total: filteredUsers.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} of ${total} users`
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* User Detail Modal */}
            <Modal
                title="User Details"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <div className="text-center">
                                    <Avatar 
                                        size={80}
                                        src={selectedUser.photoURL} 
                                        icon={<UserOutlined />}
                                        className="mb-3"
                                    />
                                    <div>
                                        <Text className="block font-medium text-lg">
                                            {selectedUser.firstName} {selectedUser.lastName}
                                        </Text>
                                        <Tag 
                                            color={getRoleColor(selectedUser.role)}
                                            className="mt-2"
                                        >
                                            {(selectedUser.role || 'user').toUpperCase()}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>
                            <Col span={16}>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <MailOutlined className="mr-2 text-gray-500" />
                                        <Text>{selectedUser.email}</Text>
                                    </div>
                                    {selectedUser.phone && (
                                        <div className="flex items-center">
                                            <PhoneOutlined className="mr-2 text-gray-500" />
                                            <Text>{selectedUser.phone}</Text>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <CalendarOutlined className="mr-2 text-gray-500" />
                                        <Text>
                                            Member since {dayjs(selectedUser.createdAt.toDate()).format('DD MMM YYYY')}
                                        </Text>
                                    </div>
                                    {selectedUser.nationality && (
                                        <div className="flex items-center">
                                            <EnvironmentOutlined className="mr-2 text-gray-500" />
                                            <Text>{selectedUser.nationality}</Text>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]} className="mt-6">
                            <Col span={8}>
                                <Card size="small" className="text-center">
                                    <Statistic
                                        title="Total Bookings"
                                        value={selectedUser.bookingCount || 0}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" className="text-center">
                                    <Statistic
                                        title="Total Spent"
                                        value={selectedUser.totalSpent || 0}
                                        formatter={(value) => `฿${value?.toLocaleString()}`}
                                        valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" className="text-center">
                                    <div className="text-gray-500 text-sm mb-1">Last Booking</div>
                                    <div className="font-medium">
                                        {selectedUser.lastBooking || 'Never'}
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {selectedUser.address && (
                            <Card size="small" title="Address">
                                <Text>
                                    {[
                                        selectedUser.address.street,
                                        selectedUser.address.city,
                                        selectedUser.address.state,
                                        selectedUser.address.postalCode,
                                        selectedUser.address.country
                                    ].filter(Boolean).join(', ')}
                                </Text>
                            </Card>
                        )}

                        <Card size="small" title="Preferences">
                            <Row gutter={[16, 8]}>
                                <Col span={8}>
                                    <Text className="text-gray-500">Currency:</Text>
                                    <Text className="ml-2">{selectedUser.preferences.currency}</Text>
                                </Col>
                                <Col span={8}>
                                    <Text className="text-gray-500">Language:</Text>
                                    <Text className="ml-2">{selectedUser.preferences.language}</Text>
                                </Col>
                                <Col span={8}>
                                    <Text className="text-gray-500">Timezone:</Text>
                                    <Text className="ml-2">{selectedUser.preferences.timezone}</Text>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
}