import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    ArrowLeft, CheckCircle, XCircle, Mail, Phone, MapPin,
    Calendar, ShieldCheck, User, FileText, AlertTriangle,
    Activity, Loader2, Truck, CreditCard, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDeliveryAgentDetail, approveDeliveryAgent, rejectDeliveryAgent, blockDeliveryAgent, unblockDeliveryAgent } from '../api/axios';

const DeliveryReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const loadAgentData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchDeliveryAgentDetail(id);
                setAgent(data);
            } catch (error) {
                console.error("Failed to load agent details:", error);
                alert("Failed to load agent profile");
            } finally {
                setIsLoading(false);
            }
        };
        loadAgentData();
    }, [id]);

    const handleAction = async (action) => {
        setIsActioning(true);
        try {
            if (action === 'Approved') {
                await approveDeliveryAgent(id, "Approved by admin");
                alert("Agent approved");
            } else if (action === 'Rejected') {
                const reason = prompt("Rejection reason:") || "Rejected by admin";
                await rejectDeliveryAgent(id, reason);
                alert("Agent rejected");
            } else if (action === 'Blocked') {
                const reason = prompt("Blocking reason:") || "Blocked by admin";
                await blockDeliveryAgent(id, reason);
                alert("Agent blocked");
            } else if (action === 'Unblocked') {
                await unblockDeliveryAgent(id);
                alert("Agent unblocked");
            }
            navigate('/delivery/agents');
        } catch (error) {
            console.error("Action execution failed:", error);
            alert("Action failed");
        } finally {
            setIsActioning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Agent Not Found</h2>
                    <button onClick={() => navigate(-1)} className="text-emerald-600 font-bold underline">Go Back</button>
                </div>
            </div>
        );
    }

    const canApprove = agent.approval_status === 'pending';
    const canReject = agent.approval_status === 'pending';
    const canBlock = agent.approval_status === 'approved' && !agent.is_blocked;
    const canUnblock = agent.is_blocked;

    const base_url = "http://localhost:8000";

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
            <Sidebar isSidebarOpen={isSidebarOpen} activePage="Delivery Agents" onLogout={() => navigate('/')} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl text-slate-400">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900">Fleet Security Audit</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto space-y-8 pb-32">
                        {/* Profile Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-emerald-100 uppercase">
                                    {agent.user_username?.charAt(0) || 'A'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${agent.is_blocked ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            agent.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {agent.is_blocked ? 'Blocked' : agent.approval_status}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {agent.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900">{agent.user_username || 'Delivery Agent'}</h2>
                                    <p className="text-slate-500 font-medium">{agent.user_email}</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Personal & Vehicle Info */}
                            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <User className="w-4 h-4 text-emerald-600" /> Profiling & Personal
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                                            <p className="text-sm font-bold">{agent.user_username || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Phone</label>
                                            <p className="text-sm font-bold">{agent.phone_number}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Date of Birth</label>
                                            <p className="text-sm font-bold">{agent.date_of_birth ? new Date(agent.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Joined On</label>
                                            <p className="text-sm font-bold">{new Date(agent.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Registered Address</label>
                                        <p className="text-sm font-medium leading-relaxed">
                                            {agent.address}<br />
                                            {agent.city}, {agent.state} - {agent.postal_code}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                                        <Truck className="w-8 h-8 text-emerald-600" />
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Logistic Capability</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">{agent.vehicle_type} - {agent.vehicle_number}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Bank Details */}
                            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <Landmark className="w-4 h-4 text-indigo-600" /> Financial Routing
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Settlement Bank</label>
                                        <p className="text-sm font-bold">{agent.bank_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Account Holder</label>
                                        <p className="text-sm font-bold">{agent.bank_holder_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <div>
                                            <label className="text-[10px] font-bold text-indigo-400 uppercase mb-1 block">Account No</label>
                                            <p className="text-sm font-mono font-bold tracking-tight text-slate-900">{agent.bank_account_number}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-indigo-400 uppercase mb-1 block">IFSC</label>
                                            <p className="text-sm font-mono font-bold tracking-tight text-slate-900">{agent.bank_ifsc_code}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Documentation */}
                            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 lg:col-span-2">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" /> Compliance Dossier
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { title: 'Identity Proof', type: agent.id_type, detail: agent.id_number, file: agent.id_proof_file, color: 'indigo' },
                                        { title: 'Driving License', type: 'License No', detail: agent.license_number, expiry: agent.license_expires, file: agent.license_file, color: 'blue' },
                                        { title: 'Vehicle RC', type: 'Registration No', detail: agent.vehicle_number, file: agent.vehicle_registration, color: 'emerald' },
                                        { title: 'Vehicle Insurance', type: 'Policy Doc', detail: 'Verification Scan', file: agent.vehicle_insurance, color: 'rose' }
                                    ].map((doc, idx) => (
                                        doc.file && (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-500/50 cursor-pointer transition-all"
                                                onClick={() => window.open(`${base_url}${doc.file}`, '_blank')}>
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-${doc.color}-600 bg-white border border-slate-200`}>
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter truncate">{doc.type}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-gray-200/50">
                                                    <p className="text-[10px] font-mono font-bold text-slate-600 truncate">{doc.detail}</p>
                                                    {doc.expiry && (
                                                        <p className="text-[9px] font-bold text-rose-500 mt-1 uppercase tracking-widest">Expires: {new Date(doc.expiry).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>

                {/* Status Bar */}
                <div className="fixed bottom-0 right-0 left-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 z-40" style={{ marginLeft: isSidebarOpen ? '280px' : '8rem' }}>
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fleet Authority Control</p>
                            <h4 className="font-bold text-slate-900">Decision Required</h4>
                        </div>
                        <div className="flex items-center gap-3">
                            {canReject && (
                                <button onClick={() => handleAction('Rejected')} className="px-6 py-3 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all font-bold text-slate-600">
                                    Reject
                                </button>
                            )}
                            {canBlock && (
                                <button onClick={() => handleAction('Blocked')} className="px-6 py-3 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all font-bold">
                                    Block Access
                                </button>
                            )}
                            {canUnblock && (
                                <button onClick={() => handleAction('Unblocked')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold">
                                    Grant Access
                                </button>
                            )}
                            {canApprove && (
                                <button onClick={() => handleAction('Approved')} className="px-10 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Final Approval
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryReview;
