import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Helper to sync cart count
  const updateCartCount = async () => {
    if (token) {
      try {
        const res = await axios.get("/cart");
        const items = res.data?.items || [];
        setCartItems(items);
        const count = items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } catch (err) {
        console.error("Failed to update cart count:", err);
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const normalizedCart = localCart.map(item => ({
        ...item,
        price: item.price,
        _id: item.productId,
        productId: {
          _id: item.productId,
          productName: item.productName,
          productCategory: item.productCategory,
          productSubCategory: item.productSubCategory,
          productPrice: item.price,
          productUrl: item.productUrl // NEW: Mapped for guests
        }
      }));
      setCartItems(normalizedCart);
      const count = localCart.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    }
  };

  const updateCartStateFromResponse = (cartInfo) => {
    const items = cartInfo?.items || [];
    setCartItems(items);
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    if (!loading) {
      updateCartCount();
    }
  }, [token, loading]);

  const addToCart = async (product, quantity = 1) => {
    const productId = product._id;
    const price = product.productPrice;

    if (token) {
      try {
        const res = await axios.post("/cart/add", { productId, price, quantity });
        updateCartStateFromResponse(res.data);
        return true;
      } catch (err) {
        console.error("Add to Cart Error:", err.response?.data || err.message);
        return false;
      }
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingItemIndex = currentCart.findIndex((i) => String(i.productId) === String(productId));

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push({
          productId: productId,
          productName: product.productName,
          productCategory: product.productCategory,
          productSubCategory: product.productSubCategory,
          price: price,
          quantity: quantity,
          productUrl: product.productUrl // NEW: Save image link to local storage
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(currentCart));
      console.log("GUEST CART SAVED:", JSON.stringify(currentCart, null, 2)); // DEBUG
      updateCartCount();
      return true;
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        const res = await axios.post("/cart/remove", { productId });
        updateCartStateFromResponse(res.data);
      } catch (err) { console.error(err); }
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const newCart = currentCart.filter(item => String(item.productId) !== String(productId));
      localStorage.setItem("guestCart", JSON.stringify(newCart));
      updateCartCount();
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (token) {
      try {
        const res = await axios.put("/cart/update", { productId, quantity });
        updateCartStateFromResponse(res.data);
      } catch (err) { console.error("Update Error:", err); }
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const itemIndex = currentCart.findIndex(item => String(item.productId) === String(productId));
      if (itemIndex > -1) {
        if (quantity > 0) {
          currentCart[itemIndex].quantity = quantity;
        } else {
          currentCart.splice(itemIndex, 1);
        }
        localStorage.setItem("guestCart", JSON.stringify(currentCart));
        updateCartCount();
      }
    }
  }

  const clearCart = async () => {
    if (token) {
      try {
        await axios.delete("/cart/clear");
        setCartItems([]);
        setCartCount(0);
      } catch (err) { console.error(err); }
    } else {
      localStorage.removeItem("guestCart");
      setCartItems([]);
      setCartCount(0);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });
    const { token: accessToken, user: userData } = res.data;

    // Save to localStorage
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setCartCount(0);
    setCartItems([]);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, cartCount, cartItems, addToCart, removeFromCart, updateQuantity, updateCartCount, clearCart }}>
      {children}
    </AuthContext.Provider>
  );
};
