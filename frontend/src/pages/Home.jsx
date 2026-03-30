import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "../api/axios";
import MenuCard from "../components/MenuCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Flame, Drumstick, CookingPot, Package, Utensils, ChevronLeft, ChevronRight } from "lucide-react";
import HeroSlider from "../components/HeroSlider";


const Home = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

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

  // Derive final categories dynamically to ensure Deals and new ones appear
  const dynamicCategories = [...new Set(menuItems.map(item => item.productCategory).filter(Boolean))];
  const ICON_MAP = {
    "All": null,
    "Fast Food": Flame,
    "BBQ": Drumstick,
    "Rice": CookingPot,
    "Deals": Package,
  };
  const finalCategories = ["All", ...dynamicCategories].map(catName => ({
    name: catName,
    icon: ICON_MAP[catName] || Utensils
  }));

  // Scroll handling logic
  const handleScroll = () => {
      if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          setShowLeftArrow(scrollLeft > 0);
          setShowRightArrow(Math.ceil(scrollLeft + clientWidth) + 1 < scrollWidth);
      }
  };

  useEffect(() => {
      handleScroll();
      window.addEventListener('resize', handleScroll);
      return () => window.removeEventListener('resize', handleScroll);
  }, [finalCategories]);

  const scroll = (direction) => {
      if (scrollContainerRef.current) {
          const scrollAmount = 250;
          scrollContainerRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
          });
          // Update arrows slightly after scroll begins to reflect new state
          setTimeout(handleScroll, 350);
      }
  };

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
          <p className="text-gray-500 mt-3">My handcrafted signature dishes, prepared fresh just for you.</p>
        </div>

        {/* Category Filter Tabs (Scrollable) */}
        <div className="relative mb-10 group px-12 sm:px-14 max-w-4xl mx-auto">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all cursor-pointer disabled:opacity-0 disabled:cursor-default
              ${showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
            disabled={!showLeftArrow}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center gap-3 overflow-x-auto py-2 px-2 scroll-smooth"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {finalCategories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border whitespace-nowrap shrink-0
                    ${isActive
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 border-transparent scale-105"
                      : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-gray-200 hover:border-orange-300"
                    }`}
                >
                  {Icon && <Icon size={18} />}
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all cursor-pointer disabled:opacity-0 disabled:cursor-default
              ${showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
            disabled={!showRightArrow}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
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
