"use client"
import { ArrowUpRight, X } from 'lucide-react'
import React from 'react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Link from 'next/link'
import useCart from '../Hooks/useCart'
import Skeleton from '../Loader/Skeleton'
import SideCartItems from './SideCartItem'

const CartItemSkeleton = () => (
    <div className='flex items-center gap-8 bg-[#F7F7F7] p-[10px] rounded-sm'>
        <Skeleton className='w-[100px] h-[100px]' />
        <div className='flex flex-col gap-[10px] w-full'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
            <Skeleton className='h-5 w-1/4' />
            <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                    <Skeleton className='w-6 h-6 rounded' />
                    <Skeleton className='w-5 h-5' />
                    <Skeleton className='w-6 h-6 rounded' />
                </div>
                <Skeleton className='w-6 h-6' />
            </div>
        </div>
    </div>
)




const SideCart = ({ isOpen, onClose }) => {
    const { cart, loading, handleUpdateCartItem, handleRemoveCartItem } = useCart();


    const cartItems = cart?.items || [];

    const currencySymbol = cart?.totals?.currency_symbol || '€';
    const total = cart?.totals?.total_price / 100;

    const sideCartRef = useRef(null);
    const overlayRef = useRef(null);


    const sousTotal = cart?.items?.reduce(
        (acc, item) =>
            acc +
            Number(item.totals.line_subtotal) +
            Number(item.totals.line_subtotal_tax),
        0
    ) / 100;

    useGSAP(() => {
        if (!sideCartRef.current) return;

        if (isOpen) {
            // Animate in: from right (100%) to position (0%)
            gsap.fromTo(sideCartRef.current,
                { x: '100%' },
                { x: '0%', duration: 0.4, ease: 'power2.out' }
            );
        } else {
            // Animate out: from position (0%) to right (100%)
            gsap.to(sideCartRef.current, {
                x: '100%',
                duration: 0.3,
                ease: 'power2.in'
            });
        }
    }, { dependencies: [isOpen] });


    return (
        isOpen &&
        <div
            ref={overlayRef}
            className={`fixed inset-0 backdrop-blur-sm z-[999] h-screen w-screen bg-black/75 ${isOpen ? '' : 'pointer-events-none'}`}
        >
            <div
                className='bg-white h-full max-w-[580px] w-full ml-auto flex flex-col justify-between'
                ref={sideCartRef}
                style={{ transform: 'translateX(100%)' }}
            >
                <div className=''>
                    <div className='p-5 flex items-center justify-between gap-[10px] flex-wrap  border-b border-b-[#E6E6E6]'>
                        <span className='text-[#111] text-[20px] font-bold uppercase'>Your cart</span>
                        <button onClick={() => onClose()} className='flex cursor-pointer items-center justify-center gap-1 text-[13px] uppercase leading-[100%]'>
                            <X className='w-4 h-4' />
                            <span>Close</span>
                        </button>
                    </div>
                </div>
                {/* Content */}
                <div className='max-h-[calc(100vh-195px)] min-h-[calc(100vh-195px)] overflow-y-scroll p-5 scroll-bar'>
                    {
                        loading ? (
                            <div className='space-y-5'>
                                <CartItemSkeleton />
                                <CartItemSkeleton />
                            </div>
                        ) : (
                            <div className='space-y-5'>
                                {[...cartItems].reverse().map((item, index) => {
                                    console.log(item, 'itemFromSideCart');

                                    return (
                                        <SideCartItems
                                            key={item.key || index}
                                            item={item}
                                            onUpdateQuantity={handleUpdateCartItem}
                                            onRemove={handleRemoveCartItem}
                                        />
                                    )
                                })}
                            </div>
                        )
                    }
                </div>
                <div className='p-5 border-t border-t-[#E6E6E6] flex flex-col items-center justify-center gap-4'>
                    <div className='flex items-end gap-1 flex-wrap'>
                        <span className='text-[15px] uppercase leading-[100%] font-bold'>Sub Total</span>
                        <span className='text-[28px] uppercase leading-[100%] font-bold'>{currencySymbol}{sousTotal || 0}</span>
                        <span className='text-[19px] leading-[100%] font-bold'>(incl. VAT)</span>
                    </div>
                    <Link onClick={() => onClose()} href={'/cart'} className='cursor-pointer'>
                        <button disabled={cartItems?.length === 0} className={`py-3 px-6 text-sm flex font-semibold uppercase leading-[100%] justify-center items-center gap-1 bg-[#1D98FF] rounded-sm text-white ${cartItems?.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Continue to Basket
                            <ArrowUpRight className='w-4 h-4' />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default SideCart