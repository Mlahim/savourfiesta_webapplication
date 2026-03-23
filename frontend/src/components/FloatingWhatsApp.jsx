import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp = () => {
    // Replace with your actual WhatsApp number with country code (e.g., +923019090311)
    const phoneNumber = "923019090311"; 
    const message = "Hello! I'm interested in ordering from SavourFiesta.";
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 hover:shadow-green-500/50 group"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={32} />
            <span className="absolute right-16 bg-white text-gray-800 text-sm font-semibold py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-lg whitespace-nowrap before:content-[''] before:absolute before:top-1/2 before:left-full before:-mt-1.5 before:border-[6px] before:border-transparent before:border-l-white">
                Chat with us
            </span>
        </a>
    );
};

export default FloatingWhatsApp;
