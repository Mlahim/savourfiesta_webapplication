import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, Home, ShoppingCart, List, LogIn, UserPlus, UserCircle, Shield, UtensilsCrossed } from "lucide-react";

const Navbar = () => {
  const { token, cartCount, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");

  React.useEffect(() => {
    if (location.pathname === "/") {
      const handleScroll = () => {
        const menuSection = document.getElementById("menu-section");
        if (menuSection) {
          const rect = menuSection.getBoundingClientRect();
          // Check if menu section is roughly in view (e.g. top is near window top or within view)
          if (rect.top <= 150 && rect.bottom >= 100) {
            setActiveSection("menu");
          } else {
            setActiveSection("home");
          }
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setActiveSection("");
    }
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMenuClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname === "/") {
      document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      window.scrollTo(0, 0);
    }
  };

  const isActive = (path) => {
    if (path === "/") return activeSection === "home" ? "text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full" : "text-gray-700 hover:text-orange-600 font-medium transition-colors";
    return location.pathname === path ? "text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full" : "text-gray-700 hover:text-orange-600 font-medium transition-colors";
  }

  const mobileIsActive = (path) => {
    if (path === "/") return activeSection === "home" ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-700 hover:text-orange-600 hover:bg-orange-50";
    return location.pathname === path ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-700 hover:text-orange-600 hover:bg-orange-50";
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0">
            <Link to="/" onClick={handleHomeClick} className="flex items-center">
              <img src="https://res.cloudinary.com/dhx8xzita/image/upload/v1771488476/hotel-menu/navbar_logo_v3.png" alt="SavourFiesta Logo" className="h-20 w-auto object-contain mix-blend-multiply mt-6" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" onClick={handleHomeClick} className={`flex items-center gap-2 ${isActive("/")}`}>
              <Home size={28} /> Home
            </Link>
            <a href="/#menu-section" onClick={handleMenuClick} className={`flex items-center gap-2 cursor-pointer ${activeSection === 'menu' ? 'text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full' : 'text-gray-700 hover:text-orange-600 font-medium transition-colors'}`}>
              <UtensilsCrossed size={28} /> Menu
            </a>
            <Link to="/cart" className={`flex items-center gap-2 relative ${isActive("/cart")}`}>
              <ShoppingCart size={28} /> Cart
              {cartCount > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full absolute -top-2 -right-3">{cartCount}</span>}
            </Link>

            {token ? (
              <>
                <Link to="/orders" className={`flex items-center gap-2 ${isActive("/orders")}`}>
                  <List size={28} /> Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={`flex items-center gap-2 ${isActive("/admin")}`}>
                    <Shield size={28} /> Admin
                  </Link>
                )}
                <Link to="/profile" className={`ml-4 flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition-colors ${location.pathname === '/profile' ? 'ring-2 ring-orange-400' : ''}`}>
                  <UserCircle size={28} /> Profile
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <Link to="/login" className={`flex items-center gap-2 ${isActive("/login")}`}>
                  <LogIn size={28} /> Login
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm flex items-center gap-2">
                  <UserPlus size={26} /> Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden ml-auto">
            <Link to="/cart" className="relative text-gray-700 hover:text-orange-600 transition-colors">
              <ShoppingCart size={28} />
              {cartCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full absolute -top-2 -right-2">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-600 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-orange-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={handleHomeClick} className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${mobileIsActive("/")}`}>
              <Home size={28} /> Home
            </Link>
            <a href="/#menu-section" onClick={handleMenuClick} className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${activeSection === 'menu' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'}`}>
              <UtensilsCrossed size={28} /> Menu
            </a>

            {token ? (
              <>
                <Link to="/orders" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${mobileIsActive("/orders")}`}>
                  <List size={28} /> Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${mobileIsActive("/admin")}`}>
                    <Shield size={28} /> Admin Panel
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${mobileIsActive("/profile")}`}>
                  <UserCircle size={28} /> My Profile
                </Link>
              </>
            ) : (
              <div className="mt-4 border-t border-gray-100 pt-4 flex flex-col space-y-2 px-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2">
                  <LogIn size={28} /> Login
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 flex items-center justify-center gap-2">
                  <UserPlus size={28} /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;