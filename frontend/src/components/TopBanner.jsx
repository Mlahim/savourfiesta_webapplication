import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Sparkles } from 'lucide-react';

const TopBanner = () => {
    const [messages, setMessages] = useState([]);
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

    if (loading || messages.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white overflow-hidden py-2 relative z-40 border-b border-orange-700 w-full" style={{ marginTop: '0px' }}>
            <div className="flex whitespace-nowrap animate-marquee items-center text-sm font-medium tracking-wide">
                {/* 
                  To make a continuous seamless marquee, we duplicate the items multiple times.
                  This ensures the screen is always filled while scrolling.
                */}
                {[...Array(3)].map((_, arrayIndex) => (
                    <div key={arrayIndex} className="flex items-center shrink-0">
                        {messages.map((msg, idx) => (
                            <React.Fragment key={`${arrayIndex}-${idx}`}>
                                <span className="mx-6 flex items-center gap-2">
                                    {msg}
                                </span>
                                <Sparkles size={14} className="text-orange-300 opacity-60 shrink-0" />
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
            
            <style jsx="true">{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    /* Adjust duration based on how many items there are to keep speed somewhat consistent */
                    animation: marquee ${messages.length * 8}s linear infinite;
                    width: fit-content;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default TopBanner;
