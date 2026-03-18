import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import MenuCard from "../components/MenuCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Flame, Drumstick, CookingPot } from "lucide-react";
import HeroSlider from "../components/HeroSlider";

const CATEGORIES = [
  { name: "All", icon: null },
  { name: "Fast Food", icon: Flame },
  { name: "BBQ", icon: Drumstick },
  { name: "Rice", icon: CookingPot },
];

const Home = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const fetchMenu = async () => {
    try {
      const res = await axios.get("/menu");
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching menu:", err);
      toast.error("Error fetching menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Filter items by active category
  const filteredItems = activeCategory === "All"
    ? menuItems
    : menuItems.filter(item => item.productCategory === activeCategory);

  // Group filtered items by subcategory
  const groupedBySubCategory = filteredItems.reduce((acc, item) => {
    const sub = item.productSubCategory || "Other";
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <HeroSlider />

      {/* Menu Section */}
      <div id="menu-section" className="container mx-auto px-4 mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
            Our Signature Menu
            <span className="block h-1 w-1/2 bg-orange-500 mx-auto mt-2 rounded-full"></span>
          </h2>
          <p className="text-gray-500 mt-3">Curated dishes from top chefs around the world</p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border
                  ${isActive
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 border-transparent scale-105"
                    : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-gray-200 hover:border-orange-300"
                  }`}
              >
                {Icon && <Icon size={16} />}
                {cat.name}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <div className="text-gray-400 text-lg">Loading menu items...</div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedBySubCategory).map(([subCategory, items]) => (
              <div key={subCategory}>
                {/* Subcategory Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                  <h3 className="text-lg font-bold text-gray-700 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200 whitespace-nowrap">
                    {subCategory}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {items.map((item) => (
                    <MenuCard key={item._id} item={item} addToCart={addToCart} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg">No items found in this category.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
