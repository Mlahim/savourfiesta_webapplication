import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Package, Clock, CheckCircle, ChefHat, Truck, XCircle, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

const STATUS_STEPS = [
  { key: 'pending', label: 'Placed', icon: Clock, color: 'text-yellow-500' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-purple-500' },
  { key: 'enroute', label: 'Enroute', icon: Truck, color: 'text-indigo-500' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
];

const StatusTimeline = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
        <XCircle size={16} className="text-red-500" />
        <span className="text-sm font-bold text-red-600">Order Rejected</span>
      </div>
    );
  }

  if (status === 'delivery_failed') {
    return (
      <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
        <AlertTriangle size={16} className="text-red-500" />
        <span className="text-sm font-bold text-red-600">Delivery Failed</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
      {STATUS_STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isDone = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center min-w-[52px]">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
                  ${isCurrent ? `${step.color} bg-white ring-2 ring-current scale-110` :
                    isDone ? `${step.color} bg-white` :
                      'text-gray-300 bg-gray-50'
                  }`}
              >
                <StepIcon size={14} />
              </div>
              <span className={`text-[10px] mt-0.5 font-semibold ${isDone ? 'text-gray-700' : 'text-gray-300'}`}>
                {step.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[12px] rounded-full mt-[-10px] ${idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Orders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/order");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (token) fetchOrders();
  }, [token]);

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );

  if (!orders.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <Package size={60} className="text-orange-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
        <p className="text-gray-500">When you place an order, it will appear here.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
          <Package size={32} className="text-orange-500" /> Your Orders
        </h1>

        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = !!expandedOrders[order._id];
            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div>
                    <span className="font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-xl text-orange-600">Rs.{order.totalAmount?.toFixed(2)}</span>
                    <button className="text-gray-400 hover:text-orange-500 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="px-6 py-3 bg-gray-50/50">
                  <StatusTimeline status={order.status} />
                </div>

                {/* Expandable Items Details */}
                {isExpanded && (
                  <div className="divide-y divide-gray-50 border-t border-gray-100 bg-white">
                    {/* Delivery Address Details */}
                    {order.delivery && (
                      <div className="px-6 py-4 bg-orange-50/30">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Delivery Details</h4>
                        <p className="text-sm font-semibold text-gray-800">{order.delivery.name} ({order.delivery.phone})</p>
                        <p className="text-sm text-gray-600 mt-1">{order.delivery.address} {order.delivery.landmark && `(Near: ${order.delivery.landmark})`}</p>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="px-6 flex flex-col">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2 tracking-wider">Items Breakdown</h4>
                      {order.items.map((item, idx) => {
                        const name = item.productName || item.productId?.productName || 'Item';
                        const category = item.productId?.productCategory || '';

                        return (
                          <div key={idx} className="py-3 flex justify-between items-center border-b border-gray-50 last:border-0">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{name}</p>
                              {category && <p className="text-xs text-gray-400">{category}</p>}
                              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-700">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
