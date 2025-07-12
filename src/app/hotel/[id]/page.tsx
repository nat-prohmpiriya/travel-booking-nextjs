"use client";

import React, { useEffect, useState } from 'react';
import { 
    Row, 
    Col, 
    Card, 
    Typography, 
    Button, 
    Rate, 
    Tag, 
    Divider, 
    Carousel, 
    Space,
    Avatar,
    Progress,
    Modal,
    DatePicker,
    InputNumber,
    Select,
    message,
    Spin,
    Breadcrumb
} from 'antd';
import { 
    EnvironmentOutlined, 
    StarOutlined,
    WifiOutlined,
    CarOutlined,
    CoffeeOutlined,
    PhoneOutlined,
    MailOutlined,
    ShareAltOutlined,
    HeartOutlined,
    CalendarOutlined,
    UserOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useSearchStore } from '@/stores/search-store';
import { SearchForm } from '@/components/search-form';
import { SearchParams as SearchParamsType } from '@/types';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Room {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    amenities: string[];
    maxGuests: number;
    bedType: string;
    size: number;
    available: number;
    images: string[];
}

interface Review {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    date: string;
    comment: string;
    helpful: number;
}

export default function HotelDetail() {
    const router = useRouter();
    const params = useParams();
    const hotelId = params.id as string;
    
    const { searchResults, isLoading } = useSearchStore();
    const [hotel, setHotel] = useState<any>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [bookingModalVisible, setBookingModalVisible] = useState<boolean>(false);
    const [rooms, setRooms] = useState<number>(1);
    const [guests, setGuests] = useState<number>(2);
    const [dateRange, setDateRange] = useState<any>(null);

    // Mock data for rooms and reviews
    const mockRooms: Room[] = [
        {
            id: '1',
            name: 'Deluxe Room',
            price: 2500,
            originalPrice: 3000,
            description: 'Spacious room with city view, modern amenities and comfortable bedding.',
            amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'TV'],
            maxGuests: 2,
            bedType: 'King Bed',
            size: 35,
            available: 5,
            images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop']
        },
        {
            id: '2',
            name: 'Superior Suite',
            price: 4200,
            originalPrice: 5000,
            description: 'Luxurious suite with separate living area, premium amenities and balcony.',
            amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'TV', 'Balcony', 'Bathtub'],
            maxGuests: 4,
            bedType: 'King Bed + Sofa Bed',
            size: 65,
            available: 2,
            images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop']
        }
    ];

    const mockReviews: Review[] = [
        {
            id: '1',
            userName: 'Sarah Johnson',
            rating: 5,
            date: '2024-06-15',
            comment: 'Amazing hotel with excellent service! The room was spacious and clean. Highly recommend.',
            helpful: 12
        },
        {
            id: '2',
            userName: 'Mike Chen',
            rating: 4,
            date: '2024-06-10',
            comment: 'Great location and friendly staff. The breakfast was delicious. Will definitely stay again.',
            helpful: 8
        }
    ];

    useEffect(() => {
        const foundHotel = searchResults.find(h => h.id === hotelId);
        if (foundHotel) {
            setHotel(foundHotel);
        } else {
            // Mock hotel data if not found in search results
            setHotel({
                id: hotelId,
                name: 'Grand Palace Hotel',
                location: 'Bangkok City Center',
                rating: 4.5,
                reviewCount: 1247,
                price: 2500,
                description: 'Experience luxury and comfort at Grand Palace Hotel, located in the heart of Bangkok. Our hotel offers world-class amenities, exceptional service, and convenient access to major attractions.',
                imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
                amenities: ['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Concierge'],
                images: [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
                ]
            });
        }
    }, [hotelId, searchResults]);

    const handleBookRoom = (room: Room) => {
        setSelectedRoom(room);
        setBookingModalVisible(true);
    };

    const handleBookingConfirm = () => {
        if (!dateRange || !selectedRoom) {
            message.error('Please select dates and room');
            return;
        }

        const bookingData = {
            hotelId,
            hotelName: hotel.name,
            room: selectedRoom,
            checkIn: dateRange[0],
            checkOut: dateRange[1],
            guests,
            rooms,
            totalPrice: selectedRoom.price * rooms * (dateRange[1].diff(dateRange[0], 'days') || 1)
        };

        // Navigate to booking page with data
        router.push(`/booking?data=${encodeURIComponent(JSON.stringify(bookingData))}`);
    };

    if (!hotel) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    const ratingDistribution = [
        { stars: 5, percentage: 65 },
        { stars: 4, percentage: 25 },
        { stars: 3, percentage: 7 },
        { stars: 2, percentage: 2 },
        { stars: 1, percentage: 1 }
    ];

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
                        <Breadcrumb.Item>
                            <Link href="/search">Search Results</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>{hotel.name}</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <Card className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <Title level={2} className="!mb-2">{hotel.name}</Title>
                            <div className="flex items-center text-gray-600 mb-2">
                                <EnvironmentOutlined className="mr-1" />
                                <Text>{hotel.location}</Text>
                            </div>
                            <div className="flex items-center">
                                <Rate disabled defaultValue={hotel.rating} className="text-sm mr-2" />
                                <Text className="font-medium">{hotel.rating}</Text>
                                <Text className="text-gray-500 ml-2">
                                    ({hotel.reviewCount} reviews)
                                </Text>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button icon={<ShareAltOutlined />}>Share</Button>
                            <Button icon={<HeartOutlined />}>Save</Button>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    <div className="mb-6">
                        <Carousel autoplay>
                            {hotel.images?.map((image: string, index: number) => (
                                <div key={index}>
                                    <img
                                        src={image}
                                        alt={`${hotel.name} - ${index + 1}`}
                                        className="w-full h-96 object-cover rounded-lg"
                                    />
                                </div>
                            ))}
                        </Carousel>
                    </div>

                    <Paragraph className="text-lg">
                        {hotel.description}
                    </Paragraph>
                </Card>

                <Row gutter={24}>
                    {/* Main Content */}
                    <Col xs={24} lg={16}>
                        {/* Amenities */}
                        <Card title="Amenities" className="mb-6">
                            <Row gutter={[16, 16]}>
                                {hotel.amenities?.map((amenity: string) => (
                                    <Col xs={12} sm={8} md={6} key={amenity}>
                                        <div className="flex items-center">
                                            {amenity.includes('WiFi') && <WifiOutlined className="mr-2 text-blue-500" />}
                                            {amenity.includes('Parking') && <CarOutlined className="mr-2 text-blue-500" />}
                                            {amenity.includes('Breakfast') && <CoffeeOutlined className="mr-2 text-blue-500" />}
                                            <Text>{amenity}</Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>

                        {/* Available Rooms */}
                        <Card title="Available Rooms" className="mb-6">
                            <div className="space-y-4">
                                {mockRooms.map((room) => (
                                    <Card key={room.id} size="small" className="border">
                                        <Row gutter={16}>
                                            <Col xs={24} sm={8}>
                                                <img
                                                    src={room.images[0]}
                                                    alt={room.name}
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                            </Col>
                                            <Col xs={24} sm={16}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <Title level={4} className="!mb-1">{room.name}</Title>
                                                        <Text className="text-gray-600">{room.bedType} • {room.size}m²</Text>
                                                    </div>
                                                    <div className="text-right">
                                                        {room.originalPrice && (
                                                            <Text delete className="text-gray-400 block">
                                                                ฿{room.originalPrice.toLocaleString()}
                                                            </Text>
                                                        )}
                                                        <div className="text-xl font-bold text-blue-600">
                                                            ฿{room.price.toLocaleString()}
                                                        </div>
                                                        <Text className="text-gray-500">per night</Text>
                                                    </div>
                                                </div>

                                                <Paragraph className="text-sm text-gray-600 mb-3">
                                                    {room.description}
                                                </Paragraph>

                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {room.amenities.slice(0, 3).map((amenity) => (
                                                        <Tag key={amenity} size="small">{amenity}</Tag>
                                                    ))}
                                                    {room.amenities.length > 3 && (
                                                        <Tag size="small">+{room.amenities.length - 3} more</Tag>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <Text className="text-green-600">
                                                        {room.available} rooms left
                                                    </Text>
                                                    <Button 
                                                        type="primary"
                                                        onClick={() => handleBookRoom(room)}
                                                    >
                                                        Select Room
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </div>
                        </Card>

                        {/* Reviews */}
                        <Card title="Guest Reviews" className="mb-6">
                            {/* Rating Summary */}
                            <Row gutter={24} className="mb-6">
                                <Col xs={24} sm={8}>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            {hotel.rating}
                                        </div>
                                        <Rate disabled defaultValue={hotel.rating} className="mb-2" />
                                        <div className="text-gray-600">
                                            Based on {hotel.reviewCount} reviews
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24} sm={16}>
                                    {ratingDistribution.map((item) => (
                                        <div key={item.stars} className="flex items-center mb-2">
                                            <span className="w-8">{item.stars}★</span>
                                            <Progress 
                                                percent={item.percentage} 
                                                showInfo={false} 
                                                className="flex-1 mx-3"
                                            />
                                            <span className="w-12 text-right">{item.percentage}%</span>
                                        </div>
                                    ))}
                                </Col>
                            </Row>

                            <Divider />

                            {/* Individual Reviews */}
                            <div className="space-y-4">
                                {mockReviews.map((review) => (
                                    <div key={review.id} className="pb-4 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-start space-x-3">
                                            <Avatar icon={<UserOutlined />} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <Text className="font-medium">{review.userName}</Text>
                                                        <Text className="text-gray-500 ml-2">{review.date}</Text>
                                                    </div>
                                                    <Rate disabled defaultValue={review.rating} className="text-sm" />
                                                </div>
                                                <Paragraph className="mb-2">{review.comment}</Paragraph>
                                                <Button type="text" size="small">
                                                    👍 Helpful ({review.helpful})
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>

                    {/* Booking Sidebar */}
                    <Col xs={24} lg={8}>
                        <Card className="sticky top-4">
                            <Title level={4} className="text-center mb-4">Book Your Stay</Title>
                            
                            <div className="mb-4">
                                <Text className="block mb-2">Check-in / Check-out</Text>
                                <RangePicker
                                    style={{ width: '100%' }}
                                    placeholder={['Check-in', 'Check-out']}
                                    value={dateRange}
                                    onChange={setDateRange}
                                />
                            </div>

                            <Row gutter={8} className="mb-4">
                                <Col span={12}>
                                    <Text className="block mb-2">Guests</Text>
                                    <InputNumber
                                        min={1}
                                        max={10}
                                        value={guests}
                                        onChange={(value) => setGuests(value || 1)}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Text className="block mb-2">Rooms</Text>
                                    <InputNumber
                                        min={1}
                                        max={5}
                                        value={rooms}
                                        onChange={(value) => setRooms(value || 1)}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                            </Row>

                            <Button 
                                type="primary" 
                                size="large" 
                                block
                                onClick={() => setBookingModalVisible(true)}
                            >
                                Select Room & Book
                            </Button>

                            <Divider />

                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <PhoneOutlined className="mr-2" />
                                    <Text>+66 2 123 4567</Text>
                                </div>
                                <div className="flex items-center justify-center">
                                    <MailOutlined className="mr-2" />
                                    <Text>info@grandpalace.com</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Booking Modal */}
            <Modal
                title="Select Room"
                open={bookingModalVisible}
                onCancel={() => setBookingModalVisible(false)}
                footer={null}
                width={800}
            >
                <div className="space-y-4">
                    {mockRooms.map((room) => (
                        <Card 
                            key={room.id} 
                            size="small" 
                            className={`cursor-pointer border-2 ${
                                selectedRoom?.id === room.id ? 'border-blue-500' : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedRoom(room)}
                        >
                            <Row gutter={16}>
                                <Col span={8}>
                                    <img
                                        src={room.images[0]}
                                        alt={room.name}
                                        className="w-full h-24 object-cover rounded"
                                    />
                                </Col>
                                <Col span={16}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Title level={5} className="!mb-1">{room.name}</Title>
                                            <Text className="text-gray-600">{room.bedType}</Text>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">
                                                ฿{room.price.toLocaleString()}
                                            </div>
                                            <Text className="text-gray-500">per night</Text>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </div>

                <Divider />

                <div className="flex justify-between items-center">
                    <Button size="large" onClick={() => setBookingModalVisible(false)}>
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        size="large"
                        disabled={!selectedRoom || !dateRange}
                        onClick={handleBookingConfirm}
                    >
                        Proceed to Booking
                    </Button>
                </div>
            </Modal>
        </div>
    );
}