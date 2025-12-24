import React from 'react'
import Link from 'next/link';
import { getCart } from '@/app/actions/Woo-Coommerce/Shop/Cart/cart';
import Cart from './Cart';
import EmptyCart from './EmptyCart';
import ProgressStepper from '@/Shared/Stepper/ProgressStepper';

const page = async () => {
    const getAllCartItems = await getCart();
    const cartItems = getAllCartItems?.data?.items || [];

    const BreadCrumbs = () => {
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
            <BreadCrumbs />

            {/* Progress Stepper - Step 1: Cart */}
            <ProgressStepper
                currentStep={1}
                steps={['Panier', 'Paiement', 'Confirmation']}
            />

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