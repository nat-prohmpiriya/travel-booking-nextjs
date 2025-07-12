"use client";

import React, { useEffect } from 'react';
import { Button, Typography, Row, Col, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search-store';
import { SearchForm } from '@/components/search-form';
import { DestinationCard } from '@/components/destination-card';
import { HotelCard } from '@/components/hotel-card';
import { SearchParams } from '@/types';

const { Title, Text } = Typography;

export default function Home() {
  const router = useRouter();
  const {
    popularDestinations,
    featuredHotels,
    isLoading,
    setSearchParams,
    searchHotels,
    loadPopularDestinations,
    loadFeaturedHotels
  } = useSearchStore();

  useEffect(() => {
    loadPopularDestinations();
    loadFeaturedHotels();
  }, [loadPopularDestinations, loadFeaturedHotels]);

  const handleSearch = async (params: Partial<SearchParams>) => {
    setSearchParams(params);
    await searchHotels();
    message.success('Search completed! Redirecting to results...');
    // TODO: Navigate to search results page
    // router.push('/search');
  };

  const handleDestinationClick = (destination: any) => {
    setSearchParams({ location: destination.name });
    // TODO: Navigate to search with destination preset
    message.info(`Searching hotels in ${destination.name}...`);
  };

  const handleBookHotel = (hotel: any) => {
    // TODO: Navigate to booking page
    message.info(`Booking ${hotel.name}...`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1200&h=600&fit=crop')"
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-8">
            <Title level={1} className="text-white !mb-2">
              Find Your Perfect Stay
            </Title>
            <Text className="text-xl text-gray-200">
              Discover amazing hotels and resorts for your next adventure
            </Text>
          </div>

          {/* Search Form */}
          <div className="max-w-6xl mx-auto">
            <SearchForm onSearch={handleSearch} loading={isLoading} />
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            Popular Destinations
          </Title>
          <Row gutter={[24, 24]}>
            {popularDestinations.map((destination) => (
              <Col xs={24} sm={12} lg={6} key={destination.id}>
                <DestinationCard
                  destination={destination}
                  onClick={() => handleDestinationClick(destination)}
                />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            Featured Hotels
          </Title>
          <Row gutter={[24, 24]}>
            {featuredHotels.map((hotel) => (
              <Col xs={24} md={8} key={hotel.id}>
                <HotelCard
                  hotel={hotel}
                  onBookClick={() => handleBookHotel(hotel)}
                />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="container mx-auto px-4 text-center text-white">
          <Title level={2} className="text-white mb-4">
            Special Offers
          </Title>
          <Text className="text-xl mb-8 block text-white">
            Save up to 50% on selected hotels this month!
          </Text>
          <Button size="large" className="bg-white text-blue-600 border-none hover:bg-gray-100">
            View All Deals
          </Button>
        </div>
      </section>

      {/* App Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Title level={2} className="mb-12">
            Why Choose Our App?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="text-6xl mb-4">🏨</div>
                <Title level={4}>Best Price Guarantee</Title>
                <Text className="text-gray-600">
                  We'll match any lower price you find elsewhere
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="text-6xl mb-4">📱</div>
                <Title level={4}>Easy Mobile Booking</Title>
                <Text className="text-gray-600">
                  Book instantly with our user-friendly mobile app
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="text-6xl mb-4">🌟</div>
                <Title level={4}>24/7 Support</Title>
                <Text className="text-gray-600">
                  Get help anytime with our round-the-clock customer service
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
}
