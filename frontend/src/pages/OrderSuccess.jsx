import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, List } from "lucide-react";

const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-800 mb-3">Order Placed!</h1>
                <p className="text-gray-500 mb-8">
                    Your order has been placed successfully. We'll prepare your delicious food and deliver it to your doorstep soon!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate("/")}
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Home size={18} /> Back to Menu
                    </button>
                    <button
                        onClick={() => navigate("/orders")}
                        className="bg-white text-gray-700 px-6 py-3 rounded-full font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <List size={18} /> View Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
