import AboutVideoSection from '@/Shared/Home/AboutVideoSection'
import BestSellers from '@/Shared/Home/BestProducts'
import CategorySection from '@/Shared/Home/Categories'
import CustomerService from '@/Shared/Home/CustomerService'
import Hero from '@/Shared/Home/Hero'
import More from '@/Shared/Home/More'
import News from '@/Shared/Home/News'
import React from 'react'

const page = () => {
  return (
    <div className='w-full'>
      <Hero />
      <AboutVideoSection />
      <BestSellers />
      <CategorySection />
      <CustomerService />
      <More />
      <News />
    </div>
  )
}

export default page