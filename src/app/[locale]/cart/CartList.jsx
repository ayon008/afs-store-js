"use client"
import useCart from '@/Shared/Hooks/useCart';
import { Minus, Plus, Trash2Icon } from 'lucide-react';
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
            <div className={`items-center justify-between gap-[10px] hidden md:flex px-6 py-3 ${updating ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className='flex items-center gap-1 flex-[1_0_0]'>
                    <button onClick={handleRemoveItem} className='cursor-pointer hover:text-red-500 transition-colors'>
                        <Trash2Icon className='w-4 h-4' />
                    </button>
                    <Image src={image} alt={name} width={60} height={60} />
                </span>
                <span className='flex-2 text-[15px] font-bold leading-[100%] text-[#1D98FF] flex-col flex gap-2'>
                    <Link href={`/product/${slug}`}>{name}</Link>
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
                <span className='flex-[1_0_0] flex items-center gap-2'>
                    <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || updating || !isInStock}
                        className='cursor-pointer hover:bg-gray-100 rounded p-1 disabled:opacity-30 disabled:cursor-not-allowed'
                    >
                        <Minus className='w-4 h-4' />
                    </button>
                    <span className='min-w-[20px] text-center'>{quantity}</span>
                    <button
                        onClick={handleIncrement}
                        disabled={updating || !isInStock || isMaxReached}
                        className='cursor-pointer hover:bg-gray-100 rounded p-1 disabled:opacity-30 disabled:cursor-not-allowed'
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
