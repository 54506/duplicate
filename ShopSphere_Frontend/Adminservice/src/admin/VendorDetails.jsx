import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useProducts } from '../context/ProductContext';
import { fetchAllVendors, blockVendor, unblockVendor, approveVendorRequest, fetchProductsByVendor } from '../api/axios';
import { useEffect } from 'react';
import {
    PanelLeftClose,
    PanelLeftOpen,
    ArrowLeft,
    Lock,
    Unlock,
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    AlertTriangle,
    Store,
    ShieldCheck,
    FileText,
    MapPin,
    Building2,
    CreditCard,
    Banknote,
    ChevronDown,
    Package,
    Activity
} from 'lucide-react';

const VendorDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [vendors, setVendors] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [vendorProducts, setVendorProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { updateProductStatus } = useProducts();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const loadData = async () => {
        try {
            const data = await fetchAllVendors();
            setVendors(Array.isArray(data) ? data : []);
            const found = Array.isArray(data) ? data.find(v => v.id.toString() === id.toString()) : null;
            setVendor(found || null);
            if (found) {
                loadProducts(found.id);
            }
        } catch (error) {
            console.error("Failed to load vendor details", error);
        }
    };

    const loadProducts = async (vendorId) => {
        setIsLoadingProducts(true);
        try {
            const productData = await fetchProductsByVendor(vendorId);
            setVendorProducts(productData);
        } catch (error) {
            console.error("Failed to load vendor products:", error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);


    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        navigate('/');
    };

    const updateVendorStatusLocal = async (vendorId, newStatus) => {
        try {
            if (newStatus === 'Blocked') {
                await blockVendor(vendorId, "Policy violation or manual administrative block");
            } else if (newStatus === 'Approved') {
                if (vendor.approval_status === 'pending') {
                    await approveVendorRequest(vendorId);
                } else {
                    await unblockVendor(vendorId);
                }
            }
            await loadData();
        } catch (error) {
            console.error("Action failed:", error);
        }
    };

    const handleStatusToggle = async () => {
        if (!vendor) return;
        const newStatus = vendor.approval_status === 'approved' ? 'Blocked' : 'Approved';
        await updateVendorStatusLocal(vendor.id, newStatus);
    };

    if (!vendor) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Vendor Not Found</h2>
                    <button
                        onClick={() => navigate('/vendors')}
                        className="text-violet-600 hover:underline font-medium"
                    >
                        Go back to Vendors list
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-violet-100 overflow-hidden text-slate-900">
            <Sidebar isSidebarOpen={isSidebarOpen} activePage="Vendors" onLogout={handleLogout} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-500"
                        >
                            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Store className="w-5 h-5 text-slate-800" />
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vendor Profile</h1>
                            </div>
                            <p className="text-xs text-slate-500 font-medium ml-7">Review and manage vendor account details and listings</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-900 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-violet-900/20">A</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50/50">
                    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-500 hover:text-violet-800 transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        {/* Vendor Information Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-4 md:px-8 py-4 border-b border-gray-100 bg-white">
                                <h2 className="text-lg md:text-xl font-bold text-slate-800">Vendor Information</h2>
                            </div>

                            <div className="p-4 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mb-12">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <Store size={12} className="text-violet-500" /> Organizational Identity
                                        </label>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shop Details</p>
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-2">{vendor.shop_name}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed italic">{vendor.shop_description || 'No description provided'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <Building2 size={12} className="text-indigo-500" /> Business Classification
                                        </label>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category & Fee</p>
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-1">{vendor.business_type}</p>
                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Base Shipping: ₹{vendor.shipping_fee || '0.00'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-emerald-500" /> Taxation & Compliance
                                        </label>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Identifiers</p>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">GST</span>
                                                    <span className="font-mono font-bold text-slate-900">{vendor.gst_number || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">PAN</span>
                                                    <span className="font-mono font-bold text-slate-900">{vendor.pan_number || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <CreditCard size={12} className="text-blue-500" /> Settlement Info
                                        </label>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Beneficiary & Holder</p>
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-1">{vendor.bank_holder_name || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-500 font-medium italic">PAN Name: {vendor.pan_name || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <Banknote size={12} className="text-amber-500" /> Banking Credentials
                                        </label>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account / IFSC</p>
                                            <p className="text-sm font-mono font-bold text-slate-900 tracking-tighter uppercase whitespace-nowrap mb-1">{vendor.bank_account_number || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">IFSC: {vendor.bank_ifsc_code || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <MapPin size={12} className="text-rose-500" /> Operations Hub
                                        </label>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Physical Address</p>
                                            <p className="text-xs font-bold text-slate-900 leading-relaxed line-clamp-2">{vendor.address || 'Address not listed'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-slate-100 mb-8 text-slate-900">
                                    <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <FileText className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{vendor.id_type || 'ID Proof'}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{vendor.id_number || 'Verification Doc'}</p>
                                        </div>
                                        {vendor.id_proof_file && (
                                            <button onClick={() => window.open(`http://localhost:8000${vendor.id_proof_file}`, '_blank')} className="ml-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-colors uppercase tracking-widest">
                                                Review
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                                            <CreditCard className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">PAN Physical Card</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{vendor.pan_number || 'Taxation ID'}</p>
                                        </div>
                                        {vendor.pan_card_file && (
                                            <button onClick={() => window.open(`http://localhost:8000${vendor.pan_card_file}`, '_blank')} className="ml-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors uppercase tracking-widest">
                                                Review
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {vendor.approval_status === 'pending' ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => updateVendorStatusLocal(vendor.id, 'Approved')}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-200 border bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Approve Vendor
                                        </button>
                                        <button
                                            onClick={() => updateVendorStatusLocal(vendor.id, 'Blocked')}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-200 border bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject Vendor
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleStatusToggle}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-200 border ${vendor.approval_status === 'approved' && !vendor.is_blocked
                                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100'
                                            }`}
                                    >
                                        {vendor.approval_status === 'approved' && !vendor.is_blocked ? (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                Block Vendor
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-4 h-4" />
                                                Unblock Vendor
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-4 md:px-8 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
                                <h2 className="text-lg md:text-xl font-bold text-slate-800">Vendor Products ({vendorProducts.length})</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#FBFCFD] border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantity</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {isLoadingProducts ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                    Streaming database inventory...
                                                </td>
                                            </tr>
                                        ) : vendorProducts.length > 0 ? (
                                            vendorProducts.map((product) => (
                                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={`http://localhost:8000${product.images[0].image}`}
                                                                    alt={product.name}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                                                    onClick={() => setSelectedProduct(product)}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                                                                    <ShoppingBag size={14} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800 leading-tight uppercase tracking-tight">{product.name}</p>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase italic">ID: {product.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{product.category}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                                                        {new Intl.NumberFormat('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR',
                                                            minimumFractionDigits: 2
                                                        }).format(product.price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 font-bold text-center">{product.quantity}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${product.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            {product.status || 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => setSelectedProduct(product)}
                                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-indigo-100 border border-transparent transition-all"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => updateProductStatus(product.id, product.status === 'active' ? 'inactive' : 'active')}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-transparent ${product.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-white hover:border-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-white hover:border-emerald-100'}`}
                                                            >
                                                                {product.status === 'active' ? 'Block' : 'Unblock'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-16 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] italic opacity-50">
                                                    Zero initial inventory detected
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>



                        {/* Business Documents (Optional Section) */}
                        {/* {vendor.documents && vendor.documents.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-80">
                                <div className="px-8 py-4 border-b border-gray-100 bg-white">
                                    <h2 className="text-lg font-bold text-slate-700 tracking-tight">Business Documents</h2>
                                </div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {vendor.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-200 text-slate-600 rounded-lg group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors font-bold text-[10px]">
                                                    {doc.type}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">{doc.size}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </div>
                </main>
            </div>

            {/* Product Detail Modal */}
            < AnimatePresence >
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh]"
                        >
                            {/* Image Section */}
                            <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex-1 min-h-[300px] mb-4 relative rounded-2xl overflow-hidden bg-white border border-slate-200">
                                    <img
                                        src={selectedProduct.activeImage || (selectedProduct.images && selectedProduct.images.length > 0 ? `http://localhost:8000${selectedProduct.images[0].image}` : '')}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-contain p-4"
                                    />
                                    {!selectedProduct.images || selectedProduct.images.length === 0 && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                            <Package size={48} className="mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Visual Assets</p>
                                        </div>
                                    )}
                                </div>

                                {/* Scrolling Image Gallery */}
                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {selectedProduct.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedProduct({ ...selectedProduct, activeImage: `http://localhost:8000${img.image}` })}
                                                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 transition-all overflow-hidden bg-white ${selectedProduct.activeImage === `http://localhost:8000${img.image}` || (!selectedProduct.activeImage && idx === 0) ? 'border-violet-600 scale-95 shadow-lg' : 'border-transparent hover:border-slate-200'}`}
                                            >
                                                <img src={`http://localhost:8000${img.image}`} alt="Preview" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="w-full md:w-1/2 p-8 flex flex-col bg-white">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-violet-600" />
                                        Inventory Audit
                                    </h2>
                                    <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <ChevronDown className="w-5 h-5 text-slate-400 rotate-90" />
                                    </button>
                                </div>

                                <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Product Name</p>
                                        <p className="text-lg font-bold text-slate-900 leading-tight uppercase">{selectedProduct.name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${selectedProduct.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                {selectedProduct.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                            <p className="text-xs font-bold text-slate-700">{selectedProduct.category}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Price</p>
                                            <p className="text-lg font-black text-slate-900 font-mono">₹{selectedProduct.price?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Units</p>
                                            <p className="text-lg font-black text-slate-900">{selectedProduct.quantity}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Associated Merchant</p>
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <Store className="w-5 h-5 text-indigo-500" />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 text-sm leading-none mb-1">{vendor.shop_name}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {vendor.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-8"
                                >
                                    Dismiss Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorDetails;
