
import React from 'react'
// import EmptyCart from './EmptyCart';
// import Cart from './Cart';
import Link from 'next/link';
import { getCart } from '@/app/actions/Woo-Coommerce/Shop/Cart/cart';
import Cart from './Cart';
import EmptyCart from './EmptyCart';

const page = async () => {
    const getAllCartItems = await getCart();
    const cartItems = getAllCartItems?.data?.items || [];
    console.log(cartItems, 'cartItems');


    const BreadCums = () => {
        return (
            <div className='uppercase'>
                <div className='font-bold text-sm text-[#999999]'>
                    <Link className='inline' href={'/'}>Home</Link> / <span className='text-black'> Cart</span>
                </div>
            </div>
        )
    }

    return (
        <div className='pt-4 global-padding'>
            <BreadCums />
            <div className='flex items-center justify-between max-w-[1080px] mx-auto relative py-[80px] lg:py-[100px]'>
                <div className='flex flex-col items-center justify-center step-1'>
                    <span className='w-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] h-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] border border-[#111] text-[clamp(0.9375rem,0.362rem+1.2005vw,1.5625rem)] font-bold text-[#111] rounded-full text-center bg-white z-10!'>1</span>
                    <span className='text-base text-[clamp(0.875rem,0.7599rem+0.2401vw,1rem)] text-center leading-[120%]'>
                        Basket
                    </span>
                </div>
                <div className='flex flex-col items-center justify-center step-2'>
                    <span className='w-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] h-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] border border-[#111] text-[clamp(0.9375rem,0.362rem+1.2005vw,1.5625rem)] font-bold text-[#111] rounded-full text-center bg-white z-10!'>2</span>
                    <span className='text-base text-[clamp(0.875rem,0.7599rem+0.2401vw,1rem)] text-center leading-[120%]'>
                        Secure payment and delivery
                    </span>
                </div>
                <div className='flex flex-col items-center justify-center step-3'>
                    <span className='w-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] h-[clamp(1.75rem,1.0594rem+1.4406vw,2.5rem)] border border-[#111] text-[clamp(0.9375rem,0.362rem+1.2005vw,1.5625rem)] font-bold text-[#111] rounded-full text-center bg-white z-10!'>3</span>
                    <span className='text-base text-[clamp(0.875rem,0.7599rem+0.2401vw,1rem)] text-center leading-[120%]'>
                        Summary
                    </span>
                </div>
            </div>
            {
                cartItems.length > 0 ? (
                    <Cart />
                ) : (
                    <EmptyCart />
                )
            }
        </div>
    )
}

export default page