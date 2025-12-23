import { NextResponse } from 'next/server';
import { getMoneticoConfig, validateMoneticoConfig } from '@/lib/monetico-config';
import MoneticoPayment from '@/lib/monetico';

export async function POST(req) {
  try {
    const { orderId, customerData, cartData } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const config = getMoneticoConfig(orderId);
    validateMoneticoConfig(config);

    const monetico = new MoneticoPayment(config);

    // Extract email from customerData (handle different data structures)
    const customerEmail = customerData.billing_email || 
                         customerData.billing?.email || 
                         customerData.email || 
                         '';

    if (!customerEmail) {
      return NextResponse.json({ error: 'L\'adresse email est requise' }, { status: 400 });
    }

    // Validate cart data
    if (!cartData || !cartData.totals || !cartData.totals.total_price) {
      return NextResponse.json({ error: 'Données du panier invalides' }, { status: 400 });
    }

    // Prepare payment data
    const paymentData = monetico.createPaymentData({
      amount: cartData.totals.total_price / 100,
      reference: orderId.toString(),
      customerEmail: customerEmail,
      description: `Commande AFS Foiling #${orderId}`,
      customerData: customerData
    });

    // Validate payment data structure
    if (!paymentData || !paymentData.formData || !paymentData.actionUrl) {
      console.error('Invalid payment data structure:', paymentData);
      return NextResponse.json({ error: 'Erreur lors de la préparation du paiement' }, { status: 500 });
    }

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Monetico initiation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

