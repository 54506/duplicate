import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PanelLeftClose, PanelLeftOpen, ClipboardList, CheckCircle, XCircle, Eye } from 'lucide-react';
import { fetchDeliveryRequests, approveDeliveryAgent, rejectDeliveryAgent } from '../api/axios';
import { motion as Motion } from 'framer-motion';

const DeliveryRequests = () => {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await fetchDeliveryRequests();
            setAgents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch delivery requests", error);
            alert("Failed to load requests");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        navigate('/');
    };

    const handleAction = async (id, action) => {
        try {
            if (action === "approve") {
                await approveDeliveryAgent(id, "Approved by administrator");
                alert("Agent approved successfully");
            } else {
                const reason = prompt("Enter rejection reason:") || "Rejected by administrator";
                await rejectDeliveryAgent(id, reason);
                alert("Agent rejected");
            }
            await loadRequests();
        } catch (error) {
            console.error("Action failed:", error);
            alert("Action failed");
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                activePage="Delivery Requests"
                onLogout={handleLogout}
            />

            <main className="flex-1 overflow-y-auto transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-slate-500 hover:bg-emerald-100 hover:text-emerald-900 rounded-lg transition-all"
                        >
                            {isSidebarOpen ? <PanelLeftClose className="w-6 h-6" /> : <PanelLeftOpen className="w-6 h-6" />}
                        </button>
                        <h1 className="text-2xl font-bold text-slate-800">Delivery Join Requests</h1>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-emerald-600" />
                                <h2 className="font-bold text-slate-700">Pending Approvals</h2>
                            </div>
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                                {agents.length} REQUESTS
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Vehicle</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Applied On</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Loading requests...</td>
                                        </tr>
                                    ) : agents.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No pending requests found.</td>
                                        </tr>
                                    ) : agents.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{agent.user_email}</div>
                                                <div className="text-xs text-slate-500">{agent.phone_number}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                    {agent.vehicle_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-slate-500">
                                                {new Date(agent.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/delivery/review/${agent.id}`)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(agent.id, 'approve')}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(agent.id, 'reject')}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Motion.div>
                </div>
            </main>
        </div>
    );
};

export default DeliveryRequests;
