"use client";

import React, { useState } from "react";
import { ChevronRight, Shield, Lock, Users, FileText } from "lucide-react";

const Page = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "shippingInfo", title: "Shipping Info", icon: FileText },
    { id: "information", title: "Info We Collect", icon: Users },
    { id: "security", title: "Security", icon: Lock },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <div className="bg-[#fefce8] py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl text-center">Privacy Policy</h1>
          <p className="text-center text-sm opacity-90">Protecting your data is our top priority</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <section id="shippingInfo" className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Navigation</h2>
              <nav className="space-y-2">
                {sections.map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === id
                        ? "bg-amber-100 text-amber-800"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{title}</span>
                    <ChevronRight
                      className={`w-4 h-4 ml-auto transition-transform ${
                        activeSection === id ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                ))}
              </nav>
            </div>
          </section>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12">
              {/* Introduction */}
              <section id="introduction" className="mb-12">
                <div className="flex items-center mb-6">
                  <FileText className="w-8 h-8 text-amber-600 mr-4" />
                  <h2 className="text-3xl font-bold text-gray-800">Shipping Info</h2>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-6">
                  <p className="text-amber-800">
                    At Spice Website, we take your privacy seriously. This policy outlines our commitment to protecting your personal information.
                  </p>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. By accessing or using our website, you agree to the terms of this privacy policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section id="information" className="mb-12">
                <div className="flex items-center mb-6">
                  <Users className="w-8 h-8 text-amber-600 mr-4" />
                  <h2 className="text-3xl font-bold text-gray-800">Information We Collect</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-amber-500 transition-colors">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-600">
                        <ChevronRight className="w-4 h-4 text-amber-600 mr-2" />
                        Name and contact information
                      </li>
                      <li className="flex items-center text-gray-600">
                        <ChevronRight className="w-4 h-4 text-amber-600 mr-2" />
                        Email address
                      </li>
                      <li className="flex items-center text-gray-600">
                        <ChevronRight className="w-4 h-4 text-amber-600 mr-2" />
                        Billing and shipping addresses
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-amber-500 transition-colors">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage Information</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-600">
                        <ChevronRight className="w-4 h-4 text-amber-600 mr-2" />
                        Browser type and version
                      </li>
                      <li className="flex items-center text-gray-600">
                        <ChevronRight className="w-4 h-4 text-amber-600 mr-2" />
                        Device information
                      </li>
                      <li className="flex items-center text-gray-600">
                        <ChevronRight className="w-4 h-4 text-amber-600 mr-2" />
                        IP address and location
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="mb-12">
                <div className="flex items-center mb-6">
                  <Lock className="w-8 h-8 text-amber-600 mr-4" />
                  <h2 className="text-3xl font-bold text-gray-800">Security</h2>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-white p-6 rounded-lg border border-amber-100">
                  <p className="text-gray-600 leading-relaxed">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Shield className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Data Encryption</h3>
                        <p className="text-gray-600 text-sm">All sensitive data is encrypted in transit and at rest</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Lock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Secure Access</h3>
                        <p className="text-gray-600 text-sm">Regular security audits and restricted access controls</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
