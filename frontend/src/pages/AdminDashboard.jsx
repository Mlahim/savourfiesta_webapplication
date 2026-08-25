import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import {
    Package, ClipboardList, ChefHat, Truck, CheckCircle, XCircle, Clock,
    MapPin, Phone, Mail, User, Eye, EyeOff, ToggleLeft, ToggleRight,
    Flame, Drumstick, CookingPot, ArrowRight, Pencil, X, Save, Tag, Percent,
    RotateCcw, AlertTriangle, Settings, Plus, Upload, ImageIcon, Trash2, TrendingUp, DollarSign, Activity, Calendar, FileText, ChevronDown, ChevronUp, Utensils, GripVertical
} from "lucide-react";
import { getCartThumbnail } from "../utils/optimizeImage";
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

// Initialize mobile drag-and-drop polyfill
// Using forceApply: true makes it work in Chrome DevTools Device Emulator
polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
    holdToDrag: 300,
    forceApply: true
});

// Prevent context menu (long press) on draggable items which interferes with mobile dragging
if (typeof window !== 'undefined') {
    window.addEventListener('contextmenu', (e) => {
        if (e.target.closest('[draggable]')) {
            // e.preventDefault(); // Optional: prevent context menu globally on draggable items
        }
    });
}

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
                        <Settings size={18} /> Settings
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
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded-xl w-40"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-[140px] flex flex-col justify-between">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                        <div className="w-10 h-8 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="w-24 h-5 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
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
                    <AnalyticsPanel orders={orders} menuItems={menuItems} fetchOrders={fetchOrders} />
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

    // Drag and drop state
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [dragCategory, setDragCategory] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    const dragSubCat = useRef(null);
    const dragOverSubCat = useRef(null);
    const [dragOverSubCatId, setDragOverSubCatId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [showSubCatDropdown, setShowSubCatDropdown] = useState(false);
    // Edit Item state
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState({
        productName: '',
        productCategory: '',
        productSubCategory: '',
        productPrice: '',
        productDescription: '',
        image: null,
        imagePreview: null
    });
    const [editCatDropdown, setEditCatDropdown] = useState(false);
    const [editSubCatDropdown, setEditSubCatDropdown] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
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

    // ---- Edit Item Handlers ----
    const openEditModal = (item) => {
        setShowAddForm(false); // close add form when editing
        setEditItem(item);
        setEditForm({
            productName: item.productName || '',
            productCategory: item.productCategory || '',
            productSubCategory: item.productSubCategory || '',
            productPrice: item.discountedPrice || item.productPrice || '',
            productDescription: item.productDescription || '',
            image: null,
            imagePreview: item.productUrl || null
        });
        // Scroll to top so the inline edit form is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                toast.error('Invalid image type. Please upload JPG, PNG, or WEBP.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size too large. Maximum allowed size is 5MB.');
                return;
            }
            setEditForm(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editForm.productName || !editForm.productCategory || !editForm.productPrice) {
            toast.error('Please fill all required fields');
            return;
        }
        setIsSavingEdit(true);
        const formData = new FormData();
        formData.append('productName', editForm.productName.trim());
        const normalizedCategory = editForm.productCategory.trim().replace(/\b\w/g, c => c.toUpperCase());
        formData.append('productCategory', normalizedCategory);
        if (editForm.productSubCategory) formData.append('productSubCategory', editForm.productSubCategory.trim());
        else formData.append('productSubCategory', '');
        formData.append('productPrice', editForm.productPrice);
        if (editForm.productDescription) formData.append('productDescription', editForm.productDescription.trim());
        else formData.append('productDescription', '');
        if (editForm.image) {
            formData.append('image', editForm.image);
        }
        try {
            const res = await axios.put(`/menu/${editItem._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Menu item updated successfully!');
            setMenuItems(prev => prev.map(m => m._id === editItem._id ? res.data : m));
            setEditItem(null);
        } catch (err) {
            console.error('Edit item error:', err);
            toast.error(err.response?.data?.message || 'Failed to update menu item');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Constraint check: File type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                toast.error('Invalid image type. Please upload JPG, PNG, or WEBP.');
                return;
            }
            // Constraint check: File size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size too large. Maximum allowed size is 5MB.');
                return;
            }

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

    // Group by category and then by subCategory
    const grouped = menuItems.reduce((acc, item) => {
        const cat = item.productCategory || "Other";
        const subCat = item.productSubCategory || "Other";
        if (!acc[cat]) acc[cat] = {};
        if (!acc[cat][subCat]) acc[cat][subCat] = [];
        acc[cat][subCat].push(item);
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

    // ---- Drag and Drop Handlers ----
    const handleDragStart = (e, item, category, subCategory) => {
        dragItem.current = item;
        setDragCategory(`${category}-${subCategory}`);
        e.dataTransfer.effectAllowed = 'move';
        // Make the drag image slightly transparent
        setTimeout(() => {
            e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        dragItem.current = null;
        dragOverItem.current = null;
        setDragCategory(null);
        setDragOverId(null);
    };

    const handleDragOver = (e, item, category, subCategory) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetGroup = `${category}-${subCategory}`;
        if (dragItem.current && item._id !== dragItem.current._id && dragCategory === targetGroup) {
            dragOverItem.current = item;
            setDragOverId(item._id);
        }
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = async (e, category, subCategory) => {
        e.preventDefault();
        setDragOverId(null);

        if (!dragItem.current || !dragOverItem.current) return;
        if (dragItem.current._id === dragOverItem.current._id) return;

        const targetGroup = `${category}-${subCategory}`;
        if (dragCategory !== targetGroup) return; // Prevent dragging across sub-categories

        // Get items in this subcategory
        const groupItems = menuItems.filter(m => (m.productCategory || 'Other') === category && (m.productSubCategory || 'Other') === subCategory);
        const dragIdx = groupItems.findIndex(m => m._id === dragItem.current._id);
        const dropIdx = groupItems.findIndex(m => m._id === dragOverItem.current._id);

        if (dragIdx === -1 || dropIdx === -1) return;

        // Find the original global indices of the items in this subcategory
        const globalIndices = groupItems.map(item => menuItems.findIndex(m => m._id === item._id));

        // Reorder subcategory items locally
        const reordered = [...groupItems];
        const [removed] = reordered.splice(dragIdx, 1);
        reordered.splice(dropIdx, 0, removed);

        // Place the reordered items back into their original global slots
        const newMenuItems = [...menuItems];
        globalIndices.forEach((globalIdx, i) => {
            newMenuItems[globalIdx] = reordered[i];
        });

        // Assign a unique global sortOrder to EVERY item so that the DB completely mirrors this exact sequence
        // This ensures categories and subcategories never randomly shift their relative positions
        const orderedPayload = newMenuItems.map((item, idx) => ({
            id: item._id,
            sortOrder: idx
        }));

        // Optimistic UI update
        setMenuItems(newMenuItems);

        try {
            const res = await axios.put('/menu/reorder', { orderedItems: orderedPayload });
            setMenuItems(res.data.items);
            toast.success('Menu order updated');
        } catch (err) {
            toast.error('Failed to reorder items');
            // Revert on failure
            setMenuItems(menuItems);
        }

        dragItem.current = null;
        dragOverItem.current = null;
        setDragCategory(null);
    };

    // ---- Subcategory Drag and Drop Handlers ----
    const handleSubCatDragStart = (e, subCategory, category) => {
        dragSubCat.current = { subCategory, category };
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleSubCatDragEnd = (e) => {
        e.target.style.opacity = '1';
        dragSubCat.current = null;
        dragOverSubCat.current = null;
        setDragOverSubCatId(null);
    };

    const handleSubCatDragOver = (e, subCategory, category) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragSubCat.current && subCategory !== dragSubCat.current.subCategory && category === dragSubCat.current.category) {
            dragOverSubCat.current = { subCategory, category };
            setDragOverSubCatId(subCategory);
        }
    };

    const handleSubCatDragLeave = () => {
        setDragOverSubCatId(null);
    };

    const handleSubCatDrop = async (e, category) => {
        e.preventDefault();
        setDragOverSubCatId(null);

        if (!dragSubCat.current || !dragOverSubCat.current) return;
        if (dragSubCat.current.subCategory === dragOverSubCat.current.subCategory) return;
        if (dragSubCat.current.category !== category || dragOverSubCat.current.category !== category) return;

        const catItems = menuItems.filter(m => (m.productCategory || 'Other') === category);
        const sourceSubCat = dragSubCat.current.subCategory;
        const targetSubCat = dragOverSubCat.current.subCategory;

        // Group items by subcategory within this category
        const catGrouped = catItems.reduce((acc, item) => {
            const sub = item.productSubCategory || 'Other';
            if (!acc[sub]) acc[sub] = [];
            acc[sub].push(item);
            return acc;
        }, {});

        // Get sorted subcategories for this category based on their appearance in menuItems
        const subCatKeys = [...new Set(catItems.map(m => m.productSubCategory || 'Other'))];
        
        const dragIdx = subCatKeys.indexOf(sourceSubCat);
        const dropIdx = subCatKeys.indexOf(targetSubCat);

        if (dragIdx === -1 || dropIdx === -1) return;

        // Reorder subcategories
        const reorderedSubCats = [...subCatKeys];
        const [removed] = reorderedSubCats.splice(dragIdx, 1);
        reorderedSubCats.splice(dropIdx, 0, removed);

        // Build a flat array of items for this category based on the new subcategory order
        const reorderedCatItems = [];
        reorderedSubCats.forEach(sub => {
            reorderedCatItems.push(...(catGrouped[sub] || []));
        });

        // Find the original global indices of all items in this category
        const globalIndices = catItems.map(item => menuItems.findIndex(m => m._id === item._id));

        // Place the reordered items back into their original global slots
        const newMenuItems = [...menuItems];
        globalIndices.forEach((globalIdx, i) => {
            newMenuItems[globalIdx] = reorderedCatItems[i];
        });

        const orderedPayload = newMenuItems.map((item, idx) => ({
            id: item._id,
            sortOrder: idx
        }));

        setMenuItems(newMenuItems);

        try {
            const res = await axios.put('/menu/reorder', { orderedItems: orderedPayload });
            setMenuItems(res.data.items);
            toast.success('Subcategories reordered');
        } catch (err) {
            toast.error('Failed to reorder subcategories');
            setMenuItems(menuItems);
        }

        dragSubCat.current = null;
        dragOverSubCat.current = null;
    };

    return (
        <div className="space-y-8">
            {/* Add New Item Header Section */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Menu Catalog</h2>
                    <p className="text-sm text-gray-500">Manage your dishes and availability</p>
                </div>
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setEditItem(null); }}
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
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-semibold text-gray-700">Image Upload</label>
                                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">Auto-fitted (No Zoom/Crop)</span>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <label className="flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-colors h-32 text-center">
                                            <Upload className="w-7 h-7 text-orange-500 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700">Choose Image or Drop Here</span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP up to 5MB · Best fit: 800×800px</span>
                                            <span className="text-[9px] text-gray-400 mt-1 italic">Images scale proportionally without zooming or cropping</span>
                                            <input 
                                                type="file" 
                                                accept="image/png, image/jpeg, image/webp, image/jpg"
                                                onChange={handleFileChange}
                                                className="hidden" 
                                            />
                                        </label>
                                        {newItemForm.imagePreview ? (
                                            <div className="w-32 h-32 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-2 flex-shrink-0 relative group shadow-inner">
                                                <img src={newItemForm.imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewItemForm(prev => ({...prev, image: null, imagePreview: null}))}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow cursor-pointer"
                                                    title="Remove image"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center flex-shrink-0 text-gray-400 p-2 text-center">
                                                <ImageIcon className="w-7 h-7 opacity-50 mb-1 text-orange-400" />
                                                <span className="text-[11px] font-semibold text-gray-600">Card Frame Preview</span>
                                                <span className="text-[9px] text-gray-400 mt-0.5">Full image fit mode</span>
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

            {/* Edit Item Inline Form */}
            {editItem && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Pencil size={20} className="text-blue-500" /> Editing: {editItem.productName}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setEditItem(null)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={editForm.productName}
                                        onChange={e => setEditForm(prev => ({ ...prev, productName: e.target.value }))}
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
                                            value={editForm.productCategory}
                                            onChange={e => {
                                                setEditForm(prev => ({ ...prev, productCategory: e.target.value }));
                                                setEditCatDropdown(true);
                                            }}
                                            onFocus={() => setEditCatDropdown(true)}
                                            onBlur={() => setTimeout(() => setEditCatDropdown(false), 200)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                            placeholder="e.g. Rice"
                                            required
                                            autoComplete="off"
                                        />
                                        {editCatDropdown && availableCategories.filter(c => c.toLowerCase().includes(editForm.productCategory.toLowerCase())).length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {availableCategories
                                                    .filter(c => c.toLowerCase().includes(editForm.productCategory.toLowerCase()))
                                                    .map(cat => (
                                                        <li
                                                            key={cat}
                                                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                                                            onClick={() => {
                                                                setEditForm(prev => ({ ...prev, productCategory: cat }));
                                                                setEditCatDropdown(false);
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
                                            value={editForm.productSubCategory}
                                            onChange={e => {
                                                setEditForm(prev => ({ ...prev, productSubCategory: e.target.value }));
                                                setEditSubCatDropdown(true);
                                            }}
                                            onFocus={() => setEditSubCatDropdown(true)}
                                            onBlur={() => setTimeout(() => setEditSubCatDropdown(false), 200)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                                            placeholder="Optional"
                                            autoComplete="off"
                                        />
                                        {editSubCatDropdown && (() => {
                                            const editSubCats = [...new Set(
                                                menuItems
                                                    .filter(mi => !editForm.productCategory || mi.productCategory === editForm.productCategory)
                                                    .map(mi => mi.productSubCategory)
                                                    .filter(Boolean)
                                            )];
                                            const filtered = editSubCats.filter(c => c.toLowerCase().includes(editForm.productSubCategory.toLowerCase()));
                                            return filtered.length > 0 ? (
                                                <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                    {filtered.map(subCat => (
                                                        <li
                                                            key={subCat}
                                                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                                                            onClick={() => {
                                                                setEditForm(prev => ({ ...prev, productSubCategory: subCat }));
                                                                setEditSubCatDropdown(false);
                                                            }}
                                                        >
                                                            {subCat}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        value={editForm.productPrice}
                                        onChange={e => setEditForm(prev => ({ ...prev, productPrice: e.target.value }))}
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
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-semibold text-gray-700">Image Upload</label>
                                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">Auto-fitted (No Zoom/Crop)</span>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <label className="flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-colors h-32 text-center">
                                            <Upload className="w-7 h-7 text-orange-500 mb-1" />
                                            <span className="text-xs font-semibold text-gray-700">{editForm.image ? 'Change Image' : 'Choose New Image'}</span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP up to 5MB · Best fit: 800×800px</span>
                                            <span className="text-[9px] text-gray-400 mt-1 italic">Images scale proportionally without zooming or cropping</span>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp, image/jpg"
                                                onChange={handleEditFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {editForm.imagePreview ? (
                                            <div className="w-32 h-32 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-2 flex-shrink-0 relative group shadow-inner">
                                                <img src={editForm.imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditForm(prev => ({ ...prev, image: null, imagePreview: null }))}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow cursor-pointer"
                                                    title="Remove image"
                                                >
                                                    <X size={14} />
                                                </button>
                                                {editForm.image && (
                                                    <span className="absolute bottom-1 left-1 text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">New</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center flex-shrink-0 text-gray-400 p-2 text-center">
                                                <ImageIcon className="w-7 h-7 opacity-50 mb-1 text-orange-400" />
                                                <span className="text-[11px] font-semibold text-gray-600">No Image</span>
                                                <span className="text-[9px] text-gray-400 mt-0.5">Upload one</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={editForm.productDescription}
                                        onChange={e => setEditForm(prev => ({ ...prev, productDescription: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 h-24 resize-none"
                                        placeholder="Add a tasty description..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditItem(null)}
                                className="px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingEdit}
                                className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all
                                    ${isSavingEdit
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg cursor-pointer"}`}
                            >
                                {isSavingEdit ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {Object.keys(grouped).sort((a, b) => {
                if (a === 'Other') return 1;
                if (b === 'Other') return -1;
                return a.localeCompare(b);
            }).map(category => {
                const subCategories = grouped[category];
                const CatIcon = categoryIcons[category] || ChefHat;
                return (
                    <div key={category} className="mb-10">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                            <CatIcon size={24} className="text-orange-500" /> {category}
                        </h3>
                        <div className="space-y-8">
                            {Object.keys(subCategories).sort((a, b) => {
                                if (a === 'Other') return 1;
                                if (b === 'Other') return -1;
                                const aIdx = menuItems.findIndex(m => (m.productCategory || 'Other') === category && (m.productSubCategory || 'Other') === a);
                                const bIdx = menuItems.findIndex(m => (m.productCategory || 'Other') === category && (m.productSubCategory || 'Other') === b);
                                return aIdx - bIdx;
                            }).map(subCategory => {
                                const items = subCategories[subCategory];
                                const isSubCatDragOver = dragOverSubCatId === subCategory;
                                return (
                                <div key={subCategory} className={`pl-2 transition-all ${isSubCatDragOver ? 'border-orange-400 border-l-4 ml-[-4px] pl-3' : ''}`}>
                                    {subCategory !== 'Other' && (
                                        <div 
                                            className="flex items-center gap-3 mb-4 cursor-grab active:cursor-grabbing p-2 hover:bg-orange-50/50 rounded-lg -ml-2"
                                            draggable
                                            onDragStart={(e) => handleSubCatDragStart(e, subCategory, category)}
                                            onDragEnd={handleSubCatDragEnd}
                                            onDragOver={(e) => handleSubCatDragOver(e, subCategory, category)}
                                            onDragLeave={handleSubCatDragLeave}
                                            onDrop={(e) => handleSubCatDrop(e, category)}
                                        >
                                            <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing" title="Drag to reorder subcategory">
                                                <GripVertical size={16} />
                                            </div>
                                            <div className="h-px w-8 bg-gradient-to-r from-orange-300 to-transparent"></div>
                                            <h4 className="text-md font-bold text-gray-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 inline-block">
                                                {subCategory}
                                            </h4>
                                            <span className="text-xs font-medium text-gray-400">(drag to reorder)</span>
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
                                        </div>
                                    )}
                                    {subCategory === 'Other' && (
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xs font-medium text-gray-400 italic">(drag to reorder general items)</span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {items.map(item => {
                                            const isEditing = editingId === item._id;
                                            const hasDiscount = item.originalPrice && item.discountedPrice;
                                            const isDragOver = dragOverId === item._id;

                                            return (
                                                <div
                                                    key={item._id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, item, category, subCategory)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => handleDragOver(e, item, category, subCategory)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, category, subCategory)}
                                                    className={`bg-white rounded-xl border p-4 transition-all cursor-grab active:cursor-grabbing
                                                        ${item.available ? 'border-gray-100 hover:shadow-md' : 'border-red-200 bg-red-50/30 opacity-75'}
                                                        ${isDragOver ? 'border-orange-400 border-2 shadow-lg scale-[1.02] bg-orange-50/20' : ''}`}
                                                >
                                                    {/* Top row: drag handle + thumbnail + name + availability */}
                                                    <div className="flex items-center justify-between mb-2 gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0" title="Drag to reorder">
                                                    <GripVertical size={16} />
                                                </div>
                                                {item.productUrl ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-0.5 shadow-sm">
                                                        <img
                                                            src={getCartThumbnail(item.productUrl)}
                                                            alt={item.productName}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-400 flex-shrink-0">
                                                        <Utensils size={18} />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-sm truncate">{item.productName}</h4>
                                                    {item.productSubCategory && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                                                            {item.productSubCategory}
                                                        </span>
                                                    )}
                                                </div>
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
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"
                                                        title="Edit Item Details"
                                                    >
                                                        <Settings size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => startEditing(item)}
                                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors cursor-pointer"
                                                        title="Edit Price / Discount"
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
    
    // Banner State
    const [bannerTexts, setBannerTexts] = useState([]);
    const [originalBannerTexts, setOriginalBannerTexts] = useState([]);
    const [newBannerText, setNewBannerText] = useState("");
    const [savingBanner, setSavingBanner] = useState(false);

    // Hero Banner State
    const defaultHeroSlides = [
        { id: 1, image: "/hero-banner.webp", title: "Taste the Extraordinary", subtitle: "Crunchy. Spicy. Irresistible." },
        { id: 2, image: "/hero-banner-2.webp", title: "Fresh & Delicious", subtitle: "Experience world-class dining" }
    ];
    const [heroBanners, setHeroBanners] = useState(defaultHeroSlides);
    const [originalHeroBanners, setOriginalHeroBanners] = useState(defaultHeroSlides);
    const [savingHero, setSavingHero] = useState(false);
    const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get("/settings"); // Fetch all settings
            const charge = res.data.deliveryCharge !== null && res.data.deliveryCharge !== undefined ? res.data.deliveryCharge : 0;
            setDeliveryCharge(charge);
            setOriginalCharge(charge);
            
            const banners = res.data.bannerTexts || [];
            setBannerTexts(banners);
            setOriginalBannerTexts(banners);

            const heroes = res.data.heroBanners && res.data.heroBanners.length > 0 ? res.data.heroBanners : defaultHeroSlides;
            setHeroBanners(heroes);
            setOriginalHeroBanners(heroes);
        } catch (err) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDelivery = async () => {
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

    // Banner handlers
    const addBannerText = () => {
        if (!newBannerText.trim()) return;
        setBannerTexts([...bannerTexts, newBannerText.trim()]);
        setNewBannerText("");
    };

    const removeBannerText = (index) => {
        const updated = [...bannerTexts];
        updated.splice(index, 1);
        setBannerTexts(updated);
    };

    const handleSaveBanner = async () => {
        setSavingBanner(true);
        try {
            const res = await axios.put("/settings/banner-texts", { bannerTexts });
            toast.success(res.data.message);
            setOriginalBannerTexts(res.data.bannerTexts);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update banner texts");
        } finally {
            setSavingBanner(false);
        }
    };

    // Hero Banner handlers
    const handleHeroChange = (index, field, value) => {
        const updated = [...heroBanners];
        updated[index] = { ...updated[index], [field]: value };
        setHeroBanners(updated);
    };

    const handleAddHeroSlide = () => {
        const newId = heroBanners.length > 0 ? Math.max(...heroBanners.map(b => Number(b.id) || 0)) + 1 : 1;
        setHeroBanners([...heroBanners, { id: newId, image: "/hero-banner.webp", title: "New Slide Title", subtitle: "New Slide Subtitle" }]);
    };

    const handleRemoveHeroSlide = (index) => {
        if (heroBanners.length <= 1) {
            toast.error("You must keep at least 1 hero banner!");
            return;
        }
        const updated = [...heroBanners];
        updated.splice(index, 1);
        setHeroBanners(updated);
    };

    const handleHeroImageUpload = async (index, file) => {
        if (!file) return;
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = async () => {
            URL.revokeObjectURL(objectUrl);
            const { width, height } = img;
            const aspectRatio = width / height;
            // Enforce resolution constraint: Min 1000x350 and landscape aspect ratio >= 1.4
            if (width < 1000 || height < 350 || aspectRatio < 1.4) {
                toast.error(`Invalid image resolution (${width}x${height}px). Please select a widescreen landscape image (min 1000x350 px, aspect ratio ≥ 1.4:1) to fit the hero banner correctly!`);
                return;
            }

            setUploadingSlideIndex(index);
            const formData = new FormData();
            formData.append("image", file);
            try {
                const res = await axios.post("/settings/hero-banner-image", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Image uploaded!");
                handleHeroChange(index, "image", res.data.imageUrl);
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to upload image");
            } finally {
                setUploadingSlideIndex(null);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            toast.error("Failed to read image file");
        };
    };

    const handleSaveHeroBanners = async () => {
        setSavingHero(true);
        try {
            const res = await axios.put("/settings/hero-banners", { heroBanners });
            toast.success(res.data.message);
            setOriginalHeroBanners(res.data.heroBanners);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update hero banners");
        } finally {
            setSavingHero(false);
        }
    };

    const hasChangesDelivery = String(deliveryCharge) !== String(originalCharge);
    const hasChangesBanner = JSON.stringify(bannerTexts) !== JSON.stringify(originalBannerTexts);
    const hasChangesHero = JSON.stringify(heroBanners) !== JSON.stringify(originalHeroBanners);

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

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-100">
                    {hasChangesDelivery && (
                        <button
                            onClick={() => setDeliveryCharge(originalCharge)}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer text-center"
                        >
                            Cancel Changes
                        </button>
                    )}
                    <button
                        onClick={handleSaveDelivery}
                        disabled={saving || !hasChangesDelivery}
                        className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
                            ${saving || !hasChangesDelivery 
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
                                Save Delivery Settings
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Banner Settings Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Top Banner Settings</h2>
                        <p className="text-sm text-gray-500">Manage the scrolling text below the website navigation.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Add New Banner Text</label>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                                type="text"
                                value={newBannerText}
                                onChange={(e) => setNewBannerText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') addBannerText(); }}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all font-medium text-gray-800"
                                placeholder="e.g. 🍔 Free Delivery on orders above Rs.2000!"
                            />
                            <button
                                onClick={addBannerText}
                                disabled={!newBannerText.trim()}
                                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                    ${!newBannerText.trim() 
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                    : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer"}`}
                            >
                                <Plus size={20} className="inline-block" /> Add
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 block">Current Banner Texts ({bannerTexts.length})</h3>
                        {bannerTexts.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-4 italic">No items configured. The banner will be hidden on the website.</p>
                        ) : (
                            <ul className="space-y-2">
                                {bannerTexts.map((text, index) => (
                                    <li key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                        <span className="text-sm font-medium text-gray-700 truncate mr-4">{text}</span>
                                        <button 
                                            onClick={() => removeBannerText(index)}
                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                            title="Remove text"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-100">
                    {hasChangesBanner && (
                        <button
                            onClick={() => setBannerTexts(originalBannerTexts)}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer text-center"
                        >
                            Cancel Changes
                        </button>
                    )}
                    <button
                        onClick={handleSaveBanner}
                        disabled={savingBanner || !hasChangesBanner}
                        className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
                            ${savingBanner || !hasChangesBanner 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                : "bg-gradient-to-r from-red-500 to-orange-600 text-white hover:shadow-lg cursor-pointer"}`}
                    >
                        {savingBanner ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Banner Settings
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Hero Banner Settings Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Hero Banners (Home Page Slider)</h2>
                            <p className="text-sm text-gray-500">Manage home page slider images, titles, and subtitles.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddHeroSlide}
                        className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                    >
                        <Plus size={16} /> Add Slide
                    </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-amber-800 text-xs md:text-sm">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <strong>Resolution Constraint Enforced:</strong> To ensure banners fit cleanly without stretching or cropping, uploaded images must be widescreen landscape (min <strong>1000x350 px</strong>, aspect ratio ≥ <strong>1.4:1</strong>).
                    </div>
                </div>

                <div className="space-y-6">
                    {heroBanners.map((slide, idx) => (
                        <div key={slide.id || idx} className="bg-gray-50 rounded-xl border border-gray-200 p-4 md:p-6 relative">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                                    Slide #{idx + 1}
                                </span>
                                {heroBanners.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveHeroSlide(idx)}
                                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Delete Slide"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                {/* Image preview & upload */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-full h-32 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300 flex items-center justify-center">
                                        <img
                                            src={slide.image || "/hero-banner.webp"}
                                            alt={slide.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = "/hero-banner.webp"; }}
                                        />
                                        {uploadingSlideIndex === idx && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                Checking & Uploading...
                                            </div>
                                        )}
                                    </div>
                                    <label className="w-full py-2 px-3 bg-white border border-gray-300 rounded-xl font-semibold text-xs text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm text-center">
                                        <Upload size={14} />
                                        Replace Image
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/jpg"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleHeroImageUpload(idx, e.target.files[0]);
                                                }
                                            }}
                                            disabled={uploadingSlideIndex === idx}
                                        />
                                    </label>
                                </div>

                                {/* Title & Subtitle inputs */}
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Slide Title</label>
                                        <input
                                            type="text"
                                            value={slide.title || ""}
                                            onChange={(e) => handleHeroChange(idx, "title", e.target.value)}
                                            placeholder="e.g. Taste the Extraordinary"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm font-medium text-gray-800 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Slide Subtitle</label>
                                        <input
                                            type="text"
                                            value={slide.subtitle || ""}
                                            onChange={(e) => handleHeroChange(idx, "subtitle", e.target.value)}
                                            placeholder="e.g. Crunchy. Spicy. Irresistible."
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm font-medium text-gray-800 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-100">
                    {hasChangesHero && (
                        <button
                            onClick={() => setHeroBanners(originalHeroBanners)}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer text-center"
                        >
                            Cancel Changes
                        </button>
                    )}
                    <button
                        onClick={handleSaveHeroBanners}
                        disabled={savingHero || !hasChangesHero || uploadingSlideIndex !== null}
                        className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
                            ${savingHero || !hasChangesHero || uploadingSlideIndex !== null
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg cursor-pointer"}`}
                    >
                        {savingHero ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Hero Banners
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
const AnalyticsPanel = ({ orders, menuItems, fetchOrders }) => {
    // Default to today's date in YYYY-MM-DD format for the input
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleResetAnalytics = async () => {
        setIsResetting(true);
        try {
            const res = await axios.delete("/order/admin/analytics/reset");
            toast.success(res.data.message);
            setShowResetConfirm(false);
            if (fetchOrders) fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset analytics");
        } finally {
            setIsResetting(false);
        }
    };

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
    const dayTotalDeliveryCharges = ordersOnDate.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);

    // State for product accordions
    const [expandedProducts, setExpandedProducts] = useState({});

    const toggleProduct = (productName) => {
        setExpandedProducts(prev => ({
            ...prev,
            [productName]: !prev[productName]
        }));
    };

    const productSalesMap = {};
    
    ordersOnDate.forEach(order => {
        const orderItemCount = order.items.length || 1;
        order.items.forEach(item => {
            let productName = item.productName || item.productId?.productName || "Unknown Item";
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
                    totalAmount: 0,
                    totalDc: 0
                };
            }
            
            productSalesMap[productName].quantity += quantity;
            productSalesMap[productName].totalAmount += itemTotalAmount;
            // Distribute delivery charge evenly across the items in the order
            productSalesMap[productName].totalDc += (order.deliveryCharge || 0) / orderItemCount;
        });
    });

    // Convert map to sorted array (highest revenue first)
    const productSalesList = Object.values(productSalesMap)
        .sort((a, b) => b.totalAmount - a.totalAmount);

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
                        onClick={() => setShowResetConfirm(true)}
                        className="px-4 py-2.5 text-sm font-bold rounded-xl transition-colors bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Reset
                    </button>
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

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">Reset Analytics?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            This will permanently delete all past (completed, rejected, failed) orders from the database. Current active orders will be kept. Are you absolutely sure?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                disabled={isResetting}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetAnalytics}
                                disabled={isResetting}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                            >
                                {isResetting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">{selectedDate === 'all' ? 'Total Revenue' : 'Total Daily Revenue'}</p>
                        <p className="text-2xl lg:text-3xl font-black text-gray-800">Rs.{dayTotalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                        <DollarSign size={24} className="lg:w-7 lg:h-7" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">{selectedDate === 'all' ? 'Total Orders' : 'Total Daily Orders'}</p>
                        <p className="text-2xl lg:text-3xl font-black text-gray-800">{dayTotalOrders}</p>
                    </div>
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                        <Package size={24} className="lg:w-7 lg:h-7" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Total Delivery Charges</p>
                        <p className="text-2xl lg:text-3xl font-black text-gray-800">Rs.{dayTotalDeliveryCharges.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-green-100 flex items-center justify-center text-green-500 shrink-0">
                        <Truck size={24} className="lg:w-7 lg:h-7" />
                    </div>
                </div>
            </div>

            {/* Sales Data Table (Accordions) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-orange-500" size={20} /> Detailed Sales Report
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
                    <div className="divide-y divide-gray-100">
                        {productSalesList.map((product, idx) => {
                            const isExpanded = expandedProducts[product.name];
                            
                            return (
                                <div key={idx} className="flex flex-col">
                                    <div 
                                        onClick={() => toggleProduct(product.name)}
                                        className="p-4 sm:p-6 hover:bg-orange-50/30 transition-colors cursor-pointer flex items-center justify-between gap-4"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-lg">
                                                {product.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <span className="font-black text-gray-800 text-lg">
                                                Rs.{product.totalAmount.toFixed(2)}
                                            </span>
                                            <div className="text-gray-400 bg-gray-50 p-1.5 rounded-lg">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="px-4 sm:px-6 pb-6 pt-2 bg-gray-50/50 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                                            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Product Sales Summary</h4>
                                                <ul className="space-y-3 text-sm">
                                                    <li className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2 font-bold text-gray-700">
                                                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-xs">{product.quantity}x</span>
                                                            Total Quantity Sold
                                                        </div>
                                                        <div className="font-semibold text-gray-600">
                                                            Rs.{product.totalAmount.toFixed(2)}
                                                        </div>
                                                    </li>
                                                </ul>
                                                
                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2 font-bold text-gray-600">
                                                            <Truck size={16} className="text-gray-400" />
                                                            Total Delivery Charges (from associated orders)
                                                        </div>
                                                        <div className="font-semibold text-gray-600">
                                                            Rs.{product.totalDc.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
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

export default AdminDashboard;
