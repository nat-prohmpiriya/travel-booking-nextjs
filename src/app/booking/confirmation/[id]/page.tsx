"use client";

import React, { useEffect, useState } from 'react';
import { 
    Result, 
    Card, 
    Typography, 
    Button, 
    Row, 
    Col, 
    Divider, 
    Space,
    QRCode,
    Tag,
    Alert,
    Steps
} from 'antd';
import { 
    CheckCircleOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    DownloadOutlined,
    ShareAltOutlined,
    HomeOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

interface BookingConfirmation {
    id: string;
    hotelName: string;
    hotelAddress: string;
    hotelPhone: string;
    hotelEmail: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    totalPrice: number;
    bookingDate: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    guestInfo: {
        name: string;
        email: string;
        phone: string;
    };
    confirmationCode: string;
    specialRequests?: string;
}

export default function BookingConfirmation() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const bookingId = params.id as string;
    
    const [booking, setBooking] = useState<BookingConfirmation | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Simulate fetching booking details
        setTimeout(() => {
            const mockBooking: BookingConfirmation = {
                id: bookingId,
                hotelName: 'Grand Palace Hotel',
                hotelAddress: '123 Sukhumvit Road, Bangkok 10110, Thailand',
                hotelPhone: '+66 2 123 4567',
                hotelEmail: 'info@grandpalace.com',
                roomName: 'Deluxe Room',
                checkIn: dayjs().add(7, 'day').format('YYYY-MM-DD'),
                checkOut: dayjs().add(10, 'day').format('YYYY-MM-DD'),
                guests: 2,
                rooms: 1,
                totalPrice: 8600,
                bookingDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                status: 'confirmed',
                guestInfo: {
                    name: user?.displayName || 'John Doe',
                    email: user?.email || 'john@example.com',
                    phone: '+66 81 234 5678'
                },
                confirmationCode: `${bookingId}-CONF`,
                specialRequests: 'Early check-in requested'
            };
            
            setBooking(mockBooking);
            setLoading(false);
        }, 1000);
    }, [bookingId, user]);

    const handleDownloadConfirmation = () => {
        // Simulate PDF download
        console.log('Downloading confirmation...');
    };

    const handleShareBooking = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Hotel Booking Confirmation',
                text: `My hotel booking at ${booking?.hotelName}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Booking link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading confirmation...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Result
                    status="404"
                    title="Booking Not Found"
                    subTitle="The booking confirmation you're looking for doesn't exist."
                    extra={
                        <Button type="primary" onClick={() => router.push('/')}>
                            Back to Home
                        </Button>
                    }
                />
            </div>
        );
    }

    const nights = dayjs(booking.checkOut).diff(dayjs(booking.checkIn), 'day');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Success Result */}
                <Result
                    status="success"
                    title="Booking Confirmed!"
                    subTitle={`Your booking ${booking.confirmationCode} has been confirmed. We've sent a confirmation email to ${booking.guestInfo.email}`}
                    extra={[
                        <Button type="primary" key="home" onClick={() => router.push('/')}>
                            <HomeOutlined /> Back to Home
                        </Button>,
                        <Button key="bookings" onClick={() => router.push('/bookings')}>
                            <BookOutlined /> View My Bookings
                        </Button>
                    ]}
                />

                <Row gutter={24} className="mt-8">
                    {/* Booking Details */}
                    <Col xs={24} lg={16}>
                        <Card title="Booking Details" className="mb-6">
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <div className="space-y-4">
                                        <div>
                                            <Title level={4} className="!mb-2">{booking.hotelName}</Title>
                                            <div className="flex items-start">
                                                <EnvironmentOutlined className="mr-2 mt-1 text-gray-500" />
                                                <Text className="text-gray-600">{booking.hotelAddress}</Text>
                                            </div>
                                        </div>

                                        <div>
                                            <Text className="block font-medium mb-2">Room Details</Text>
                                            <Text className="text-lg">{booking.roomName}</Text>
                                            <div className="flex items-center mt-1">
                                                <UserOutlined className="mr-2 text-gray-500" />
                                                <Text className="text-gray-600">
                                                    {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}, 
                                                    {booking.rooms} {booking.rooms === 1 ? 'room' : 'rooms'}
                                                </Text>
                                            </div>
                                        </div>

                                        <div>
                                            <Text className="block font-medium mb-2">Check-in / Check-out</Text>
                                            <div className="flex items-center mb-1">
                                                <CalendarOutlined className="mr-2 text-gray-500" />
                                                <Text>
                                                    {dayjs(booking.checkIn).format('ddd, DD MMM YYYY')} - 
                                                    {dayjs(booking.checkOut).format(' ddd, DD MMM YYYY')}
                                                </Text>
                                            </div>
                                            <Text className="text-gray-600 ml-6">
                                                {nights} {nights === 1 ? 'night' : 'nights'}
                                            </Text>
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} md={12}>
                                    <div className="space-y-4">
                                        <div>
                                            <Text className="block font-medium mb-2">Guest Information</Text>
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <UserOutlined className="mr-2 text-gray-500" />
                                                    <Text>{booking.guestInfo.name}</Text>
                                                </div>
                                                <div className="flex items-center">
                                                    <MailOutlined className="mr-2 text-gray-500" />
                                                    <Text>{booking.guestInfo.email}</Text>
                                                </div>
                                                <div className="flex items-center">
                                                    <PhoneOutlined className="mr-2 text-gray-500" />
                                                    <Text>{booking.guestInfo.phone}</Text>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Text className="block font-medium mb-2">Booking Status</Text>
                                            <Tag color="green" className="text-sm">
                                                <CheckCircleOutlined className="mr-1" />
                                                Confirmed
                                            </Tag>
                                        </div>

                                        {booking.specialRequests && (
                                            <div>
                                                <Text className="block font-medium mb-2">Special Requests</Text>
                                                <Text className="text-gray-600">{booking.specialRequests}</Text>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {/* Important Information */}
                        <Card title="Important Information" className="mb-6">
                            <Alert
                                message="Check-in Instructions"
                                description="Please present this confirmation and a valid ID at check-in. Check-in time is from 3:00 PM, and check-out is until 12:00 PM."
                                type="info"
                                showIcon
                                className="mb-4"
                            />

                            <Alert
                                message="Cancellation Policy"
                                description="Free cancellation until 24 hours before check-in. Cancellations after this time may be subject to charges."
                                type="warning"
                                showIcon
                                className="mb-4"
                            />

                            <div className="space-y-2">
                                <Text className="block font-medium">Hotel Contact Information:</Text>
                                <div className="flex items-center">
                                    <PhoneOutlined className="mr-2 text-gray-500" />
                                    <Text>{booking.hotelPhone}</Text>
                                </div>
                                <div className="flex items-center">
                                    <MailOutlined className="mr-2 text-gray-500" />
                                    <Text>{booking.hotelEmail}</Text>
                                </div>
                            </div>
                        </Card>

                        {/* Next Steps */}
                        <Card title="What's Next?" className="mb-6">
                            <Steps
                                direction="vertical"
                                size="small"
                                current={0}
                                items={[
                                    {
                                        title: 'Confirmation Email Sent',
                                        description: 'Check your email for detailed confirmation',
                                        status: 'finish'
                                    },
                                    {
                                        title: 'Prepare for Check-in',
                                        description: 'Bring valid ID and this confirmation'
                                    },
                                    {
                                        title: 'Enjoy Your Stay',
                                        description: `Check-in on ${dayjs(booking.checkIn).format('DD MMM YYYY')}`
                                    }
                                ]}
                            />
                        </Card>
                    </Col>

                    {/* Confirmation Summary */}
                    <Col xs={24} lg={8}>
                        <Card className="mb-6">
                            <div className="text-center mb-4">
                                <Title level={4}>Confirmation Code</Title>
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <Text className="text-2xl font-bold text-blue-600">
                                        {booking.confirmationCode}
                                    </Text>
                                </div>
                                <Text className="text-gray-600">
                                    Save this code for your records
                                </Text>
                            </div>

                            <Divider />

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Text>Room Rate ({nights} nights)</Text>
                                    <Text>฿{(booking.totalPrice * 0.85).toLocaleString()}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Taxes & Fees</Text>
                                    <Text>฿{(booking.totalPrice * 0.1).toLocaleString()}</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Service Fee</Text>
                                    <Text>฿{(booking.totalPrice * 0.05).toLocaleString()}</Text>
                                </div>
                                
                                <Divider />
                                
                                <div className="flex justify-between items-center">
                                    <Title level={4} className="!mb-0">Total Paid</Title>
                                    <Title level={4} className="!mb-0 text-green-600">
                                        ฿{booking.totalPrice.toLocaleString()}
                                    </Title>
                                </div>
                            </div>

                            <Divider />

                            <Space direction="vertical" className="w-full">
                                <Button 
                                    type="primary" 
                                    icon={<DownloadOutlined />} 
                                    block
                                    onClick={handleDownloadConfirmation}
                                >
                                    Download Confirmation
                                </Button>
                                <Button 
                                    icon={<ShareAltOutlined />} 
                                    block
                                    onClick={handleShareBooking}
                                >
                                    Share Booking
                                </Button>
                            </Space>
                        </Card>

                        {/* QR Code */}
                        <Card title="Quick Access" className="text-center">
                            <QRCode 
                                value={`${window.location.origin}/booking/confirmation/${bookingId}`}
                                size={150}
                                className="mb-4"
                            />
                            <Text className="text-gray-600 text-sm">
                                Scan to access your booking
                            </Text>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}