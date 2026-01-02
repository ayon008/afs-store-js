import React from 'react'
import Link from 'next/link';
import CartWrapper from './CartWrapper';

const BreadCrumbs = () => {
    return (
        <div className='uppercase'>
            <div className='font-bold text-sm text-[#999999]'>
                <Link className='inline' href={'/'}>Home</Link> / <span className='text-black'> Cart</span>
            </div>
        </div>
    )
}

const page = () => {
    return (
        <div className='pt-4 global-padding'>
            <BreadCrumbs />

            {/* CartWrapper handles loading cart from client-side API */}
            <CartWrapper />
        </div>
    )
}

export default page