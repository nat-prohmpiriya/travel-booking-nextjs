import React from 'react';
import { Card, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Destination } from '@/types';

const { Text } = Typography;

interface Props {
    destination: Destination;
    onClick?: () => void;
}

export const DestinationCard: React.FC<Props> = ({ destination, onClick }) => {
    return (
        <Card
            hoverable
            onClick={onClick}
            cover={
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={destination.image}
                        alt={destination.name}
                        fill
                        className="object-cover transition-transform hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                        <div className="flex items-center text-sm">
                            <EnvironmentOutlined className="mr-1" />
                            <Text className="text-white">
                                {destination.hotelCount} properties
                            </Text>
                        </div>
                    </div>
                </div>
            }
            className="border-0 shadow-lg"
            styles={{ body: { padding: '16px' } }}
        >
            <div className="text-center">
                <Text className="text-lg font-semibold text-blue-600">
                    From ฿{destination.startingPrice.toLocaleString()}/night
                </Text>
            </div>
        </Card>
    );
};
