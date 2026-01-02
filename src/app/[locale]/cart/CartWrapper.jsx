"use client"
import React from 'react';
import Cart from './Cart';
import EmptyCart from './EmptyCart';
import useCart from '@/Shared/Hooks/useCart';

const CartWrapper = () => {
    const { cart, loading } = useCart();

    // Show loading state only on initial load
    if (loading && !cart) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Chargement du panier...</p>
                </div>
            </div>
        );
    }

    const cartItems = cart?.items || [];

    // Show cart or empty cart based on items
    if (cartItems.length > 0) {
        return <Cart />;
    }

    return <EmptyCart />;
};

export default CartWrapper;

