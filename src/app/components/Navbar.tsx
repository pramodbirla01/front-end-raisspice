"use client";

import React, { useState, useEffect } from "react";
import { Menu, Search, User, Heart, ShoppingBag, X, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { IoHomeOutline } from "react-icons/io5";
import { FiShoppingBag } from "react-icons/fi";
import { TbCategoryPlus } from "react-icons/tb";
import { IoMdContact } from "react-icons/io";
import Link from "next/link";
import Image from "next/image";
import ShoppingCart_Sidebar from "./ShoppingCart_Sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductCategories } from "@/store/slices/productCategorySlice";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logoutCustomer } from '@/store/slices/customerSlice';
import SearchBar from '@/components/SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { setCartOpen } from '@/store/slices/cartSlice';

// Update the Category interface to match ProductCategory
interface Category {
  $id: string;
  name: string;
  slug?: string;  // Make slug optional to match ProductCategory
  description?: string;
  sub_text?: string;
}

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.productCategories);
  const { currentCustomer, token } = useSelector((state: RootState) => state.customer);
  const isLoggedIn = !!token;

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    dispatch(fetchProductCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 360);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logoutCustomer());
    router.push('/login');
  };

  const handleCategoryClick = (categorySlug: string) => {
    setIsDesktopCategoryOpen(false);
    setIsMenuOpen(false);
  };

  const handleUserIconClick = () => {
    if (isLoggedIn) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  const handleCartClick = () => {
    dispatch(setCartOpen(true));
  };

  const navLink_Items = [
    { text: "Home", link: "/" },
    { text: "Shop", link: "/shop" },
    { text: "Category", link: "#", isDropdown: true },
    { text: "About Us", link: "/about" },
    { text: "Blog", link: "/blog" },
  ];

  // Update the menuItems array to include href for all items
  const menuItems = [
    { Icon: IoHomeOutline, text: "Home", href: "/" },
    { Icon: FiShoppingBag, text: "Shop", href: "/shop" },
    { 
      Icon: TbCategoryPlus, 
      text: "Category", 
      isCategory: true,
      href: "#" 
    },
    { text: "About Us", href: "/about", imgSrc: "/images/about_us_icon.png" },
    { Icon: IoMdContact, text: "Contact Us", href: "/contact" },
  ];

  const navbarVariants = {
    hidden: { y: -100 },
    visible: { y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <>
      <motion.header 
        initial="hidden"
        animate="visible"
        variants={navbarVariants}
        className={`w-full fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-lg' 
            : 'bg-bgColor'
        }`}
      >
        <div className="w-[95%] 2xl:w-[70%] mx-auto">
          <div className="flex items-center justify-between py-1"> {/* Changed py-2 to py-1 */}
            {/* Desktop View - NavLogo */}
            <motion.div
              animate={{ 
                rotateY: rotation,
                transition: {
                  duration: 1.2,
                  ease: "easeInOut"
                }
              }}
              whileHover={{ 
                scale: 1.05,
                z: 50,
              }}
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
              className="navbar_logo hidden lg:block"
            >
              <Link href="/">
                <div className="transform-gpu hover:shadow-xl rounded-lg p-1"> {/* Changed p-2 to p-1 */}
                  <Image
                    src="/images/navbar_logo.PNG"
                    width={80} 
                    height={60} 
                    alt="Logo"
                    className="h-16 w-auto object-contain"
                    priority
                  />
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation Menu */}
            <nav className="navbar_info hidden lg:block">
              <ul className="flex gap-16">
                {navLink_Items.map((currElem, index) => (
                  <motion.li
                    key={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    {currElem.isDropdown ? (
                      <div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="cursor-pointer text-gray-700 hover:text-lightRed transition-colors duration-300 flex items-center gap-1"
                          onClick={() => setIsDesktopCategoryOpen(!isDesktopCategoryOpen)}
                        >
                          {currElem.text}
                          <motion.span
                            animate={{ rotate: isDesktopCategoryOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.span>
                        </motion.button>
                        <AnimatePresence mode="wait">
                          {isDesktopCategoryOpen && (
                            <motion.div
                              key="category-dropdown"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-lg py-2 z-50"
                            >
                              {categories?.map((category: Category) => (
                                <Link
                                  key={category.$id}
                                  href={`/shop?category=${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                  className="block px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-lightRed transition-colors duration-300"
                                  onClick={() => handleCategoryClick(category.slug || category.name.toLowerCase().replace(/\s+/g, '-'))}
                                >
                                  {category.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Link
                          href={currElem.link}
                          className="cursor-pointer text-gray-700 hover:text-lightRed transition-colors duration-300"
                        >
                          {currElem.text}
                        </Link>
                      </motion.div>
                    )}
                    <motion.span 
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-lightRed"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Desktop Right Side Icons */}
            <div className="navbar_icon hidden lg:flex gap-6 items-center">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Search 
                  className="w-5 h-5 cursor-pointer" 
                  onClick={() => setIsSearchOpen(!isSearchOpen)} 
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <User 
                  className="w-5 h-5 cursor-pointer" 
                  onClick={handleUserIconClick}
                />
              </motion.div>
              {isLoggedIn && (
                <motion.div whileHover={{ scale: 1.1 }}>
                  <LogOut 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={handleLogout}
                  />
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingBag
                  className="w-5 h-5 cursor-pointer text-gray-700 hover:text-lightRed transition-colors duration-300"
                  onClick={handleCartClick}
                />
              </motion.div>
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden flex items-center justify-between w-full h-16">
              {isMenuOpen ? (
                <X
                  className="w-6 h-6 cursor-pointer transform hover:scale-110 transition-transform duration-300"
                  onClick={() => setIsMenuOpen(false)}
                />
              ) : (
                <Menu
                  className="w-6 h-6 cursor-pointer transform hover:scale-110 transition-transform duration-300"
                  onClick={() => setIsMenuOpen(true)}
                />
              )}
              <motion.div
                animate={{ 
                  rotateY: rotation,
                  transition: {
                    duration: 1.2,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{ 
                  scale: 1.05,
                  z: 50,
                }}
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d"
                }}
                className="flex justify-center items-center"
              >
                <Link href="/">
                  <div className="transform-gpu hover:shadow-xl rounded-lg p-1">
                    <Image
                      src="/images/navbar_logo.PNG"
                      alt="Logo"
                      width={64}
                      height={64}
                      className="h-14 w-auto object-contain"
                      priority
                    />
                  </div>
                </Link>
              </motion.div>
              <div className="flex gap-4 items-center">
                {[
                  { Icon: Search, action: () => setIsSearchOpen(!isSearchOpen) },
                  { Icon: ShoppingBag, action: handleCartClick },
                ].map((item, index) => (
                  <item.Icon
                    key={index}
                    className="w-5 h-5 cursor-pointer transform hover:scale-110 transition-transform duration-300"
                    onClick={item.action}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Replace the existing search bar with the new SearchBar component */}
          <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
      </motion.header>

      {/* Mobile/Tablet Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-0 transition-opacity duration-300"
            style={{ animation: "fadeIn 0.3s forwards" }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className="fixed left-0 top-0 h-full w-64 max-md:w-[80%] bg-bgColor shadow-lg transform -translate-x-full overflow-y-auto"
            style={{ animation: "slideIn 0.3s forwards" }}
          >
            <div className="p-4">
              <div className="flex justify-end">
                <X
                  className="w-6 h-6 cursor-pointer transform hover:scale-110 transition-transform duration-300"
                  onClick={() => setIsMenuOpen(false)}
                />
              </div>
              <nav className="mt-8 w-full flex flex-col justify-between">
                <ul className="space-y-4">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {item.isCategory ? (
                        <div>
                          <div
                            className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 cursor-pointer transition-colors duration-300"
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                          >
                            <div className="flex items-center space-x-2">
                              <TbCategoryPlus className="w-5 h-5 text-gray-800" />
                              <span className="text-gray-800">{item.text}</span>
                            </div>
                            {isCategoryOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-800" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-800" />
                            )}
                          </div>
                          <AnimatePresence>
                            {isCategoryOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white"
                              >
                                {categories.map((category) => (
                                  <Link
                                    href={`/shop?category=${category.slug}`}
                                    key={category.$id} // Changed from category.id to category.$id
                                    className="block py-2 px-8 text-sm text-gray-600 hover:text-lightRed hover:bg-gray-50 transition-colors duration-300"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setIsCategoryOpen(false);
                                      router.push(`/shop?category=${category.slug}`);
                                    }}
                                  >
                                    {category.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block"
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push(item.href);
                          }}
                        >
                          <div className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-50 transition-colors duration-300 transform hover:translate-x-2">
                            {item.Icon ? (
                              <item.Icon className="w-5 h-5" />
                            ) : (
                              <Image width={5} height={5} src={item.imgSrc} alt="Icon" className="w-5 h-auto" />
                            )}
                            <span className="text-gray-800">{item.text}</span>
                          </div>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 mt-8">
                  {currentCustomer ? (
                    <>
                      <Link href="/profile">
                        <button 
                          onClick={() => setIsMenuOpen(false)} 
                          className="w-32 h-10 flex items-center gap-3 pl-4 bg-[darkRed] text-white rounded-lg"
                        >
                          <User /> Profile
                        </button>
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="w-32 h-10 flex items-center gap-3 pl-4 bg-[darkRed] text-white rounded-lg"
                      >
                        <LogOut /> Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/login">
                      <button 
                        onClick={() => setIsMenuOpen(false)} 
                        className="w-32 h-10 flex items-center gap-3 pl-4 bg-[darkRed] text-white rounded-lg"
                      >
                        <User /> Login
                      </button>
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </div>
          <style jsx>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 0.5; }
              }
              @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
              }
            `}
          </style>
        </div>
      )}

      <ShoppingCart_Sidebar onClose={() => dispatch(setCartOpen(false))} />
    </>
  );
};

export default Navbar;