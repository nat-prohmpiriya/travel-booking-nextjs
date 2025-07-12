'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, Alert, Spin, Space } from 'antd';
import { EnvironmentOutlined, CompassOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom hotel marker icon
const hotelIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff4757" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface Hotel {
  coordinates?: GeoPoint;
  name: string;
  address: string;
}

interface HotelMapProps {
  hotel: Hotel;
  height?: string;
  className?: string;
}

export const HotelMap: React.FC<HotelMapProps> = ({ 
  hotel, 
  height = '400px',
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMapReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Check if coordinates are available
  if (!hotel.coordinates) {
    return (
      <Card className={`w-full ${className}`}>
        <Alert
          message="ตำแหน่งไม่พร้อมใช้งาน"
          description="ขออภัย ข้อมูลตำแหน่งของโรงแรมนี้ยังไม่พร้อมใช้งาน"
          type="warning"
          showIcon
          icon={<EnvironmentOutlined />}
        />
      </Card>
    );
  }

  const { latitude, longitude } = hotel.coordinates;

  // Validate coordinates
  if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return (
      <Card className={`w-full ${className}`}>
        <Alert
          message="ข้อมูลตำแหน่งไม่ถูกต้อง"
          description="ข้อมูลพิกัดของโรงแรมไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่"
          type="error"
          showIcon
          icon={<EnvironmentOutlined />}
        />
      </Card>
    );
  }

  const handleOpenGoogleMaps = (): void => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const handleGetDirections = (): void => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <div className="flex justify-center items-center" style={{ height }}>
          <Spin size="large" tip="กำลังโหลดแผนที่..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          showIcon
          icon={<EnvironmentOutlined />}
        />
      </Card>
    );
  }

  return (
    <Card 
      className={`w-full ${className}`}
      title={
        <div className="flex items-center gap-2">
          <EnvironmentOutlined />
          <span>ตำแหน่งโรงแรม</span>
        </div>
      }
      extra={
        <Space size="small" className="hidden sm:flex">
          <Button 
            type="default" 
            icon={<EnvironmentOutlined />}
            onClick={handleOpenGoogleMaps}
            size="small"
          >
            เปิด Google Maps
          </Button>
          <Button 
            type="primary" 
            icon={<CompassOutlined />}
            onClick={handleGetDirections}
            size="small"
          >
            เส้นทาง
          </Button>
        </Space>
      }
    >
      <div className="space-y-4">
        {/* Map Container */}
        <div 
          className="w-full rounded-lg overflow-hidden border border-gray-200"
          style={{ height }}
        >
          {mapReady && (
            <MapContainer
              center={[latitude, longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              attributionControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]} icon={hotelIcon}>
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-1">{hotel.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{hotel.address}</p>
                    <Space direction="vertical" size="small" className="w-full">
                      <Button 
                        type="link" 
                        icon={<EnvironmentOutlined />}
                        onClick={handleOpenGoogleMaps}
                        size="small"
                        className="p-0"
                      >
                        เปิด Google Maps
                      </Button>
                      <Button 
                        type="link" 
                        icon={<CompassOutlined />}
                        onClick={handleGetDirections}
                        size="small"
                        className="p-0"
                      >
                        เส้นทาง
                      </Button>
                    </Space>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex sm:hidden gap-2">
          <Button 
            type="default" 
            icon={<EnvironmentOutlined />}
            onClick={handleOpenGoogleMaps}
            block
          >
            เปิด Google Maps
          </Button>
          <Button 
            type="primary" 
            icon={<CompassOutlined />}
            onClick={handleGetDirections}
            block
          >
            เส้นทาง
          </Button>
        </div>

        {/* Address Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">ที่อยู่:</p>
          <p className="font-medium">{hotel.address}</p>
          <p className="text-xs text-gray-500 mt-1">
            พิกัด: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </Card>
  );
};