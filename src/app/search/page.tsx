"use client";

import React, { useEffect, useState, Suspense } from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Button,
    Slider,
    Checkbox,
    Radio,
    Space,
    Divider,
    Tag,
    Rate,
    Select,
    Spin,
    Empty
} from 'antd';
import {
    FilterOutlined,
    EnvironmentOutlined,
    StarOutlined,
    WifiOutlined,
    CarOutlined,
    CoffeeOutlined
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchStore } from '@/stores/search-store';
import { SearchForm } from '@/components/search-form';
import { SearchParams as SearchParamsType, SearchFilters as HotelSearchFilters } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

interface SearchFilters {
    priceRange: [number, number];
    rating: number;
    amenities: string[];
    hotelType: string;
}

function SearchResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {
        searchResults,
        isLoading,
        error,
        searchParams: currentSearchParams,
        currentFilters,
        setSearchParams,
        setFilters: setStoreFilters,
        searchHotels
    } = useSearchStore();

    const [sortBy, setSortBy] = useState<string>('relevance');

    // Use filters from store with defaults
    const filters = {
        priceRange: currentFilters.priceRange || [0, 10000] as [number, number],
        rating: currentFilters.rating || 0,
        amenities: currentFilters.amenities || [],
        hotelType: 'all'
    };

    useEffect(() => {
        const location = searchParams.get('location');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const guests = searchParams.get('guests');
        const rooms = searchParams.get('rooms');

        if (location) {
            const params: Partial<SearchParamsType> = {
                location,
                ...(checkIn && { checkIn: new Date(checkIn) }),
                ...(checkOut && { checkOut: new Date(checkOut) }),
                ...(guests && {
                    guests: {
                        adults: parseInt(guests),
                        children: 0
                    }
                }),
                ...(rooms && { rooms: parseInt(rooms) })
            };

            setSearchParams(params);
            searchHotels();
        }
    }, [searchParams, setSearchParams, searchHotels]);

    const handleSearch = async (params: Partial<SearchParamsType>) => {
        setSearchParams(params);
        await searchHotels();
    };

    const handleFilterChange = (key: keyof SearchFilters, value: string[] | number | [number, number] | number[]) => {
        const newFilters = { ...currentFilters, [key]: value };
        setStoreFilters(newFilters);
        // Trigger search with new filters
        searchWithFilters(newFilters);
    };

    const searchWithFilters = async (newFilters: Partial<HotelSearchFilters>) => {
        const currentParams = currentSearchParams;
        if (!currentParams?.location) return;

        // Update filters in store and trigger search
        setStoreFilters(newFilters);
        await searchHotels();
    };

    const handleBookHotel = (hotelId: string) => {
        router.push(`/hotel/${hotelId}`);
    };

    // Remove client-side filtering since we're doing server-side filtering
    const displayResults = searchResults;

    const sortedResults = [...displayResults].sort((a, b) => {
        switch (sortBy) {
            case 'price-low': return (a.price || 0) - (b.price || 0);
            case 'price-high': return (b.price || 0) - (a.price || 0);
            case 'rating': return b.rating - a.rating;
            case 'distance': return (a.distance || 0) - (b.distance || 0);
            default: return 0;
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Form */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <SearchForm
                        onSearch={handleSearch}
                        loading={isLoading}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <Row gutter={24}>
                    {/* Filters Sidebar */}
                    <Col xs={24} lg={6}>
                        <Card className="mb-6">
                            <div className="flex items-center mb-4">
                                <FilterOutlined className="mr-2" />
                                <Title level={4} className="!mb-0">Filters</Title>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <Title level={5}>Price Range (per night)</Title>
                                <Slider
                                    range
                                    min={0}
                                    max={10000}
                                    value={filters.priceRange}
                                    onChange={(value) => handleFilterChange('priceRange', value)}
                                    tooltip={{ formatter: (value?: number) => value ? `฿${value}` : '฿0' }}
                                />
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>฿{filters.priceRange[0]}</span>
                                    <span>฿{filters.priceRange[1]}</span>
                                </div>
                            </div>

                            <Divider />

                            {/* Rating */}
                            <div className="mb-6">
                                <Title level={5}>Minimum Rating</Title>
                                <Radio.Group
                                    value={filters.rating}
                                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                                >
                                    <Space direction="vertical">
                                        <Radio value={0}>Any rating</Radio>
                                        <Radio value={3}>
                                            <Rate disabled defaultValue={3} className="text-sm" /> & up
                                        </Radio>
                                        <Radio value={4}>
                                            <Rate disabled defaultValue={4} className="text-sm" /> & up
                                        </Radio>
                                        <Radio value={4.5}>
                                            <Rate disabled defaultValue={4.5} className="text-sm" /> & up
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </div>

                            <Divider />

                            {/* Amenities */}
                            <div className="mb-6">
                                <Title level={5}>Amenities</Title>
                                <Checkbox.Group
                                    value={filters.amenities}
                                    onChange={(value) => handleFilterChange('amenities', value)}
                                >
                                    <Space direction="vertical">
                                        <Checkbox value="wifi">
                                            <WifiOutlined className="mr-2" />
                                            Free WiFi
                                        </Checkbox>
                                        <Checkbox value="parking">
                                            <CarOutlined className="mr-2" />
                                            Free Parking
                                        </Checkbox>
                                        <Checkbox value="breakfast">
                                            <CoffeeOutlined className="mr-2" />
                                            Breakfast Included
                                        </Checkbox>
                                        <Checkbox value="pool">Swimming Pool</Checkbox>
                                        <Checkbox value="gym">Fitness Center</Checkbox>
                                        <Checkbox value="spa">Spa Services</Checkbox>
                                    </Space>
                                </Checkbox.Group>
                            </div>
                        </Card>
                    </Col>

                    {/* Results */}
                    <Col xs={24} lg={18}>
                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <Title level={3} className="!mb-1">
                                    {currentSearchParams?.location ?
                                        `Hotels in ${currentSearchParams.location}` :
                                        'Search Results'
                                    }
                                </Title>
                                <Text className="text-gray-600">
                                    {isLoading ? 'Searching...' : `${sortedResults.length} properties found`}
                                </Text>
                            </div>
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                style={{ width: 200 }}
                            >
                                <Option value="relevance">Most Relevant</Option>
                                <Option value="price-low">Price: Low to High</Option>
                                <Option value="price-high">Price: High to Low</Option>
                                <Option value="rating">Highest Rated</Option>
                                <Option value="distance">Distance</Option>
                            </Select>
                        </div>

                        {/* Error State */}
                        {error && (
                            <Card className="mb-6">
                                <div className="text-center py-4">
                                    <Text type="danger">{error}</Text>
                                    <div className="mt-2">
                                        <Button
                                            type="primary"
                                            onClick={() => searchHotels()}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Loading */}
                        {isLoading && (
                            <div className="text-center py-12">
                                <Spin size="large" />
                                <div className="mt-4">
                                    <Text>Searching for the best hotels...</Text>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && sortedResults.length === 0 && (
                            <Card>
                                <Empty
                                    description="ไม่พบโรงแรมที่ตรงกับเงื่อนไขการค้นหา"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                >
                                    <Button type="primary" onClick={() => setStoreFilters({
                                        priceRange: [0, 10000],
                                        rating: 0,
                                        amenities: []
                                    })}>
                                        Clear Filters
                                    </Button>
                                </Empty>
                            </Card>
                        )}

                        {/* Hotel Cards */}
                        <div className="space-y-6">
                            {sortedResults.map((hotel) => (
                                <Card
                                    key={hotel.id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => handleBookHotel(hotel.id)}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={8}>                                <img
                                            src={hotel.imageUrl}
                                            alt={hotel.name}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        </Col>
                                        <Col xs={24} sm={16}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <Title level={4} className="!mb-1">{hotel.name}</Title>
                                                    <div className="flex items-center text-gray-600 mb-2">
                                                        <EnvironmentOutlined className="mr-1" />
                                                        <Text>{hotel.location}</Text>
                                                        {hotel.distance && (
                                                            <Text className="ml-4">
                                                                {hotel.distance}km from center
                                                            </Text>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center mb-3">
                                                        <Rate disabled defaultValue={hotel.rating} className="text-sm mr-2" />
                                                        <Text className="font-medium">{hotel.rating}</Text>
                                                        <Text className="text-gray-500 ml-2">
                                                            ({hotel.reviewCount || 0} reviews)
                                                        </Text>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        ฿{(hotel.price || 0).toLocaleString()}
                                                    </div>
                                                    <Text className="text-gray-500">per night</Text>
                                                </div>
                                            </div>

                                            <Text className="text-gray-600 mb-3 block">
                                                {hotel.description}
                                            </Text>

                                            {hotel.amenities && (
                                                <div className="mb-3">
                                                    {hotel.amenities.slice(0, 4).map((amenity) => (
                                                        <Tag key={amenity} className="mb-1">
                                                            {amenity}
                                                        </Tag>
                                                    ))}
                                                    {hotel.amenities.length > 4 && (
                                                        <Tag>+{hotel.amenities.length - 4} more</Tag>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <StarOutlined className="text-yellow-500 mr-1" />
                                                    <Text className="text-green-600 font-medium">
                                                        Free cancellation
                                                    </Text>
                                                </div>
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBookHotel(hotel.id);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default function SearchResults() {
    return (
        <Suspense fallback={<Spin size="large" />}>
            <SearchResultsContent />
        </Suspense>
    );
}