'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Card, Button, Alert, Spin, Typography, Divider, Space } from 'antd';
import { CreditCardOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { getStripe, formatCurrency, PaymentIntentData } from '@/lib/stripe';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface PaymentFormProps {
  clientSecret: string;
  bookingData: PaymentIntentData;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  clientSecret,
  bookingData,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'An error occurred');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation/${bookingData.bookingId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        onError?.(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent.id);
        router.push(`/booking/confirmation/${bookingData.bookingId}`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      onError?.(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Title level={3} className="flex items-center justify-center gap-2">
          <CreditCardOutlined />
          ชำระเงิน
        </Title>
        <Text className="text-gray-600">
          กรุณากรอกข้อมูลการชำระเงินเพื่อยืนยันการจอง
        </Text>
      </div>

      {/* Booking Summary */}
      <Card size="small" className="mb-6 bg-gray-50">
        <Title level={5} className="mb-3">สรุปการจอง</Title>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Text>โรงแรม:</Text>
            <Text className="font-medium">{bookingData.hotelName}</Text>
          </div>
          <div className="flex justify-between">
            <Text>ผู้เข้าพัก:</Text>
            <Text className="font-medium">{bookingData.guestName}</Text>
          </div>
          <div className="flex justify-between">
            <Text>วันที่เข้าพัก:</Text>
            <Text className="font-medium">{bookingData.checkIn}</Text>
          </div>
          <div className="flex justify-between">
            <Text>วันที่ออก:</Text>
            <Text className="font-medium">{bookingData.checkOut}</Text>
          </div>
          <div className="flex justify-between">
            <Text>จำนวนห้อง:</Text>
            <Text className="font-medium">{bookingData.rooms} ห้อง</Text>
          </div>
          <div className="flex justify-between">
            <Text>จำนวนผู้เข้าพัก:</Text>
            <Text className="font-medium">{bookingData.guests} คน</Text>
          </div>
          <Divider className="my-3" />
          <div className="flex justify-between">
            <Text className="text-lg font-semibold">ยอดรวม:</Text>
            <Text className="text-lg font-bold text-blue-600">
              {formatCurrency(bookingData.amount)}
            </Text>
          </div>
        </div>
      </Card>

      {/* Payment Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Billing Address */}
          <div>
            <Title level={5} className="mb-3">ที่อยู่สำหรับออกใบเสร็จ</Title>
            <AddressElement 
              options={{
                mode: 'billing',
                defaultValues: {
                  name: bookingData.guestName,
                },
              }}
            />
          </div>

          {/* Payment Method */}
          <div>
            <Title level={5} className="mb-3">วิธีการชำระเงิน</Title>
            <PaymentElement 
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: bookingData.guestName,
                    email: bookingData.guestEmail,
                  },
                },
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert
              message="เกิดข้อผิดพลาด"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          {/* Security Info */}
          <Card size="small" className="bg-green-50 border-green-200">
            <Space className="w-full">
              <LockOutlined className="text-green-600" />
              <div>
                <Text className="text-green-800 font-medium block">
                  การชำระเงินของคุณปลอดภัย
                </Text>
                <Text className="text-green-600 text-sm">
                  ข้อมูลการชำระเงินของคุณได้รับการเข้ารหัสและปกป้องด้วย SSL
                </Text>
              </div>
            </Space>
          </Card>

          {/* Submit Button */}
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isLoading || isProcessing}
            disabled={!stripe || !elements}
            block
            className="h-12 text-lg font-medium"
            icon={!isLoading && !isProcessing ? <SafetyOutlined /> : undefined}
          >
            {isLoading || isProcessing ? 'กำลังดำเนินการ...' : `ชำระเงิน ${formatCurrency(bookingData.amount)}`}
          </Button>

          {/* Terms */}
          <div className="text-center text-sm text-gray-500">
            การคลิก "ชำระเงิน" ถือว่าคุณยอมรับ{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              ข้อกำหนดและเงื่อนไข
            </a>{' '}
            และ{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              นโยบายความเป็นส่วนตัว
            </a>
          </div>
        </div>
      </form>
    </Card>
  );
};

interface PaymentFormWrapperProps {
  clientSecret: string;
  bookingData: PaymentIntentData;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormWrapperProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    setStripePromise(getStripe());
  }, []);

  if (!stripePromise) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
          <div className="ml-3">กำลังโหลดระบบชำระเงิน...</div>
        </div>
      </Card>
    );
  }

  const options = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#1890ff',
        colorBackground: '#ffffff',
        colorText: '#424770',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};