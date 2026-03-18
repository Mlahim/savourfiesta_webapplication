import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Save, LogOut, ArrowLeft, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/profile");
            setProfile(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.put("/profile", {
                name: profile.name,
                phone: profile.phone,
                address: profile.address,
            });
            setProfile(res.data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
        setSaving(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Menu
                </button>

                {/* Profile Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white mb-6 shadow-lg">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black border-2 border-white/30">
                            {profile.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">{profile.name}</h1>
                            <p className="text-white/80 text-sm">{profile.email}</p>
                            <p className="text-white/60 text-xs mt-1">Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Card Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Profile Details</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors cursor-pointer"
                            >
                                <Edit3 size={16} /> Edit
                            </button>
                        ) : (
                            <button
                                onClick={() => { setIsEditing(false); fetchProfile(); }}
                                className="text-gray-500 hover:text-gray-700 font-semibold text-sm transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Fields */}
                    <div className="p-6 space-y-5">

                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                <User size={16} /> Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1">{profile.name || "Not set"}</p>
                            )}
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                <Mail size={16} /> Email Address
                            </label>
                            <p className="text-gray-800 font-medium px-1">{profile.email}</p>
                            {isEditing && <p className="text-xs text-gray-400 mt-1 px-1">Email cannot be changed</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                <Phone size={16} /> Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800"
                                    placeholder="Enter your phone number"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1">{profile.phone || "Not set"}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                                <MapPin size={16} /> Delivery Address
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-gray-800 resize-none"
                                    placeholder="Enter your delivery address"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium px-1">{profile.address || "Not set"}</p>
                            )}
                        </div>

                        {/* Save Button */}
                        {isEditing && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full mt-6 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100 cursor-pointer"
                >
                    <LogOut size={18} /> Logout
                </button>

            </div>
        </div>
    );
};

export default Profile;
