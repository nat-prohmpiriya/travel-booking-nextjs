"use client";

import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Button,
    Row,
    Col,
    Tag,
    Empty,
    Tabs,
    Input,
    Select,
    DatePicker,
    Modal,
    Rate,
    Form,
    message,
    Spin,
    Alert,
    Breadcrumb,
    Divider
} from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    StarOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { bookingService, } from '@/services/bookingService';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Booking {
    id: string;
    confirmationCode: string;
    hotelName: string;
    hotelImage: string;
    hotelLocation: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    totalPrice: number;
    bookingDate: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    canCancel: boolean;
    canModify: boolean;
    hasReview?: boolean;
}

export default function BookingsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<any>(null);
    const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
    const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [reviewForm] = Form.useForm();

    // Mock booking data
    const mockBookings: Booking[] = [
        {
            id: '1',
            confirmationCode: 'BK2024001-CONF',
            hotelName: 'Grand Palace Hotel',
            hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
            hotelLocation: 'Bangkok, Thailand',
            roomName: 'Deluxe Room',
            checkIn: dayjs().add(7, 'day').format('YYYY-MM-DD'),
            checkOut: dayjs().add(10, 'day').format('YYYY-MM-DD'),
            guests: 2,
            rooms: 1,
            totalPrice: 8600,
            bookingDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
            status: 'upcoming',
            canCancel: true,
            canModify: true
        },
        {
            id: '2',
            confirmationCode: 'BK2024002-CONF',
            hotelName: 'Seaside Resort',
            hotelImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop',
            hotelLocation: 'Phuket, Thailand',
            roomName: 'Ocean View Suite',
            checkIn: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
            checkOut: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
            guests: 2,
            rooms: 1,
            totalPrice: 12500,
            bookingDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD HH:mm:ss'),
            status: 'completed',
            canCancel: false,
            canModify: false,
            hasReview: false
        },
        {
            id: '3',
            confirmationCode: 'BK2024003-CONF',
            hotelName: 'Mountain Lodge',
            hotelImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop',
            hotelLocation: 'Chiang Mai, Thailand',
            roomName: 'Standard Room',
            checkIn: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            checkOut: dayjs().subtract(28, 'day').format('YYYY-MM-DD'),
            guests: 1,
            rooms: 1,
            totalPrice: 4200,
            bookingDate: dayjs().subtract(35, 'day').format('YYYY-MM-DD HH:mm:ss'),
            status: 'cancelled',
            canCancel: false,
            canModify: false
        }
    ];

    useEffect(() => {
        if (!user) {
            router.push('/auth/signin');
            return;
        }

        const loadBookings = async () => {
            try {
                const userBookings = await bookingService.getUserBookings(user.uid);

                // Convert Firebase bookings to our Booking interface
                const convertedBookings: Booking[] = userBookings.map(booking => ({
                    id: booking.id,
                    confirmationCode: booking.confirmationCode,
                    hotelName: booking.hotelName,
                    hotelImage: booking.hotelImage,
                    hotelLocation: booking.hotelLocation,
                    roomName: booking.roomName,
                    checkIn: dayjs(booking.checkIn.toDate()).format('YYYY-MM-DD'),
                    checkOut: dayjs(booking.checkOut.toDate()).format('YYYY-MM-DD'),
                    guests: booking.guests,
                    rooms: booking.rooms,
                    totalPrice: booking.pricing.total,
                    bookingDate: dayjs(booking.createdAt.toDate()).format('YYYY-MM-DD HH:mm:ss'),
                    status: booking.status === 'confirmed' ? 'upcoming' :
                        booking.status === 'checked-out' ? 'completed' :
                            booking.status as 'upcoming' | 'completed' | 'cancelled',
                    canCancel: booking.policies.canCancel && booking.status === 'confirmed',
                    canModify: booking.policies.canModify && booking.status === 'confirmed',
                    hasReview: false // TODO: Check if user has submitted review
                }));

                setBookings(convertedBookings);
                setFilteredBookings(convertedBookings);
            } catch (error) {
                console.error('Error loading bookings:', error);
                // Fallback to mock data
                setBookings(mockBookings);
                setFilteredBookings(mockBookings);
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, [user, router]);

    useEffect(() => {
        let filtered = bookings;

        // Filter by status
        if (activeTab !== 'all') {
            filtered = filtered.filter(booking => booking.status === activeTab);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.hotelLocation.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status dropdown
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }

        // Filter by date range
        if (dateFilter && dateFilter.length === 2) {
            filtered = filtered.filter(booking => {
                const bookingDate = dayjs(booking.bookingDate);
                return bookingDate.isAfter(dateFilter[0]) && bookingDate.isBefore(dateFilter[1]);
            });
        }

        setFilteredBookings(filtered);
    }, [bookings, activeTab, searchTerm, statusFilter, dateFilter]);

    const handleCancelBooking = async (booking: Booking) => {
        setSelectedBooking(booking);
        setCancelModalVisible(true);
    };

    const confirmCancelBooking = async () => {
        if (!selectedBooking) return;

        try {
            await bookingService.cancelBooking(selectedBooking.id);

            setBookings(prev =>
                prev.map(booking =>
                    booking.id === selectedBooking.id
                        ? { ...booking, status: 'cancelled' as const, canCancel: false, canModify: false }
                        : booking
                )
            );

            message.success('Booking cancelled successfully');
            setCancelModalVisible(false);
        } catch (error: any) {
            message.error(error.message || 'Failed to cancel booking');
        }
    };

    const handleWriteReview = (booking: Booking) => {
        setSelectedBooking(booking);
        setReviewModalVisible(true);
    };

    const submitReview = async (values: any) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setBookings(prev =>
                prev.map(booking =>
                    booking.id === selectedBooking?.id
                        ? { ...booking, hasReview: true }
                        : booking
                )
            );

            message.success('Review submitted successfully');
            setReviewModalVisible(false);
            reviewForm.resetFields();
        } catch (error) {
            message.error('Failed to submit review');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'blue';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'upcoming': return <ClockCircleOutlined />;
            case 'completed': return <CheckCircleOutlined />;
            case 'cancelled': return <CloseCircleOutlined />;
            default: return null;
        }
    };

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <Link href="/">
                                        <HomeOutlined /> Home
                                    </Link>
                                )
                            },
                            {
                                title: 'My Bookings'
                            }
                        ]}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <Title level={2}>My Bookings</Title>
                    <Text className="text-gray-600">
                        Manage your hotel reservations and view booking history
                    </Text>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder="Search by hotel name or booking code"
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={6} md={4}>
                            <Select
                                placeholder="Status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: '100%' }}
                            >
                                <Option value="all">All Status</Option>
                                <Option value="upcoming">Upcoming</Option>
                                <Option value="completed">Completed</Option>
                                <Option value="cancelled">Cancelled</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={6} md={8}>
                            <RangePicker
                                placeholder={['Booking from', 'Booking to']}
                                value={dateFilter}
                                onChange={setDateFilter}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Button
                                block
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFilter(null);
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Tabs */}
                <Card className='mt-4'>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'all',
                                label: `All (${bookings.length})`,
                                children: null
                            },
                            {
                                key: 'upcoming',
                                label: `Upcoming (${bookings.filter(b => b.status === 'upcoming').length})`,
                                children: null
                            },
                            {
                                key: 'completed',
                                label: `Completed (${bookings.filter(b => b.status === 'completed').length})`,
                                children: null
                            },
                            {
                                key: 'cancelled',
                                label: `Cancelled (${bookings.filter(b => b.status === 'cancelled').length})`,
                                children: null
                            }
                        ]}
                    />

                    {/* Bookings List */}
                    {filteredBookings.length === 0 ? (
                        <Empty
                            description={
                                searchTerm || statusFilter !== 'all' || dateFilter
                                    ? "No bookings match your filters"
                                    : "No bookings found"
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            {!searchTerm && statusFilter === 'all' && !dateFilter && (
                                <Button type="primary" onClick={() => router.push('/')}>
                                    Start Booking
                                </Button>
                            )}
                        </Empty>
                    ) : (
                        <div className="space-y-4 mt-6">
                            {filteredBookings.map((booking) => {
                                const nights = dayjs(booking.checkOut).diff(dayjs(booking.checkIn), 'day');
                                const isUpcoming = booking.status === 'upcoming';
                                const isCompleted = booking.status === 'completed';

                                return (
                                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                        <Row gutter={16}>
                                            <Col xs={24} sm={6}>
                                                <img
                                                    src={booking.hotelImage}
                                                    alt={booking.hotelName}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            </Col>
                                            <Col xs={24} sm={18}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <Title level={4} className="!mb-1">
                                                            {booking.hotelName}
                                                        </Title>
                                                        <div className="flex items-center text-gray-600 mb-2">
                                                            <EnvironmentOutlined className="mr-1" />
                                                            <Text>{booking.hotelLocation}</Text>
                                                        </div>
                                                        <Text className="text-gray-600">
                                                            {booking.roomName} • {booking.rooms} room • {booking.guests} guests
                                                        </Text>
                                                    </div>
                                                    <div className="text-right">
                                                        <Tag
                                                            color={getStatusColor(booking.status)}
                                                            icon={getStatusIcon(booking.status)}
                                                            className="mb-2"
                                                        >
                                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                        </Tag>
                                                        <div className="text-lg font-bold text-blue-600">
                                                            ฿{booking.totalPrice.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Row gutter={16} className="mb-3">
                                                    <Col span={12}>
                                                        <div className="flex items-center">
                                                            <CalendarOutlined className="mr-2 text-gray-500" />
                                                            <div>
                                                                <Text className="block">Check-in</Text>
                                                                <Text className="font-medium">
                                                                    {dayjs(booking.checkIn).format('DD MMM YYYY')}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col span={12}>
                                                        <div className="flex items-center">
                                                            <CalendarOutlined className="mr-2 text-gray-500" />
                                                            <div>
                                                                <Text className="block">Check-out</Text>
                                                                <Text className="font-medium">
                                                                    {dayjs(booking.checkOut).format('DD MMM YYYY')}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="mb-3">
                                                    <Text className="text-gray-600">
                                                        Booking Code: <span className="font-medium">{booking.confirmationCode}</span>
                                                    </Text>
                                                    <Text className="text-gray-600 ml-4">
                                                        Booked: {dayjs(booking.bookingDate).format('DD MMM YYYY')}
                                                    </Text>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        icon={<EyeOutlined />}
                                                        onClick={() => router.push(`/booking/confirmation/${booking.id}`)}
                                                    >
                                                        View Details
                                                    </Button>

                                                    <Button
                                                        icon={<DownloadOutlined />}
                                                        onClick={() => console.log('Download confirmation')}
                                                    >
                                                        Download
                                                    </Button>

                                                    {booking.canModify && (
                                                        <Button
                                                            icon={<EditOutlined />}
                                                            disabled
                                                        >
                                                            Modify (Coming Soon)
                                                        </Button>
                                                    )}

                                                    {booking.canCancel && (
                                                        <Button
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleCancelBooking(booking)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}

                                                    {isCompleted && !booking.hasReview && (
                                                        <Button
                                                            type="primary"
                                                            icon={<StarOutlined />}
                                                            onClick={() => handleWriteReview(booking)}
                                                        >
                                                            Write Review
                                                        </Button>
                                                    )}

                                                    {isCompleted && booking.hasReview && (
                                                        <Button
                                                            icon={<StarOutlined />}
                                                            disabled
                                                        >
                                                            Review Submitted
                                                        </Button>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Cancel Booking Modal */}
            <Modal
                title="Cancel Booking"
                open={cancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                onOk={confirmCancelBooking}
                okText="Yes, Cancel Booking"
                okType="danger"
                width={500}
            >
                <Alert
                    message="Are you sure you want to cancel this booking?"
                    description={`This will cancel your reservation at ${selectedBooking?.hotelName}. Depending on the cancellation policy, you may be charged a fee.`}
                    type="warning"
                    showIcon
                    className="mb-4"
                />

                {selectedBooking && (
                    <div className="space-y-2">
                        <Text className="block"><strong>Hotel:</strong> {selectedBooking.hotelName}</Text>
                        <Text className="block"><strong>Check-in:</strong> {dayjs(selectedBooking.checkIn).format('DD MMM YYYY')}</Text>
                        <Text className="block"><strong>Check-out:</strong> {dayjs(selectedBooking.checkOut).format('DD MMM YYYY')}</Text>
                        <Text className="block"><strong>Total Amount:</strong> ฿{selectedBooking.totalPrice.toLocaleString()}</Text>
                    </div>
                )}
            </Modal>

            {/* Review Modal */}
            <Modal
                title="Write a Review"
                open={reviewModalVisible}
                onCancel={() => setReviewModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={reviewForm}
                    layout="vertical"
                    onFinish={submitReview}
                >
                    {selectedBooking && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <Text className="block font-medium">{selectedBooking.hotelName}</Text>
                            <Text className="text-gray-600">{selectedBooking.hotelLocation}</Text>
                            <Text className="text-gray-600">
                                {dayjs(selectedBooking.checkIn).format('DD MMM')} - {dayjs(selectedBooking.checkOut).format('DD MMM YYYY')}
                            </Text>
                        </div>
                    )}

                    <Form.Item
                        name="rating"
                        label="Overall Rating"
                        rules={[{ required: true, message: 'Please provide a rating' }]}
                    >
                        <Rate className="text-2xl" />
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Review Title"
                        rules={[{ required: true, message: 'Please enter a review title' }]}
                    >
                        <Input placeholder="Summarize your experience" />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="Your Review"
                        rules={[{ required: true, message: 'Please write your review' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Share your experience with other travelers"
                        />
                    </Form.Item>

                    <Form.Item className="!mb-0">
                        <div className="flex justify-end space-x-2">
                            <Button onClick={() => setReviewModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Submit Review
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}