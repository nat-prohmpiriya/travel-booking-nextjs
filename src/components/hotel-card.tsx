import React from 'react';
import { Card, Button, Typography, Rate } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Hotel } from '@/types';

const { Text } = Typography;

interface Props {
    hotel: Hotel;
    onBookClick?: () => void;
}

export const HotelCard: React.FC<Props> = ({ hotel, onBookClick }) => {
    return (
        <Card
            hoverable
            cover={
                <div className="relative h-64 overflow-hidden">
                    <Image
                        src={hotel.images[0]}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                    />
                </div>
            }
            actions={[
                <Button
                    type="primary"
                    key="book"
                    onClick={onBookClick}
                    className="mx-4"
                >
                    Book Now
                </Button>
            ]}
            className="h-full"
        >
            <Card.Meta
                title={
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{hotel.name}</h3>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-gray-600">
                                <EnvironmentOutlined className="mr-1" />
                                <Text>{hotel.location}</Text>
                            </div>
                            <div className="flex items-center">
                                <Rate disabled defaultValue={hotel.rating} allowHalf className="text-sm" />
                                <Text className="ml-2 text-yellow-600 font-semibold">
                                    {hotel.rating}
                                </Text>
                            </div>
                        </div>
                    </div>
                }
                description={
                    <div>
                        <div className="mb-3">
                            <Text className="text-gray-600">{hotel.description}</Text>
                        </div>
                        <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                                    >
                                        {amenity}
                                    </span>
                                ))}
                                {hotel.amenities.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                                        +{hotel.amenities.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <Text className="text-2xl font-bold text-blue-600">
                                ฿{hotel.pricePerNight.toLocaleString()}
                            </Text>
                            <Text className="text-gray-500 ml-1">/night</Text>
                        </div>
                    </div>
                }
            />
        </Card>
    );
};
