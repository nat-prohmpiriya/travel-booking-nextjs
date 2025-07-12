'use client';

import React from 'react';
import { Spin, Result, Button, Card, Skeleton } from 'antd';
import { 
  LoadingOutlined,
  LockOutlined,
  ExceptionOutlined,
  UserOutlined,
  HomeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface AuthLoadingProps {
  message?: string;
  size?: 'small' | 'default' | 'large';
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({
  message = 'กำลังตรวจสอบสิทธิ์การเข้าถึง...',
  size = 'large'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="text-center p-8 shadow-lg">
        <Spin 
          size={size}
          indicator={<LoadingOutlined className="text-4xl text-blue-500" />}
        />
        <div className="mt-4">
          <div className="text-lg font-medium text-gray-800 mb-2">
            กำลังโหลด...
          </div>
          <div className="text-gray-600">
            {message}
          </div>
        </div>
      </Card>
    </div>
  );
};

interface UnauthorizedProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
  showHomeButton?: boolean;
  onRetry?: () => void;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({
  title = 'ไม่มีสิทธิ์เข้าถึง',
  message = 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้',
  showLoginButton = true,
  showHomeButton = true,
  onRetry
}) => {
  const router = useRouter();

  const handleLogin = (): void => {
    router.push('/auth/signin');
  };

  const handleHome = (): void => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle={
          <div className="space-y-2">
            <div className="text-xl font-semibold text-gray-800">{title}</div>
            <div className="text-gray-600">{message}</div>
          </div>
        }
        icon={<LockOutlined className="text-gray-400" />}
        extra={
          <div className="space-x-3">
            {showLoginButton && (
              <Button 
                type="primary" 
                size="large"
                onClick={handleLogin}
                icon={<UserOutlined />}
              >
                เข้าสู่ระบบ
              </Button>
            )}
            {onRetry && (
              <Button 
                size="large"
                onClick={onRetry}
                icon={<ReloadOutlined />}
              >
                ลองใหม่
              </Button>
            )}
            {showHomeButton && (
              <Button 
                size="large"
                onClick={handleHome}
                icon={<HomeOutlined />}
              >
                กลับหน้าหลัก
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
};

interface ForbiddenProps {
  title?: string;
  message?: string;
  allowedRoles?: string[];
  userRole?: string;
  showHomeButton?: boolean;
}

export const Forbidden: React.FC<ForbiddenProps> = ({
  title = 'ไม่มีสิทธิ์เข้าถึง',
  message = 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
  allowedRoles,
  userRole,
  showHomeButton = true
}) => {
  const router = useRouter();

  const handleHome = (): void => {
    router.push('/');
  };

  const roleMessage = allowedRoles && userRole 
    ? `ต้องการสิทธิ์: ${allowedRoles.join(', ')} (คุณเป็น: ${userRole})`
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle={
          <div className="space-y-2">
            <div className="text-xl font-semibold text-gray-800">{title}</div>
            <div className="text-gray-600">{message}</div>
            {roleMessage && (
              <div className="text-sm text-gray-500 mt-2">{roleMessage}</div>
            )}
          </div>
        }
        icon={<LockOutlined className="text-red-400" />}
        extra={
          showHomeButton && (
            <Button 
              type="primary"
              size="large"
              onClick={handleHome}
              icon={<HomeOutlined />}
            >
              กลับหน้าหลัก
            </Button>
          )
        }
      />
    </div>
  );
};

interface AuthErrorProps {
  error: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const AuthError: React.FC<AuthErrorProps> = ({
  error,
  onRetry,
  onGoHome
}) => {
  const router = useRouter();

  const handleRetry = (): void => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleHome = (): void => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="error"
        title="เกิดข้อผิดพลาด"
        subTitle={
          <div className="space-y-2">
            <div className="text-gray-600">ไม่สามารถตรวจสอบสิทธิ์การเข้าถึงได้</div>
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded border">
              {error}
            </div>
          </div>
        }
        icon={<ExceptionOutlined className="text-red-400" />}
        extra={
          <div className="space-x-3">
            <Button 
              type="primary"
              size="large"
              onClick={handleRetry}
              icon={<ReloadOutlined />}
            >
              ลองใหม่
            </Button>
            <Button 
              size="large"
              onClick={handleHome}
              icon={<HomeOutlined />}
            >
              กลับหน้าหลัก
            </Button>
          </div>
        }
      />
    </div>
  );
};

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  title = 'กำลังโหลด',
  description = 'กรุณารอสักครู่...'
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <Spin size="large" />
            <div className="mt-4">
              <div className="text-lg font-medium text-gray-800 mb-2">
                {title}
              </div>
              <div className="text-gray-600">
                {description}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const SkeletonPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
          <div className="mt-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
          <div className="mt-6">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        </Card>
      </div>
    </div>
  );
};