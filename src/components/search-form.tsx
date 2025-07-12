import React from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Row, Col } from 'antd';
import { SearchOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { SearchParams } from '@/types';

const { RangePicker } = DatePicker;

interface Props {
    onSearch: (values: Partial<SearchParams>) => void;
    loading?: boolean;
}

export const SearchForm: React.FC<Props> = ({ onSearch, loading = false }) => {
    const [form] = Form.useForm();

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
                            <Input
                                prefix={<EnvironmentOutlined />}
                                placeholder="City, hotel, or attraction"
                                size="large"
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
