import React, { useState } from 'react';
import { IoIosArrowUp } from "react-icons/io";

const ProductDisplayAvailability = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-lightBgColor rounded-lg shadow-premium p-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-medium text-darkRed">Availability</h3>
                <IoIosArrowUp 
                    className={`text-darkRed transform transition-transform duration-300 ${
                        isOpen ? '' : 'rotate-180'
                    }`}
                />
            </button>
            
            <div 
                className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-40' : 'max-h-0'
                }`}
            >
                <div className="space-y-3 py-4">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            id="inStock"
                            className="w-5 h-5 border-2 border-gold-200 rounded text-darkRed focus:ring-lightRed transition-colors"
                        />
                        <span className="text-darkRed group-hover:text-lightRed transition-colors">
                            In stock (63)
                        </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            id="outOfStock"
                            className="w-5 h-5 border-2 border-gold-200 rounded text-darkRed focus:ring-lightRed transition-colors"
                        />
                        <span className="text-darkRed group-hover:text-lightRed transition-colors">
                            Out of stock (9)
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ProductDisplayAvailability;