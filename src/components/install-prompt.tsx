'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography, Modal } from 'antd';
import { DownloadOutlined, CloseOutlined, MobileOutlined, DesktopOutlined } from '@ant-design/icons';
import { usePWA } from '@/hooks/use-pwa';

const { Text, Title } = Typography;

interface InstallPromptProps {
  showInModal?: boolean;
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  showInModal = false,
  onInstall,
  onDismiss,
}) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [dismissedPermanently, setDismissedPermanently] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has dismissed the prompt permanently
    const dismissed: string | null = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setDismissedPermanently(true);
      return;
    }

    // Show prompt if installable and not already installed
    if (isInstallable && !isInstalled && !dismissedPermanently) {
      // Delay showing the prompt to not be intrusive
      const timer: NodeJS.Timeout = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissedPermanently]);

  const handleInstall = async (): Promise<void> => {
    setIsInstalling(true);
    
    try {
      await installApp();
      setShowPrompt(false);
      onInstall?.();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = (): void => {
    setShowPrompt(false);
    onDismiss?.();
  };

  const handleDismissPermanently = (): void => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDismissedPermanently(true);
    setShowPrompt(false);
    onDismiss?.();
  };

  const getDeviceIcon = (): React.ReactNode => {
    if (typeof window === 'undefined') return <MobileOutlined style={{ fontSize: '24px' }} />;
    
    const isMobile: boolean = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    return isMobile ? 
      <MobileOutlined style={{ fontSize: '24px' }} /> : 
      <DesktopOutlined style={{ fontSize: '24px' }} />;
  };

  const getInstallInstructions = (): string => {
    if (typeof window === 'undefined') return '';
    
    const isIOS: boolean = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid: boolean = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      return 'Tap the Share button and select "Add to Home Screen"';
    } else if (isAndroid) {
      return 'Tap the menu and select "Add to Home Screen"';
    } else {
      return 'Click the install button in your browser\'s address bar';
    }
  };

  // Don't show if not installable, already installed, or dismissed permanently
  if (!isInstallable || isInstalled || dismissedPermanently || !showPrompt) {
    return null;
  }

  const promptContent = (
    <div className="text-center">
      <div className="flex justify-center mb-4 text-blue-500">
        {getDeviceIcon()}
      </div>
      
      <Title level={4} className="mb-2">
        Install Travel Booking App
      </Title>
      
      <Text className="text-gray-600 block mb-4">
        Get the full app experience with offline access, push notifications, and faster loading.
      </Text>
      
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <Text strong className="block mb-2">Benefits:</Text>
        <ul className="text-sm text-gray-600 text-left">
          <li>• Works offline</li>
          <li>• Faster loading</li>
          <li>• Push notifications</li>
          <li>• No app store needed</li>
        </ul>
      </div>
      
      <Space direction="vertical" size="middle" className="w-full">
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          onClick={handleInstall}
          loading={isInstalling}
          className="w-full"
        >
          {isInstalling ? 'Installing...' : 'Install App'}
        </Button>
        
        <Space size="small">
          <Button size="small" onClick={handleDismiss}>
            Not Now
          </Button>
          <Button size="small" type="text" onClick={handleDismissPermanently}>
            Don't Ask Again
          </Button>
        </Space>
      </Space>
      
      <div className="mt-3 pt-3 border-t">
        <Text className="text-xs text-gray-500">
          {getInstallInstructions()}
        </Text>
      </div>
    </div>
  );

  if (showInModal) {
    return (
      <Modal
        open={showPrompt}
        onCancel={handleDismiss}
        footer={null}
        centered
        closable={false}
        width={400}
      >
        {promptContent}
      </Modal>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-0">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {promptContent}
          </div>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2"
          />
        </div>
      </Card>
    </div>
  );
};

// Hook for showing install prompt programmatically
export const useInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [showModal, setShowModal] = useState<boolean>(false);

  const showInstallPrompt = (): void => {
    if (isInstallable) {
      setShowModal(true);
    }
  };

  const hideInstallPrompt = (): void => {
    setShowModal(false);
  };

  return {
    showInstallPrompt,
    hideInstallPrompt,
    isInstallable,
    InstallModal: () => (
      <InstallPrompt
        showInModal={true}
        onInstall={hideInstallPrompt}
        onDismiss={hideInstallPrompt}
      />
    ),
  };
};

// Standalone install button component
interface InstallButtonProps {
  size?: 'small' | 'middle' | 'large';
  type?: 'primary' | 'default' | 'text' | 'link';
  block?: boolean;
  className?: string;
}

export const InstallButton: React.FC<InstallButtonProps> = ({
  size = 'middle',
  type = 'primary',
  block = false,
  className = '',
}) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const handleInstall = async (): Promise<void> => {
    setIsInstalling(true);
    
    try {
      await installApp();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Don't show if not installable or already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <Button
      type={type}
      size={size}
      block={block}
      icon={<DownloadOutlined />}
      onClick={handleInstall}
      loading={isInstalling}
      className={className}
    >
      {isInstalling ? 'Installing...' : 'Install App'}
    </Button>
  );
};