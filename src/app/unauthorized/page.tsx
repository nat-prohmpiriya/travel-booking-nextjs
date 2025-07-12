'use client';

import React from 'react';
import { Forbidden } from '@/components/auth/loading-states';
import { useAuth } from '@/hooks/useAuth';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <Forbidden
      title="ไม่มีสิทธิ์เข้าถึง"
      message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด"
      userRole={user?.role}
      showHomeButton={true}
    />
  );
}