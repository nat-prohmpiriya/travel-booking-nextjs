"use client";

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    Avatar,
    Rate,
    Modal,
    message,
    Dropdown,
    Typography,
    Row,
    Col,
    Card,
    Statistic,
    Select,
    Popconfirm
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    MoreOutlined,
    StarOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { IoTrendingUpOutline } from "react-icons/io5";
import { LuHotel } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import { hotelService, Hotel } from '@/services/hotelService';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface HotelTableData extends Hotel {
    key: string;
}

export default function HotelsManagement() {
    const router = useRouter();
    const [hotels, setHotels] = useState<HotelTableData[]>([]);
    const [filteredHotels, setFilteredHotels] = useState<HotelTableData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        loadHotels();
    }, []);

    useEffect(() => {
        filterHotels();
    }, [hotels, searchText, statusFilter]);

    const loadHotels = async () => {
        try {
            setLoading(true);
            const hotelsData = await hotelService.getAllHotels();
            const tableData: HotelTableData[] = hotelsData.map(hotel => ({
                ...hotel,
                key: hotel.id
            }));
            setHotels(tableData);
        } catch (error) {
            console.error('Error loading hotels:', error);
            message.error('Failed to load hotels');
        } finally {
            setLoading(false);
        }
    };

    const filterHotels = () => {
        let filtered = hotels;

        // Search filter
        if (searchText) {
            filtered = filtered.filter(hotel =>
                hotel.name.toLowerCase().includes(searchText.toLowerCase()) ||
                hotel.location.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(hotel => {
                if (statusFilter === 'active') return hotel.isActive;
                if (statusFilter === 'inactive') return !hotel.isActive;
                if (statusFilter === 'featured') return hotel.isFeatured;
                return true;
            });
        }

        setFilteredHotels(filtered);
    };

    const handleDeleteHotel = async (hotelId: string) => {
        try {
            await hotelService.deleteHotel(hotelId);
            message.success('Hotel deleted successfully');
            loadHotels();
        } catch (error) {
            console.error('Error deleting hotel:', error);
            message.error('Failed to delete hotel');
        }
    };

    const handleToggleStatus = async (hotelId: string, currentStatus: boolean) => {
        try {
            await hotelService.updateHotel(hotelId, { isActive: !currentStatus });
            message.success(`Hotel ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadHotels();
        } catch (error) {
            console.error('Error updating hotel status:', error);
            message.error('Failed to update hotel status');
        }
    };

    const handleToggleFeatured = async (hotelId: string, currentFeatured: boolean) => {
        try {
            await hotelService.updateHotel(hotelId, { isFeatured: !currentFeatured });
            message.success(`Hotel ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
            loadHotels();
        } catch (error) {
            console.error('Error updating hotel featured status:', error);
            message.error('Failed to update hotel featured status');
        }
    };

    const columns = [
        {
            title: 'Hotel',
            key: 'hotel',
            render: (record: HotelTableData) => (
                <div className="flex items-center">
                    <Avatar
                        shape="square"
                        size={64}
                        src={record.images[0]}
                        icon={<LuHotel />}
                        className="mr-3"
                    />
                    <div>
                        <Text className="font-medium text-base">{record.name}</Text>
                        <div className="flex items-center mt-1">
                            <EnvironmentOutlined className="text-gray-400 text-xs mr-1" />
                            <Text className="text-gray-600 text-sm">{record.location}</Text>
                        </div>
                        <div className="flex items-center mt-1">
                            <Rate
                                disabled
                                value={record.rating}
                                className="text-xs"
                            />
                            <Text className="text-gray-600 text-xs ml-2">
                                ({record.reviewCount} reviews)
                            </Text>
                        </div>
                    </div>
                </div>
            ),
            width: 300
        },
        {
            title: 'Price Range',
            key: 'price',
            render: (record: HotelTableData) => (
                <div>
                    <Text className="font-medium">
                        ฿{record.priceRange.min.toLocaleString()} - ฿{record.priceRange.max.toLocaleString()}
                    </Text>
                    <div className="text-gray-500 text-sm">per night</div>
                </div>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: HotelTableData) => (
                <Space direction="vertical" size="small">
                    <Tag color={record.isActive ? 'green' : 'red'}>
                        {record.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                    {record.isFeatured && (
                        <Tag color="gold" icon={<StarOutlined />}>
                            Featured
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Amenities',
            dataIndex: 'amenities',
            key: 'amenities',
            render: (amenities: string[]) => (
                <div>
                    {amenities.slice(0, 3).map(amenity => (
                        <Tag key={amenity} className="mb-1">
                            {amenity}
                        </Tag>
                    ))}
                    {amenities.length > 3 && (
                        <Tag className="mb-1">
                            +{amenities.length - 3} more
                        </Tag>
                    )}
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: HotelTableData) => {
                const menuItems = [
                    {
                        key: 'view',
                        icon: <EyeOutlined />,
                        label: 'View Details',
                        onClick: () => router.push(`/hotel/${record.id}`)
                    },
                    {
                        key: 'edit',
                        icon: <EditOutlined />,
                        label: 'Edit Hotel',
                        onClick: () => router.push(`/admin/hotels/${record.id}/edit`)
                    },
                    {
                        type: 'divider' as const
                    },
                    {
                        key: 'toggle-status',
                        label: record.isActive ? 'Deactivate' : 'Activate',
                        onClick: () => handleToggleStatus(record.id, record.isActive)
                    },
                    {
                        key: 'toggle-featured',
                        label: record.isFeatured ? 'Remove from Featured' : 'Add to Featured',
                        onClick: () => handleToggleFeatured(record.id, record.isFeatured)
                    },
                    {
                        type: 'divider' as const
                    },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: 'Delete Hotel',
                        danger: true,
                        onClick: () => {
                            Modal.confirm({
                                title: 'Delete Hotel',
                                content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
                                okText: 'Delete',
                                okType: 'danger',
                                onOk: () => handleDeleteHotel(record.id)
                            });
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
        total: hotels.length,
        active: hotels.filter(h => h.isActive).length,
        featured: hotels.filter(h => h.isFeatured).length,
        averageRating: hotels.length > 0
            ? (hotels.reduce((sum, h) => sum + h.rating, 0) / hotels.length).toFixed(1)
            : '0'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-2">Hotel Management</Title>
                    <Text className="text-gray-600">
                        Manage all hotels, rooms, and properties on your platform
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push('/admin/hotels/new')}
                >
                    Add New Hotel
                </Button>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Hotels"
                            value={stats.total}
                            prefix={<LuHotel />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Active Hotels"
                            value={stats.active}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Featured Hotels"
                            value={stats.featured}
                            prefix={<StarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Avg Rating"
                            value={stats.averageRating}
                            suffix="/ 5"
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Search
                            placeholder="Search hotels or locations..."
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
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="featured">Featured</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={10} md={14}>
                        {selectedRowKeys.length > 0 && (
                            <Space>
                                <Text>{selectedRowKeys.length} hotels selected</Text>
                                <Button size="small">
                                    Bulk Actions
                                </Button>
                            </Space>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Hotels Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredHotels}
                    rowSelection={rowSelection}
                    loading={loading}
                    pagination={{
                        total: filteredHotels.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} hotels`
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </div>
    );
}