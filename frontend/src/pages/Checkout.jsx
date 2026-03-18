import React, { useState, useContext, useEffect } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, User, Landmark, CreditCard, ShoppingBag, Banknote, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const Checkout = () => {
    const { token, cartItems, updateCartCount, clearCart } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        landmark: ""
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState(0);

    // Fetch Delivery Settings
    useEffect(() => {
        axios.get("/settings?key=deliveryCharge")
            .then(res => {
                if (res.data.deliveryCharge !== undefined && res.data.deliveryCharge !== null) {
                    setDeliveryCharge(Number(res.data.deliveryCharge));
                }
            })
            .catch(err => console.error("Failed to fetch delivery settings:", err));
    }, []);

    // Pre-fill from profile if logged in
    useEffect(() => {
        if (token) {
            axios.get("/profile").then(res => {
                setForm(prev => ({
                    ...prev,
                    name: res.data.name || "",
                    email: res.data.email || "",
                    phone: res.data.phone || "",
                    address: res.data.address || ""
                }));
            }).catch(() => { });
        }
    }, [token]);

    // Redirect if cart is empty
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            navigate("/cart");
        }
    }, [cartItems, navigate]);

    const subtotal = cartItems?.reduce((acc, item) => {
        const price = item.price || item.productId?.productPrice || 0;
        return acc + (price * item.quantity);
    }, 0) || 0;

    const totalAmount = subtotal + deliveryCharge;

    const validate = () => {
        const newErrors = {};
        const pkPhoneRegex = /^((\+92)|(0092)|(92)|(0))?3[0-9]{2}[\s-]?[0-9]{7}$/;

        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";

        if (!form.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!pkPhoneRegex.test(form.phone.trim())) newErrors.phone = "Enter a valid pk phone number (e.g. 0300 1234567)";

        if (!form.address.trim()) newErrors.address = "Delivery address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const orderItems = cartItems.map(item => ({
                productId: item.productId?._id || item.productId,
                productName: item.productId?.productName || item.productName || '',
                quantity: item.quantity,
                price: item.price || item.productId?.productPrice || 0
            }));

            await axios.post("/order", {
                items: orderItems,
                delivery: form,
                deliveryCharge,
                totalAmount
            });

            // Clear cart
            if (token) {
                await updateCartCount();
            } else {
                await clearCart();
            }

            toast.success("Order placed successfully!");
            navigate("/order-success");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to place order");
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate("/cart")}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Cart
                </button>

                <div className="grid md:grid-cols-5 gap-6">

                    {/* Delivery Form - 3 cols */}
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MapPin size={22} /> Delivery Information
                                </h2>
                                <p className="text-white/70 text-sm mt-1">Where should we deliver your order?</p>
                            </div>

                            <form id="checkout-form" onSubmit={handleSubmit} className="p-6 space-y-4">

                                {/* Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1.5">
                                        <User size={15} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Email * */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1.5">
                                        <Mail size={15} /> Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Phone * */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1.5">
                                        <Phone size={15} /> Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="+92 300 1234567"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                {/* Address * */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1.5">
                                        <MapPin size={15} /> Delivery Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800 resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                        placeholder="House #, Street, Area, City"
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>

                                {/* Landmark */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1.5">
                                        <Landmark size={15} /> Landmark <span className="text-gray-400 text-xs">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={form.landmark}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800"
                                        placeholder="Near a famous place, mosque, park, etc."
                                    />
                                </div>

                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Banknote size={20} className="text-green-600" /> Payment Method
                                </h3>
                            </div>

                            <div className="p-6">
                                <div className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50 flex items-center justify-between cursor-default transition-all shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 text-white">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-base">Cash on Delivery (COD)</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Pay our rider when you receive your order.</p>
                                        </div>
                                    </div>
                                    <Banknote size={28} className="text-orange-300 opacity-60" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary - 2 cols */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag size={20} /> Order Summary
                                </h3>
                            </div>

                            <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                                {cartItems?.map((item, idx) => {
                                    const name = item.productId?.productName || item.productName || 'Item';
                                    const price = item.price || item.productId?.productPrice || 0;
                                    return (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gray-700 text-sm">Rs.{(price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-800">Rs.{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-gray-500 font-medium">Delivery</span>
                                    {deliveryCharge === 0 ? (
                                        <span className="font-bold text-green-600">Free</span>
                                    ) : (
                                        <span className="font-bold text-gray-800">Rs.{deliveryCharge.toFixed(2)}</span>
                                    )}
                                </div>
                                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center mb-6">
                                    <span className="text-lg font-black text-gray-800">Total</span>
                                    <span className="text-lg font-black text-orange-600">Rs.{totalAmount.toFixed(2)}</span>
                                </div>

                                {/* Submit Button moved here */}
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <CreditCard size={20} /> {submitting ? "Placing Order..." : "Place Order"}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
