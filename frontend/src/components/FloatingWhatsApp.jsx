import React, { useState, useEffect, useRef } from 'react';
import { Headset } from 'lucide-react';

const FloatingWhatsApp = () => {
    // Replace with your actual WhatsApp number with country code (e.g., +923019090311)
    const phoneNumber = "923019090311"; 
    const message = "Hello! I'm interested in ordering from SavourFiesta.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);
    const buttonRef = useRef(null);
    const dragStartRef = useRef({ offsetX: 0, offsetY: 0, startX: 0, startY: 0 });

    // Set initial position (bottom right, slightly higher than before so it doesn't cover footer)
    useEffect(() => {
        const updateInitialPosition = () => {
            if (!isDragging && position.x === 0 && position.y === 0) {
                // 80px from right, 120px from bottom initially (higher than previous default)
                setPosition({
                    x: window.innerWidth - 80,
                    y: window.innerHeight - 120
                });
            }
        };

        updateInitialPosition();
        window.addEventListener('resize', updateInitialPosition);
        return () => window.removeEventListener('resize', updateInitialPosition);
    }, [isDragging, position.x, position.y]);

    const handlePointerDown = (e) => {
        // Only allow dragging with main mouse button or touch
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        
        setIsDragging(true);
        setHasDragged(false);
        e.target.setPointerCapture(e.pointerId);
        
        dragStartRef.current = {
            offsetX: e.clientX - position.x,
            offsetY: e.clientY - position.y,
            startX: e.clientX,
            startY: e.clientY
        };
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        
        // Calculate distance moved from initial touch
        const deltaX = Math.abs(e.clientX - dragStartRef.current.startX);
        const deltaY = Math.abs(e.clientY - dragStartRef.current.startY);
        
        // Only consider it a drag if moved more than 10 pixels (accounts for finger tap jitter)
        if (deltaX > 10 || deltaY > 10) {
            setHasDragged(true);
        }
        
        const newX = e.clientX - dragStartRef.current.offsetX;
        const newY = e.clientY - dragStartRef.current.offsetY;

        // Keep within window bounds
        const buttonWidth = buttonRef.current ? buttonRef.current.offsetWidth : 56;
        const buttonHeight = buttonRef.current ? buttonRef.current.offsetHeight : 56;
        
        const boundedX = Math.max(0, Math.min(newX, window.innerWidth - buttonWidth));
        const boundedY = Math.max(0, Math.min(newY, window.innerHeight - buttonHeight));

        setPosition({ x: boundedX, y: boundedY });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
    };

    const handleClick = (e) => {
        // Prevent opening WhatsApp if the user was just dragging the button
        if (hasDragged) {
            e.preventDefault();
        }
    };

    // If position isn't calculated yet, don't show to prevent flashing at top-left
    if (position.x === 0 && position.y === 0) return null;

    return (
        <a 
            ref={buttonRef}
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                touchAction: 'none' // Prevent scrolling while dragging on mobile
            }}
            className={`fixed z-50 flex items-center justify-center w-14 h-14 bg-orange-500 text-white rounded-full shadow-[0_4px_14px_rgba(234,88,12,0.4)] ${!isDragging ? 'hover:bg-orange-600 transition-colors duration-300 hover:scale-110' : 'cursor-grabbing scale-105 shadow-[0_8px_25px_rgba(234,88,12,0.6)]'} cursor-grab group`}
            aria-label="Helpline"
        >
            <Headset size={32} />
            <span className="absolute right-16 bg-white text-gray-800 text-sm font-semibold py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-lg whitespace-nowrap before:content-[''] before:absolute before:top-1/2 before:left-full before:-mt-1.5 before:border-[6px] before:border-transparent before:border-l-white">
                Helpline (Drag me!)
            </span>
        </a>
    );
};

export default FloatingWhatsApp;
