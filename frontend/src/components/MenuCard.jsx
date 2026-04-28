import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ShoppingCart, Plus, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { getMenuCardImage } from "../utils/optimizeImage";
import OptimizedImage from "./OptimizedImage";

const MenuCard = ({ item }) => {
  const { addToCart } = useContext(AuthContext);
  const [quantity, setQuantity] = React.useState(1);
  const isAvailable = item.available !== false;

  const handleAddToCart = async () => {
    if (!isAvailable) {
      toast.error("This item is currently out of stock");
      return;
    }
    const success = await addToCart(item, quantity);
    if (success) {
      toast.success(`${quantity}x ${item.productName} added to cart!`);
      setQuantity(1);
    } else {
      toast.error("Failed to add item.");
    }
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => q > 1 ? q - 1 : 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-row md:flex-col h-32 md:h-full group">
      {/* Image Section */}
      <div className="relative overflow-hidden w-32 md:w-full flex-shrink-0 md:h-48">
        <OptimizedImage
          src={item.productUrl ? getMenuCardImage(item.productUrl) : `https://placehold.co/400x300?text=${encodeURIComponent(item.productName)}`}
          alt={item.productName}
          fallbackText={item.productName}
          className="w-full h-full"
          style={{ mixBlendMode: "multiply" }}
          rootMargin="300px"
        />
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10">
          {item.productCategory}
        </div>

      </div>

      {/* Content Section */}
      <div className="p-3 flex-1 flex flex-col justify-between min-w-0 relative">
        <div>
          {/* Discount Tag */}
          {item.originalPrice && item.discountedPrice && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
              {Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)}% OFF
            </div>
          )}
          <h3 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1 leading-tight">{item.productName}</h3>
          <p className="text-gray-500 text-[10px] sm:text-xs line-clamp-2 mb-1 hidden sm:block">
            {item.productDescription || `Delicious ${item.productSubCategory || item.productCategory}.`}
          </p>
          <div className="md:hidden text-[10px] text-gray-400 mb-1 truncate">{item.productSubCategory}</div>
        </div>

        <div className="mt-auto md:space-y-3">
          {/* Mobile Bottom Row: Price | Qty | Button */}
          {/* Desktop: Stacked Price/Qty then Button */}

          <div className="flex flex-col md:gap-3">
            <div className="flex items-center justify-between mb-2 md:mb-0">
              <span className="text-base md:text-lg font-black text-gray-800 flex items-center gap-2">
                {item.originalPrice && item.discountedPrice ? (
                  <>
                    <span className="text-sm text-gray-400 line-through">Rs.{item.originalPrice}</span>
                    <span className="text-green-600">Rs.{item.discountedPrice}</span>
                  </>
                ) : (
                  <>Rs.{item.productPrice}</>
                )}
              </span>

              {isAvailable && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 border border-gray-100 scale-90 origin-right md:scale-100 md:origin-center">
                  <button
                    onClick={decrement}
                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-orange-50 hover:text-orange-600 transition-colors text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-3 md:w-4 text-center">{quantity}</span>
                  <button
                    onClick={increment}
                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-orange-50 hover:text-orange-600 transition-colors text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {isAvailable ? (
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 md:py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 active:scale-95 transition-all shadow-md hover:shadow-lg text-[10px] md:text-sm font-bold"
              >
                <ShoppingCart size={14} className="md:w-4 md:h-4" />
                Add to Cart
              </button>
            ) : (
              <div className="w-full py-1.5 md:py-2 rounded-lg bg-red-50 border border-red-100 text-red-500 text-[10px] md:text-sm font-bold flex items-center justify-center gap-2">
                <AlertTriangle size={14} className="md:w-4 md:h-4" />
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
