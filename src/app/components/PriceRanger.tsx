import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const PriceRanger: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(6971);
    const [leftThumbPosition, setLeftThumbPosition] = useState<number>(0);
    const [rightThumbPosition, setRightThumbPosition] = useState<number>(100);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [activeDragger, setActiveDragger] = useState<'left' | 'right' | null>(null);
    
    const trackRef = useRef<HTMLDivElement>(null);

    const calculatePriceFromPosition = (position: number): number => {
        return Math.round((position / 100) * 6971);
    };

    const calculatePositionFromEvent = (event: MouseEvent | TouchEvent): number => {
        if (!trackRef.current) return 0;
        
        const track = trackRef.current.getBoundingClientRect();
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const position = ((clientX - track.left) / track.width) * 100;
        return Math.max(0, Math.min(100, position));
    };

    const handleMouseDown = (dragger: 'left' | 'right') => () => {
        setIsDragging(true);
        setActiveDragger(dragger);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging || !activeDragger) return;

            const newPosition = calculatePositionFromEvent(e);

            if (activeDragger === 'left') {
                if (newPosition < rightThumbPosition) {
                    setLeftThumbPosition(newPosition);
                    setMinPrice(calculatePriceFromPosition(newPosition));
                }
            } else {
                if (newPosition > leftThumbPosition) {
                    setRightThumbPosition(newPosition);
                    setMaxPrice(calculatePriceFromPosition(newPosition));
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setActiveDragger(null);
        };

        // Add both mouse and touch event listeners
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, activeDragger, leftThumbPosition, rightThumbPosition]);

    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = Math.min(Number(e.target.value), maxPrice);
        setMinPrice(value);
        const percentage = (value / 6971) * 100;
        setLeftThumbPosition(percentage);
    };

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = Math.max(Number(e.target.value), minPrice);
        setMaxPrice(Math.min(value, 6971));
        const percentage = (Math.min(value, 6971) / 6971) * 100;
        setRightThumbPosition(percentage);
    };

    return (
        <div className="w-full max-w-md py-4 bg-cream-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between mb-6"
            >
                <h2 className="text-lg font-medium text-gray-900">Price</h2>
                <ChevronUp
                    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? '' : 'transform rotate-180'}`}
                />
            </button>

            {isOpen && (
                <>
                    <div className="relative w-[93%] h-1 bg-gray-200 rounded-full mb-6" ref={trackRef}>
                        <div
                            className="absolute h-full bg-gray-400 rounded-full"
                            style={{
                                left: `${leftThumbPosition}%`,
                                right: `${100 - rightThumbPosition}%`
                            }}
                        />

                        <div
                            className="absolute w-4 h-4 bg-gray-500 rounded-full -mt-1.5 cursor-pointer"
                            style={{ left: `${leftThumbPosition}%` }}
                            onMouseDown={handleMouseDown('left')}
                            onTouchStart={handleMouseDown('left')}
                        />
                        <div
                            className="absolute w-4 h-4 bg-gray-500 rounded-full -mt-1.5 cursor-pointer"
                            style={{ left: `${rightThumbPosition}%` }}
                            onMouseDown={handleMouseDown('right')}
                            onTouchStart={handleMouseDown('right')}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                        <span>Price:</span>
                        <span className="text-gray-400">₹</span>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={handleMinPriceChange}
                            className="w-20 px-4 py-1 border border-gray-300 rounded text-center"
                            min="0"
                            max={maxPrice}
                        />
                        <span>-</span>
                        <span className="text-gray-400">₹</span>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={handleMaxPriceChange}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            min={minPrice}
                            max="6971"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default PriceRanger;