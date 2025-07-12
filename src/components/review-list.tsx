'use client';

import React, { useEffect, useState } from 'react';
import { Card, Select, Rate, Progress, Button, Empty, Spin, Typography, Row, Col, Divider, Space } from 'antd';
import { FilterOutlined, LoadingOutlined } from '@ant-design/icons';
import { ReviewCard } from './review-card';
import { useReviewStore } from '@/stores/review-store';
import { ReviewFilters } from '@/types/review';

const { Title, Text } = Typography;
const { Option } = Select;

interface ReviewListProps {
    hotelId: string;
    canRespond?: boolean;
    canVerify?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
    hotelId,
    canRespond = false,
    canVerify = false
}) => {
    const {
        reviews,
        reviewStats,
        currentFilters,
        isLoading,
        hasMore,
        loadHotelReviews,
        loadReviewStats,
        setFilters,
        clearReviews
    } = useReviewStore();

    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        if (hotelId && !initialized) {
            clearReviews();
            loadReviewStats(hotelId);
            loadHotelReviews(hotelId, true);
            setInitialized(true);
        }
    }, [hotelId, initialized, clearReviews, loadReviewStats, loadHotelReviews]);

    const handleFilterChange = (key: keyof ReviewFilters, value: any): void => {
        setFilters({ [key]: value });
        loadHotelReviews(hotelId, true); // Reset and reload with new filters
    };

    const handleLoadMore = (): void => {
        loadHotelReviews(hotelId, false);
    };

    const getRatingText = (rating: number): string => {
        if (rating >= 4.5) return 'ยอดเยี่ยม';
        if (rating >= 4.0) return 'ดีมาก';
        if (rating >= 3.5) return 'ดี';
        if (rating >= 3.0) return 'พอใช้';
        return 'ควรปรับปรุง';
    };

    const getRatingColor = (rating: number): string => {
        if (rating >= 4.0) return '#52c41a';
        if (rating >= 3.0) return '#faad14';
        return '#ff4d4f';
    };

    if (!reviewStats && isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Review Stats */}
            {reviewStats && (
                <Card>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2" style={{ color: getRatingColor(reviewStats.averageRating) }}>
                                    {reviewStats.averageRating.toFixed(1)}
                                </div>
                                <Rate disabled value={reviewStats.averageRating} allowHalf className="mb-2" />
                                <div className="text-lg font-medium text-gray-700">
                                    {getRatingText(reviewStats.averageRating)}
                                </div>
                                <Text type="secondary">
                                    จาก {reviewStats.totalReviews.toLocaleString()} รีวิว
                                </Text>
                            </div>
                        </Col>

                        <Col xs={24} md={8}>
                            <Title level={5} className="mb-4">การให้คะแนน</Title>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-1 w-12">
                                            <span className="text-sm">{rating}</span>
                                            <Rate disabled value={1} count={1} className="text-xs" />
                                        </div>
                                        <Progress
                                            percent={
                                                reviewStats.totalReviews > 0
                                                    ? (reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100
                                                    : 0
                                            }
                                            size="small"
                                            showInfo={false}
                                            className="flex-1"
                                        />
                                        <span className="text-sm text-gray-500 w-8">
                                            {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Col>

                        <Col xs={24} md={8}>
                            <Title level={5} className="mb-4">คะแนนตามหมวดหมู่</Title>
                            <div className="space-y-3">
                                {Object.entries(reviewStats.categories).map(([category, score]) => (
                                    <div key={category} className="flex items-center justify-between">
                                        <span className="text-sm">
                                            {category === 'cleanliness' && 'ความสะอาด'}
                                            {category === 'service' && 'การบริการ'}
                                            {category === 'location' && 'ทำเลที่ตั้ง'}
                                            {category === 'facilities' && 'สิ่งอำนวยความสะดวก'}
                                            {category === 'value' && 'คุณภาพเทียบราคา'}
                                        </span>
                                        <span className="font-medium" style={{ color: getRatingColor(score) }}>
                                            {score.toFixed(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Filters */}
            <Card>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <FilterOutlined />
                        <span className="font-medium">ตัวกรอง:</span>
                    </div>

                    <Select
                        placeholder="เรียงตาม"
                        style={{ width: 150 }}
                        value={currentFilters.sortBy || 'newest'}
                        onChange={(value) => handleFilterChange('sortBy', value)}
                    >
                        <Option value="newest">ล่าสุด</Option>
                        <Option value="oldest">เก่าที่สุด</Option>
                        <Option value="highest">คะแนนสูงสุด</Option>
                        <Option value="lowest">คะแนนต่ำสุด</Option>
                        <Option value="helpful">มีประโยชน์</Option>
                    </Select>

                    <Select
                        placeholder="คะแนน"
                        style={{ width: 120 }}
                        value={currentFilters.rating}
                        onChange={(value) => handleFilterChange('rating', value)}
                        allowClear
                    >
                        <Option value={[5]}>5 ดาว</Option>
                        <Option value={[4]}>4 ดาว</Option>
                        <Option value={[3]}>3 ดาว</Option>
                        <Option value={[2]}>2 ดาว</Option>
                        <Option value={[1]}>1 ดาว</Option>
                        <Option value={[4, 5]}>4+ ดาว</Option>
                        <Option value={[3, 4, 5]}>3+ ดาว</Option>
                    </Select>

                    <Select
                        placeholder="รีวิวที่ยืนยันแล้ว"
                        style={{ width: 160 }}
                        value={currentFilters.verified}
                        onChange={(value) => handleFilterChange('verified', value)}
                        allowClear
                    >
                        <Option value={true}>ยืนยันแล้ว</Option>
                        <Option value={false}>ยังไม่ยืนยัน</Option>
                    </Select>

                    <Select
                        placeholder="มีรูปภาพ"
                        style={{ width: 120 }}
                        value={currentFilters.hasImages}
                        onChange={(value) => handleFilterChange('hasImages', value)}
                        allowClear
                    >
                        <Option value={true}>มีรูปภาพ</Option>
                    </Select>
                </div>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
                {isLoading && reviews.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                    </div>
                ) : reviews.length === 0 ? (
                    <Empty
                        description="ยังไม่มีรีวิว"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-12"
                    />
                ) : (
                    <>
                        <Divider>
                            <Text type="secondary">
                                แสดงรีวิว {reviews.length} รายการ
                                {reviewStats && ` จากทั้งหมด ${reviewStats.totalReviews} รายการ`}
                            </Text>
                        </Divider>

                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                canRespond={canRespond}
                                canVerify={canVerify}
                            />
                        ))}

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center py-4">
                                <Button
                                    type="default"
                                    size="large"
                                    loading={isLoading}
                                    onClick={handleLoadMore}
                                    icon={isLoading ? <LoadingOutlined /> : undefined}
                                >
                                    โหลดรีวิวเพิ่มเติม
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};