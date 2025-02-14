import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { MdDelete } from "react-icons/md";
import Image from 'next/image';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    discount?: number;
    sizes?: string[];
}

const WishlistPage = () => {
    const wishlistItems: WishlistItem[] = [
        {
            id: '1',
            name: 'Coriander Powder Special',
            price: 27,
            originalPrice: 26,
            image: '/images/product_display_page_img.webp',
            discount: 4,
            sizes: ['100g', '200g', '500g']
        },
        {
            id: '2',
            name: 'Cumin Powder',
            price: 68,
            image: '/images/product_img_1.webp',
            originalPrice: 26,
            discount: 4,
            sizes: ['100g', '200g', '500g']
        },
    ];

    return (
        <div className="w-full py-6 bg-lightBgColor min-h-screen">
            <div className="2xl:w-[70%] w-[95%] mx-auto flex flex-col justify-center items-center py-8 mb-8">
                <h1 className="text-4xl font-semibold my-8">Your wishlist</h1>


                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-sm:gap-3">
                    {wishlistItems.map((item) => (
                        <div
                            key={item.id}
                            className="group rounded-lg overflow-hidden"
                        >
                            <div className="relative">
                                {/* Product Image */}
                                <div className="aspect-[3/4] overflow-hidden">
                                    <Image
                                    width={100}
                                    height={100}
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>

                                {/* Discount Badge */}
                                {item.discount && (
                                    <span className="absolute top-3 left-3 rounded-full bg-bgColor px-4 py-1">
                                        - {item.discount}%
                                    </span>
                                )}

                                {/* Quick Action Icons Overlay */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
                                        <button className="bg-white p-3 rounded-full hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                            <ShoppingCart className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button className="bg-white p-3 rounded-full hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                            <Eye className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </div>
                                </div>

                                {/* Delete Icons Overlay */}
                                <div className="absolute right-0 inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <MdDelete className="absolute top-6 right-0 -translate-x-1/2 -translate-y-1/2 flex gap-4 text-3xl text-black hover:text-red-600 cursor-pointer" />
                                </div>

                                {/* Size Options */}
                                {item.sizes && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-white py-2 px-4 flex justify-center gap-2 opacity-0 group-hover:opacity-60 transition-all duration-300 translate-y-full group-hover:translate-y-0">
                                        {item.sizes.map((size) => (
                                            <button
                                                key={size}
                                                className="px-3 py-1 text-sm font-semibold border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="text-gray-800 text-center font-medium mb-2 text-lg max-sm:text-sm">
                                    {item.name}
                                </h3>
                                <div className="flex justify-center items-center gap-2 max-sm:text-sm">
                                    {item.originalPrice && (
                                        <span className="text-gray-500 font-semibold line-through">
                                            ₹{item.originalPrice}
                                        </span>
                                    )}
                                    <span className="text-red-500 font-semibold">
                                        {item.originalPrice ? 'From ' : ''}₹{item.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {wishlistItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Your wishlist is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;