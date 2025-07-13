"use client";
import AdminLayout from '@/components/admin-layout';
import { usePathname } from 'next/navigation';


interface AdminLayoutWrapperProps {
    children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
    // path === /admin no layout
    const pathname = usePathname();
    if (pathname === '/admin') {
        return <>{children}</>;
    }
    return <AdminLayout>{children}</AdminLayout>;
}