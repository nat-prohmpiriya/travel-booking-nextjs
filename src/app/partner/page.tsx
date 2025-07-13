'use client';
import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Row justify="center">
        <Col span={24} md={16}>
          <Card>
            <Title level={2}>Partner Program</Title>
            <Paragraph>
              Join our partner program to start earning with us.
            </Paragraph>
            <Button type="primary" size="large">
              Become a Partner
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
