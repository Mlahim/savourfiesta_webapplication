import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, CreditCard, ArrowRight, CornerUpLeft, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import { getCartThumbnail } from "../utils/optimizeImage";

const Cart = () => {
  const { token, updateCartCount, cartItems, removeFromCart, updateQuantity } = React.useContext(AuthContext);
  const navigate = useNavigate();

  // Refresh cart on mount
  useEffect(() => {
    updateCartCount();
  }, [token]);

  const goToCheckout = () => {
    navigate("/checkout");
  };

  if (!cartItems || cartItems.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <div className="text-6xl mb-4 text-orange-200">
          <ShoppingCart size={80} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any delicious food yet.</p>
        <a href="/" className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition-all flex items-center gap-2">
          <CornerUpLeft size={20} /> Browse Menu
        </a>
      </div>
    );

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = item.price || item.productId?.productPrice || 0;
    return acc + (price * item.quantity);
  }, 0);

  const { clearCart } = React.useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <ShoppingCart size={32} className="text-orange-500" /> Your Cart
          </h2>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 font-bold flex items-center gap-2"
          >
            <Trash2 size={18} /> Clear Cart
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => {
              const name = item.productId?.productName || item.productName || 'Unknown Item';
              const category = item.productId?.productCategory || item.productCategory || 'General';
              const subCategory = item.productId?.productSubCategory || item.productSubCategory || '';
              const price = item.price || item.productId?.productPrice || 0;
              const itemId = item.productId?._id || item.productId;

              return (
                <div key={item._id || itemId} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-gray-50 transition-colors gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getCartThumbnail(item.productId?.productUrl || item.productUrl) || `https://placehold.co/400x300?text=${encodeURIComponent(name)}`}
                        alt={name}
                        className="w-full h-full object-cover mix-blend-multiply"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/400x300?text=${encodeURIComponent(name)}`;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm md:text-lg text-gray-800 truncate">
                        {name}
                      </h3>
                      <p className="text-gray-500 text-xs md:text-sm truncate">
                        {category}{subCategory ? ` › ${subCategory}` : ''}
                      </p>
                      <button
                        onClick={() => removeFromCart(String(itemId))}
                        className="text-red-500 text-xs md:text-sm flex items-center gap-1 mt-1 hover:text-red-700 font-medium cursor-pointer"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <p className="font-bold text-gray-800 text-base md:text-lg">Rs.{price.toFixed(2)}</p>

                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(String(itemId), item.quantity - 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(String(itemId), item.quantity + 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-2xl font-black text-gray-800">
              Total: <span className="text-orange-600">Rs.{totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={goToCheckout}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard size={20} /> Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
