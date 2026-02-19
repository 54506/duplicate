import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function DeliveryLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const handler = (e) => setSidebarOpen(Boolean(e?.detail?.open));
        window.addEventListener('deliverySidebarToggle', handler);
        return () => window.removeEventListener('deliverySidebarToggle', handler);
    }, []);

    return (
        <div className="min-h-screen flex bg-gray-50">
            <Sidebar />
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-0`}>
                <Outlet />
            </main>
        </div>
    );
}
