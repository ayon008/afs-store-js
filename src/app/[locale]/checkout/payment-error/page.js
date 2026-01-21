'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { XCircle, AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

const PaymentErrorPage = () => {
    const t = useTranslations('checkout');
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order_id');
    const [statusUpdated, setStatusUpdated] = useState(false);

    useEffect(() => {
        // Log error for debugging
        if (orderId) {
            console.log('Payment error for order:', orderId);
            
            // Detect payment method from URL params or referrer
            const paymentMethod = searchParams.get('payment_method') || 
                                 (typeof window !== 'undefined' && window.location.search.includes('monetico') ? 'monetico' : null) ||
                                 (typeof window !== 'undefined' && window.location.search.includes('authnet') ? 'authnet' : null) ||
                                 (typeof window !== 'undefined' && window.location.search.includes('authorize') ? 'authnet' : null) ||
                                 null; // No default - let it be null if not specified
            
            // Update order status to failed when page loads
            // This ensures the order is marked as failed even if the webhook didn't fire
            const updateOrderStatus = async () => {
                try {
                    console.log(`[Payment Error] Updating order ${orderId} status to failed (payment method: ${paymentMethod})`);
                    
                    const response = await fetch(`/api/orders/${orderId}/update-status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: 'failed',
                            note: 'Paiement échoué - redirection vers la page d\'erreur',
                            paymentMethod: paymentMethod
                        })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('[Payment Error] Order status updated to failed:', result);
                        setStatusUpdated(true);
                    } else {
                        const errorText = await response.text();
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch {
                            errorData = { error: errorText };
                        }
                        console.error('[Payment Error] Failed to update order status:', errorData);
                    }
                } catch (error) {
                    console.error('[Payment Error] Error updating order status:', error);
                }
            };

            // Only update if not already updated
            if (!statusUpdated) {
                updateOrderStatus();
            }
        }
    }, [orderId, statusUpdated, searchParams]);

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
            <div className='global-padding'>
                {/* Breadcrumbs */}
                <div className='pt-4 uppercase'>
                    <div className='font-bold text-sm text-[#999999]'>
                        <Link className='inline' href='/'>Home</Link> / <span className='text-black'>Erreur de paiement</span>
                    </div>
                </div>

                {/* Error Message */}
                <div className='max-w-2xl mx-auto pb-20'>
                    <div className='card-modern p-8 lg:p-12 text-center animate-slideUp'>
                        {/* Error Icon */}
                        <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn'>
                            <XCircle className='w-10 h-10 text-red-600' />
                        </div>

                        {/* Title */}
                        <h1 className='text-2xl lg:text-3xl font-bold text-[#111] mb-4'>
                            {t('paymentError') || 'Erreur de paiement'}
                        </h1>

                        {/* Subtitle */}
                        <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                            {t('paymentErrorMessage') || 'Une erreur est survenue lors du traitement de votre paiement. Votre commande n\'a pas été validée. Veuillez réessayer ou contacter notre service client si le problème persiste.'}
                        </p>

                        {/* Order ID if available */}
                        {orderId && (
                            <div className='bg-gray-50 rounded-xl p-4 mb-8 inline-block'>
                                <div className='flex items-center gap-3 justify-center'>
                                    <AlertCircle className='w-5 h-5 text-red-500' />
                                    <span className='text-gray-600'>{t('orderNumber') || 'Numéro de commande'}:</span>
                                    <span className='font-bold text-[#111]'>#{orderId}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mt-8'>
                            <button
                                onClick={() => router.back()}
                                className='
                                    flex items-center gap-2 px-6 py-3 bg-[#1D98FF] text-white
                                    font-semibold rounded-xl shadow-lg shadow-blue-500/25
                                    hover:bg-[#1585e0] hover:shadow-blue-500/40
                                    active:scale-[0.98] transition-all duration-200
                                '
                            >
                                <RefreshCw className='w-5 h-5' />
                                {t('tryAgain') || 'Réessayer'}
                            </button>

                            <Link
                                href='/checkout'
                                className='
                                    flex items-center gap-2 px-6 py-3 bg-white text-[#111]
                                    font-semibold rounded-xl border-2 border-gray-200
                                    hover:border-[#1D98FF] hover:text-[#1D98FF]
                                    transition-all duration-200
                                '
                            >
                                <ArrowLeft className='w-5 h-5' />
                                {t('backToCheckout') || 'Retour au paiement'}
                            </Link>

                            <Link
                                href='/'
                                className='
                                    flex items-center gap-2 px-6 py-3 bg-white text-[#111]
                                    font-semibold rounded-xl border-2 border-gray-200
                                    hover:border-[#1D98FF] hover:text-[#1D98FF]
                                    transition-all duration-200
                                '
                            >
                                <Home className='w-5 h-5' />
                                {t('backToHome') || 'Retour à l\'accueil'}
                            </Link>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='card-modern p-6'>
                            <h3 className='font-semibold text-[#111] mb-2'>
                                {t('needHelp') || 'Besoin d\'aide ?'}
                            </h3>
                            <p className='text-sm text-gray-600 mb-3'>
                                {t('needHelpMessage') || 'Si vous rencontrez des difficultés, notre équipe est là pour vous aider.'}
                            </p>
                            <Link
                                href='/contact'
                                className='text-[#1D98FF] hover:underline text-sm font-medium'
                            >
                                {t('contactUs') || 'Nous contacter'}
                            </Link>
                        </div>
                        <div className='card-modern p-6'>
                            <h3 className='font-semibold text-[#111] mb-2'>
                                {t('commonIssues') || 'Problèmes courants'}
                            </h3>
                            <ul className='text-sm text-gray-600 space-y-1'>
                                <li>• {t('checkCardDetails') || 'Vérifiez les détails de votre carte'}</li>
                                <li>• {t('checkBalance') || 'Vérifiez le solde de votre compte'}</li>
                                <li>• {t('tryDifferentCard') || 'Essayez une autre carte'}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentErrorPage;
