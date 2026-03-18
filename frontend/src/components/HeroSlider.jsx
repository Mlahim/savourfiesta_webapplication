import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = () => {
    // Assuming user put the image in public/banner1.png as requested.
    // Adding a second placeholder to demonstrate slider functionality.
    const slides = [
        {
            id: 1,
            image: "/hero-banner.png",
            title: "Taste the Extraordinary",
            subtitle: "Crunchy. Spicy. Irresistible."
        },
        {
            id: 2,
            image: "/hero-banner-2.png", // Fallback/Second image
            title: "Fresh & Delicious",
            subtitle: "Experience world-class dining"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

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
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className="w-full flex-shrink-0"
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-auto object-cover md:h-[65vh] md:object-fill"
                        />
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
        </div>
    );
};

export default HeroSlider;
