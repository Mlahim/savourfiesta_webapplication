import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import {
    Package, ClipboardList, ChefHat, Truck, CheckCircle, XCircle, Clock,
    MapPin, Phone, Mail, User, Eye, EyeOff, ToggleLeft, ToggleRight,
    Flame, Drumstick, CookingPot, ArrowRight, Pencil, X, Save, Tag, Percent,
    RotateCcw, AlertTriangle, Settings, Plus, Upload, ImageIcon, Trash2, TrendingUp, DollarSign, Activity, Calendar
} from "lucide-react";

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'enroute', 'delivered', 'delivery_failed'];

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, next: 'confirmed' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle, next: 'preparing' },
    preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: ChefHat, next: 'enroute' },
    enroute: { label: 'Enroute', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: Truck, next: 'delivered' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, next: null },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, next: null },
    delivery_failed: { label: 'Delivery Failed', color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle, next: null },
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial load
        if (activeTab === "orders") fetchOrders(true);
        else if (activeTab === "menu") fetchMenu(true);
        else if (activeTab === "analytics") {
            fetchOrders(true);
            fetchMenu(true);
        }

        // Set up real-time polling for dashboards that need live data
        let interval;
        if (activeTab === "orders" || activeTab === "analytics") {
            interval = setInterval(() => {
                fetchOrders(false); // background fetch, no loading spinner
            }, 5000); // 5 seconds polling for real-time feel
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTab]);

    const fetchOrders = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await axios.get("/order/admin/all");
            setOrders(res.data);
        } catch (err) {
            if (showLoading) toast.error("Failed to load orders");
        }
        if (showLoading) setLoading(false);
    };

    const fetchMenu = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await axios.get("/menu");
            setMenuItems(res.data);
        } catch (err) {
            if (showLoading) toast.error("Failed to load menu");
        }
        if (showLoading) setLoading(false);
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await axios.put(`/order/admin/${orderId}/status`, { status: newStatus });
            toast.success(res.data.message);
            setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const toggleAvailability = async (itemId) => {
        try {
            const res = await axios.put(`/menu/${itemId}/availability`);
            toast.success(res.data.message);
            setMenuItems(prev => prev.map(m => m._id === itemId ? res.data.item : m));
        } catch (err) {
            toast.error("Failed to update availability");
        }
    };

    const updatePrice = async (itemId, priceData) => {
        try {
            const res = await axios.put(`/menu/${itemId}/price`, priceData);
            toast.success(res.data.message);
            setMenuItems(prev => prev.map(m => m._id === itemId ? res.data.item : m));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update price");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-8 px-6 shadow-lg shadow-orange-200">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-black tracking-tight italic">Admin Dashboard</h1>
                    <p className="text-orange-100 mt-1 font-medium">Manage orders and menu items</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 mt-6">
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0
              ${activeTab === "orders"
                                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600"
                            }`}
                    >
                        <ClipboardList size={18} /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab("menu")}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0
              ${activeTab === "menu"
                                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600"
                            }`}
                    >
                        <ChefHat size={18} /> Menu
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0
              ${activeTab === "settings"
                                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600"
                            }`}
                    >
                        <Truck size={18} /> Delivery
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0
              ${activeTab === "analytics"
                                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600"
                            }`}
                    >
                        <TrendingUp size={18} /> Analytics
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : activeTab === "orders" ? (
                    <OrdersPanel
                        orders={orders}
                        navigate={navigate}
                    />
                ) : activeTab === "menu" ? (
                    <MenuPanel 
                        menuItems={menuItems} 
                        toggleAvailability={toggleAvailability} 
                        updatePrice={updatePrice} 
                        setMenuItems={setMenuItems}
                    />
                ) : activeTab === "analytics" ? (
                    <AnalyticsPanel orders={orders} menuItems={menuItems} />
                ) : (
                    <SettingsPanel />
                )}
            </div>
        </div>
    );
};

/* ============================================================
   ORDERS PANEL (Summary Cards)
   ============================================================ */
const OrdersPanel = ({ orders, navigate }) => {
    // Calculate counts for each status
    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Orders Overview</h2>
                    <p className="text-sm text-gray-500">Select a category to view detailed tracking</p>
                </div>
                <div className="bg-orange-50 px-4 py-2 rounded-xl text-orange-700 font-bold text-sm border border-orange-100">
                    Total Lifetime Orders: {orders.length}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
                    const count = statusCounts[statusKey] || 0;
                    const StatusIcon = config.icon;
                    
                    return (
                        <div
                            key={statusKey}
                            onClick={() => navigate(`/admin/orders/${statusKey}`)}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${config.color}`}>
                                    <StatusIcon size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-800 leading-none">
                                        {count}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto">
                                <h3 className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                                    {config.label}
                                </h3>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ============================================================
   MENU PANEL
   ============================================================ */
const MenuPanel = ({ menuItems, toggleAvailability, updatePrice, setMenuItems }) => {
    const [editingId, setEditingId] = useState(null);
    const [priceForm, setPriceForm] = useState({ newPrice: '', oldPrice: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [showSubCatDropdown, setShowSubCatDropdown] = useState(false);
    const [newItemForm, setNewItemForm] = useState({
        productName: '',
        productCategory: '',
        productSubCategory: '',
        productPrice: '',
        productDescription: '',
        image: null,
        imagePreview: null
    });

    const startEditing = (item) => {
        setEditingId(item._id);
        setPriceForm({
            newPrice: item.discountedPrice || item.productPrice || '',
            oldPrice: item.originalPrice || '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setPriceForm({ newPrice: '', oldPrice: '' });
    };

    const handleSavePrice = async (itemId) => {
        const { newPrice, oldPrice } = priceForm;
        if (!newPrice || isNaN(newPrice)) {
            toast.error('Please enter a valid new price');
            return;
        }

        if (oldPrice && !isNaN(oldPrice) && Number(oldPrice) > Number(newPrice)) {
            // Discount mode: oldPrice is the original, newPrice is the discounted
            await updatePrice(itemId, {
                originalPrice: Number(oldPrice),
                discountedPrice: Number(newPrice),
            });
        } else {
            // Simple price update
            await updatePrice(itemId, {
                productPrice: Number(newPrice),
            });
        }
        cancelEditing();
    };

    const handleRemoveDiscount = async (itemId, currentOriginalPrice) => {
        await updatePrice(itemId, {
            removeDiscount: true,
            productPrice: currentOriginalPrice,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItemForm(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        if (!newItemForm.productName || !newItemForm.productCategory || !newItemForm.productPrice) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("productName", newItemForm.productName.trim());
        
        // Normalize category to Title Case so they group properly
        const normalizedCategory = newItemForm.productCategory.trim().replace(/\b\w/g, c => c.toUpperCase());
        formData.append("productCategory", normalizedCategory);
        
        if (newItemForm.productSubCategory) formData.append("productSubCategory", newItemForm.productSubCategory.trim());
        formData.append("productPrice", newItemForm.productPrice);
        if (newItemForm.productDescription) formData.append("productDescription", newItemForm.productDescription.trim());
        if (newItemForm.image) {
            formData.append("image", newItemForm.image);
        }

        try {
            const res = await axios.post("/menu", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Menu item added successfully!");
            setMenuItems(prev => [...prev, res.data]);
            setShowAddForm(false);
            setNewItemForm({
                productName: '',
                productCategory: '',
                productSubCategory: '',
                productPrice: '',
                productDescription: '',
                image: null,
                imagePreview: null
            });
        } catch (err) {
            console.error("Add item error:", err);
            toast.error(err.response?.data?.message || "Failed to add menu item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/menu/${itemToDelete._id}`);
            toast.success("Menu item deleted successfully");
            setMenuItems(prev => prev.filter(m => m._id !== itemToDelete._id));
            setItemToDelete(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete item");
        } finally {
            setIsDeleting(false);
        }
    };

    // Group by category
    const grouped = menuItems.reduce((acc, item) => {
        const cat = item.productCategory || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const categoryIcons = {
        "Fast Food": Flame,
        "BBQ": Drumstick,
        "Rice": CookingPot,
    };

    // Extract unique categories for the dropdown
    const availableCategories = [...new Set(menuItems.map(item => item.productCategory).filter(Boolean))];

    // Extract subcategories dynamically based on the form's category (or show all if no category)
    const availableSubCategories = [...new Set(
        menuItems
            .filter(item => !newItemForm.productCategory || item.productCategory === newItemForm.productCategory)
            .map(item => item.productSubCategory)
            .filter(Boolean)
    )];

    return (
        <div className="space-y-8">
            {/* Add New Item Header Section */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Menu Catalog</h2>
                    <p className="text-sm text-gray-500">Manage your dishes and availability</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                    {showAddForm ? <X size={18} /> : <Plus size={18} />}
                    {showAddForm ? "Cancel" : "Add New Item"}
                </button>
            </div>

            {/* Add Item Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-orange-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-orange-500" /> Add New Menu Item
                    </h3>
                    <form onSubmit={handleAddMenuItem} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                                    <input 
                                        type="text" 
                                        value={newItemForm.productName}
                                        onChange={e => setNewItemForm(prev => ({...prev, productName: e.target.value}))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                        placeholder="e.g. Chicken Biryani"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                                        <input 
                                            type="text" 
                                            value={newItemForm.productCategory}
                                            onChange={e => {
                                                setNewItemForm(prev => ({...prev, productCategory: e.target.value}));
                                                setShowCatDropdown(true);
                                            }}
                                            onFocus={() => setShowCatDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowCatDropdown(false), 200)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                            placeholder="e.g. Rice"
                                            required
                                            autoComplete="off"
                                        />
                                        {showCatDropdown && availableCategories.filter(c => c.toLowerCase().includes(newItemForm.productCategory.toLowerCase())).length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {availableCategories
                                                    .filter(c => c.toLowerCase().includes(newItemForm.productCategory.toLowerCase()))
                                                    .map(cat => (
                                                        <li 
                                                            key={cat} 
                                                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNewItemForm(prev => ({...prev, productCategory: cat}));
                                                                setShowCatDropdown(false);
                                                            }}
                                                        >
                                                            {cat}
                                                        </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Category</label>
                                        <input 
                                            type="text" 
                                            value={newItemForm.productSubCategory}
                                            onChange={e => {
                                                setNewItemForm(prev => ({...prev, productSubCategory: e.target.value}));
                                                setShowSubCatDropdown(true);
                                            }}
                                            onFocus={() => setShowSubCatDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowSubCatDropdown(false), 200)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                            placeholder="Optional"
                                            autoComplete="off"
                                        />
                                        {showSubCatDropdown && availableSubCategories.filter(c => c.toLowerCase().includes(newItemForm.productSubCategory.toLowerCase())).length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {availableSubCategories
                                                    .filter(c => c.toLowerCase().includes(newItemForm.productSubCategory.toLowerCase()))
                                                    .map(subCat => (
                                                        <li 
                                                            key={subCat} 
                                                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNewItemForm(prev => ({...prev, productSubCategory: subCat}));
                                                                setShowSubCatDropdown(false);
                                                            }}
                                                        >
                                                            {subCat}
                                                        </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rs.) *</label>
                                    <input 
                                        type="number" 
                                        value={newItemForm.productPrice}
                                        onChange={e => setNewItemForm(prev => ({...prev, productPrice: e.target.value}))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                        placeholder="e.g. 1200"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image and Description */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image Upload</label>
                                    <div className="flex items-start gap-4">
                                        <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-colors h-32">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm font-medium text-gray-600">Choose Image or Drop Here</span>
                                            <span className="text-xs text-gray-400 mt-1">JPEG, PNG up to 5MB</span>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden" 
                                            />
                                        </label>
                                        {newItemForm.imagePreview ? (
                                            <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 relative group">
                                                <img src={newItemForm.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewItemForm(prev => ({...prev, image: null, imagePreview: null}))}
                                                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center flex-shrink-0 text-gray-400">
                                                <ImageIcon className="w-8 h-8 opacity-50 mb-1" />
                                                <span className="text-xs font-medium">Preview</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        value={newItemForm.productDescription}
                                        onChange={e => setNewItemForm(prev => ({...prev, productDescription: e.target.value}))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 h-24 resize-none"
                                        placeholder="Add a tasty description..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all 
                                    ${isSubmitting 
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg cursor-pointer"}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> Save Item
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {Object.entries(grouped).map(([category, items]) => {
                const CatIcon = categoryIcons[category] || ChefHat;
                return (
                    <div key={category}>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CatIcon size={20} className="text-orange-500" /> {category}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(item => {
                                const isEditing = editingId === item._id;
                                const hasDiscount = item.originalPrice && item.discountedPrice;

                                return (
                                    <div
                                        key={item._id}
                                        className={`bg-white rounded-xl border p-4 transition-all
                                            ${item.available ? 'border-gray-100 hover:shadow-md' : 'border-red-200 bg-red-50/30 opacity-75'}`}
                                    >
                                        {/* Top row: name + availability */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.productName}</h4>
                                                {item.productSubCategory && (
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {item.productSubCategory}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => toggleAvailability(item._id)}
                                                className={`ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0
                                                    ${item.available
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {item.available ? <Eye size={13} /> : <EyeOff size={13} />}
                                                {item.available ? 'Available' : 'Out of Stock'}
                                            </button>
                                        </div>

                                        {/* Price display row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {hasDiscount ? (
                                                    <>
                                                        <span className="text-sm text-gray-400 line-through">Rs.{item.originalPrice}</span>
                                                        <span className="text-sm font-bold text-green-600">Rs.{item.discountedPrice}</span>
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                                            <Percent size={10} />
                                                            {Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)}% off
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-bold text-orange-600">Rs.{item.productPrice}</span>
                                                )}
                                            </div>

                                            {!isEditing && (
                                                <div className="flex gap-1 text-gray-500">
                                                    <button
                                                        onClick={() => startEditing(item)}
                                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors cursor-pointer"
                                                        title="Edit Price"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setItemToDelete(item)}
                                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                                                        title="Delete Item"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit form */}
                                        {isEditing && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] text-gray-400 font-medium mb-0.5 block">New Price (Rs.)</label>
                                                        <input
                                                            type="number"
                                                            value={priceForm.newPrice}
                                                            onChange={(e) => setPriceForm(prev => ({ ...prev, newPrice: e.target.value }))}
                                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                                                            placeholder="e.g. 250"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] text-gray-400 font-medium mb-0.5 block">Old Price (for discount)</label>
                                                        <input
                                                            type="number"
                                                            value={priceForm.oldPrice}
                                                            onChange={(e) => setPriceForm(prev => ({ ...prev, oldPrice: e.target.value }))}
                                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                                                            placeholder="e.g. 350"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-400">
                                                    💡 Enter both Old Price &amp; New Price to apply a discount (old price will be shown with strikethrough)
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSavePrice(item._id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
                                                    >
                                                        <Save size={13} /> Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
                                                    >
                                                        <X size={13} /> Cancel
                                                    </button>
                                                    {hasDiscount && (
                                                        <button
                                                            onClick={() => { handleRemoveDiscount(item._id, item.originalPrice); cancelEditing(); }}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all cursor-pointer ml-auto"
                                                        >
                                                            <Tag size={13} /> Remove Discount
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm animate-in zoom-in-95">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Delete Menu Item?</h3>
                                <p className="text-sm text-gray-500 font-medium">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to delete <strong>{itemToDelete.productName}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setItemToDelete(null)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all 
                                    ${isDeleting ? "bg-red-300 text-white cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md"}`}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} /> Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ============================================================
   SETTINGS PANEL
   ============================================================ */
const SettingsPanel = () => {
    const [deliveryCharge, setDeliveryCharge] = useState("");
    const [originalCharge, setOriginalCharge] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get("/settings?key=deliveryCharge");
            const charge = res.data.deliveryCharge !== null ? res.data.deliveryCharge : 0;
            setDeliveryCharge(charge);
            setOriginalCharge(charge);
        } catch (err) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (deliveryCharge === "" || isNaN(deliveryCharge) || Number(deliveryCharge) < 0) {
            toast.error("Please enter a valid non-negative number for delivery charge");
            return;
        }

        setSaving(true);
        try {
            const res = await axios.put("/settings/delivery-charge", { deliveryCharge: Number(deliveryCharge) });
            toast.success(res.data.message);
            setOriginalCharge(res.data.deliveryCharge);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update delivery charge");
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = String(deliveryCharge) !== String(originalCharge);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Delivery Settings</h2>
                        <p className="text-sm text-gray-500">Configure global delivery rules</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Standard Delivery Charge (Rs.)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium select-none cursor-text pointer-events-none">Rs.</span>
                            <input
                                type="number"
                                value={deliveryCharge}
                                onChange={(e) => setDeliveryCharge(e.target.value)}
                                min="0"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-medium text-gray-800"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-orange-400" />
                            Set to <strong>0</strong> to offer Free Delivery to all customers.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                    {hasChanges && (
                        <button
                            onClick={() => setDeliveryCharge(originalCharge)}
                            className="px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Cancel Changes
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all 
                            ${saving || !hasChanges 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg cursor-pointer"}`}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   ANALYTICS PANEL
   ============================================================ */
const AnalyticsPanel = ({ orders, menuItems }) => {
    // Default to today's date in YYYY-MM-DD format for the input
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    // 1. Filter orders that have been successfully delivered
    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    // 2. Filter further by the exact selected date
    const ordersOnDate = deliveredOrders.filter(order => {
        if (selectedDate === 'all') return true;
        const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDateStr === selectedDate;
    });

    // 3. Calculate Day-Level Key Metrics
    const dayTotalRevenue = ordersOnDate.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const dayTotalOrders = ordersOnDate.length;

    // 4. Aggregate Product Sales for the Selected Date
    const productSalesMap = {};
    
    ordersOnDate.forEach(order => {
        order.items.forEach(item => {
            // Figure out the product name (handles populated vs unpopulated product IDs)
            let productName = item.productName || item.productId?.productName || "Unknown Item";
            
            // If missing from order item, attempt to look it up in menuItems
            if (!item.productId?.productName) {
                const menuItem = menuItems.find(m => m._id === (item.productId?._id || item.productId));
                if (menuItem) productName = menuItem.productName;
            }

            const itemPrice = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            const itemTotalAmount = itemPrice * quantity;

            if (!productSalesMap[productName]) {
                productSalesMap[productName] = {
                    name: productName,
                    quantity: 0,
                    totalAmount: 0
                };
            }
            
            productSalesMap[productName].quantity += quantity;
            productSalesMap[productName].totalAmount += itemTotalAmount;
        });
    });

    // Convert map to sorted array (highest revenue first)
    const productSalesList = Object.values(productSalesMap).sort((a, b) => b.totalAmount - a.totalAmount);

    return (
        <div className="space-y-6">
            {/* Header / Date Filter */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedDate === 'all' ? 'All Time Sales Analytics' : 'Daily Sales Analytics'}</h2>
                    <p className="text-sm text-gray-500">Pick a date to view a detailed breakdown of items sold.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setSelectedDate('all')}
                        className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                            selectedDate === 'all' 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                    >
                        All Time
                    </button>
                    <div className="flex items-center gap-2">
                        <label htmlFor="dateFilter" className="text-sm font-bold text-gray-700 whitespace-nowrap hidden sm:block">Filter Date:</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-orange-500">
                                <Calendar size={18} />
                            </div>
                            <input
                                type="date"
                                id="dateFilter"
                                value={selectedDate === 'all' ? '' : selectedDate}
                                max={today}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className={`border text-sm font-bold rounded-xl focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 px-4 py-2.5 outline-none cursor-pointer transition-colors ${
                                    selectedDate !== 'all' 
                                    ? 'bg-orange-50 border-orange-200 text-orange-700' 
                                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:bg-white'
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">{selectedDate === 'all' ? 'Total Revenue' : 'Total Daily Revenue'}</p>
                        <p className="text-3xl font-black text-gray-800">Rs.{dayTotalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                        <DollarSign size={28} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">{selectedDate === 'all' ? 'Total Orders' : 'Total Daily Orders'}</p>
                        <p className="text-3xl font-black text-gray-800">{dayTotalOrders}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <Package size={28} />
                    </div>
                </div>
            </div>

            {/* Sales Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-orange-500" size={20} /> Itemized Sales Report
                    </h3>
                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {selectedDate === 'all' ? 'All Time' : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                
                {productSalesList.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Activity size={32} />
                        </div>
                        <p className="text-lg font-bold text-gray-800">No Sales Data</p>
                        <p className="text-gray-500 mt-1">There are no delivered orders on this selected date.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4 rounded-tl-xl text-left">Product Name</th>
                                    <th scope="col" className="px-6 py-4 text-center">Total Quantity Sold</th>
                                    <th scope="col" className="px-6 py-4 rounded-tr-xl text-right">Total Amount (Subtotal)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {productSalesList.map((item, index) => (
                                    <tr key={index} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-600">
                                            {item.quantity} <span className="text-xs text-gray-400 font-normal ml-1">items</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-800">
                                            Rs.{item.totalAmount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-orange-50/50 border-t-2 border-orange-100">
                                <tr>
                                    <td className="px-6 py-5 font-black text-gray-800 text-lg uppercase tracking-wide">
                                        Grand Total
                                    </td>
                                    <td className="px-6 py-5 text-center font-bold text-orange-600">
                                        {productSalesList.reduce((sum, item) => sum + item.quantity, 0)} <span className="text-sm font-normal ml-1 text-orange-500/70">items total</span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-orange-600 text-xl">
                                        Rs.{dayTotalRevenue.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
