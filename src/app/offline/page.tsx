'use client';

import React from 'react';
import { Result, Button, Card, Typography, Space } from 'antd';
import { DisconnectOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface OfflinePageProps {}

const OfflinePage: React.FC<OfflinePageProps> = () => {
  const handleRetry = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleCheckConnection = (): void => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
        return registration.sync.register('connectivity-check');
      }).catch((error: Error) => {
        console.error('Background sync registration failed:', error);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center shadow-lg">
          <Result
            icon={
              <div className="text-6xl text-gray-400 mb-4">
                <DisconnectOutlined style={{ fontSize: '64px' }} />
              </div>
            }
            title={
              <Title level={2} className="text-gray-700">
                You're Offline
              </Title>
            }
            subTitle={
              <div className="space-y-4">
                <Paragraph className="text-gray-600">
                  It looks like you're not connected to the internet. 
                  Don't worry, you can still browse some cached content.
                </Paragraph>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Title level={4} className="text-blue-700 mb-2">
                    What you can do:
                  </Title>
                  <ul className="text-left text-blue-600 space-y-1">
                    <li>• View your saved bookings</li>
                    <li>• Browse cached hotel information</li>
                    <li>• Plan your next trip offline</li>
                  </ul>
                </div>
              </div>
            }
            extra={
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ReloadOutlined />}
                  onClick={handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>
                
                <Button 
                  size="large" 
                  icon={<HomeOutlined />}
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Go to Homepage
                </Button>
                
                <Button 
                  type="link" 
                  onClick={handleCheckConnection}
                  className="text-sm"
                >
                  Check Connection in Background
                </Button>
              </Space>
            }
          />
        </Card>
        
        <div className="mt-6 text-center">
          <Paragraph className="text-gray-500 text-sm">
            We'll automatically sync your data once you're back online.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;