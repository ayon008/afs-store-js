import AboutVideoSection from '@/Shared/Home/AboutVideoSection'
import BestSellers from '@/Shared/Home/BestProducts'
import Hero from '@/Shared/Home/Hero'
import React from 'react'

const page = () => {
  return (
    <div className='w-full'>
      <Hero />
      <AboutVideoSection />
      <BestSellers />
    </div>
  )
}

export default page