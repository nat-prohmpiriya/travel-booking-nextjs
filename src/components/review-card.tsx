'use client';

import React, { useState } from 'react';
import { Card, Rate, Avatar, Button, Tag, Divider, Image, Typography, Space, Modal, Input, message } from 'antd';
import { LikeOutlined, DislikeOutlined, MessageOutlined, MoreOutlined, FlagOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Review } from '@/types/review';
import { useReviewStore } from '@/stores/review-store';
import { useAuth } from '@/contexts/AuthContext';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ReviewCardProps {
    review: Review;
    showHotelName?: boolean;
    canRespond?: boolean;
    canVerify?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    showHotelName = false,
    canRespond = false,
    canVerify = false
}) => {
    const { user } = useAuth();
    const { markHelpful, reportReview, addResponse, verifyReview } = useReviewStore();

    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
    const [reportReason, setReportReason] = useState<string>('');
    const [responseContent, setResponseContent] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleMarkHelpful = async (): Promise<void> => {
        if (!user) {
            message.warning('กรุณาเข้าสู่ระบบเพื่อให้คะแนนความเป็นประโยชน์');
            return;
        }

        try {
            await markHelpful(review.id, user.uid);
            message.success('ให้คะแนนความเป็นประโยชน์แล้ว');
        } catch (error) {
            message.error('ไม่สามารถให้คะแนนได้');
        }
    };

    const handleReport = async (): Promise<void> => {
        if (!user) {
            message.warning('กรุณาเข้าสู่ระบบเพื่อรายงานรีวิว');
            return;
        }

        if (!reportReason.trim()) {
            message.warning('กรุณาระบุเหตุผลในการรายงาน');
            return;
        }

        setIsSubmitting(true);
        try {
            await reportReview(review.id, user.uid, reportReason);
            message.success('รายงานรีวิวแล้ว');
            setShowReportModal(false);
            setReportReason('');
        } catch (error) {
            message.error('ไม่สามารถรายงานได้');
        }
        setIsSubmitting(false);
    };

    const handleAddResponse = async (): Promise<void> => {
        if (!user) {
            message.warning('กรุณาเข้าสู่ระบบเพื่อตอบกลับ');
            return;
        }

        if (!responseContent.trim()) {
            message.warning('กรุณาใส่เนื้อหาการตอบกลับ');
            return;
        }

        setIsSubmitting(true);
        try {
            await addResponse(
                review.id,
                user.uid,
                user.displayName || 'ผู้ใช้',
                'user',
                responseContent
            );
            message.success('ตอบกลับรีวิวแล้ว');
            setShowResponseModal(false);
            setResponseContent('');
        } catch (error) {
            message.error('ไม่สามารถตอบกลับได้');
        }
        setIsSubmitting(false);
    };

    const handleVerify = async (isVerified: boolean): Promise<void> => {
        try {
            await verifyReview(review.id, isVerified);
            message.success(isVerified ? 'ยืนยันรีวิวแล้ว' : 'ยกเลิกการยืนยันแล้ว');
        } catch (error) {
            message.error('ไม่สามารถอัปเดตสถานะการยืนยันได้');
        }
    };

    const formatDate = (date: any): string => {
        if (!date) return '';
        const reviewDate = date.toDate ? date.toDate() : new Date(date);
        return reviewDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className="mb-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <Avatar
                            src={review.userAvatar}
                            size={48}
                            className="bg-blue-500"
                        >
                            {review.userName.charAt(0)}
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <Text strong className="text-lg">{review.userName}</Text>
                                {review.isVerified && (
                                    <CheckCircleOutlined className="text-green-500" title="รีวิวที่ยืนยันแล้ว" />
                                )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                                <Rate disabled value={review.rating} />
                                <Text type="secondary" className="text-sm">
                                    {formatDate(review.createdAt)}
                                </Text>
                                {review.roomType && (
                                    <Tag color="blue" className="text-xs">
                                        {review.roomType}
                                    </Tag>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {canVerify && (
                            <Button
                                type={review.isVerified ? "default" : "primary"}
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleVerify(!review.isVerified)}
                            >
                                {review.isVerified ? 'ยกเลิกยืนยัน' : 'ยืนยัน'}
                            </Button>
                        )}
                        <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                        />
                    </div>
                </div>

                {/* Review Content */}
                <div className="space-y-3">
                    {review.title && (
                        <Text strong className="text-base block">{review.title}</Text>
                    )}

                    <Paragraph className="mb-0">
                        {review.comment}
                    </Paragraph>

                    {/* Pros and Cons */}
                    {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {review.pros && review.pros.length > 0 && (
                                <div>
                                    <Text strong className="text-green-600 block mb-2">👍 จุดเด่น</Text>
                                    <ul className="list-disc list-inside space-y-1">
                                        {review.pros.map((pro: string, index: number) => (
                                            <li key={index} className="text-sm text-gray-700">{pro}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {review.cons && review.cons.length > 0 && (
                                <div>
                                    <Text strong className="text-red-600 block mb-2">👎 จุดด้อย</Text>
                                    <ul className="list-disc list-inside space-y-1">
                                        {review.cons.map((con: string, index: number) => (
                                            <li key={index} className="text-sm text-gray-700">{con}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Tags */}
                    {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {review.tags.map((tag: string, index: number) => (
                                <Tag key={index} color="blue" className="text-xs">
                                    {tag}
                                </Tag>
                            ))}
                        </div>
                    )}

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2 overflow-x-auto">
                            {review.images.map((image: string, index: number) => (
                                <Image
                                    key={index}
                                    src={image}
                                    alt={`รีวิวภาพที่ ${index + 1}`}
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-cover flex-shrink-0"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                        <Button
                            type="text"
                            size="small"
                            icon={<LikeOutlined />}
                            onClick={handleMarkHelpful}
                            className="text-gray-600 hover:text-blue-600"
                        >
                            เป็นประโยชน์ ({review.helpfulCount})
                        </Button>

                        {canRespond && (
                            <Button
                                type="text"
                                size="small"
                                icon={<MessageOutlined />}
                                onClick={() => setShowResponseModal(true)}
                                className="text-gray-600 hover:text-blue-600"
                            >
                                ตอบกลับ
                            </Button>
                        )}
                    </div>

                    <Button
                        type="text"
                        size="small"
                        icon={<FlagOutlined />}
                        onClick={() => setShowReportModal(true)}
                        className="text-gray-600 hover:text-red-600"
                    >
                        รายงาน
                    </Button>
                </div>

                {/* Responses */}
                {review.responses && review.responses.length > 0 && (
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                        <Text strong className="block">การตอบกลับ</Text>
                        {review.responses.map((response, index) => (
                            <div key={index} className="flex space-x-3">
                                <Avatar size={32} className="bg-gray-500">
                                    {response.userName.charAt(0)}
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <Text strong className="text-sm">{response.userName}</Text>
                                        <Tag
                                            color={response.userRole === 'hotel' ? 'green' : response.userRole === 'admin' ? 'red' : 'default'}
                                            className="text-xs"
                                        >
                                            {response.userRole === 'hotel' ? 'โรงแรม' : response.userRole === 'admin' ? 'ผู้ดูแล' : 'ผู้ใช้'}
                                        </Tag>
                                        <Text type="secondary" className="text-xs">
                                            {formatDate(response.createdAt)}
                                        </Text>
                                    </div>
                                    <Paragraph className="text-sm mt-1 mb-0">
                                        {response.content}
                                    </Paragraph>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Modal */}
            <Modal
                title="รายงานรีวิว"
                open={showReportModal}
                onOk={handleReport}
                onCancel={() => setShowReportModal(false)}
                confirmLoading={isSubmitting}
                okText="รายงาน"
                cancelText="ยกเลิก"
            >
                <div className="space-y-4">
                    <Text>เหตุผลในการรายงานรีวิวนี้:</Text>
                    <TextArea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="ระบุเหตุผล..."
                        rows={4}
                    />
                </div>
            </Modal>

            {/* Response Modal */}
            <Modal
                title="ตอบกลับรีวิว"
                open={showResponseModal}
                onOk={handleAddResponse}
                onCancel={() => setShowResponseModal(false)}
                confirmLoading={isSubmitting}
                okText="ส่งการตอบกลับ"
                cancelText="ยกเลิก"
            >
                <div className="space-y-4">
                    <Text>การตอบกลับของคุณ:</Text>
                    <TextArea
                        value={responseContent}
                        onChange={(e) => setResponseContent(e.target.value)}
                        placeholder="เขียนการตอบกลับ..."
                        rows={4}
                    />
                </div>
            </Modal>
        </Card>
    );
};