"use client"
import useCart from '@/Shared/Hooks/useCart';
import { Minus, Plus, Trash2Icon, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'

const CartList = ({ item }) => {


    const { handleUpdateCartItem, handleRemoveCartItem } = useCart();

    const basePriceWithTax = parseInt(item?.prices?.price || 0);

    // const line_total = parseInt(item?.totals?.line_total || 0);
    // const line_total_tax = parseInt(item?.totals?.line_total_tax || 0);
    // const total = line_total + line_total_tax;


    const sub_total = (parseInt(item?.totals?.line_subtotal) + parseInt(item?.totals?.line_subtotal_tax)) || 0;

    const image = item.images?.[0]?.src || item.image;
    const name = item.name || item.title;


    const currency_symbol = item?.prices?.currency_symbol || '€';
    const total_Currency_Symbol = item?.totals?.currency_symbol || '€';
    const variations = item?.variation || [];
    const itemKey = item?.key;
    const slug = item?.permalink?.split('/product/')?.[1]?.replace(/\/$/, '') || '';

    // Check if product is in stock
    const isInStock = item?.stock_status === 'instock' || item?.is_in_stock === true || item?.catalog_visibility !== 'hidden';

    // Get maximum quantity from stock or quantity limits
    const maxQuantity = item?.quantity_limits?.maximum || item?.stock_quantity || item?.quantity_limit || Infinity;

    const [quantity, setQuantity] = useState(parseInt(item.quantity));
    const [updating, setUpdating] = useState(false);

    // Check if maximum quantity reached
    const isMaxReached = quantity >= maxQuantity;

    const handleIncrement = async () => {
        if (updating || isMaxReached) return;
        setUpdating(true);
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        await handleUpdateCartItem(itemKey, newQuantity);
        setUpdating(false);
    };

    const handleDecrement = async () => {
        if (updating || quantity <= 1) return;
        setUpdating(true);
        const newQuantity = quantity - 1;
        setQuantity(newQuantity);
        await handleUpdateCartItem(itemKey, newQuantity);
        setUpdating(false);
    };

    const handleRemoveItem = async () => {
        if (updating) return;
        setUpdating(true);
        await handleRemoveCartItem(itemKey);
        setUpdating(false);
    };

    // Format price (WooCommerce returns price in cents)
    const formatPrice = (value) => {
        return (parseInt(value) / 100).toFixed(2);
    };



    return (
        <div>
            {/* Mobile Card View */}
            <div
                className={`
                    md:hidden p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-3
                    ${updating ? 'opacity-50 pointer-events-none' : ''}
                    animate-slideUp
                `}
            >
                <div className='flex gap-4'>
                    {/* Product Image with Delete Button */}
                    <div className='relative flex-shrink-0'>
                        <Image
                            src={image}
                            alt={name}
                            width={80}
                            height={80}
                            className='rounded-lg object-cover'
                        />
                        <button
                            onClick={handleRemoveItem}
                            className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                                       flex items-center justify-center hover:bg-red-600 transition-colors
                                       shadow-sm'
                        >
                            <X className='w-3 h-3' />
                        </button>
                    </div>

                    {/* Product Info */}
                    <div className='flex-1 min-w-0'>
                        <Link
                            href={`/product/${slug}`}
                            className='font-semibold text-[#1D98FF] text-sm line-clamp-2 hover:underline'
                        >
                            {name}
                        </Link>

                        {/* Variations */}
                        {variations?.length > 0 && (
                            <div className='mt-1 space-y-0.5'>
                                {variations.map((v, i) => (
                                    <p key={i} className='text-xs text-gray-500'>
                                        {v.attribute}: {v.value}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* Unit Price */}
                        <p className='text-sm font-bold text-[#111] mt-2'>
                            {formatPrice(basePriceWithTax)} {currency_symbol}
                        </p>
                    </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                    <div className='flex items-center gap-1'>
                        <button
                            onClick={handleDecrement}
                            disabled={quantity <= 1 || updating || !isInStock}
                            className='btn-quantity'
                        >
                            <Minus className='w-4 h-4' />
                        </button>
                        <span className={`w-10 text-center font-semibold ${updating ? 'animate-pulse-soft' : ''}`}>
                            {quantity}
                        </span>
                        <button
                            onClick={handleIncrement}
                            disabled={updating || !isInStock || isMaxReached}
                            className='btn-quantity'
                        >
                            <Plus className='w-4 h-4' />
                        </button>
                    </div>

                    <div className='text-right'>
                        <span className='text-xs text-gray-500'>Sous-total</span>
                        <p className='font-bold text-[#111]'>
                            {formatPrice(sub_total)} {total_Currency_Symbol}
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className={`items-center justify-between gap-[10px] hidden md:flex px-6 py-3 ${updating ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className='flex items-center gap-2 flex-[1_0_0]'>
                    <button
                        onClick={handleRemoveItem}
                        className='cursor-pointer text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg'
                    >
                        <Trash2Icon className='w-4 h-4' />
                    </button>
                    <Image src={image} alt={name} width={60} height={60} className='rounded-lg' />
                </span>
                <span className='flex-2 text-[15px] font-bold leading-[100%] text-[#1D98FF] flex-col flex gap-2'>
                    <Link href={`/product/${slug}`} className='hover:underline'>{name}</Link>
                    {
                        variations?.map((variation, i) => {
                            return (
                                <dl key={i} className="font-normal text-[14.4px] leading-[130%] text-[#111]">
                                    <span className='flex items-start gap-[2px]'>
                                        <dt>
                                            {variation?.attribute}:
                                        </dt>
                                        <dd>
                                            <p>{variation?.value}</p>
                                        </dd>
                                    </span>
                                </dl>
                            )
                        })
                    }
                </span>
                <span className='flex-[1_0_0] text-sm text-[#111] leading-[100%] font-medium'>
                    {`${formatPrice(basePriceWithTax)} ${currency_symbol}`}
                </span>
                <span className='flex-[1_0_0] flex items-center gap-1'>
                    <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || updating || !isInStock}
                        className='btn-quantity'
                    >
                        <Minus className='w-4 h-4' />
                    </button>
                    <span className={`min-w-[32px] text-center font-semibold text-sm ${updating ? 'animate-pulse-soft' : ''}`}>
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrement}
                        disabled={updating || !isInStock || isMaxReached}
                        className='btn-quantity'
                    >
                        <Plus className='w-4 h-4' />
                    </button>
                </span>
                <span className='flex-[1_0_0] text-sm text-[#111] leading-[100%] font-medium'>
                    {`${formatPrice(sub_total)} ${total_Currency_Symbol}`}
                </span>
            </div>
        </div>
    )
}

export default CartList
