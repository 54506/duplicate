import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShieldCheck,
    Building2,
    User,
    FileText,
    AlertTriangle,
    Clock,
    Activity,
    PanelLeftClose,
    PanelLeftOpen,
    Loader2,
    Package,
    Store,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { fetchVendorRequests, fetchAllVendors, fetchVendorDetail, approveVendorRequest, rejectVendorRequest, blockVendor, unblockVendor } from '../api/axios';
import { useNotifications } from '../context/NotificationContext';

const VendorReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [vendors, setVendors] = useState([]);
    const { markAsRead } = useNotifications();
    const [vendor, setVendor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const hasMarkedRef = useRef(false);

    useEffect(() => {
        const loadVendorData = async () => {
            setIsLoading(true);
            try {
                // Fetch specific vendor data directly
                const data = await fetchVendorDetail(id);
                setVendor(data);

                if (!hasMarkedRef.current && data.notifId) {
                    markAsRead(data.notifId);
                    hasMarkedRef.current = true;
                }
            } catch (error) {
                console.error("Failed to load vendor details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadVendorData();
    }, [id, markAsRead]);

    const handleActionClick = (action) => {
        setPendingAction(action);
        setIsActionModalOpen(true);
    };

    const confirmAction = async () => {
        if (!pendingAction || !vendor) return;

        setIsActioning(true);
        setIsActionModalOpen(false);

        try {
            if (pendingAction === "Approved") {
                await approveVendorRequest(vendor.id);
            } else if (pendingAction === "Blocked" || pendingAction === "Suspended") {
                await blockVendor(vendor.id, "Actioned via Management Review");
            } else if (pendingAction === "Unblocked") {
                await unblockVendor(vendor.id);
            } else {
                await rejectVendorRequest(vendor.id, "Declined via Security Review");
            }
            navigate('/vendors');
        } catch (error) {
            console.error("Action execution failed:", error);
        } finally {
            setIsActioning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full shadow-2xl"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Loading Profile</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Fetching vendor audit data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="text-center max-w-sm px-6">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">The vendor credential you are looking for is either archived or the token has expired.</p>
                    <button
                        onClick={() => navigate('/vendors')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 hover:scale-105 transition-all"
                    >
                        Return to Registry
                    </button>
                </div>
            </div>
        );
    }

    // Determine available actions based on current status
    const canApprove = vendor.approval_status === 'pending';
    const canBlock = vendor.approval_status === 'approved' && !vendor.is_blocked;
    const canUnblock = vendor.is_blocked;
    const canReject = vendor.approval_status === 'pending';

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
            <Sidebar isSidebarOpen={isSidebarOpen} activePage="Vendors" onLogout={() => window.location.href = '/'} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-100 px-8 h-20 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-slate-200 hidden sm:block mx-2" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                                {vendor.approval_status === 'approved' ? 'Merchant Profile' : 'Security Review'}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3 text-indigo-500" /> @{vendor.user_username || vendor.id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" /> Registry Node
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]">
                    <div className="max-w-5xl mx-auto space-y-8 pb-32">
                        {/* Elegant Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-indigo-100">
                                    {(vendor.shop_name || "V").charAt(0)}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${vendor.is_blocked ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            vendor.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {vendor.is_blocked ? 'Blocked' : vendor.approval_status}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full border border-slate-100">Registry ID: {vendor.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{vendor.shop_name}</h2>
                                    <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed">{vendor.shop_description || "No description available for this partner profile."}</p>
                                </div>
                                <div className="hidden lg:block text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registration Date</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(vendor.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>
                            </div>

                            {(vendor.blocked_reason || vendor.rejection_reason) && (
                                <div className="mt-8 bg-rose-50/50 border border-rose-100 rounded-2xl p-5 flex items-start gap-4">
                                    <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Status Remarks</p>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{vendor.blocked_reason || vendor.rejection_reason}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Detailed Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Business Identity</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Official Designation</label>
                                            <p className="text-sm font-semibold text-slate-900">{vendor.shop_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Model Classification</label>
                                            <p className="text-xs font-bold text-indigo-600 uppercase">{vendor.business_type}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Registered Headquarters</label>
                                            <p className="text-sm font-medium text-slate-700 flex items-start gap-2 leading-relaxed">
                                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" /> {vendor.address}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Tax ID (GSTIN)</label>
                                            <p className="text-sm font-mono font-semibold text-slate-900 tracking-tight">{vendor.gst_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Tax ID (PAN)</label>
                                            <p className="text-sm font-mono font-semibold text-slate-900 tracking-tight">{vendor.pan_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Legal PAN Name</label>
                                            <p className="text-sm font-semibold text-slate-900">{vendor.pan_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Base Logisitics Fee</label>
                                            <p className="text-sm font-bold text-emerald-600">₹{parseFloat(vendor.shipping_fee || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/60 shadow-sm">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Settlement Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Beneficiary Name</label>
                                            <p className="text-sm font-semibold text-slate-900">{vendor.bank_holder_name || 'N/A'}</p>
                                        </div>
                                        <div />
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Account Number</label>
                                            <p className="text-sm font-mono font-semibold text-slate-900">{vendor.bank_account_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">IFSC Code</label>
                                            <p className="text-sm font-mono font-semibold text-slate-900">{vendor.bank_ifsc_code || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/60 shadow-sm">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Verification Documents</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vendor.id_proof_file && (
                                            <div className="group p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-indigo-500/30 transition-all cursor-pointer"
                                                onClick={() => window.open(`http://localhost:8000${vendor.id_proof_file}`, '_blank')}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 border border-slate-200">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{vendor.id_type || 'Identity Proof'}</p>
                                                        <p className="text-[10px] font-medium text-slate-400 uppercase">{vendor.id_number || 'Official ID'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {vendor.pan_card_file && (
                                            <div className="group p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-indigo-500/30 transition-all cursor-pointer"
                                                onClick={() => window.open(`http://localhost:8000${vendor.pan_card_file}`, '_blank')}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 border border-slate-200">
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">PAN Verification</p>
                                                        <p className="text-[10px] font-medium text-slate-400 uppercase">{vendor.pan_number || 'Tax Asset'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!vendor.id_proof_file && !vendor.pan_card_file && (
                                            <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No documentation found</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Contact & Registry Info */}
                            <div className="space-y-8">
                                <section className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Contact Node</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Official Email</p>
                                            <p className="text-sm font-semibold text-slate-900 truncate">{vendor.user_email || 'Unspecified'}</p>
                                        </div>

                                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Phone</p>
                                            <p className="text-sm font-semibold text-slate-900">{vendor.user_phone || 'Unspecified'}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="p-8 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ShieldCheck className="w-4 h-4 text-indigo-200" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Audit Status</span>
                                        </div>
                                        <p className="text-xs font-medium text-indigo-50 leading-relaxed mb-6">This partner profile has been fully synchronized with the central marketplace registry.</p>
                                        <div className="h-1.5 w-full bg-indigo-500 rounded-full overflow-hidden">
                                            <div className="h-full bg-white w-full rounded-full" />
                                        </div>
                                    </div>
                                    <Activity className="absolute -bottom-8 -right-8 w-32 h-32 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                </section>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Action Bar */}
                <div className={`fixed bottom-0 right-0 left-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-6 z-40 transition-all duration-300`} style={{ left: isSidebarOpen ? '280px' : '80px' }}>
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div>
                            <h4 className="text-base font-bold text-slate-900">Administrative Governance</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Decision finalized upon authentication</p>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            {canBlock && (
                                <button
                                    onClick={() => handleActionClick('Blocked')}
                                    disabled={isActioning}
                                    className="flex-1 sm:flex-none px-8 py-3.5 bg-white border border-slate-200 text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all disabled:opacity-50"
                                >
                                    Force Block
                                </button>
                            )}

                            {canUnblock && (
                                <button
                                    onClick={() => handleActionClick('Unblocked')}
                                    disabled={isActioning}
                                    className="flex-1 sm:flex-none px-8 py-3.5 bg-white border border-slate-200 text-emerald-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-50"
                                >
                                    Unblock Access
                                </button>
                            )}

                            {canReject && (
                                <button
                                    onClick={() => handleActionClick('Rejected')}
                                    disabled={isActioning}
                                    className="flex-1 sm:flex-none px-8 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                                >
                                    Reject Entry
                                </button>
                            )}

                            {canApprove && (
                                <button
                                    onClick={() => handleActionClick('Approved')}
                                    disabled={isActioning}
                                    className="flex-1 sm:flex-none px-10 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 min-w-[200px]"
                                >
                                    {isActioning ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Authorizing...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4 text-indigo-200" />
                                            Publish Clearance
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isActionModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                            onClick={() => setIsActionModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-[3rem] p-16 max-w-sm w-full relative z-10 shadow-2xl text-center"
                        >
                            <div className="w-28 h-28 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-12 border border-rose-100 mx-auto">
                                <AlertTriangle className="w-14 h-14 text-rose-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Review Execution</h2>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed mb-12 px-2 italic">
                                Modifying partner status to <span className="text-slate-900 font-black uppercase tracking-[0.2em] underline decoration-indigo-600/40">{pendingAction}</span>. Confirm?
                            </p>
                            <div className="flex flex-col gap-5">
                                <button
                                    onClick={confirmAction}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    Execute Order
                                </button>
                                <button
                                    onClick={() => setIsActionModalOpen(false)}
                                    className="w-full py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Decline Operation
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default VendorReview;
