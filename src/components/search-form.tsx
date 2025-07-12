import React, { useState } from 'react';
import { Card, Form, AutoComplete, DatePicker, InputNumber, Button, Row, Col } from 'antd';
import { SearchOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { SearchParams } from '@/types';
import { hotelService } from '@/services/hotelService';

const { RangePicker } = DatePicker;

interface Props {
    onSearch: (values: Partial<SearchParams>) => void;
    loading?: boolean;
}

export const SearchForm: React.FC<Props> = ({ onSearch, loading }) => {
    const [form] = Form.useForm();
    const [options, setOptions] = useState<{ value: string }[]>([]);
    const [allOptions, setAllOptions] = useState<{ value: string }[]>([]);

    // ดึงข้อมูล auto suggest จาก Firestore เมื่อ component mount
    React.useEffect(() => {
        async function fetchOptions() {
            try {
                const destinations = await hotelService.getPopularDestinations(20);
                const hotels = await hotelService.getFeaturedHotels(20);
                const values = Array.from(new Set([
                    ...destinations.map(d => d.name),
                    ...hotels.map(h => h.city),
                    ...hotels.map(h => h.name),
                    ...hotels.map(h => h.location)
                ])).map(val => ({ value: val }));
                setAllOptions(values);
            } catch (err) {
                setAllOptions([]);
            }
        }
        fetchOptions();
    }, []);

    const handleFinish = (values: any) => {
        const searchParams: Partial<SearchParams> = {
            location: values.location,
            adults: values.adults || 2,
            children: values.children || 0,
        };

        if (values.dates && values.dates.length === 2) {
            searchParams.checkIn = values.dates[0].toDate();
            searchParams.checkOut = values.dates[1].toDate();
        }

        onSearch(searchParams);
    };

    const handleSearchLocation = (value: string) => {
        if (!value) {
            setOptions([]);
            return;
        }
        const filtered = allOptions.filter(opt =>
            opt.value.toLowerCase().includes(value.toLowerCase())
        );
        setOptions(filtered);
    };

    return (
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <Form
                form={form}
                onFinish={handleFinish}
                layout="vertical"
                initialValues={{
                    adults: 2,
                    children: 0
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="location"
                            label="Where are you going?"
                            rules={[{ required: true, message: 'Please enter destination' }]}
                        >
                            <AutoComplete
                                options={options}
                                onSearch={handleSearchLocation}
                                placeholder="City, hotel, or attraction"
                                size="large"
                                allowClear
                                filterOption={false}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="dates"
                            label="Check-in - Check-out"
                            rules={[{ required: true, message: 'Please select dates' }]}
                        >
                            <RangePicker
                                size="large"
                                style={{ width: '100%' }}
                                placeholder={['Check-in', 'Check-out']}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={3}>
                        <Form.Item
                            name="adults"
                            label="Adults"
                        >
                            <InputNumber
                                min={1}
                                max={10}
                                size="large"
                                style={{ width: '100%' }}
                                prefix={<UserOutlined />}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={3}>
                        <Form.Item
                            name="children"
                            label="Children"
                        >
                            <InputNumber
                                min={0}
                                max={10}
                                size="large"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={2}>
                        <Form.Item label=" " style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                icon={<SearchOutlined />}
                                loading={loading}
                                className="w-full h-12"
                            >
                                Search
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};
