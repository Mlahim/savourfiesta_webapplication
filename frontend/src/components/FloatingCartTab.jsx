import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ShoppingBag, ArrowRight } from "lucide-react";

const FloatingCartTab = () => {
  const { cartItems, cartCount } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the floating tab on these pages
  const hideRoutes = ["/cart", "/checkout", "/order-success", "/login", "/signup"];
  if (hideRoutes.includes(location.pathname) || cartCount === 0) {
    return null;
  }

  const subtotal = cartItems?.reduce((acc, item) => {
    const price = item.price || item.productId?.productPrice || 0;
    return acc + (price * item.quantity);
  }, 0) || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none flex justify-center animate-[slideUp_0.3s_ease-out]">
      <div className="w-full max-w-lg bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl shadow-orange-600/30 p-3 md:p-4 flex items-center justify-between pointer-events-auto border border-orange-400/30 text-white">
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-white/20 p-2 md:p-2.5 rounded-xl">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-orange-100">
              {cartCount} {cartCount === 1 ? "Item" : "Items"} in cart
            </p>
            <p className="text-sm md:text-lg font-black tracking-tight">
              Rs. {subtotal.toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          Checkout <ArrowRight size={18} />
        </button>

      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FloatingCartTab;
