"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import Image from "next/image";

interface CompanyLogo {
  id: number;
  name: string;
  imagePath: string;
  width?: string;
}

const TrustedBy: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  const companies: CompanyLogo[] = [
    {
      id: 1,
      name: "Haldiram's",
      imagePath: "/images/trusted_by_img_1.png",
      width: "w-24 md:w-32"
    },
    {
      id: 2,
      name: "Synthite",
      imagePath: "/images/trusted_by_img_2.avif",
      width: "w-28 md:w-36"
    },
    {
      id: 3,
      name: "DMart",
      imagePath: "/images/trusted_by_img_3.avif",
      width: "w-24 md:w-32"
    },
    {
      id: 4,
      name: "Amul",
      imagePath: "/images/trusted_by_img_4.webp",
      width: "w-20 md:w-28"
    },
    {
      id: 5,
      name: "Symega",
      imagePath: "/images/trusted_by_img_5.png",
      width: "w-28 md:w-36"
    },
    {
      id: 6,
      name: "Jabsons",
      imagePath: "/images/trusted_by_img_6.avif",
      width: "w-24 md:w-32"
    }
  ];

  // Duplicate companies array for infinite scroll
  const duplicatedCompanies = [...companies, ...companies];

  // Animation variants for infinite scroll
  const scrollAnimation = {
    animate: {
      x: [0, -50 * companies.length],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear",
        },
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="bg-lightestBgColor py-12 md:py-16" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Trusted By
          </h2>
        </motion.div>

        {/* Desktop & Tablet - Infinite Auto Scroll */}
        <div className="hidden md:block overflow-hidden">
          <motion.div 
            className="flex gap-8 items-center"
            animate="animate"
            variants={scrollAnimation}
          >
            {duplicatedCompanies.map((company, index) => (
              <motion.div
                key={`${company.id}-${index}`}
                className="relative flex-shrink-0 group cursor-pointer transform transition-transform duration-300 hover:scale-110 hover:pause"
              >
                <Image
                  width={100}
                  height={100}
                  src={company.imagePath}
                  alt={company.name}
                  className={`${company.width} object-contain`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile - Auto Scroll */}
        <div className="md:hidden overflow-hidden">
          <motion.div 
            className="flex gap-8 items-center"
            animate="animate"
            variants={scrollAnimation}
          >
            {duplicatedCompanies.map((company, index) => (
              <motion.div
                key={`${company.id}-${index}`}
                className="relative flex-shrink-0 group cursor-pointer transform transition-transform duration-300 hover:scale-110"
              >
                <Image
                  width={100}
                  height={100}
                  src={company.imagePath}
                  alt={company.name}
                  className={`${company.width} object-contain`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;