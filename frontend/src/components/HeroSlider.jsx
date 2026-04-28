import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = () => {
    // Assuming user put the image in public/banner1.png as requested.
    // Adding a second placeholder to demonstrate slider functionality.
    const slides = [
        {
            id: 1,
            image: "/hero-banner.webp",
            title: "Taste the Extraordinary",
            subtitle: "Crunchy. Spicy. Irresistible."
        },
        {
            id: 2,
            image: "/hero-banner-2.webp", // Fallback/Second image
            title: "Fresh & Delicious",
            subtitle: "Experience world-class dining"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState({});

    // Preload the first image immediately, others lazily
    useEffect(() => {
        // Preload the first slide with high priority
        const firstImg = new Image();
        firstImg.src = slides[0].image;
        firstImg.onload = () => {
            setImagesLoaded(prev => ({ ...prev, 0: true }));
        };

        // Preload the second slide after a delay
        const timer = setTimeout(() => {
            slides.slice(1).forEach((slide, idx) => {
                const img = new Image();
                img.src = slide.image;
                img.onload = () => {
                    setImagesLoaded(prev => ({ ...prev, [idx + 1]: true }));
                };
            });
        }, 2000); // 2s delay — load non-visible slides after first paint

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000); // Auto slide every 5 seconds

        return () => clearInterval(timer);
    }, [currentIndex]);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="w-full relative group overflow-hidden">
            <div
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                className="w-full flex transition-transform duration-500 ease-in-out"
            >
                {slides.map((slide, idx) => (
                    <div
                        key={slide.id}
                        className="w-full flex-shrink-0"
                    >
                        {/* Show shimmer skeleton until image loads */}
                        <div className="relative">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-auto object-cover md:h-[65vh] md:object-fill"
                                loading={idx === 0 ? "eager" : "lazy"}
                                fetchPriority={idx === 0 ? "high" : "low"}
                                decoding={idx === 0 ? "sync" : "async"}
                                style={{
                                    opacity: imagesLoaded[idx] ? 1 : 0,
                                    transition: "opacity 0.3s ease-in-out",
                                }}
                                onLoad={() => setImagesLoaded(prev => ({ ...prev, [idx]: true }))}
                            />
                            {/* Skeleton while loading */}
                            {!imagesLoaded[idx] && (
                                <div 
                                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 md:h-[65vh]"
                                    style={{
                                        backgroundSize: "200% 100%",
                                        animation: "shimmer 1.5s ease-in-out infinite",
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-colors z-10">
                <ChevronLeft onClick={prevSlide} size={30} />
            </div>

            {/* Right Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-colors z-10">
                <ChevronRight onClick={nextSlide} size={30} />
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center py-2 gap-2 z-10">
                {slides.map((slide, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`text-2xl cursor-pointer transition-all duration-300 ${currentIndex === slideIndex ? 'text-orange-500 scale-125' : 'text-white/70'
                            }`}
                    >
                        •
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};

export default HeroSlider;
