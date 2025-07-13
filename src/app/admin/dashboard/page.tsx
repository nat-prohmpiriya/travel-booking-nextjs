"use client";

import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Typography,
    Table,
    Tag,
    Progress,
    Space,
    Avatar,
    Button,
    Select,
    DatePicker,
    Spin
} from 'antd';
import {
    DollarOutlined,
    BookOutlined,
    UserOutlined,
    EyeOutlined,
    StarOutlined,
} from '@ant-design/icons';
import { IoTrendingUpOutline } from "react-icons/io5";
import { LuHotel } from "react-icons/lu";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { hotelService } from '@/services/hotelService';
import { bookingService } from '@/services/bookingService';
import { userService } from '@/services/userService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DashboardStats {
    totalRevenue: number;
    totalHotels: number;
    totalBookings: number;
    totalUsers: number;
    revenueGrowth: number;
    bookingGrowth: number;
}

interface RecentBooking {
    id: string;
    guestName: string;
    hotelName: string;
    checkIn: string;
    total: number;
    status: string;
}

interface TopHotel {
    id: string;
    name: string;
    bookings: number;
    revenue: number;
    rating: number;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalHotels: 0,
        totalBookings: 0,
        totalUsers: 0,
        revenueGrowth: 0,
        bookingGrowth: 0
    });
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [topHotels, setTopHotels] = useState<TopHotel[]>([]);
    const [dateRange, setDateRange] = useState<any>([
        dayjs().subtract(30, 'day'),
        dayjs()
    ]);

    // Mock data for charts
    const revenueData = [
        { month: 'Jan', revenue: 125000, bookings: 45 },
        { month: 'Feb', revenue: 142000, bookings: 52 },
        { month: 'Mar', revenue: 168000, bookings: 61 },
        { month: 'Apr', revenue: 155000, bookings: 58 },
        { month: 'May', revenue: 189000, bookings: 67 },
        { month: 'Jun', revenue: 203000, bookings: 74 }
    ];

    const bookingStatusData = [
        { name: 'Confirmed', value: 65, color: '#52c41a' },
        { name: 'Pending', value: 20, color: '#faad14' },
        { name: 'Cancelled', value: 10, color: '#ff4d4f' },
        { name: 'Completed', value: 5, color: '#1890ff' }
    ];

    useEffect(() => {
        loadDashboardData();
    }, [dateRange]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load real data from Firebase
            const [hotels, bookings] = await Promise.all([
                hotelService.getAllHotels(),
                bookingService.getAllBookings() // You'll need to implement this
            ]);

            // Calculate stats
            const totalRevenue = bookings.reduce((sum, booking) => sum + booking.pricing.total, 0);
            const totalHotels = hotels.length;
            const totalBookings = bookings.length;

            // Mock recent bookings data
            const mockRecentBookings: RecentBooking[] = [
                {
                    id: '1',
                    guestName: 'John Doe',
                    hotelName: 'Grand Palace Hotel',
                    checkIn: dayjs().add(2, 'day').format('YYYY-MM-DD'),
                    total: 8500,
                    status: 'confirmed'
                },
                {
                    id: '2',
                    guestName: 'Sarah Wilson',
                    hotelName: 'Seaside Resort',
                    checkIn: dayjs().add(5, 'day').format('YYYY-MM-DD'),
                    total: 12300,
                    status: 'pending'
                },
                {
                    id: '3',
                    guestName: 'Mike Chen',
                    hotelName: 'Mountain Lodge',
                    checkIn: dayjs().add(1, 'day').format('YYYY-MM-DD'),
                    total: 6700,
                    status: 'confirmed'
                }
            ];

            // Mock top hotels data
            const mockTopHotels: TopHotel[] = hotels.slice(0, 5).map((hotel, index) => ({
                id: hotel.id,
                name: hotel.name,
                bookings: Math.floor(Math.random() * 50) + 20,
                revenue: Math.floor(Math.random() * 100000) + 50000,
                rating: hotel.rating
            }));

            setStats({
                totalRevenue,
                totalHotels,
                totalBookings,
                totalUsers: 1247, // Mock data - implement userService.getUserCount()
                revenueGrowth: 15.3,
                bookingGrowth: 8.7
            });

            setRecentBookings(mockRecentBookings);
            setTopHotels(mockTopHotels);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to mock data
            setStats({
                totalRevenue: 1250000,
                totalHotels: 156,
                totalBookings: 2834,
                totalUsers: 1247,
                revenueGrowth: 15.3,
                bookingGrowth: 8.7
            });
        } finally {
            setLoading(false);
        }
    };

    const recentBookingsColumns = [
        {
            title: 'Guest',
            dataIndex: 'guestName',
            key: 'guestName',
            render: (name: string) => (
                <div className="flex items-center">
                    <Avatar icon={<UserOutlined />} className="mr-2" />
                    <Text>{name}</Text>
                </div>
            )
        },
        {
            title: 'Hotel',
            dataIndex: 'hotelName',
            key: 'hotelName'
        },
        {
            title: 'Check-in',
            dataIndex: 'checkIn',
            key: 'checkIn',
            render: (date: string) => dayjs(date).format('DD MMM YYYY')
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (amount: number) => (
                <Text className="font-medium">
                    ฿{amount.toLocaleString()}
                </Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    confirmed: 'green',
                    pending: 'orange',
                    cancelled: 'red'
                };
                return (
                    <Tag color={colors[status]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Tag>
                );
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="link" icon={<EyeOutlined />}>
                    View
                </Button>
            )
        }
    ];

    const topHotelsColumns = [
        {
            title: 'Hotel',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: TopHotel) => (
                <div className="flex items-center">
                    <Avatar
                        shape="square"
                        size="large"
                        icon={<LuHotel />}
                        className="mr-3"
                    />
                    <div>
                        <Text className="font-medium">{name}</Text>
                        <div className="flex items-center mt-1">
                            <StarOutlined className="text-yellow-500 text-xs mr-1" />
                            <Text className="text-xs text-gray-500">{record.rating}</Text>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Bookings',
            dataIndex: 'bookings',
            key: 'bookings',
            render: (count: number) => (
                <Text className="font-medium">{count}</Text>
            )
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (amount: number) => (
                <Text className="font-medium text-green-600">
                    ฿{amount.toLocaleString()}
                </Text>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-2">Dashboard</Title>
                    <Text className="text-gray-600">
                        Welcome back! Here's what's happening with your platform.
                    </Text>
                </div>
                <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="ml-4"
                />
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats.totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="THB"
                            formatter={(value) => `฿${value?.toLocaleString()}`}
                        />
                        <div className="mt-2">
                            <Text className="text-green-600 text-sm">
                                <IoTrendingUpOutline /> +{stats.revenueGrowth}% from last month
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Hotels"
                            value={stats.totalHotels}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<LuHotel />}
                        />
                        <div className="mt-2">
                            <Text className="text-gray-500 text-sm">
                                Active properties
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Bookings"
                            value={stats.totalBookings}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<BookOutlined />}
                        />
                        <div className="mt-2">
                            <Text className="text-purple-600 text-sm">
                                <IoTrendingUpOutline /> +{stats.bookingGrowth}% from last month
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            valueStyle={{ color: '#f5222d' }}
                            prefix={<UserOutlined />}
                        />
                        <div className="mt-2">
                            <Text className="text-gray-500 text-sm">
                                Registered users
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Revenue Trend" className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'revenue' ? `฿${value?.toLocaleString()}` : value,
                                        name === 'revenue' ? 'Revenue' : 'Bookings'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Booking Status" className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bookingStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                >
                                    {bookingStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Tables Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card
                        title="Recent Bookings"
                        extra={
                            <Button type="link">
                                View All
                            </Button>
                        }
                    >
                        <Table
                            dataSource={recentBookings}
                            columns={recentBookingsColumns}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card
                        title="Top Performing Hotels"
                        extra={
                            <Button type="link">
                                View All
                            </Button>
                        }
                    >
                        <Table
                            dataSource={topHotels}
                            columns={topHotelsColumns}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}