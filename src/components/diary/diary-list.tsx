'use client';

import React, { useState, useEffect } from 'react';
import {
	Row,
	Col,
	Card,
	Typography,
	Button,
	Empty,
	Spin,
	Avatar,
	Tag,
	Space,
	Input,
	Select,
	DatePicker,
	Dropdown,
	message
} from 'antd';
import {
	PlusOutlined,
	EyeOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	FilterOutlined,
	CalendarOutlined,
	EnvironmentOutlined,
	CameraOutlined,
	BookOutlined,
	MoreOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { diaryService } from '@/services/diaryService';
import { TravelDiary, DiaryFilters } from '@/types/diary';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DiaryListProps {
	showUserDiaries?: boolean;
	showPublicDiaries?: boolean;
	userId?: string;
	limit?: number;
}

export const DiaryList: React.FC<DiaryListProps> = ({
	showUserDiaries = true,
	showPublicDiaries = false,
	userId,
	limit
}) => {
	const { user } = useAuth();
	const router = useRouter();

	const [diaries, setDiaries] = useState<TravelDiary[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<DiaryFilters>({
		limit: limit || 12,
		orderBy: 'createdAt',
		orderDirection: 'desc'
	});

	useEffect(() => {
		loadDiaries();
	}, [filters, user, userId, showUserDiaries, showPublicDiaries]);

	const loadDiaries = async (): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			let diariesData: TravelDiary[] = [];

			if (showUserDiaries && (user || userId)) {
				const targetUserId = userId || user!.uid;
				const userDiaries = await diaryService.getUserDiaries(targetUserId, filters);
				diariesData = [...diariesData, ...userDiaries];
			}

			if (showPublicDiaries) {
				const publicDiaries = await diaryService.getPublicDiaries(filters);
				diariesData = [...diariesData, ...publicDiaries];
			}

			// Remove duplicates if showing both user and public diaries
			const uniqueDiaries = diariesData.filter((diary, index, self) =>
				self.findIndex(d => d.id === diary.id) === index
			);

			setDiaries(uniqueDiaries);
		} catch (err: any) {
			console.error('Error loading diaries:', err);
			setError(err.message || 'Failed to load diaries');
			message.error('Failed to load travel diaries');
		} finally {
			setLoading(false);
		}
	};

	const handleSearchChange = (value: string): void => {
		setFilters(prev => ({ ...prev, search: value || undefined }));
	};

	const handleFilterChange = (key: keyof DiaryFilters, value: any): void => {
		setFilters(prev => ({ ...prev, [key]: value }));
	};

	const handleDateRangeChange = (dates: any): void => {
		if (dates && dates[0] && dates[1]) {
			setFilters(prev => ({
				...prev,
				dateRange: {
					start: dates[0].toDate(),
					end: dates[1].toDate()
				}
			}));
		} else {
			setFilters(prev => ({ ...prev, dateRange: undefined }));
		}
	};

	const handleViewDiary = (diaryId: string): void => {
		router.push(`/diary/${diaryId}`);
	};

	const handleEditDiary = (diaryId: string): void => {
		router.push(`/diary/${diaryId}/edit`);
	};

	const handleDeleteDiary = async (diaryId: string): Promise<void> => {
		try {
			await diaryService.deleteDiary(diaryId);
			message.success('Travel diary deleted successfully');
			await loadDiaries();
		} catch (error) {
			console.error('Error deleting diary:', error);
			message.error('Failed to delete diary');
		}
	};

	const handleCreateDiary = (): void => {
		router.push('/diary/new');
	};

	const renderDiaryCard = (diary: TravelDiary): React.ReactNode => {
		const isOwner = user && diary.userId === user.uid;
		const daysDuration = Math.ceil(
			(diary.endDate.toDate().getTime() - diary.startDate.toDate().getTime()) / (1000 * 60 * 60 * 24)
		);

		const menuItems = [
			{
				key: 'view',
				label: 'View Diary',
				icon: <EyeOutlined />,
				onClick: () => handleViewDiary(diary.id)
			}
		];

		if (isOwner) {
			menuItems.push(
				{
					key: 'edit',
					label: 'Edit Diary',
					icon: <EditOutlined />,
					onClick: () => handleEditDiary(diary.id)
				},
				{
					key: 'delete',
					label: 'Delete Diary',
					icon: <DeleteOutlined />,
					onClick: () => handleDeleteDiary(diary.id)
				}
			);
		}

		return (
			<Card
				key={diary.id}
				hoverable
				className="h-full"
				cover={
					diary.coverPhoto ? (
						<div className="h-48 overflow-hidden">
							<img
								src={diary.coverPhoto}
								alt={diary.tripName}
								className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
							/>
						</div>
					) : (
						<div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
							<BookOutlined className="text-4xl text-gray-400" />
						</div>
					)
				}
				actions={[
					<Button
						key="view"
						type="text"
						icon={<EyeOutlined />}
						onClick={() => handleViewDiary(diary.id)}
					>
						View
					</Button>,
					...(isOwner ? [
						<Button
							key="edit"
							type="text"
							icon={<EditOutlined />}
							onClick={() => handleEditDiary(diary.id)}
						>
							Edit
						</Button>
					] : []),
					<Dropdown
						key="more"
						menu={{ items: menuItems }}
						trigger={['click']}
					>
						<Button type="text" icon={<MoreOutlined />} />
					</Dropdown>
				]}
			>
				<div className="space-y-3">
					<div>
						<Title level={4} className="!mb-1 line-clamp-1">
							{diary.tripName}
						</Title>
						<div className="flex items-center text-gray-600 mb-2">
							<EnvironmentOutlined className="mr-1" />
							<Text className="line-clamp-1">{diary.destination}</Text>
						</div>
						{diary.isPublic && (
							<Tag color="green">Public</Tag>
						)}
					</div>

					{diary.description && (
						<Paragraph
							className="text-gray-600 text-sm line-clamp-2"
							ellipsis={{ rows: 2 }}
						>
							{diary.description}
						</Paragraph>
					)}

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm text-gray-500">
							<div className="flex items-center">
								<CalendarOutlined className="mr-1" />
								<span>{dayjs(diary.startDate.toDate()).format('MMM DD, YYYY')}</span>
							</div>
							<span>{daysDuration} days</span>
						</div>

						<div className="flex items-center justify-between text-sm text-gray-500">
							<div className="flex items-center space-x-3">
								<span className="flex items-center">
									<BookOutlined className="mr-1" />
									{diary.totalEntries || 0} entries
								</span>
								<span className="flex items-center">
									<CameraOutlined className="mr-1" />
									{diary.totalPhotos || 0} photos
								</span>
							</div>
							{!isOwner && showPublicDiaries && (
								<Avatar size="small" className="bg-blue-500">
									{diary.userId.charAt(0).toUpperCase()}
								</Avatar>
							)}
						</div>
					</div>
				</div>
			</Card>
		);
	};

	if (error) {
		return (
			<div className="text-center py-8">
				<Empty
					description="Failed to load travel diaries"
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				>
					<Button onClick={loadDiaries}>Try Again</Button>
				</Empty>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<Title level={2} className="!mb-1">
						{showPublicDiaries ? 'Public Travel Diaries' : 'My Travel Diaries'}
					</Title>
					<Text className="text-gray-600">
						{showPublicDiaries
							? 'Discover amazing travel stories from our community'
							: 'Your personal collection of travel memories'
						}
					</Text>
				</div>

				{showUserDiaries && user && (
					<Button
						type="primary"
						size="large"
						icon={<PlusOutlined />}
						onClick={handleCreateDiary}
					>
						New Diary
					</Button>
				)}
			</div>

			{/* Filters */}
			<Card size="small">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Search
						placeholder="Search diaries..."
						allowClear
						onChange={(e) => handleSearchChange(e.target.value)}
						prefix={<SearchOutlined />}
					/>

					<Input
						placeholder="Filter by destination"
						allowClear
						onChange={(e) => handleFilterChange('destination', e.target.value)}
						prefix={<EnvironmentOutlined />}
					/>

					<RangePicker
						placeholder={['Start Date', 'End Date']}
						onChange={handleDateRangeChange}
						style={{ width: '100%' }}
					/>

					<Select
						placeholder="Sort by"
						value={`${filters.orderBy}-${filters.orderDirection}`}
						onChange={(value) => {
							const [orderBy, orderDirection] = value.split('-');
							setFilters(prev => ({
								...prev,
								orderBy: orderBy as any,
								orderDirection: orderDirection as any
							}));
						}}
					>
						<Option value="createdAt-desc">Latest Created</Option>
						<Option value="createdAt-asc">Oldest Created</Option>
						<Option value="startDate-desc">Latest Trip</Option>
						<Option value="startDate-asc">Oldest Trip</Option>
						<Option value="updatedAt-desc">Recently Updated</Option>
					</Select>
				</div>
			</Card>

			{/* Diary Grid */}
			{loading ? (
				<div className="text-center py-12">
					<Spin size="large" />
					<div className="mt-4">
						<Text>Loading travel diaries...</Text>
					</div>
				</div>
			) : diaries.length === 0 ? (
				<div className="text-center py-12">
					<Empty
						description={
							showUserDiaries
								? "You haven't created any travel diaries yet"
								: "No public diaries found"
						}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					>
						{showUserDiaries && user && (
							<Button type="primary" icon={<PlusOutlined />} onClick={handleCreateDiary}>
								Create Your First Diary
							</Button>
						)}
					</Empty>
				</div>
			) : (
				<Row gutter={[16, 16]}>
					{diaries.map((diary) => (
						<Col key={diary.id} xs={24} sm={12} lg={8} xl={6}>
							{renderDiaryCard(diary)}
						</Col>
					))}
				</Row>
			)}
		</div>
	);
};