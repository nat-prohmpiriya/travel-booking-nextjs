'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Alert, Breadcrumb } from 'antd';
import { HomeOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentForm } from '@/components/payment-form';
import { PaymentProcessing, PaymentError } from '@/components/payment-status';
import { createPaymentIntent, PaymentIntentData } from '@/lib/stripe';
import Link from 'next/link';

const { Title } = Typography;

interface BookingPaymentData {
  bookingId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  amount: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [bookingData, setBookingData] = useState<BookingPaymentData | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?redirect=/booking/payment');
      return;
    }

    const initializePayment = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // Get booking data from URL params
        const bookingDataParam = searchParams.get('data');
        if (!bookingDataParam) {
          throw new Error('No booking data provided');
        }

        const decodedData: BookingPaymentData = JSON.parse(
          decodeURIComponent(bookingDataParam)
        );

        // Validate booking data
        console.log('Payment data received:', decodedData);
        if (!decodedData.bookingId || !decodedData.amount) {
          throw new Error('Invalid booking data: missing bookingId or amount');
        }
        
        // Set default email if not provided
        if (!decodedData.guestEmail && user?.email) {
          decodedData.guestEmail = user.email;
        }
        
        if (!decodedData.guestEmail) {
          throw new Error('Invalid booking data: missing guest email');
        }

        setBookingData(decodedData);

        // Create payment intent
        const paymentData: PaymentIntentData = {
          amount: decodedData.amount,
          currency: 'thb',
          bookingId: decodedData.bookingId,
          hotelName: decodedData.hotelName,
          guestName: decodedData.guestName,
          guestEmail: decodedData.guestEmail,
          checkIn: decodedData.checkIn,
          checkOut: decodedData.checkOut,
          rooms: decodedData.rooms,
          guests: decodedData.guests,
        };

        const response = await createPaymentIntent(paymentData);
        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId);

      } catch (err: any) {
        console.error('Payment initialization error:', err);
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [user, searchParams, router]);

  const handlePaymentSuccess = (paymentIntentId: string): void => {
    router.push(`/booking/confirmation/${bookingData?.bookingId}`);
  };

  const handlePaymentError = (error: string): void => {
    setError(error);
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <PaymentProcessing message="กำลังเตรียมระบบชำระเงิน..." />
        </div>
      </div>
    );
  }

  if (error || !bookingData || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <PaymentError
            error={error || 'ไม่สามารถโหลดข้อมูลการชำระเงินได้'}
            bookingId={bookingData?.bookingId}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href="/">
                    <HomeOutlined /> หน้าหลัก
                  </Link>
                )
              },
              {
                title: <Link href="/booking">จองห้องพัก</Link>
              },
              {
                title: (
                  <span>
                    <CreditCardOutlined /> ชำระเงิน
                  </span>
                )
              }
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <Title level={2}>ชำระเงิน</Title>
        </div>

        {/* Security Notice */}
        <div className="mb-6">
          <Alert
            message="ข้อมูลการชำระเงินของคุณปลอดภัย"
            description="เราใช้การเข้ารหัส SSL และ Stripe เพื่อป้องกันข้อมูลการชำระเงินของคุณ ข้อมูลบัตรเครดิตจะไม่ถูกเก็บไว้ในระบบของเรา"
            type="info"
            showIcon
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Payment Form */}
        <PaymentForm
          clientSecret={clientSecret}
          bookingData={bookingData}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        {/* Support Info */}
        <Card size="small" className="max-w-2xl mx-auto mt-6 text-center">
          <div className="text-gray-600">
            <div className="mb-2">หากคุณมีปัญหาในการชำระเงิน</div>
            <div>
              โทร: <a href="tel:+66-2-123-4567" className="text-blue-600">02-123-4567</a>
              {' | '}
              อีเมล: <a href="mailto:support@hotel-booking.com" className="text-blue-600">support@hotel-booking.com</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}