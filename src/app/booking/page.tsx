"use client";

import React, { useEffect, useState } from 'react';
import { 
    Row, 
    Col, 
    Card, 
    Typography, 
    Button, 
    Form, 
    Input, 
    Select, 
    Divider, 
    Steps,
    Radio,
    Checkbox,
    message,
    Spin,
    Alert,
    DatePicker,
    Breadcrumb
} from 'antd';
import { 
    UserOutlined,
    CreditCardOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    HomeOutlined,
    CalendarOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, CreateBookingData } from '@/services/bookingService';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

interface BookingData {
    hotelId: string;
    hotelName: string;
    room: {
        id: string;
        name: string;
        price: number;
        bedType: string;
        maxGuests: number;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    totalPrice: number;
}

interface GuestInfo {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    specialRequests?: string;
}

interface PaymentInfo {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
    billingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
}

export default function BookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [guestForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [agreeTnC, setAgreeTnC] = useState<boolean>(false);

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(dataParam));
                setBookingData(decodedData);
            } catch (error) {
                message.error('Invalid booking data');
                router.push('/');
            }
        } else {
            router.push('/');
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (user && bookingData) {
            guestForm.setFieldsValue({
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                email: user.email || ''
            });
        }
    }, [user, bookingData, guestForm]);

    const handleGuestInfoSubmit = (values: GuestInfo) => {
        setCurrentStep(1);
    };

    const handlePaymentSubmit = async (values: PaymentInfo) => {
        if (!agreeTnC || !user || !bookingData) {
            message.error('Please agree to terms and conditions');
            return;
        }

        setLoading(true);
        try {
            // Get guest info from the first form
            const guestFormValues = guestForm.getFieldsValue();
            
            const nights = dayjs(bookingData.checkOut).diff(dayjs(bookingData.checkIn), 'day');
            const subtotal = bookingData.room.price * bookingData.rooms * nights;
            const taxes = subtotal * 0.1;
            const serviceFee = 100;
            const total = subtotal + taxes + serviceFee;

            // Create booking data (without payment processing)
            const createBookingData: CreateBookingData = {
                userId: user.uid,
                hotelId: bookingData.hotelId,
                hotelName: bookingData.hotelName,
                hotelLocation: bookingData.hotelName, // TODO: Get actual location
                hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
                roomId: bookingData.room.id,
                roomName: bookingData.room.name,
                checkIn: new Date(bookingData.checkIn),
                checkOut: new Date(bookingData.checkOut),
                guests: bookingData.guests,
                rooms: bookingData.rooms,
                guestInfo: {
                    title: guestFormValues.title,
                    firstName: guestFormValues.firstName,
                    lastName: guestFormValues.lastName,
                    email: guestFormValues.email,
                    phone: guestFormValues.phone,
                    country: guestFormValues.country,
                    specialRequests: guestFormValues.specialRequests
                },
                pricing: {
                    roomRate: subtotal,
                    taxes: taxes,
                    serviceFee: serviceFee,
                    total: total,
                    currency: 'THB'
                }
            };

            // Create booking in Firebase with pending payment status
            const booking = await bookingService.createBooking(createBookingData);
            
            // Prepare payment data
            const paymentData = {
                bookingId: booking.id,
                hotelName: bookingData.hotelName,
                guestName: `${guestFormValues.firstName} ${guestFormValues.lastName}`,
                guestEmail: guestFormValues.email,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                rooms: bookingData.rooms,
                guests: bookingData.guests,
                amount: total
            };
            
            // Redirect to payment page
            router.push(`/booking/payment?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
        } catch (error) {
            console.error('Booking error:', error);
            message.error('Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!bookingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    const nights = dayjs(bookingData.checkOut).diff(dayjs(bookingData.checkIn), 'day');
    const subtotal = bookingData.room.price * bookingData.rooms * nights;
    const taxes = subtotal * 0.1; // 10% tax
    const serviceFee = 100;
    const total = subtotal + taxes + serviceFee;

    const steps = [
        {
            title: 'Guest Details',
            icon: <UserOutlined />
        },
        {
            title: 'Payment',
            icon: <CreditCardOutlined />
        },
        {
            title: 'Confirmation',
            icon: <CheckCircleOutlined />
        }
    ];

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
                                        <HomeOutlined /> Home
                                    </Link>
                                )
                            },
                            {
                                title: <Link href="/search">Search Results</Link>
                            },
                            {
                                title: (
                                    <Link href={`/hotel/${bookingData.hotelId}`}>
                                        {bookingData.hotelName}
                                    </Link>
                                )
                            },
                            {
                                title: 'Booking'
                            }
                        ]}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Steps */}
                <Card className="mb-6">
                    <Steps current={currentStep} items={steps} />
                </Card>

                <Row gutter={24}>
                    {/* Main Content */}
                    <Col xs={24} lg={16}>
                        {currentStep === 0 && (
                            <Card title="Guest Information">
                                <Alert
                                    message="Please provide accurate information as it will be used for your hotel check-in."
                                    type="info"
                                    className="mb-6"
                                />

                                <Form
                                    form={guestForm}
                                    layout="vertical"
                                    onFinish={handleGuestInfoSubmit}
                                    requiredMark={false}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={6}>
                                            <Form.Item
                                                name="title"
                                                label="Title"
                                                rules={[{ required: true, message: 'Please select title' }]}
                                            >
                                                <Select placeholder="Select">
                                                    <Option value="Mr">Mr.</Option>
                                                    <Option value="Mrs">Mrs.</Option>
                                                    <Option value="Ms">Ms.</Option>
                                                    <Option value="Dr">Dr.</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={9}>
                                            <Form.Item
                                                name="firstName"
                                                label="First Name"
                                                rules={[{ required: true, message: 'Please enter first name' }]}
                                            >
                                                <Input placeholder="Enter first name" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={9}>
                                            <Form.Item
                                                name="lastName"
                                                label="Last Name"
                                                rules={[{ required: true, message: 'Please enter last name' }]}
                                            >
                                                <Input placeholder="Enter last name" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email Address"
                                                rules={[
                                                    { required: true, message: 'Please enter email' },
                                                    { type: 'email', message: 'Please enter valid email' }
                                                ]}
                                            >
                                                <Input placeholder="Enter email address" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="phone"
                                                label="Phone Number"
                                                rules={[{ required: true, message: 'Please enter phone number' }]}
                                            >
                                                <Input placeholder="Enter phone number" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="country"
                                        label="Country/Region"
                                        rules={[{ required: true, message: 'Please select country' }]}
                                    >
                                        <Select placeholder="Select country" showSearch>
                                            <Option value="TH">Thailand</Option>
                                            <Option value="US">United States</Option>
                                            <Option value="GB">United Kingdom</Option>
                                            <Option value="JP">Japan</Option>
                                            <Option value="SG">Singapore</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="specialRequests"
                                        label="Special Requests (Optional)"
                                    >
                                        <TextArea 
                                            rows={3} 
                                            placeholder="Any special requests or preferences (e.g., early check-in, room location, dietary requirements)"
                                        />
                                    </Form.Item>

                                    <div className="flex justify-end">
                                        <Button type="primary" htmlType="submit" size="large">
                                            Continue to Payment
                                        </Button>
                                    </div>
                                </Form>
                            </Card>
                        )}

                        {currentStep === 1 && (
                            <Card title="Payment Information">
                                <Alert
                                    message="Your payment information is secure and encrypted."
                                    type="success"
                                    icon={<SafetyCertificateOutlined />}
                                    className="mb-6"
                                />

                                <Form
                                    form={paymentForm}
                                    layout="vertical"
                                    onFinish={handlePaymentSubmit}
                                    requiredMark={false}
                                >
                                    <Title level={5}>Payment Method</Title>
                                    <Form.Item name="paymentMethod" initialValue="card">
                                        <Radio.Group>
                                            <Radio value="card">Credit/Debit Card</Radio>
                                            <Radio value="paypal" disabled>PayPal (Coming Soon)</Radio>
                                            <Radio value="bank" disabled>Bank Transfer (Coming Soon)</Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    <Divider />

                                    <Title level={5}>Card Information</Title>
                                    <Form.Item
                                        name="cardNumber"
                                        label="Card Number"
                                        rules={[{ required: true, message: 'Please enter card number' }]}
                                    >
                                        <Input 
                                            placeholder="1234 5678 9012 3456" 
                                            prefix={<CreditCardOutlined />}
                                        />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="expiryDate"
                                                label="Expiry Date"
                                                rules={[{ required: true, message: 'Please enter expiry date' }]}
                                            >
                                                <Input placeholder="MM/YY" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="cvv"
                                                label="CVV"
                                                rules={[{ required: true, message: 'Please enter CVV' }]}
                                            >
                                                <Input placeholder="123" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="cardHolderName"
                                        label="Cardholder Name"
                                        rules={[{ required: true, message: 'Please enter cardholder name' }]}
                                    >
                                        <Input placeholder="Name as printed on card" />
                                    </Form.Item>

                                    <Divider />

                                    <Title level={5}>Billing Address</Title>
                                    <Form.Item
                                        name={['billingAddress', 'address']}
                                        label="Address"
                                        rules={[{ required: true, message: 'Please enter address' }]}
                                    >
                                        <Input placeholder="Street address" />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name={['billingAddress', 'city']}
                                                label="City"
                                                rules={[{ required: true, message: 'Please enter city' }]}
                                            >
                                                <Input placeholder="City" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name={['billingAddress', 'postalCode']}
                                                label="Postal Code"
                                                rules={[{ required: true, message: 'Please enter postal code' }]}
                                            >
                                                <Input placeholder="Postal code" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name={['billingAddress', 'country']}
                                        label="Country"
                                        rules={[{ required: true, message: 'Please select country' }]}
                                    >
                                        <Select placeholder="Select country" showSearch>
                                            <Option value="TH">Thailand</Option>
                                            <Option value="US">United States</Option>
                                            <Option value="GB">United Kingdom</Option>
                                            <Option value="JP">Japan</Option>
                                            <Option value="SG">Singapore</Option>
                                        </Select>
                                    </Form.Item>

                                    <Divider />

                                    <Form.Item>
                                        <Checkbox 
                                            checked={agreeTnC}
                                            onChange={(e) => setAgreeTnC(e.target.checked)}
                                        >
                                            I agree to the{' '}
                                            <Link href="/terms" target="_blank">Terms and Conditions</Link>
                                            {' '}and{' '}
                                            <Link href="/privacy" target="_blank">Privacy Policy</Link>
                                        </Checkbox>
                                    </Form.Item>

                                    <div className="flex justify-between">
                                        <Button 
                                            size="large" 
                                            onClick={() => setCurrentStep(0)}
                                        >
                                            Back to Guest Info
                                        </Button>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            size="large"
                                            loading={loading}
                                            disabled={!agreeTnC}
                                        >
                                            Complete Booking
                                        </Button>
                                    </div>
                                </Form>
                            </Card>
                        )}
                    </Col>

                    {/* Booking Summary */}
                    <Col xs={24} lg={8}>
                        <Card title="Booking Summary" className="sticky top-4">
                            <div className="space-y-4">
                                <div>
                                    <Title level={4} className="!mb-1">{bookingData.hotelName}</Title>
                                    <Text className="text-gray-600">{bookingData.room.name}</Text>
                                </div>

                                <Divider />

                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <CalendarOutlined className="mr-2 text-gray-500" />
                                        <Text>
                                            {dayjs(bookingData.checkIn).format('DD MMM YYYY')} - 
                                            {dayjs(bookingData.checkOut).format(' DD MMM YYYY')}
                                        </Text>
                                    </div>
                                    <Text className="text-gray-600">
                                        {nights} {nights === 1 ? 'night' : 'nights'}
                                    </Text>
                                </div>

                                <div className="flex items-center">
                                    <UserOutlined className="mr-2 text-gray-500" />
                                    <Text>
                                        {bookingData.guests} {bookingData.guests === 1 ? 'guest' : 'guests'}, 
                                        {bookingData.rooms} {bookingData.rooms === 1 ? 'room' : 'rooms'}
                                    </Text>
                                </div>

                                <Divider />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Text>Room rate ({nights} nights)</Text>
                                        <Text>฿{subtotal.toLocaleString()}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Taxes & fees</Text>
                                        <Text>฿{taxes.toLocaleString()}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Service fee</Text>
                                        <Text>฿{serviceFee.toLocaleString()}</Text>
                                    </div>
                                </div>

                                <Divider />

                                <div className="flex justify-between items-center">
                                    <Title level={4} className="!mb-0">Total</Title>
                                    <Title level={4} className="!mb-0 text-blue-600">
                                        ฿{total.toLocaleString()}
                                    </Title>
                                </div>

                                <Alert
                                    message="Free cancellation until 24 hours before check-in"
                                    type="success"
                                    showIcon
                                    className="mt-4"
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}