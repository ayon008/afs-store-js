"use client"
import React, { useEffect, useState } from 'react';
import Cart from './Cart';
import EmptyCart from './EmptyCart';
import useCart from '@/Shared/Hooks/useCart';

const CartWrapper = () => {
    const { cart, loading, loadCart } = useCart();
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        // Force reload cart from API when component mounts
        const init = async () => {
            await loadCart();
            setInitialLoading(false);
        };
        init();
    }, []);

    // Show loading state while fetching cart
    if (initialLoading || loading) {
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

