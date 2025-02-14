import { motion } from 'framer-motion';
import React from 'react';

interface CheckoutSectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
  isVisible: boolean;
}

const CheckoutSection: React.FC<CheckoutSectionProps> = ({ number, title, children, isVisible }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-8 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-6">
        <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-gradient-to-br from-darkRed to-darkestRed rounded-full">
          {number}
        </span>
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </motion.div>
  );
};

export default CheckoutSection;
