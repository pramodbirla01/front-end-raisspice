import Image from 'next/image';
import React from 'react';



const page = () => {

  const spiceArray = [
    { heading: "Premium Quality Spices", subHeading: "Spice Delight offers a collection of premium quality spices sourced from the finest farms. Our spices are carefully selected and processed to ensure unparalleled freshness, flavor, and aroma. Transform your culinary creations with the perfect blend of tradition and excellence." },
    { heading: "Sustainable Practices", subHeading: "We are committed to sustainable and eco-friendly practices, ensuring a better future for generations to come. By sourcing our spices responsibly and minimizing waste, Spice Delight supports a healthier planet and a conscious culinary community." },
    { heading: "Inclusive Flavor Profiles", subHeading: "Sour spice blends cater to diverse palates and cooking styles, ensuring everyone can find their perfect flavor. Whether you prefer traditional tastes or modern culinary adventures, Spice Delight celebrates diversity and creativity in every recipe." },
    { heading: "Affordable Luxury", subHeading: "Experience the luxury of premium spices at prices that suit your budget. At Spice Delight, we believe exceptional quality should be accessible to everyone. Elevate your cooking without compromising on value or taste." },
    { heading: "Unmatched Customer Satisfaction", subHeading: "Your satisfaction is our top priority. From seamless shopping experiences to dedicated customer support, Spice Delight ensures every step of your journey with us is memorable and fulfilling. Trust us to bring quality and care to your kitchen." },
  ]
  return (
    <>
      <div className="contact_us pt-16 bg-bgColor">
        <div className="contact_us_heading_box w-full h-[280px] max-sm:h-[180px] max-md:px-2 flex flex-col gap-1 justify-center items-center bg-yellow-50 py-16">
          <h1 className='text-4xl font-medium'>About Us</h1>
          <p className='text-sm text-zinc-600 text-center'>Learn more about Spice Delight, our mission, and our journey in bringing premium spices to your kitchen.</p>
        </div>
        <div className="contact_us_inner_container w-[90%] mx-auto py-12 flex flex-col">
          {
            spiceArray?.map((currElem, index) => {
              return (
                <div key={index} className={`info_container flex ${(index % 2 == 0) ? "flex-row-reverse" : ""} max-lg:flex-col justify-between items-center gap-8 px-4 py-8 border-b border-gray-400`}>
                  <div className='flex flex-col items-start justify-start gap-3'>
                    <h1 className='text-xl font-semibold w-full max-lg:text-center'>{currElem.heading}</h1>
                    <p className='text-sm text-zinc-600'>{currElem.subHeading}</p>
                  </div>
                  <Image width={100} height={100} src={`/images/about_spice_img_${index+1}.png`} alt="" className='w-[100px]' />
                  {/* <RiTShirtFill className='text-[128px]' /> */}
                </div>
              )
            })
          }
        </div>
      </div>
    </>
  )
}

export default page
