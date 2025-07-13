'use client';

import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Typography, Button, Row, Col } from 'antd';
import { HeartFilled, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Paragraph } = Typography;

interface FavoriteHotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  imageUrl: string;
}

const FavoritesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteHotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Mock fetch favorites
    const fetchFavorites = async (): Promise<void> => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock empty favorites for now
        setFavorites([]);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, router]);

  const handleGoHome = (): void => {
    router.push('/');
  };

  if (!user) {
    return null; // Will redirect to signin
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Title level={2} className="mb-2 flex items-center">
            <HeartFilled className="text-red-500 mr-2" />
            My Favorites
          </Title>
          <Paragraph className="text-gray-600">
            Save your favorite hotels and find them easily here.
          </Paragraph>
        </div>

        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} className="text-gray-400 mb-2">
                    No favorites yet
                  </Title>
                  <Paragraph className="text-gray-500 mb-4">
                    Start exploring and save your favorite hotels to see them here.
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={handleGoHome}
                  >
                    Browse Hotels
                  </Button>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {favorites.map((hotel: FavoriteHotel) => (
              <Col key={hotel.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={hotel.name}
                      src={hotel.imageUrl}
                      className="h-48 object-cover"
                    />
                  }
                  onClick={() => router.push(`/hotel/${hotel.id}`)}
                >
                  <Card.Meta
                    title={hotel.name}
                    description={`${hotel.location} • ฿${hotel.price.toLocaleString()}`}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;