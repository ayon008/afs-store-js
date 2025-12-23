import FormButton from '@/Shared/Button/FormButton'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const EmptyCart = () => {
    return (
        <div className=''>
            <div className='global-margin'>
                <div className='flex items-center justify-between gap-5 flex-wrap p-5 border max-w-[1280px] mx-auto border-[#111] rounded-sm'>
                    <div className='flex items-center gap-2'>
                        <ShoppingCart className='block text-black' />
                        <p>Your cart is currently empty.</p>
                    </div>
                    <div>
                        <Link href={'/product-category/foiling'}>
                            <FormButton label={"Back to shop"} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyCart 