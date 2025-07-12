'use client';

import React from 'react';
import { Card, Result, Button, Typography, Space, Descriptions } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/stripe';

const { Text } = Typography;

interface BookingDetails {
  bookingId: string;
  hotelName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  amount: number;
  paymentMethod?: string;
}

interface PaymentSuccessProps {
  bookingDetails: BookingDetails;
  paymentIntentId?: string;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  bookingDetails,
  paymentIntentId,
}) => {
  const router = useRouter();

  const handleViewBooking = (): void => {
    router.push(`/booking/confirmation/${bookingDetails.bookingId}`);
  };

  const handleBackToHome = (): void => {
    router.push('/');
  };

  const handleViewBookings = (): void => {
    router.push('/bookings');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <Result
        status="success"
        icon={<CheckCircleOutlined className="text-green-500" />}
        title="ชำระเงินสำเร็จ!"
        subTitle="การจองของคุณได้รับการยืนยันแล้ว เราได้ส่งอีเมลยืนยันไปที่อีเมลของคุณแล้ว"
        extra={
          <Space direction="vertical" size="large" className="w-full">
            {/* Booking Summary */}
            <Card size="small" className="text-left bg-green-50 border-green-200">
              <Descriptions
                title="รายละเอียดการจอง"
                column={1}
                size="small"
                labelStyle={{ fontWeight: 'bold', width: '150px' }}
              >
                <Descriptions.Item label="หมายเลขการจอง">
                  <Text className="font-mono text-blue-600">{bookingDetails.bookingId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="โรงแรม">
                  {bookingDetails.hotelName}
                </Descriptions.Item>
                <Descriptions.Item label="ชื่อผู้เข้าพัก">
                  {bookingDetails.guestName}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่เข้าพัก">
                  {bookingDetails.checkIn}
                </Descriptions.Item>
                <Descriptions.Item label="วันที่ออก">
                  {bookingDetails.checkOut}
                </Descriptions.Item>
                <Descriptions.Item label="จำนวนห้อง">
                  {bookingDetails.rooms} ห้อง
                </Descriptions.Item>
                <Descriptions.Item label="จำนวนผู้เข้าพัก">
                  {bookingDetails.guests} คน
                </Descriptions.Item>
                <Descriptions.Item label="ยอดชำระ">
                  <Text className="text-lg font-bold text-green-600">
                    {formatCurrency(bookingDetails.amount)}
                  </Text>
                </Descriptions.Item>
                {bookingDetails.paymentMethod && (
                  <Descriptions.Item label="วิธีการชำระ">
                    <Space>
                      <CreditCardOutlined />
                      {bookingDetails.paymentMethod}
                    </Space>
                  </Descriptions.Item>
                )}
                {paymentIntentId && (
                  <Descriptions.Item label="หมายเลขธุรกรรม">
                    <Text className="font-mono text-gray-600">{paymentIntentId}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Action Buttons */}
            <Space size="middle" wrap>
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                onClick={handleViewBooking}
              >
                ดูรายละเอียดการจอง
              </Button>
              <Button
                size="large"
                icon={<UserOutlined />}
                onClick={handleViewBookings}
              >
                ดูการจองทั้งหมด
              </Button>
              <Button
                size="large"
                icon={<HomeOutlined />}
                onClick={handleBackToHome}
              >
                กลับหน้าหลัก
              </Button>
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

interface PaymentErrorProps {
  error: string;
  bookingId?: string;
  onRetry?: () => void;
}

export const PaymentError: React.FC<PaymentErrorProps> = ({
  error,
  bookingId,
  onRetry,
}) => {
  const router = useRouter();

  const handleRetry = (): void => {
    if (onRetry) {
      onRetry();
    } else if (bookingId) {
      router.push(`/booking?retry=${bookingId}`);
    }
  };

  const handleBackToHome = (): void => {
    router.push('/');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Result
        status="error"
        icon={<CloseCircleOutlined className="text-red-500" />}
        title="การชำระเงินไม่สำเร็จ"
        subTitle={error || 'เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง'}
        extra={
          <Space size="middle">
            {(onRetry || bookingId) && (
              <Button
                type="primary"
                size="large"
                onClick={handleRetry}
                icon={<CreditCardOutlined />}
              >
                ลองชำระใหม่
              </Button>
            )}
            <Button
              size="large"
              onClick={handleBackToHome}
              icon={<HomeOutlined />}
            >
              กลับหน้าหลัก
            </Button>
          </Space>
        }
      />
    </Card>
  );
};

interface PaymentProcessingProps {
  message?: string;
}

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  message = 'กำลังดำเนินการชำระเงิน...',
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Result
        status="info"
        icon={<LoadingOutlined className="text-blue-500" />}
        title="กำลังดำเนินการ"
        subTitle={message}
        extra={
          <div className="text-center text-gray-500">
            <Text>กรุณารอสักครู่ อย่าปิดหน้าเว็บนี้</Text>
          </div>
        }
      />
    </Card>
  );
};