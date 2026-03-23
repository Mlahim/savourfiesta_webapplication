import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Megaphone, Sparkles } from 'lucide-react';

const TopBanner = () => {
    const [messages, setMessages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await axios.get('/settings?key=bannerTexts');
                if (res.data.bannerTexts && Array.isArray(res.data.bannerTexts)) {
                    setMessages(res.data.bannerTexts);
                }
            } catch (err) {
                console.error("Error fetching banner texts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, []);

    // Text rotation effect
    useEffect(() => {
        if (messages.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 4000); // Change text every 4 seconds
        
        return () => clearInterval(interval);
    }, [messages.length]);

    if (loading || messages.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 relative z-40 border-b border-orange-700 w-full flex justify-center items-center px-4 min-h-[40px]">
            <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto w-full">
                <Megaphone size={16} className="text-orange-200 shrink-0" />
                
                <div className="flex-1 overflow-hidden relative text-center" style={{ minHeight: '20px' }}>
                    {messages.map((msg, index) => (
                        <div 
                            key={index}
                            className={`w-full transition-all duration-700 ease-in-out text-sm font-medium tracking-wide
                                ${index === currentIndex 
                                    ? 'opacity-100 relative transform translate-y-0 scale-100' 
                                    : 'opacity-0 absolute top-0 left-0 pointer-events-none transform -translate-y-4 scale-95'}`}
                        >
                            {msg}
                        </div>
                    ))}
                </div>
                
                <Sparkles size={16} className="text-orange-200 shrink-0 opacity-70" />
            </div>
        </div>
    );
};

export default TopBanner;
