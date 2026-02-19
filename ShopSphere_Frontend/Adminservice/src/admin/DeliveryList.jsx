import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PanelLeftClose, PanelLeftOpen, Users, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';
import { fetchAllDeliveryAgents, blockDeliveryAgent, unblockDeliveryAgent } from '../api/axios';
import { motion as Motion } from 'framer-motion';

const DeliveryList = () => {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [filter, setFilter] = useState('all');

    const loadAgents = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllDeliveryAgents();
            setAgents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch delivery agents", error);
            alert("Failed to load agents");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAgents();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        navigate('/');
    };

    const handleBlockAction = async (id, isBlocked) => {
        try {
            if (isBlocked) {
                await unblockDeliveryAgent(id);
                alert("Agent unblocked");
            } else {
                const reason = prompt("Enter blocking reason:") || "Blocked by administrator";
                await blockDeliveryAgent(id, reason);
                alert("Agent blocked");
            }
            await loadAgents();
        } catch (error) {
            console.error("Block action failed:", error);
            alert("Action failed");
        }
    };

    const filteredAgents = agents.filter(agent => {
        if (filter === 'all') return true;
        if (filter === 'approved') return agent.approval_status === 'approved';
        if (filter === 'pending') return agent.approval_status === 'pending';
        if (filter === 'blocked') return agent.is_blocked;
        return true;
    });

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                activePage="Delivery Agents"
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
                        <h1 className="text-2xl font-bold text-slate-800">Delivery Fleet</h1>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <div className="flex gap-4 mb-8">
                        {['all', 'approved', 'pending', 'blocked'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                    : 'bg-white text-slate-400 border border-gray-100'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                            <h2 className="font-bold text-slate-700">Fleet Index</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Vehicle</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Compliance</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Access</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">Loading fleet data...</td>
                                        </tr>
                                    ) : filteredAgents.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No agents found.</td>
                                        </tr>
                                    ) : filteredAgents.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{agent.user_email}</div>
                                                <div className="text-xs text-slate-500">{agent.phone_number}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                    {agent.vehicle_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${agent.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    agent.approval_status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {agent.approval_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {agent.is_blocked ? (
                                                    <span className="text-rose-600 flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                                        <ShieldAlert className="w-3 h-3" /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                                        <ShieldCheck className="w-3 h-3" /> Active
                                                    </span>
                                                )}
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
                                                        onClick={() => handleBlockAction(agent.id, agent.is_blocked)}
                                                        className={`p-2 rounded-lg transition-all ${agent.is_blocked
                                                            ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                            : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                                                            }`}
                                                        title={agent.is_blocked ? "Unblock" : "Block"}
                                                    >
                                                        {agent.is_blocked ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
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

export default DeliveryList;
