"use client";

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    Avatar,
    Modal,
    message,
    Dropdown,
    Typography,
    Row,
    Col,
    Card,
    Statistic,
    Select,
    DatePicker,
    Form,
    Divider
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    EyeOutlined,
    MoreOutlined,
    BookOutlined,
    UserOutlined,
    DollarOutlined,
    CalendarOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface BookingTableData extends Booking {
    key: string;
}

export default function BookingsManagement() {
    const [bookings, setBookings] = useState<BookingTableData[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<BookingTableData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<any>(null);
    const [selectedBooking, setSelectedBooking] = useState<BookingTableData | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
    const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [statusForm] = Form.useForm();

    useEffect(() => {
        loadBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, searchText, statusFilter, dateFilter]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const bookingsData = await bookingService.getAllBookings();
            const tableData: BookingTableData[] = bookingsData.map(booking => ({
                ...booking,
                key: booking.id
            }));
            setBookings(tableData);
        } catch (error) {
            console.error('Error loading bookings:', error);
            message.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = bookings;

        // Search filter
        if (searchText) {
            filtered = filtered.filter(booking =>
                booking.guestInfo.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
                booking.guestInfo.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
                booking.hotelName.toLowerCase().includes(searchText.toLowerCase()) ||
                booking.confirmationCode.toLowerCase().includes(searchText.toLowerCase()) ||
                booking.guestInfo.email.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }

        // Date filter
        if (dateFilter && dateFilter.length === 2) {
            filtered = filtered.filter(booking => {
                const checkInDate = dayjs(booking.checkIn.toDate());
                return checkInDate.isAfter(dateFilter[0]) && checkInDate.isBefore(dateFilter[1]);
            });
        }

        setFilteredBookings(filtered);
    };

    const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            message.success(`Booking status updated to ${newStatus}`);
            loadBookings();
        } catch (error) {
            console.error('Error updating booking status:', error);
            message.error('Failed to update booking status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'green';
            case 'pending': return 'orange';
            case 'cancelled': return 'red';
            case 'checked-in': return 'blue';
            case 'checked-out': return 'purple';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircleOutlined />;
            case 'pending': return <ClockCircleOutlined />;
            case 'cancelled': return <CloseCircleOutlined />;
            case 'checked-in': return <CalendarOutlined />;
            case 'checked-out': return <CheckCircleOutlined />;
            default: return null;
        }
    };

    const columns = [
        {
            title: 'Guest',
            key: 'guest',
            render: (record: BookingTableData) => (
                <div className="flex items-center">
                    <Avatar icon={<UserOutlined />} className="mr-3" />
                    <div>
                        <Text className="font-medium">
                            {record.guestInfo.firstName} {record.guestInfo.lastName}
                        </Text>
                        <div className="text-gray-500 text-sm">
                            {record.guestInfo.email}
                        </div>
                        <div className="text-gray-500 text-sm">
                            {record.guestInfo.phone}
                        </div>
                    </div>
                </div>
            ),
            width: 200
        },
        {
            title: 'Booking Details',
            key: 'booking',
            render: (record: BookingTableData) => (
                <div>
                    <Text className="font-medium block">{record.hotelName}</Text>
                    <Text className="text-gray-600 block text-sm">{record.roomName}</Text>
                    <Text className="text-gray-500 text-xs">
                        Code: {record.confirmationCode}
                    </Text>
                </div>
            )
        },
        {
            title: 'Check-in',
            dataIndex: 'checkIn',
            key: 'checkIn',
            render: (date: any) => (
                <div>
                    <Text className="block">{dayjs(date.toDate()).format('DD MMM YYYY')}</Text>
                    <Text className="text-gray-500 text-sm">
                        {dayjs(date.toDate()).format('dddd')}
                    </Text>
                </div>
            )
        },
        {
            title: 'Check-out',
            dataIndex: 'checkOut',
            key: 'checkOut',
            render: (date: any) => (
                <div>
                    <Text className="block">{dayjs(date.toDate()).format('DD MMM YYYY')}</Text>
                    <Text className="text-gray-500 text-sm">
                        {dayjs(date.toDate()).format('dddd')}
                    </Text>
                </div>
            )
        },
        {
            title: 'Guests',
            key: 'guests',
            render: (record: BookingTableData) => (
                <div className="text-center">
                    <Text className="block font-medium">{record.guests}</Text>
                    <Text className="text-gray-500 text-sm">{record.rooms} room(s)</Text>
                </div>
            )
        },
        {
            title: 'Total',
            dataIndex: 'pricing',
            key: 'total',
            render: (pricing: any) => (
                <div>
                    <Text className="font-medium text-green-600">
                        ฿{pricing.total.toLocaleString()}
                    </Text>
                    <div className="text-gray-500 text-sm">
                        {pricing.currency}
                    </div>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag
                    color={getStatusColor(status)}
                    icon={getStatusIcon(status)}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            )
        },
        {
            title: 'Booked',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: any) => (
                <Text className="text-gray-500 text-sm">
                    {dayjs(date.toDate()).format('DD/MM/YY')}
                </Text>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: BookingTableData) => {
                const menuItems = [
                    {
                        key: 'view',
                        icon: <EyeOutlined />,
                        label: 'View Details',
                        onClick: () => {
                            setSelectedBooking(record);
                            setDetailModalVisible(true);
                        }
                    },
                    {
                        key: 'status',
                        icon: <EditOutlined />,
                        label: 'Change Status',
                        onClick: () => {
                            setSelectedBooking(record);
                            setStatusModalVisible(true);
                            statusForm.setFieldsValue({ status: record.status });
                        }
                    },
                    {
                        type: 'divider' as const
                    },
                    {
                        key: 'email',
                        icon: <MailOutlined />,
                        label: 'Send Email',
                        onClick: () => {
                            message.info('Email feature coming soon');
                        }
                    }
                ];

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button icon={<MoreOutlined />} />
                    </Dropdown>
                );
            }
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[]) => {
            setSelectedRowKeys(selectedKeys);
        }
    };

    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        revenue: bookings
            .filter(b => b.paymentInfo.status === 'completed')
            .reduce((sum, b) => sum + b.pricing.total, 0)
    };

    const handleStatusFormSubmit = async (values: any) => {
        if (!selectedBooking) return;

        try {
            await handleStatusChange(selectedBooking.id, values.status);
            setStatusModalVisible(false);
            statusForm.resetFields();
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-2">Booking Management</Title>
                    <Text className="text-gray-600">
                        Manage all bookings, check-ins, and customer reservations
                    </Text>
                </div>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Bookings"
                            value={stats.total}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Confirmed"
                            value={stats.confirmed}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Revenue"
                            value={stats.revenue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `฿${value?.toLocaleString()}`}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Search
                            placeholder="Search guest, hotel, or booking code..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={6} md={4}>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: '100%' }}
                            placeholder="Filter by status"
                        >
                            <Option value="all">All Status</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="confirmed">Confirmed</Option>
                            <Option value="checked-in">Checked In</Option>
                            <Option value="checked-out">Checked Out</Option>
                            <Option value="cancelled">Cancelled</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={10} md={8}>
                        <RangePicker
                            placeholder={['Check-in from', 'Check-in to']}
                            value={dateFilter}
                            onChange={setDateFilter}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        {selectedRowKeys.length > 0 && (
                            <Space>
                                <Text>{selectedRowKeys.length} selected</Text>
                                <Button size="small">
                                    Bulk Actions
                                </Button>
                            </Space>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Bookings Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredBookings}
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={{
                        total: filteredBookings.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} bookings`
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Booking Detail Modal */}
            <Modal
                title="Booking Details"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedBooking && (
                    <div className="space-y-4">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" title="Guest Information">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <UserOutlined className="mr-2" />
                                            <Text>
                                                {selectedBooking.guestInfo.firstName} {selectedBooking.guestInfo.lastName}
                                            </Text>
                                        </div>
                                        <div className="flex items-center">
                                            <MailOutlined className="mr-2" />
                                            <Text>{selectedBooking.guestInfo.email}</Text>
                                        </div>
                                        <div className="flex items-center">
                                            <PhoneOutlined className="mr-2" />
                                            <Text>{selectedBooking.guestInfo.phone}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Country: </Text>
                                            <Text>{selectedBooking.guestInfo.country}</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Booking Information">
                                    <div className="space-y-2">
                                        <div>
                                            <Text className="font-medium">Hotel: </Text>
                                            <Text>{selectedBooking.hotelName}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Room: </Text>
                                            <Text>{selectedBooking.roomName}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Check-in: </Text>
                                            <Text>{dayjs(selectedBooking.checkIn.toDate()).format('DD MMM YYYY')}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Check-out: </Text>
                                            <Text>{dayjs(selectedBooking.checkOut.toDate()).format('DD MMM YYYY')}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Guests: </Text>
                                            <Text>{selectedBooking.guests} in {selectedBooking.rooms} room(s)</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Card size="small" title="Payment Information">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <div className="space-y-2">
                                        <div>
                                            <Text className="font-medium">Room Rate: </Text>
                                            <Text>฿{selectedBooking.pricing.roomRate.toLocaleString()}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Taxes: </Text>
                                            <Text>฿{selectedBooking.pricing.taxes.toLocaleString()}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Service Fee: </Text>
                                            <Text>฿{selectedBooking.pricing.serviceFee.toLocaleString()}</Text>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className="space-y-2">
                                        <div>
                                            <Text className="font-medium">Total: </Text>
                                            <Text className="text-green-600 font-bold">
                                                ฿{selectedBooking.pricing.total.toLocaleString()}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Payment Method: </Text>
                                            <Text>{selectedBooking.paymentInfo.method}</Text>
                                        </div>
                                        <div>
                                            <Text className="font-medium">Payment Status: </Text>
                                            <Tag color={selectedBooking.paymentInfo.status === 'completed' ? 'green' : 'orange'}>
                                                {selectedBooking.paymentInfo.status}
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {selectedBooking.guestInfo.specialRequests && (
                            <Card size="small" title="Special Requests">
                                <Text>{selectedBooking.guestInfo.specialRequests}</Text>
                            </Card>
                        )}
                    </div>
                )}
            </Modal>

            {/* Status Change Modal */}
            <Modal
                title="Change Booking Status"
                open={statusModalVisible}
                onCancel={() => setStatusModalVisible(false)}
                footer={null}
            >
                <Form
                    form={statusForm}
                    onFinish={handleStatusFormSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="status"
                        label="New Status"
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select placeholder="Select new status">
                            <Option value="pending">Pending</Option>
                            <Option value="confirmed">Confirmed</Option>
                            <Option value="checked-in">Checked In</Option>
                            <Option value="checked-out">Checked Out</Option>
                            <Option value="cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end space-x-2">
                        <Button onClick={() => setStatusModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Update Status
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}