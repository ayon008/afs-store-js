'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import ProgressStepper from '@/Shared/Stepper/ProgressStepper';

const OrderSuccessPage = () => {
    const t = useTranslations('checkout');
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id') || searchParams.get('order');
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        // Optionally fetch order details here
        if (orderId) {
            // Could fetch from /api/wc/orders/[id] if needed
            console.log('Order ID:', orderId);
        }
    }, [orderId]);

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
            <div className='global-padding'>
                {/* Breadcrumbs */}
                <div className='pt-4 uppercase'>
                    <div className='font-bold text-sm text-[#999999]'>
                        <Link className='inline' href='/'>Home</Link> / <span className='text-black'>Order Confirmation</span>
                    </div>
                </div>

                {/* Progress Stepper - Step 3: Confirmation */}
                <ProgressStepper
                    currentStep={3}
                    steps={[t('basket') || 'Panier', t('securePayment') || 'Paiement', t('summary') || 'Confirmation']}
                />

                {/* Success Message */}
                <div className='max-w-2xl mx-auto pb-20'>
                    <div className='card-modern p-8 lg:p-12 text-center animate-slideUp'>
                        {/* Success Icon */}
                        <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn'>
                            <CheckCircle className='w-10 h-10 text-green-600' />
                        </div>

                        {/* Title */}
                        <h1 className='text-2xl lg:text-3xl font-bold text-[#111] mb-4'>
                            {t('orderConfirmed') || 'Commande confirmée !'}
                        </h1>

                        {/* Subtitle */}
                        <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                            {t('orderConfirmedMessage') || 'Merci pour votre commande. Vous recevrez bientôt un email de confirmation avec les détails de votre commande.'}
                        </p>

                        {/* Order ID */}
                        {orderId && (
                            <div className='bg-gray-50 rounded-xl p-4 mb-8 inline-block'>
                                <div className='flex items-center gap-3 justify-center'>
                                    <Package className='w-5 h-5 text-[#1D98FF]' />
                                    <span className='text-gray-600'>{t('orderNumber') || 'Numéro de commande'}:</span>
                                    <span className='font-bold text-[#111]'>#{orderId}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mt-8'>
                            <Link
                                href='/'
                                className='
                                    flex items-center gap-2 px-6 py-3 bg-[#1D98FF] text-white
                                    font-semibold rounded-xl shadow-lg shadow-blue-500/25
                                    hover:bg-[#1585e0] hover:shadow-blue-500/40
                                    active:scale-[0.98] transition-all duration-200
                                '
                            >
                                <Home className='w-5 h-5' />
                                {t('backToHome') || 'Retour à l\'accueil'}
                            </Link>

                            <Link
                                href='/my-profile'
                                className='
                                    flex items-center gap-2 px-6 py-3 bg-white text-[#111]
                                    font-semibold rounded-xl border-2 border-gray-200
                                    hover:border-[#1D98FF] hover:text-[#1D98FF]
                                    transition-all duration-200
                                '
                            >
                                {t('viewOrders') || 'Voir mes commandes'}
                                <ArrowRight className='w-5 h-5' />
                            </Link>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='card-modern p-6'>
                            <h3 className='font-semibold text-[#111] mb-2'>
                                {t('emailConfirmation') || 'Email de confirmation'}
                            </h3>
                            <p className='text-sm text-gray-600'>
                                {t('emailConfirmationMessage') || 'Un email récapitulatif vous a été envoyé avec tous les détails de votre commande.'}
                            </p>
                        </div>
                        <div className='card-modern p-6'>
                            <h3 className='font-semibold text-[#111] mb-2'>
                                {t('deliveryInfo') || 'Livraison'}
                            </h3>
                            <p className='text-sm text-gray-600'>
                                {t('deliveryInfoMessage') || 'Vous recevrez un email avec le suivi de votre colis dès son expédition.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
