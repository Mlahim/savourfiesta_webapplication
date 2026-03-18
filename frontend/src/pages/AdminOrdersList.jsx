import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import {
    Package, ChefHat, Truck, CheckCircle, XCircle, Clock,
    MapPin, Phone, Mail, User, ArrowRight, RotateCcw, AlertTriangle, ArrowLeft
} from "lucide-react";

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
    preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: ChefHat },
    enroute: { label: 'Enroute', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
    delivery_failed: { label: 'Delivery Failed', color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle },
};

const AdminOrdersList = () => {
    const { status } = useParams();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Filter validation
    const currentConfig = STATUS_CONFIG[status];
    
    useEffect(() => {
        if (!currentConfig) {
            navigate('/admin');
            return;
        }
        fetchOrders();
    }, [status, navigate, currentConfig]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/order/admin/all");
            // Filter locally for this specific page
            const filteredOrders = res.data.filter(order => order.status === status);
            setOrders(filteredOrders);
        } catch (err) {
            toast.error("Failed to load orders");
        }
        setLoading(false);
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`/order/admin/${orderId}/status`, { status: newStatus });
            toast.success(res.data.message);
            // If the status changed, it no longer belongs on this filtered page. Remove it.
            setOrders(prev => prev.filter(o => o._id !== orderId));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    if (!currentConfig) return null;
    const HeaderIcon = currentConfig.icon;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-8 px-6 shadow-lg shadow-orange-200">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button 
                            onClick={() => navigate('/admin')}
                            className="text-white/80 hover:text-white flex items-center gap-1.5 text-sm font-bold mb-3 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <HeaderIcon size={28} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight italic capitalize">
                                {currentConfig.label} Orders
                            </h1>
                        </div>
                        <p className="text-orange-100 mt-2 font-medium">Viewing all {status} deliveries</p>
                    </div>
                    <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-3">
                        <Package size={24} className="opacity-80" />
                        <div>
                            <p className="text-xs uppercase tracking-wider font-bold opacity-80">Total Count</p>
                            <p className="text-2xl font-black leading-none">{orders.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${currentConfig.color}`}>
                            <HeaderIcon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No {currentConfig.label} Orders</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">There are currently no orders in this status queue.</p>
                        <button 
                            onClick={() => navigate('/admin')}
                            className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const isExpanded = expandedOrder === order._id;

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
                                >
                                    {/* Order Header - always visible */}
                                    <div
                                        className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentConfig.color}`}>
                                                <HeaderIcon size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-800">#{order._id.slice(-6).toUpperCase()}</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentConfig.color}`}>
                                                        {currentConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    {order.userId?.name && <span className="ml-2">• {order.userId.name}</span>}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-gray-800">Rs.{order.totalAmount?.toFixed(2)}</span>
                                            <span className="text-gray-300 text-xl">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100">
                                            {/* Customer Details */}
                                            <div className="px-6 py-4 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {order.delivery?.name && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <User size={14} className="text-gray-400" /> {order.delivery.name}
                                                    </div>
                                                )}
                                                {order.delivery?.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="text-gray-400" /> {order.delivery.email}
                                                    </div>
                                                )}
                                                {order.delivery?.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={14} className="text-gray-400" /> {order.delivery.phone}
                                                    </div>
                                                )}
                                                {order.delivery?.address && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                                                        <MapPin size={14} className="text-gray-400 flex-shrink-0" /> {order.delivery.address}
                                                        {order.delivery.landmark && <span className="text-gray-400">({order.delivery.landmark})</span>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Items */}
                                            <div className="divide-y divide-gray-50">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="px-6 py-3 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">
                                                                {item.productName || item.productId?.productName || 'Item'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold text-gray-700 text-sm">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(order._id, 'confirmed')}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <CheckCircle size={15} /> Accept Order
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(order._id, 'rejected')}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <XCircle size={15} /> Reject
                                                        </button>
                                                    </>
                                                )}

                                                {order.status === 'confirmed' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(order._id, 'preparing')}
                                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <ArrowRight size={15} /> Mark as Preparing
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(order._id, 'pending')}
                                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                                                        >
                                                            <RotateCcw size={15} /> Undo Accept
                                                        </button>
                                                    </>
                                                )}

                                                {order.status === 'rejected' && (
                                                    <button
                                                        onClick={() => updateStatus(order._id, 'pending')}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <RotateCcw size={15} /> Undo Reject
                                                    </button>
                                                )}

                                                {order.status === 'preparing' && (
                                                    <button
                                                        onClick={() => updateStatus(order._id, 'enroute')}
                                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <ArrowRight size={15} /> Mark as Enroute
                                                    </button>
                                                )}

                                                {order.status === 'enroute' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(order._id, 'delivered')}
                                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <CheckCircle size={15} /> Mark as Delivered
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(order._id, 'delivery_failed')}
                                                            className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                                                        >
                                                            <AlertTriangle size={15} /> Mark Delivery Failed
                                                        </button>
                                                    </>
                                                )}
                                                {(order.status === 'delivered' || order.status === 'delivery_failed') && (
                                                    <span className="px-4 py-2 text-gray-400 text-sm font-medium">No further actions</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersList;
