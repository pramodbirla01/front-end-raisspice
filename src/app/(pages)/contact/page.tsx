'use client'
import React, { useState } from 'react';
import { MdLocationPin } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { IoTimeSharp } from "react-icons/io5";

const Page = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_BACKEND_URL}/api/contact-forms-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contact_us bg-bgColor min-h-screen">
        <div className="contact_us_heading_box w-full h-[280px] max-sm:h-[180px] max-md:px-2 flex flex-col gap-1 justify-center items-center bg-yellow-50 py-16">
          <h1 className='text-4xl font-medium'>Contact Us</h1>
          <p className='text-sm text-zinc-600 text-center'>We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
        </div>

        <div className="contact_us_inner_container grid grid-cols-[6fr_3fr] max-lg:grid-cols-1 gap-20 w-[90%] mx-auto py-12">
          <div className='flex flex-col justify-start items-start gap-6 bg-white p-8 rounded-2xl shadow-sm'>
            <h3 className='text-3xl font-semibold text-gray-800'>Send us a Message</h3>
            <p className='text-sm text-zinc-600'>Use the form below to get in touch with our team </p>
            {success && (
              <div className="w-full p-4 bg-green-100 text-green-700 rounded-lg">
                Thank you for your message. We'll get back to you soon!
              </div>
            )}
            {error && (
              <div className="w-full p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className='w-full flex flex-col justify-start items-start gap-6'>
              <div className="name_and_email_section w-full">
                <label htmlFor="full_name" className='font-medium text-gray-700 mb-1 block'>Your Name*</label>
                <input 
                  type="text" 
                  placeholder='Your Name*' 
                  id='full_name' 
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className='w-full p-3 bg-gray-50 outline-none border border-gray-200 rounded-lg transition-all duration-300 focus:border-darkRed focus:bg-white' 
                />
              </div>
              <div className="name_and_email_section w-full">
                <label htmlFor="email" className='font-medium text-gray-700 mb-1 block'>Email Address*</label>
                <input 
                  type="email" 
                  placeholder='Your Email*' 
                  id='email' 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='w-full p-3 bg-gray-50 outline-none border border-gray-200 rounded-lg transition-all duration-300 focus:border-darkRed focus:bg-white' 
                />
              </div>
              <div className="name_and_email_section w-full">
                <label htmlFor="subject" className='font-medium text-gray-700 mb-1 block'>Subject*</label>
                <input 
                  type="text" 
                  placeholder='Enter your subject for contacting' 
                  id='subject' 
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className='w-full p-3 bg-gray-50 outline-none border border-gray-200 rounded-lg transition-all duration-300 focus:border-darkRed focus:bg-white' 
                />
              </div>
              <div className="name_and_email_section w-full">
                <label htmlFor="message" className='font-medium text-gray-700 mb-1 block'>Message*</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className='w-full p-3 bg-gray-50 outline-none border border-gray-200 rounded-lg transition-all duration-300 focus:border-darkRed focus:bg-white' 
                  placeholder='Your Message*'
                ></textarea>
              </div>

              <button 
                type='submit' 
                disabled={loading}
                className='bg-darkRed hover:bg-black px-6 py-3 rounded-xl text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-gray-400'
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className='flex flex-col justify-start items-start gap-10'>
            <div className='address_and_contact_info flex flex-col justify-start items-start gap-8 bg-white p-6 rounded-xl shadow-sm w-full'>
              <h3 className='text-2xl font-semibold text-gray-800'>Get in Touch</h3>
              <div className='w-full flex flex-col justify-start items-start gap-4'>
                <div className='w-full p-4 rounded-lg bg-gray-50 flex flex-col gap-2'>
                  <p className='font-medium flex items-center gap-2 text-lightRed'> 
                    <MdLocationPin className='text-xl' />Our Location
                  </p>
                  <p className='text-sm text-zinc-600 pl-7'>123 Spice Street, Flavor District Seasoning City, SC 12345</p>
                </div>
                <div className='w-full p-4 rounded-lg bg-gray-50 flex flex-col gap-2'>
                  <p className='font-medium flex items-center gap-2 text-lightRed'> 
                    <FaPhone className='text-lg' />Phone
                  </p>
                  <p className='text-sm text-zinc-600 pl-7'>+1 (555) 123-4567</p>
                </div>
                <div className='w-full p-4 rounded-lg bg-gray-50 flex flex-col gap-2'>
                  <p className='font-medium flex items-center gap-2 text-lightRed'> 
                    <MdEmail className='text-lg' />Email
                  </p>
                  <p className='text-sm text-zinc-600 pl-7'>info@spicewebsite.com</p>
                </div>
              </div>
            </div>

            <div className='opening_time flex flex-col justify-start items-start gap-6 bg-white p-6 rounded-xl shadow-sm w-full'>
              <h3 className='text-2xl font-semibold text-gray-800'>Open Hours</h3>
              <div className='w-full p-4 rounded-lg bg-gray-50 flex flex-col gap-2'>
                <p className='font-medium flex items-center gap-2 text-lightRed'> 
                  <IoTimeSharp className='text-lg' />Business Hours
                </p>
                <div className='text-sm text-zinc-600 pl-7 flex flex-col gap-1'>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM </p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
