"use client"
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import React from 'react'
import { useTranslations } from 'next-intl'

const EmptyCart = () => {
    const t = useTranslations("cart");
    
    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4'>
            <div className='max-w-2xl w-full'>
                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
                    {/* Icon Section */}
                    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-12 text-center'>
                        <div className='inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-6'>
                            <ShoppingCart className='w-12 h-12 text-gray-400' />
                        </div>
                        <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-3'>
                            {t("emptyCart")}
                        </h2>
                        <p className='text-lg text-gray-600 max-w-md mx-auto'>
                            {t("emptyCartMessage")}
                        </p>
                    </div>

                    {/* Action Section */}
                    <div className='p-8 text-center bg-gray-50'>
                        <Link 
                            href="/product-category/foiling/wing-foil"
                            className='
                                inline-flex items-center justify-center gap-3
                                bg-[#1D98FF] text-white font-semibold
                                px-8 py-4 rounded-xl
                                hover:bg-[#1585e0] active:scale-[0.98]
                                shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                                transition-all duration-200
                                text-base uppercase tracking-wide
                            '
                        >
                            {t("backToShop")}
                            <ArrowRight className='w-5 h-5' />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyCart 