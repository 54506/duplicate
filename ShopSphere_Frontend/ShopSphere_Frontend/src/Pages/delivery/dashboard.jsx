import { useState, useEffect } from 'react';
import { FaBox, FaDollarSign, FaMapMarkerAlt, FaCheck, FaSignOutAlt, FaBars, FaTruck, FaClipboardList, FaMoneyBillWave, FaTachometerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchDeliveryDashboard, acceptOrder as apiAcceptOrder } from '../../api/delivery_axios';
import { toast } from 'react-hot-toast';

export default function DeliveryDashboard({ onLogout: propLogout }) {
    const navigate = useNavigate();

    const onLogout = () => {
        localStorage.removeItem("accessToken");
        navigate('/delivery');
    };

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeAssignments, setActiveAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await fetchDeliveryDashboard();
                setProfile(data.profile);
                setStats(data.today_stats);
                setActiveAssignments(data.active_assignments);
            } catch (error) {
                console.error("Dashboard load failed:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);




    const handleAcceptOrder = async (assignmentId) => {
        try {
            await apiAcceptOrder(assignmentId);
            toast.success('Order accepted!');
            // Refresh data
            const data = await fetchDeliveryDashboard();
            setActiveAssignments(data.active_assignments);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to accept order");
        }
    };


    return (
        <div className="w-full">

            <div className="bg-white border-b px-8 py-6">
                <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
            </div>


            <div className="p-8">

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
                    <p className="text-gray-500">Pick up new orders and track your earnings.</p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-700 font-semibold">Total Earnings</span>
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                <FaDollarSign className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">₹{profile?.total_earnings || '0.00'}</div>
                        <p className="text-sm text-gray-500 mt-2">Life time</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-700 font-semibold">Completed</span>
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                <FaBox className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{profile?.completed_deliveries || 0}</div>
                        <p className="text-sm text-gray-500 mt-2">Deliveries</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-700 font-semibold">Today's Earnings</span>
                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                <FaDollarSign className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">₹{stats?.total_earnings || '0.00'}</div>
                        <p className="text-sm text-gray-500 mt-2">Today</p>
                    </div>
                </div>


                {activeAssignments.length > 0 ? (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Active Assignments</h3>
                        <div className="space-y-4">
                            {activeAssignments.map((assignment) => (
                                <div key={assignment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-gray-900">Delivery #{assignment.id}</h4>
                                            <p className="text-gray-500">To: {assignment.customer_name}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                                            ₹{assignment.delivery_fee}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2 mb-4 text-gray-500">
                                        <FaMapMarkerAlt className="w-4 h-4 mt-1 flex-shrink-0" />
                                        <p className="text-sm">{assignment.delivery_city}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        {assignment.status === 'assigned' && (
                                            <button
                                                onClick={() => handleAcceptOrder(assignment.id)}
                                                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FaCheck className="w-4 h-4" />
                                                Accept
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/delivery/order/${assignment.id}`)}
                                            className="px-6 py-3 border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Track / View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaBox className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Active Deliveries</h3>
                        <p className="text-gray-500">Check back later for new delivery requests.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
