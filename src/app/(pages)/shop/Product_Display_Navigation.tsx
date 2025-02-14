"use client";

import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { useAppDispatch } from "@/store/hooks";
import { setFilters } from "@/store/slices/productSlice";

const Product_Display_Navigation = ({ isToggle }: { isToggle: () => void }) => {
  const dispatch = useAppDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Latest");

  const sortOptions = [
    { label: "Latest", value: "createdAt:desc" },
    { label: "Oldest", value: "createdAt:asc" },
    { label: "Price: Low to High", value: "weights.sale_Price:asc" },
    { label: "Price: High to Low", value: "weights.sale_Price:desc" }
  ];

  const handleSort = (label: string, value: string) => {
    setSelectedSort(label);
    dispatch(setFilters({ sort: value }));
    setShowDropdown(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-bgColor/95 backdrop-blur-sm border-b border-gold-200">
      <div className="product_display_navigation w-full flex max-lg:justify-between justify-end items-center gap-6 py-4">
        <div className="product_display_mobile_btn py-2.5 px-4 text-lg rounded-lg gap-2 hidden max-lg:flex items-center bg-lightBgColor shadow-premium-button hover:shadow-premium-hover transition-all duration-300">
          <FiFilter 
            onClick={isToggle} 
            className="text-xl cursor-pointer text-darkRed" 
            aria-label="Toggle filters"
          />
          <span className="font-medium text-darkRed">Filter</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-lightBgColor border-none py-2.5 px-6 w-full flex justify-between items-center gap-10 rounded-lg shadow-premium-button hover:shadow-premium-hover transition-all duration-300"
          >
            <span className="text-darkRed">{selectedSort}</span>
            {showDropdown ? <IoIosArrowUp className="text-darkRed" /> : <IoIosArrowDown className="text-darkRed" />}
          </button>
          <div className={`z-10 ${showDropdown ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"} absolute top-14 left-0 bg-lightBgColor rounded-lg shadow-premium w-48 transition-all duration-200`}>
            <ul className="py-2">
              {sortOptions.map((option) => (
                <li key={option.value}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSort(option.label, option.value);
                    }}
                    className="block px-4 py-2 text-darkRed hover:bg-bgColor hover:text-lightRed transition-colors"
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product_Display_Navigation;
