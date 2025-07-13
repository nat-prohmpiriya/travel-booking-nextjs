"use client";

import { Button } from 'antd'
import { useRouter } from 'next/navigation';

const AuthAdminPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Admin Authentication</h1>
            <p className="text-gray-600">This page is for admin authentication purposes.</p>
            {/* Add your authentication form or components here */}
            <div className="mt-4">
                <Button type="primary" onClick={() => router.push('/admin/dashboard')}>
                    go to admin dashboard
                </Button>
            </div>
        </div>
    )
}

export default AuthAdminPage